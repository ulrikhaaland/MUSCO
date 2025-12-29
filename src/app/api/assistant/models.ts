/**
 * Centralized AI model configuration
 * All endpoints now use the responses API, so gpt-5.2 is supported everywhere
 */

// Diagnosis assistant model (pain assessment)
export const DIAGNOSIS_MODEL = process.env.DIAGNOSIS_MODEL || 'gpt-5.2';

// Explore assistant model (exercise education)
export const EXPLORE_MODEL = process.env.EXPLORE_MODEL || 'gpt-5.2';

// Program generation model
export const PROGRAM_MODEL = process.env.PROGRAM_MODEL || 'gpt-5.2';

// Follow-up program generation model
export const FOLLOWUP_MODEL = process.env.FOLLOWUP_MODEL || 'gpt-5.2';

// Pre-followup chat model (feedback collection)
export const PRE_FOLLOWUP_CHAT_MODEL = process.env.PRE_FOLLOWUP_CHAT_MODEL || 'gpt-5.2';

// Router model for determining chat mode (lightweight)
export const ROUTER_MODEL = process.env.ROUTER_MODEL || 'gpt-5.2';

// Title generation model (lightweight)
export const TITLE_MODEL = process.env.TITLE_MODEL || 'gpt-5.2';
