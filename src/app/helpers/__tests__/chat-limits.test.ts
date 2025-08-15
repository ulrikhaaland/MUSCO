import {
  ENFORCE_CHAT_LIMITS,
  FREE_DAILY_TOKENS,
  ESTIMATED_RESPONSE_TOKENS,
  estimateTokensFromString,
  estimateJsonTokens,
  ANON_COOKIE_NAME,
} from '@/app/lib/chatLimits';

describe('chatLimits shared module', () => {
  test('exports sane constants', () => {
    expect(typeof ENFORCE_CHAT_LIMITS).toBe('boolean');
    expect(FREE_DAILY_TOKENS).toBeGreaterThan(0);
    expect(ESTIMATED_RESPONSE_TOKENS).toBeGreaterThan(0);
    expect(ANON_COOKIE_NAME).toBe('musco_anon_id');
  });

  test('token estimators are consistent', () => {
    const s = 'abcd';
    expect(estimateTokensFromString(s)).toBeGreaterThan(0);

    const obj = { a: 1, b: 'test', c: [1, 2, 3] };
    const jsonStr = JSON.stringify(obj);
    expect(estimateJsonTokens(obj)).toBe(estimateTokensFromString(jsonStr));
  });
});


