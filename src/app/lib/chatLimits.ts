// Centralized chat limit constants and helpers

export const ENFORCE_CHAT_LIMITS: boolean = (process.env.ENFORCE_CHAT_LIMITS ?? 'true') !== 'false';

// Re-export from client-safe module (server code can import from either place)
export { SUBSCRIPTIONS_ENABLED } from './featureFlags';

export const FREE_DAILY_TOKENS: number = parseInt(
  process.env.NON_SUBSCRIBER_CHAT_DAILY_TOKENS ?? (process.env.NODE_ENV === 'production' ? '10000' : '200'),
  10
);

export const ESTIMATED_RESPONSE_TOKENS: number = parseInt(
  process.env.NON_SUBSCRIBER_CHAT_ESTIMATED_RESPONSE_TOKENS ?? (process.env.NODE_ENV === 'production' ? '500' : '60'),
  10
);

export const ANON_COOKIE_NAME = 'musco_anon_id';

// Lazy tiktoken encoder
let _encoder: any | null = null;
async function getEncoder() {
  if (_encoder) return _encoder;
  const { encoding_for_model } = await import('@dqbd/tiktoken');
  // Default to a modern GPT-4 family encoding; falls back internally
  _encoder = encoding_for_model('gpt-4o-mini');
  return _encoder;
}

export async function estimateTokensAccurate(text: string): Promise<number> {
  try {
    if (!text) return 0;
    const enc = await getEncoder();
    return enc.encode(text).length;
  } catch {
    return estimateTokensFromString(text);
  }
}

export async function estimateJsonTokensAccurate(obj: unknown): Promise<number> {
  try {
    return estimateTokensAccurate(JSON.stringify(obj ?? {}));
  } catch {
    return Promise.resolve(0);
  }
}

// Heuristic fallback (sync)
export function estimateTokensFromString(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateJsonTokens(obj: unknown): number {
  try {
    return estimateTokensFromString(JSON.stringify(obj ?? {}));
  } catch {
    return 0;
  }
}

// Centralized logging for limits
export function logFreeLimit(event: {
  scope: 'chat' | 'explain_selection';
  kind: 'user' | 'anon';
  id: string;
  used?: number;
  need?: number;
  next?: number;
  cap?: number;
  est_in?: number;
  est_out?: number;
}) {
  const parts = [
    'level=warn',
    `limit=${event.scope}`,
    `kind=${event.kind}`,
    `${event.kind === 'user' ? 'user' : 'anon'}=${event.id}`,
  ];
  if (typeof event.used === 'number') parts.push(`used=${event.used}`);
  if (typeof event.need === 'number') parts.push(`need=${event.need}`);
  if (typeof event.next === 'number') parts.push(`new=${event.next}`);
  if (typeof event.cap === 'number') parts.push(`cap=${event.cap}`);
  if (typeof event.est_in === 'number') parts.push(`est_in=${event.est_in}`);
  if (typeof event.est_out === 'number') parts.push(`est_out=${event.est_out}`);
  // eslint-disable-next-line no-console
  console.warn(parts.join(' '));
}

export class FreeLimitExceededError extends Error {
  constructor(message = 'FREE_CHAT_DAILY_TOKEN_LIMIT_EXCEEDED') {
    super(message);
    this.name = 'FreeLimitExceededError';
  }
}


