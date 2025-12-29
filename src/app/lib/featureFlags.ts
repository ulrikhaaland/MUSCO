// Client-safe feature flags (no WASM or server-only dependencies)

// When false, all users are treated as subscribers (no rate limits, hide subscribe CTAs)
export const SUBSCRIPTIONS_ENABLED: boolean = (process.env.SUBSCRIPTIONS_ENABLED ?? 'false') !== 'false';

// When true, users can generate follow-up programs anytime (no waiting for next week)
export const DISABLE_FOLLOWUP_RESTRICTIONS: boolean = true;


















