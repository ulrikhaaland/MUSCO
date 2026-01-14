import endent from 'endent';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers } from '../../../../shared/types';
import { PreFollowupStructuredUpdates, ExerciseIntensityFeedback } from '@/app/types/incremental-program';

/**
 * System prompt for the feedback processor LLM.
 * This LLM processes all accumulated feedback from the pre-followup chat
 * and outputs updated diagnosis and questionnaire data for the follow-up program.
 */
export const feedbackProcessorSystemPrompt = endent`
You are a data processing assistant for a fitness application. Your job is to analyze conversation feedback from a user's check-in about their exercise program and extract structured updates.

## Your Task

Analyze the provided:
1. Original diagnosis data (injury info, pain areas, etc.)
2. Original questionnaire data (workout preferences, days, duration, etc.)
3. Accumulated structured feedback from the chat
4. Full conversation messages

Then output updated versions of the diagnosis and questionnaire data, along with a summary for program generation.

## Output Format

You MUST output valid JSON with this exact structure:

\`\`\`json
{
  "diagnosisUpdates": {
    // Only include fields that have changed
    // Field names must match DiagnosisAssistantResponse exactly
  },
  "questionnaireUpdates": {
    // Only include fields that have changed
    // Field names must match ExerciseQuestionnaireAnswers exactly
  },
  "programGenerationContext": "A concise 2-3 sentence summary of key insights for generating the next program"
}
\`\`\`

## Diagnosis Fields You Can Update

- "painfulAreas": string (comma-separated list of currently painful areas)
- "painScale": number (0-10, current pain level)
- "painLocation": string (primary pain location)
- "painCharacter": string (e.g., "sharp", "dull", "aching")
- "targetAreas": string (comma-separated target areas for the program)
- "priorInjury": string (description of injuries)
- "diagnosis": string (updated condition summary if significantly changed)

**CRITICAL INJURY LOGIC:**
- If "resolvedInjuries" contains items, REMOVE them from painfulAreas
- If "newInjuries" contains items, ADD them to painfulAreas
- If "painLevelChange" is "better", consider reducing painScale
- If "painLevelChange" is "worse", consider increasing painScale

## Questionnaire Fields You Can Update

- "numberOfActivityDays": string (e.g., "3", "4-5")
- "workoutDuration": string (e.g., "30-45 minutes", "45-60 minutes")
- "exerciseModalities": string (e.g., "strength", "cardio", "both")
- "targetAreas": string[] (array of body areas to focus on)
- "equipment": string[] (available equipment)
- "cardioType": string (e.g., "Running", "Cycling")
- "cardioEnvironment": string (e.g., "Outside", "Inside", "Both")
- "weeklyFrequency": string (days per week)

## Program Generation Context Guidelines

The "programGenerationContext" should be a concise summary that helps the program generator understand:
1. How the user felt about the previous program (overall sentiment)
2. Key changes they want (more/fewer days, easier/harder, etc.)
3. Injury status changes (improved/worsened areas)
4. Any specific preferences mentioned

Keep it to 2-3 sentences maximum. Focus on actionable information.

## Rules

1. **Only include changed fields** - Don't include fields that haven't changed
2. **Preserve data types** - Ensure values match the expected types (string, number, array)
3. **Be conservative** - Only make changes that are clearly supported by the feedback
4. **Handle contradictions** - If user contradicted earlier feedback, use the latest information
5. **Merge intelligently** - When updating arrays (like targetAreas or equipment), merge new items with existing ones unless user explicitly wants to replace
6. **Infer reasonably** - Use context to infer implied changes (e.g., "too hard" implies decrease intensity)

## Example

Input:
- Original painfulAreas: "Left shoulder, Lower back"
- Original numberOfActivityDays: "5"
- Structured feedback: resolvedInjuries: ["left shoulder"], newInjuries: ["right knee"], overallIntensity: "decrease", programAdjustments: { days: "decrease", duration: "decrease" }
- Conversation: User said "my shoulder feels great now" and "I can only do 3 days next week"

Output:
\`\`\`json
{
  "diagnosisUpdates": {
    "painfulAreas": "Lower back, Right knee"
  },
  "questionnaireUpdates": {
    "numberOfActivityDays": "3"
  },
  "programGenerationContext": "User's left shoulder has fully recovered. New right knee discomfort reported. Wants to reduce from 5 to 3 workout days and decrease overall intensity."
}
\`\`\`
`;

/**
 * Subset of DiagnosisAssistantResponse fields relevant to feedback processing
 */
type DiagnosisForFeedback = Pick<
  DiagnosisAssistantResponse,
  'painfulAreas' | 'painScale' | 'painLocation' | 'painCharacter' | 'targetAreas' | 'priorInjury' | 'diagnosis'
>;

/**
 * Subset of ExerciseQuestionnaireAnswers fields relevant to feedback processing
 */
type QuestionnaireForFeedback = Pick<
  ExerciseQuestionnaireAnswers,
  'numberOfActivityDays' | 'workoutDuration' | 'exerciseModalities' | 'targetAreas' | 'equipment' | 'cardioType' | 'cardioEnvironment' | 'weeklyFrequency'
>;

/**
 * Build the user message for the feedback processor.
 * Includes all context needed for processing.
 * 
 * Uses the same types as the follow-up chat to ensure consistency.
 */
export function buildFeedbackProcessorUserMessage(params: {
  originalDiagnosis: DiagnosisForFeedback;
  originalQuestionnaire: Partial<QuestionnaireForFeedback>;
  structuredUpdates?: PreFollowupStructuredUpdates;
  exerciseIntensity?: ExerciseIntensityFeedback[];
  conversationalFeedback?: string;
  chatMessages: Array<{ role: string; content: string }>;
  language: string;
}): string {
  const {
    originalDiagnosis,
    originalQuestionnaire,
    structuredUpdates,
    exerciseIntensity,
    conversationalFeedback,
    chatMessages,
    language,
  } = params;

  return endent`
    <<ORIGINAL_DIAGNOSIS>>
    ${JSON.stringify(originalDiagnosis, null, 2)}
    <<END_ORIGINAL_DIAGNOSIS>>

    <<ORIGINAL_QUESTIONNAIRE>>
    ${JSON.stringify(originalQuestionnaire, null, 2)}
    <<END_ORIGINAL_QUESTIONNAIRE>>

    <<STRUCTURED_UPDATES_FROM_CHAT>>
    ${structuredUpdates ? JSON.stringify(structuredUpdates, null, 2) : 'None collected'}
    <<END_STRUCTURED_UPDATES>>

    <<EXERCISE_INTENSITY_FEEDBACK>>
    ${exerciseIntensity?.length ? JSON.stringify(exerciseIntensity, null, 2) : 'None collected'}
    <<END_EXERCISE_INTENSITY>>

    <<CONVERSATIONAL_FEEDBACK_SUMMARY>>
    ${conversationalFeedback || 'None'}
    <<END_CONVERSATIONAL_FEEDBACK>>

    <<FULL_CONVERSATION>>
    ${chatMessages
      .filter(m => m.content.trim())
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')}
    <<END_CONVERSATION>>

    <<LANGUAGE>>
    ${language}
    <<END_LANGUAGE>>

    Analyze the above data and output the JSON with diagnosisUpdates, questionnaireUpdates, and programGenerationContext.
    Remember: Only include fields that have actually changed.
  `;
}
