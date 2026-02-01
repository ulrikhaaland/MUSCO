import endent from 'endent';
import { BODY_GROUP_NAMES, BODY_GROUP_NAMES_NB } from '@/app/types/program';

/**
 * System prompt for the pre-followup conversational chat.
 * This LLM asks the user about their experience with the previous week's program
 * and collects feedback to inform the follow-up program generation.
 */
export const preFollowupSystemPrompt = endent`
You are a friendly fitness coach checking in about the previous week's program. Gather feedback to improve the next program.

RULES:
1. You are the expert - user gives direction, you decide implementation. Never ask about sets/reps/exercise details.
2. One follow-up max per topic - accept answers and move on.
3. Match user's language - if "nb", everything is Norwegian.

USER HEALTH CONTEXT:
If a <<USER_HEALTH_CONTEXT>> block is present, use it to personalize your check-in:
- Consider their medical conditions/medications when discussing pain or intensity
- Factor in their fitness level when suggesting adjustments
- Respect any custom notes they've provided (e.g., schedule preferences)
- Don't ask about known injuries/conditions unless checking for changes
- Use their stated goals to frame the conversation positively

FORBIDDEN followUpQuestions (UI provides these):
Any free-text/open-ended options, "Build program", "I'm ready", "All done" (and Norwegian equivalents)

RESPONSE FORMAT:
Message first (question only, NO answer options listed), then JSON in <<JSON_DATA>>...<<JSON_END>>

BAD: "How did it feel—too easy, about right, or too hard?"
GOOD: "How did it feel overall?" (options go in followUpQuestions)

followUpQuestions:
  title: Short button label (max 24 chars), no subtitles
  multiSelect: true when user can pick multiple. Last option (e.g. "Not sure") should NOT have multiSelect.

structuredUpdates:
{
  "overallFeeling": "<user's words>",
  "overallIntensity": "increase" | "maintain" | "decrease",
  "programAdjustments": { "days"|"duration"|"sets"|"reps"|"restTime": "increase"|"decrease"|"maintain" },
  "painLevelChange": "better" | "same" | "worse",
  "newInjuries": ["Body Part from VALID_BODY_PARTS"],
  "resolvedInjuries": ["Body Part"],
  "numberOfActivityDays": 3,
  "preferredWorkoutDays": [1, 3, 5],
  "allWorkoutsCompleted": true,
  "dayCompletionStatus": [{ "day": 1, "completed": true }],
  "feedbackSummary": "Incremental summary"
}
Only include programAdjustments fields user explicitly selected.

exerciseIntensity (if asking about specific exercises):
{ "exerciseIntensity": [{ "exerciseId": "id", "feedback": "..." }] }

SYNTAX:
Exercises: [[Bench Press]] (renders as card)
Body parts: plain text

PROGRAM PARAMETERS:
Exercise: sets, repetitions, rest (seconds), duration (minutes), name, modification, warmup
Day: day (1=Mon), dayType (strength/cardio/recovery/rest), duration
Program: programOverview, targetAreas, whatNotToDo

PROGRAM TYPES:
exercise = strength/cardio for fitness
recovery = mobility/stretching/rehab
exercise_and_recovery = both

Only offer adjustments for parameters in PREVIOUS_PROGRAM context.

FLOW:
1. Open: Ask about overall experience
2. Intensity:
   "Too easy" → multi-select: what to increase (from available params)
   "Too hard" → multi-select: what to reduce
   "About right" → maintain, don't push changes
   If "days" selected AND has cardio+strength → ask which to adjust
3. Topics (when relevant):
   Pain: yes/no first, then WHERE if yes (show VALID_BODY_PARTS)
   Exercise intensity: only if has sets/reps data
4. Close: Summarize, tell user to press "Build Program", set conversationComplete: true

Never give medical advice. If significant pain → recommend professional.
`;

/**
 * Build the user message context for the pre-followup chat.
 * This includes the previous program, diagnosis data, and questionnaire answers.
 */
