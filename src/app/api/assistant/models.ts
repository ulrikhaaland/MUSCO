/**
 * Centralized AI model configuration
 * Different models optimized for different tasks
 */

// Diagnosis assistant model (used for pain assessment)
export const DIAGNOSIS_MODEL = process.env.DIAGNOSIS_MODEL || 'gpt-4.1';

// Explore assistant model (used for exercise education)
export const EXPLORE_MODEL = process.env.EXPLORE_MODEL || 'gpt-5-mini';

// Program generation model
export const PROGRAM_MODEL = process.env.PROGRAM_MODEL || 'gpt-5-mini';

// Follow-up program generation model
export const FOLLOWUP_MODEL = process.env.FOLLOWUP_MODEL || 'gpt-5-mini';

// Router model for determining chat mode
export const ROUTER_MODEL = process.env.ROUTER_MODEL || 'gpt-5-mini';

