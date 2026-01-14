/**
 * Centralized AI model configuration
 * All endpoints now use the responses API, so gpt-5.2 is supported everywhere
 * 
 * Reasoning options (for o-series and supported models):
 * - undefined: No reasoning (fastest, cheapest)
 * - { effort: 'low' }: Light reasoning
 * - { effort: 'medium' }: Balanced reasoning
 * - { effort: 'high' }: Deep reasoning (slowest, most thorough)
 */

// Type for reasoning configuration
export type ReasoningConfig = { effort: 'low' | 'medium' | 'high' } | undefined;

// Model configuration type
export interface ModelConfig {
  model: string;
  reasoning: ReasoningConfig;
}

// ─────────────────────────────────────────────────────────────
// Model Configurations
// ─────────────────────────────────────────────────────────────

// Diagnosis assistant model (pain assessment)
export const DIAGNOSIS_CONFIG: ModelConfig = {
  model: process.env.DIAGNOSIS_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - conversational flow
};
export const DIAGNOSIS_MODEL = DIAGNOSIS_CONFIG.model;
export const DIAGNOSIS_REASONING = DIAGNOSIS_CONFIG.reasoning;

// Explore assistant model (exercise education)
export const EXPLORE_CONFIG: ModelConfig = {
  model: process.env.EXPLORE_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - educational content
};
export const EXPLORE_MODEL = EXPLORE_CONFIG.model;
export const EXPLORE_REASONING = EXPLORE_CONFIG.reasoning;

// Explainer model (body part tooltips in 3D viewer)
export const EXPLAINER_CONFIG: ModelConfig = {
  model: process.env.EXPLAINER_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - quick tooltip explanations
};
export const EXPLAINER_MODEL = EXPLAINER_CONFIG.model;
export const EXPLAINER_REASONING = EXPLAINER_CONFIG.reasoning;

// Program generation model
export const PROGRAM_CONFIG: ModelConfig = {
  model: process.env.PROGRAM_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - structured JSON output
};
export const PROGRAM_MODEL = PROGRAM_CONFIG.model;
export const PROGRAM_REASONING = PROGRAM_CONFIG.reasoning;

// Follow-up program generation model (legacy, unused)
export const FOLLOWUP_CONFIG: ModelConfig = {
  model: process.env.FOLLOWUP_MODEL || 'gpt-5.2',
  reasoning: undefined,
};
export const FOLLOWUP_MODEL = FOLLOWUP_CONFIG.model;
export const FOLLOWUP_REASONING = FOLLOWUP_CONFIG.reasoning;

// Pre-followup chat model (feedback collection)
export const PRE_FOLLOWUP_CHAT_CONFIG: ModelConfig = {
  model: process.env.PRE_FOLLOWUP_CHAT_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - conversational feedback
};
export const PRE_FOLLOWUP_CHAT_MODEL = PRE_FOLLOWUP_CHAT_CONFIG.model;
export const PRE_FOLLOWUP_CHAT_REASONING = PRE_FOLLOWUP_CHAT_CONFIG.reasoning;

// Feedback processor model (processes chat feedback before program generation)
export const FEEDBACK_PROCESSOR_CONFIG: ModelConfig = {
  model: process.env.FEEDBACK_PROCESSOR_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - structured data extraction
};
export const FEEDBACK_PROCESSOR_MODEL = FEEDBACK_PROCESSOR_CONFIG.model;
export const FEEDBACK_PROCESSOR_REASONING = FEEDBACK_PROCESSOR_CONFIG.reasoning;

// Router model for determining chat mode (lightweight)
export const ROUTER_CONFIG: ModelConfig = {
  model: process.env.ROUTER_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - fast classification
};
export const ROUTER_MODEL = ROUTER_CONFIG.model;
export const ROUTER_REASONING = ROUTER_CONFIG.reasoning;

// Title generation model (lightweight)
export const TITLE_CONFIG: ModelConfig = {
  model: process.env.TITLE_MODEL || 'gpt-5.2',
  reasoning: undefined, // No reasoning - simple title generation
};
export const TITLE_MODEL = TITLE_CONFIG.model;
export const TITLE_REASONING = TITLE_CONFIG.reasoning;

// ─────────────────────────────────────────────────────────────
// Helper to build reasoning param for API calls
// ─────────────────────────────────────────────────────────────
export function getReasoningParam(config: ReasoningConfig): Record<string, unknown> {
  if (!config) return {};
  return { reasoning: config };
}
