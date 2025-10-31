import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { z } from 'zod';
import { reserveFreeChatTokens, reserveFreeChatTokensForAnon } from '@/app/api/assistant/openai-server';
import { estimateJsonTokens, ESTIMATED_RESPONSE_TOKENS, ANON_COOKIE_NAME, logFreeLimit } from '@/app/lib/chatLimits';
import { EXPLORE_MODEL } from '@/app/api/assistant/models';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const InputSchema = z.object({
  partId: z.string().min(1),
  displayName: z.string().min(1),
  partType: z
    .enum(['muscle', 'bone', 'joint', 'ligament', 'tendon', 'nerve', 'other'])
    .default('muscle'),
  side: z.enum(['L', 'R', 'unknown']).default('unknown'),
  language: z.enum(['EN', 'NB']).default('EN'),
  readingLevel: z.enum(['simple', 'standard', 'pro']).default('standard'),
  viewerHints: z
    .object({
      cameraTarget: z.string().optional(),
      visibleLayers: z.array(z.string()).optional(),
      userGoal: z.enum(['learn', 'train', 'recover']).optional(),
    })
    .optional(),
  // Optional user context for free-tier limits
  uid: z.string().optional(),
  isSubscriber: z.boolean().optional(),
});

// (Kept for future validation if needed)
// const OutputSchema = z.object({
//   text: z.string().min(1),
//   quick_replies: z.array(z.string()).length(3),
//   meta: z.object({
//     tone: z.enum(['simple', 'standard', 'pro']),
//     language: z.enum(['EN', 'NB']),
//     partId: z.string(),
//     displayName: z.string(),
//   }),
// });

// No backend cache; client-side cache will short-circuit repeated requests

// Removed non-stream JSON-system prompt

// Streaming prompt: emit PLAIN TEXT ONLY (no JSON)
const SYSTEM_PROMPT_TEXT = `You are the “Explain Selection” writer for an interactive 3D musculoskeletal viewer.
Goal: given a selected anatomical structure, produce a short, lay-friendly explanation that helps a user understand what it is and why it matters in everyday movement. This is exploration, not diagnosis.

Constraints:
- Output plain text only (no markdown, no JSON). ≤ 120 words.
- Direct, neutral tone; no filler; avoid diagnosis/treatment.
- Use requested language (EN/NB) and reading level (simple/standard/pro) to guide wording.
- If partType provided, emphasize:
  • muscle: main actions, role in common tasks
  • tendon/ligament: stabilization & what loads it
  • bone/joint: motion allowed, key articulations
  • nerve: general innervation territory
- Mention side (L/R) only if helpful.
`;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = InputSchema.parse(json);
    
    // Enforce non-subscriber daily limits (best-effort pre-reservation)
    const cookieStore = await cookies();
    const anonCookieName = ANON_COOKIE_NAME;
    let anonId = cookieStore.get(anonCookieName)?.value;
    if (!anonId) {
      anonId = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      // Set cookie via response later if needed (SSE path sets headers on Response)
    }
    // Roughly estimate tokens: input JSON + expected response chunk
    const estimatedResponse = ESTIMATED_RESPONSE_TOKENS;
    const estimatedInput = estimateJsonTokens({
      partId: input.partId,
      displayName: input.displayName,
      partType: input.partType,
      side: input.side,
      language: input.language,
      readingLevel: input.readingLevel,
      viewerHints: input.viewerHints,
    });
    if (input.uid) {
      try {
        await reserveFreeChatTokens(input.uid, estimatedInput + estimatedResponse, input.isSubscriber);
      } catch {
        logFreeLimit({
          scope: 'explain_selection',
          kind: 'user',
          id: input.uid!,
          est_in: estimatedInput,
          est_out: estimatedResponse,
        });
        return NextResponse.json({ error: 'free_limit_exceeded' }, { status: 429 });
      }
    } else if (!input.uid && anonId) {
      try {
        await reserveFreeChatTokensForAnon(anonId, estimatedInput + estimatedResponse);
      } catch {
        logFreeLimit({
          scope: 'explain_selection',
          kind: 'anon',
          id: anonId,
          est_in: estimatedInput,
          est_out: estimatedResponse,
        });
        return NextResponse.json({ error: 'free_limit_exceeded' }, { status: 429 });
      }
    }

    // Streaming mode if client requests SSE
    const wantsStream =
      req.headers.get('accept')?.includes('text/event-stream') ||
      req.nextUrl.searchParams.get('stream') === '1';

    // Backend cache removed; rely on client cache to avoid repeat streams

    if (wantsStream) {
      const stream = await client.responses.stream({
        model: EXPLORE_MODEL,
        // reasoning: { effort: 'minimal' } as any,
        input: [
          { role: 'system', content: SYSTEM_PROMPT_TEXT },
          { role: 'user', content: JSON.stringify({
            partId: input.partId,
            displayName: input.displayName,
            partType: input.partType,
            side: input.side,
            language: input.language,
            readingLevel: input.readingLevel,
            viewerHints: input.viewerHints,
          }) },
        ],
      });

      // Prevent unhandled promise rejection when stream is aborted
      // Do not await; just attach a catch handler
      void stream
        .done()
        .catch((e: any) => {
          if (!(e && String(e?.message || e).includes('aborted'))) {
            console.error('explain_selection stream.done error', e);
          }
        });

      let fullContent = '';

      const sse = new ReadableStream({
        start(controller) {
          const enc = new TextEncoder();
          stream
            .on('response.output_text.delta', (event: any) => {
              const delta = event?.delta ?? event?.output_text_delta ?? '';
              if (typeof delta === 'string' && delta) {
                fullContent += delta;
                controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'delta', delta })}\n\n`));
              }
            })
            .on('error', () => {
              controller.close();
            })
            .on('response.completed', () => {
              const text = capWords(String(fullContent || ''), 80);
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'final', payload: { text } })}\n\n`));
              controller.close();
            });
        },
        cancel() {
          try { stream.abort(); } catch {}
        },
      });
      const headers: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      };
      if (anonId) {
        headers['Set-Cookie'] = `${anonCookieName}=${anonId}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`;
      }
      return new Response(sse, {
        headers: {
          ...headers,
        },
      });
    }

    // No non-streaming path required
    return NextResponse.json({ error: 'streaming_required' }, { status: 400 });
  } catch (err: any) {
    const message = err?.message || 'invalid_request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Removed JSON coercion helpers; streaming is text-only

function capWords(s: string, maxWords: number) {
  const words = s.trim().split(/\s+/);
  if (words.length <= maxWords) return s.trim();
  return words.slice(0, maxWords).join(' ');
}

// oneOf removed


