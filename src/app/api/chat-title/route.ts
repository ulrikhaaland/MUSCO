import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { TITLE_MODEL } from '@/app/api/assistant/models';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const InputSchema = z.object({
  firstQuestion: z.string().min(1),
  firstResponse: z.string().min(1),
  language: z.enum(['en', 'nb']).default('en'),
});

const SYSTEM_PROMPT = `You generate short, unique chat titles based on the first question and response in a conversation.

Rules:
- Output ONLY the title, nothing else
- Maximum 6 words
- Be specific and descriptive - capture the essence of what was discussed
- Use the same language as the input (English or Norwegian)
- Don't use generic words like "Chat about", "Question about", "Help with"
- Don't use quotes or punctuation at the end
- Make it memorable and distinct

Examples:
- "Knee pain after running" → "Runners Knee Assessment"
- "How does the shoulder work?" → "Shoulder Anatomy Basics"
- "Pain in lower back" → "Lower Back Pain Evaluation"
- "Smerter i nakken etter søvn" → "Nakkesmerter etter søvn"
`;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = InputSchema.parse(json);

    // Truncate inputs to avoid excessive tokens
    const question = input.firstQuestion.slice(0, 200);
    const response = input.firstResponse.slice(0, 500);

    const completion = await client.chat.completions.create({
      model: TITLE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Language: ${input.language === 'nb' ? 'Norwegian' : 'English'}

First question: ${question}

First response: ${response}

Generate a unique, specific title:`,
        },
      ],
      max_tokens: 30,
      temperature: 0.7,
    });

    const title = completion.choices[0]?.message?.content?.trim() || '';
    
    // Validate and clean up the title
    const cleanTitle = title
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/[.!?]$/, '') // Remove trailing punctuation
      .slice(0, 60); // Max 60 chars

    if (!cleanTitle) {
      return NextResponse.json({ error: 'failed_to_generate_title' }, { status: 500 });
    }

    return NextResponse.json({ title: cleanTitle });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'invalid_request';
    console.error('[chat-title] Error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}