// Day number to name mapping
const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_NB = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

function getDayName(dayNumber: number, language: string): string {
  const names = language === 'nb' ? DAY_NAMES_NB : DAY_NAMES_EN;
  // Day 1 = Monday (index 0), Day 7 = Sunday (index 6)
  const index = ((dayNumber - 1) % 7);
  return names[index] || `Day ${dayNumber}`;
}

export function buildPreFollowupUserContext(params: {
  previousProgram: {
    title: string;
    createdAt?: Date | string;
    days: Array<{
      day: number;
      dayType: string;
      exercises: Array<{
        exerciseId: string;
        name?: string;
        sets?: number;
        reps?: number;
        restBetweenSets?: number;
        duration?: number;
      }>;
    }>;
  };
  diagnosisData: {
    diagnosis?: string;
    painfulAreas?: string[];
    programType?: string;
    targetAreas?: string[];
  };
  questionnaireData: {
    numberOfActivityDays?: number;
    workoutDuration?: string;
    exerciseModalities?: string;
  };
  exerciseNames: Map<string, string>; // exerciseId -> name
  language: string;
}): string {
  const { previousProgram, diagnosisData, questionnaireData, exerciseNames, language } = params;
  
  // Temporal context
  const currentDate = new Date();
  const programCreatedAt = previousProgram.createdAt 
    ? new Date(previousProgram.createdAt) 
    : null;
  
  // Calculate how long ago the program was created
  const daysSinceProgramCreated = programCreatedAt 
    ? Math.floor((currentDate.getTime() - programCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Build exercise list with names - show [[name]] format so LLM knows how to reference them
  const exerciseList = previousProgram.days
    .filter(d => d.exercises?.length > 0)
    .map(d => {
      const dayName = getDayName(d.day, language);
      const exercises = d.exercises.map(e => {
        const name = exerciseNames.get(e.exerciseId) || e.name || e.exerciseId;
        const intensityInfo = e.sets && e.reps 
          ? ` (${e.sets}x${e.reps}${e.restBetweenSets ? `, ${e.restBetweenSets}s rest` : ''})` 
          : e.duration 
            ? ` (${e.duration} min)` 
            : '';
        // Show as [[name]] so LLM knows the exact format to use when referencing
        return `  - [[${name}]]${intensityInfo}`;
      }).join('\n');
      return `${dayName} (${d.dayType}):\n${exercises}`;
    }).join('\n\n');

  const hasSetsReps = previousProgram.days.some(d => 
    d.exercises?.some(e => e.sets !== undefined && e.reps !== undefined)
  );

  // Calculate summary stats for previous program
  const workoutDays = previousProgram.days.filter(d => d.dayType !== 'rest');
  const totalWorkoutDays = workoutDays.length;
  
  // Helper to get median value
  const median = (arr: number[]): number | null => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };
  
  // Collect all values from exercises
  const allSets: number[] = [];
  const allReps: number[] = [];
  const allRest: number[] = [];
  const allDurations: number[] = [];
  
  previousProgram.days.forEach(d => {
    d.exercises?.forEach(e => {
      if (e.sets) allSets.push(e.sets);
      if (e.reps) allReps.push(e.reps);
      if (e.restBetweenSets) allRest.push(e.restBetweenSets);
      if (e.duration) allDurations.push(e.duration);
    });
  });

  const medianSets = median(allSets);
  const medianReps = median(allReps);
  const medianRest = median(allRest);
  const totalDuration = allDurations.length > 0 ? allDurations.reduce((a, b) => a + b, 0) : null;

  // Build summary - only include params that have data
  const summaryLines = [
    `- Total workout days: ${totalWorkoutDays}`,
    medianSets !== null ? `- Typical sets per exercise: ${medianSets}` : null,
    medianReps !== null ? `- Typical reps per set: ${medianReps}` : null,
    medianRest !== null ? `- Typical rest between sets: ${medianRest} seconds` : null,
    totalDuration !== null ? `- Total session duration: ~${totalDuration} minutes` : null,
  ].filter(Boolean).join('\n');

  const summaryStats = endent`
    
    PREVIOUS WEEK SUMMARY (only offer adjustments for parameters listed here):
    ${summaryLines}
  `;

  // Build a clear list of workout days (non-rest) for completion question
  const workoutDaysList = previousProgram.days
    .filter(d => d.dayType !== 'rest')
    .map(d => `${getDayName(d.day, language)} (${d.dayType})`)
    .join(', ');

  // Format dates for context
  const formatDate = (d: Date) => d.toLocaleDateString(language === 'nb' ? 'nb-NO' : 'en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const temporalContext = programCreatedAt 
    ? endent`
      <<TEMPORAL_CONTEXT>>
      Today's date: ${formatDate(currentDate)}
      Previous program was created: ${formatDate(programCreatedAt)} (${daysSinceProgramCreated} days ago)
      
      IMPORTANT: This chat is about the user's experience with THAT previous program week.
      - If the program was created recently (≤7 days), ask about "this past week" or "last week"
      - If older (>7 days), acknowledge the gap: "Since your last program was a few weeks back..."
      - All pain/discomfort questions refer to NEW issues that arose DURING or SINCE that program
      - Do NOT ask about pain "this week" as if it's current - frame relative to when they did the program
      <<END_TEMPORAL_CONTEXT>>
    `
    : '';

  return endent`
    ${temporalContext}
    
    <<PREVIOUS_PROGRAM>>
    Title: ${previousProgram.title}
    Created: ${programCreatedAt ? formatDate(programCreatedAt) : 'Unknown'}
    Program Type: ${diagnosisData.programType || 'exercise'}
    Workout Days: ${questionnaireData.numberOfActivityDays || 'not specified'}
    Duration Preference: ${questionnaireData.workoutDuration || 'not specified'}
    Has Sets/Reps Data: ${hasSetsReps ? 'Yes - you can ask about exercise intensity' : 'No - skip exercise intensity questions'}
    ${summaryStats}
    
    WORKOUT DAYS LIST (use this when asking about completion):
    ${workoutDaysList || 'No workout days found'}
    
    When asking about workout completion, provide each workout day as a MULTI-SELECT option.
    Use "multiSelect": true on each day option so user can select which days they COMPLETED.
    Always frame positively - ask about completed workouts, not missed ones.

    EXERCISES (use [[name]] format EXACTLY as shown when referencing):
    ${exerciseList}
    <<END_PREVIOUS_PROGRAM>>

    <<DIAGNOSIS_CONTEXT>>
    ${diagnosisData.diagnosis ? `Condition: ${diagnosisData.diagnosis}` : 'No specific diagnosis'}
    ${Array.isArray(diagnosisData.painfulAreas) && diagnosisData.painfulAreas.length ? `Painful Areas: ${diagnosisData.painfulAreas.join(', ')}` : diagnosisData.painfulAreas ? `Painful Areas: ${diagnosisData.painfulAreas}` : 'No reported painful areas'}
    ${Array.isArray(diagnosisData.targetAreas) && diagnosisData.targetAreas.length ? `Target Areas: ${diagnosisData.targetAreas.join(', ')}` : ''}
    <<END_DIAGNOSIS_CONTEXT>>

    <<LANGUAGE_LOCK>>
    Language: ${language}
    <<END_LANGUAGE_LOCK>>

    <<VALID_BODY_PARTS>>
    Use these EXACT English names for newInjuries/resolvedInjuries arrays (one per line):
${BODY_GROUP_NAMES.map((name, i) => `    ${i + 1}. "${name}"${language === 'nb' ? ` → "${BODY_GROUP_NAMES_NB[name]}"` : ''}`).join('\n')}
    <<END_VALID_BODY_PARTS>>
  `;
}

