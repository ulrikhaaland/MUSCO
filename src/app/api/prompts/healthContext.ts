/**
 * Health Context Extraction for Chat Prompts
 * 
 * Extracts and formats health data from existing types (UserProfile, 
 * ExerciseQuestionnaireAnswers, DiagnosisAssistantResponse) for prompt injection.
 * 
 * Uses existing types as single source of truth - no duplicate definitions.
 */

import { UserProfile } from '@/app/types/user';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers } from '../../../../shared/types';

/** Input for health context - uses existing types directly */
export interface HealthContextInput {
  userProfile?: UserProfile;
  questionnaireAnswers?: Partial<ExerciseQuestionnaireAnswers>;
  diagnosisResponse?: Partial<DiagnosisAssistantResponse>;
}

/** Options for formatting */
export interface FormatOptions {
  language?: string;
  maxLength?: number;
}  

// Norwegian labels for i18n
const LABELS_NB: Record<string, string> = {
  physical: 'Fysisk', medical: 'Medisinsk', fitness: 'Treningsnivå',
  current: 'Nåværende', goals: 'Mål', notes: 'Notater', sleep: 'Søvn',
};

/** Parse comma-separated string or array into clean array */
function toArray(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => v?.trim());
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/** Merge arrays, deduplicating (case-insensitive) */
function mergeUnique(...arrays: string[][]): string[] {
  const seen = new Set<string>();
  return arrays.flat().filter(item => {
    const key = item?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Calculate age from date of birth */
function calcAge(dob: string | undefined): string | undefined {
  if (!dob) return undefined;
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || 
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age}` : undefined;
  } catch { return undefined; }
}

/**
 * Build health context string for prompt injection.
 * Extracts from existing types and formats as concise text block.
 * 
 * Priority when same field exists in multiple sources:
 * 1. DiagnosisAssistantResponse (most recent)
 * 2. ExerciseQuestionnaireAnswers (session-specific)
 * 3. UserProfile (background/baseline)
 */
export function buildHealthContextForPrompt(
  input: HealthContextInput,
  options: FormatOptions = {}
): string {
  const { userProfile: p, questionnaireAnswers: q, diagnosisResponse: d } = input;
  const { language = 'en', maxLength } = options;
  const isNb = language === 'nb' || language === 'no';
  const L = (key: string, en: string) => isNb ? (LABELS_NB[key] || en) : en;
  
  const lines: string[] = [];
  
  // Physical profile
  const physical = [
    p?.gender,
    q?.age || calcAge(p?.dateOfBirth),
    p?.height,
    p?.weight,
  ].filter(Boolean);
  if (physical.length) lines.push(`${L('physical', 'Physical')}: ${physical.join(', ')}`);
  
  // Medical background (only from UserProfile)
  const medParts: string[] = [];
  const conditions = toArray(p?.medicalConditions);
  const medications = toArray(p?.medications);
  const injuries = toArray(p?.injuries);
  const familyHist = toArray(p?.familyHistory);
  if (conditions.length) medParts.push(`conditions: ${conditions.join(', ')}`);
  if (medications.length) medParts.push(`medications: ${medications.join(', ')}`);
  if (injuries.length) medParts.push(`injuries: ${injuries.join(', ')}`);
  if (familyHist.length) medParts.push(`family history: ${familyHist.join(', ')}`);
  if (medParts.length) lines.push(`${L('medical', 'Medical')}: ${medParts.join('; ')}`);
  
  // Exercise context (questionnaire > profile)
  const exParts: string[] = [];
  const fitness = p?.fitnessLevel || q?.experienceLevel;
  const freq = q?.numberOfActivityDays || q?.weeklyFrequency || p?.exerciseFrequency;
  const modality = q?.exerciseModalities || (Array.isArray(p?.exerciseModalities) ? p.exerciseModalities.join(', ') : p?.exerciseModalities);
  const duration = q?.workoutDuration || p?.workoutDuration;
  const env = q?.exerciseEnvironments || (Array.isArray(p?.exerciseEnvironments) ? p.exerciseEnvironments.join(', ') : p?.exerciseEnvironments);
  if (fitness) exParts.push(`level: ${fitness}`);
  if (freq) exParts.push(`frequency: ${freq}`);
  if (modality) exParts.push(`type: ${modality}`);
  if (duration) exParts.push(`duration: ${duration}`);
  if (env) exParts.push(`environment: ${env}`);
  if (q?.equipment?.length) exParts.push(`equipment: ${q.equipment.join(', ')}`);
  if (exParts.length) lines.push(`${L('fitness', 'Fitness')}: ${exParts.join(', ')}`);
  
  // Sleep
  if (p?.sleepPattern) lines.push(`${L('sleep', 'Sleep')}: ${p.sleepPattern}`);
  
  // Current assessment (diagnosis > questionnaire > profile)
  const curParts: string[] = [];
  if (d?.diagnosis) curParts.push(`diagnosis: ${d.diagnosis}`);
  const painAreas = mergeUnique(
    toArray(d?.painfulAreas),
    q?.generallyPainfulAreas || [],
    p?.painfulAreas || []
  );
  if (painAreas.length) {
    const painStr = d?.painScale != null 
      ? `${painAreas.join(', ')} (${d.painScale}/10${d.painCharacter ? `, ${d.painCharacter}` : ''})`
      : painAreas.join(', ');
    curParts.push(`pain: ${painStr}`);
  }
  const targets = toArray(d?.targetAreas) || q?.targetAreas || p?.targetAreas || [];
  if (targets.length) curParts.push(`targeting: ${targets.join(', ')}`);
  const avoid = toArray(d?.avoidActivities);
  if (avoid.length) curParts.push(`avoid: ${avoid.join(', ')}`);
  if (curParts.length) lines.push(`${L('current', 'Current')}: ${curParts.join('; ')}`);
  
  // Goals
  const goalParts: string[] = [];
  if (p?.healthGoals?.length) goalParts.push(`goals: ${p.healthGoals.join(', ')}`);
  if (p?.dietaryPreferences?.length) goalParts.push(`dietary: ${p.dietaryPreferences.join(', ')}`);
  if (goalParts.length) lines.push(`${L('goals', 'Goals')}: ${goalParts.join('; ')}`);
  
  // Custom notes (user's explicit AI guidance)
  const notes = p?.customNotes?.filter(n => n?.trim());
  if (notes?.length) lines.push(`${L('notes', 'Notes')}: ${notes.map(n => `"${n}"`).join(', ')}`);
  
  if (!lines.length) return '';
  
  let result = `<<USER_HEALTH_CONTEXT>>\n${lines.join('\n')}\n<<END_USER_HEALTH_CONTEXT>>`;
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...';
  }
  return result;
}

/** Check if input has any meaningful health data */
export function hasHealthContext(input: HealthContextInput): boolean {
  const { userProfile: p, questionnaireAnswers: q, diagnosisResponse: d } = input;
  return !!(
    p?.height || p?.weight || p?.gender || p?.dateOfBirth ||
    p?.medicalConditions || p?.medications || p?.injuries ||
    p?.fitnessLevel || p?.sleepPattern || p?.healthGoals?.length ||
    p?.customNotes?.length || p?.painfulAreas?.length ||
    q?.age || q?.generallyPainfulAreas?.length || q?.targetAreas?.length ||
    d?.diagnosis || d?.painfulAreas || d?.painScale
  );
}
