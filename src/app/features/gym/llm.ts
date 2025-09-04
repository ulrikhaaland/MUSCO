import fs from 'fs';
import path from 'path';
import { getChatCompletion } from '@/app/api/assistant/openai-server';
import { singleDayPrompt as inRepoSingleDayPrompt } from '@/app/api/prompts/singleDayPrompt';

export function getSingleDaySystemPrompt(): string {
  // 1) Prefer the in-repo prompt if present
  if (typeof inRepoSingleDayPrompt === 'string' && inRepoSingleDayPrompt.trim().length > 0) {
    return inRepoSingleDayPrompt;
  }

  // 2) Fallback to env
  const env = process.env.SINGLE_DAY_PROGRAM_SYSTEM_PROMPT;
  if (env && env.trim().length > 0) return env;

  // 3) Fallback to prompts file path
  try {
    const p = path.join(process.cwd(), 'prompts', 'singleDayProgram.txt');
    return fs.readFileSync(p, 'utf8');
  } catch {}

  // 4) Final safety fallback
  return 'CRITICAL: Return only valid JSON for a single-day session.';
}

export async function callSingleDayLLM({
  systemPrompt,
  input,
  model = 'gpt-5-mini',
}: {
  systemPrompt: string;
  input: unknown;
  model?: string;
}): Promise<string> {
  const content = await getChatCompletion({
    threadId: 'single-day',
    messages: [],
    systemMessage: systemPrompt,
    userMessage: JSON.stringify(input),
    modelName: model,
    options: {},
  });
  return content || '';
}


