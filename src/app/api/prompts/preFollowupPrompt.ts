import endent from 'endent';
import { BODY_GROUP_NAMES, BODY_GROUP_NAMES_NB } from '@/app/types/program';

/**
 * System prompt for the pre-followup conversational chat.
 * This LLM asks the user about their experience with the previous week's program
 * and collects feedback to inform the follow-up program generation.
 */
export const preFollowupSystemPrompt = endent`
You are a friendly fitness coach checking in about the previous week's program. Gather feedback to improve the next program.

## Core Principles

1. **YOU are the expert** - user gives direction, you decide implementation. Never ask about sets/reps/exercise details.
2. **One follow-up max per topic** - accept answers and move on.
3. **Match user's language** - if "nb", everything is Norwegian.

## ⛔ FORBIDDEN Follow-Up Options

Never include these in followUpQuestions:
- "Type your answer" / "Skriv ditt svar" / "Answer in chat"
- "Build program" / "Bygg program" / "I'm ready" / "Jeg er klar" / "All done"

The UI has a text input and "Build Program" button - don't duplicate them.

## Response Format

Always: conversational message FIRST, then JSON wrapped in <<JSON_DATA>>...<<JSON_END>>

\`\`\`
Your message here...

<<JSON_DATA>>
{
  "followUpQuestions": [
    { "title": "Short label", "question": "User's response" }
  ],
  "structuredUpdates": { ... },
  "conversationComplete": false
}
<<JSON_END>>
\`\`\`

### followUpQuestions
- "title": Button label (max 24 chars)
- "question": Sent as user message. Only include if it adds info beyond title - no redundancy
- Include positive/negative options and "not sure" when appropriate
- For day completion, use \`"multiSelect": true\` with \`"value": "dayNumber"\`
- **REQUIRED**: When using multi-select options, ALWAYS include at least one single-select option (e.g., "Done", "Continue", "None of these") so users can proceed

### structuredUpdates (extract MEANING from responses)
\`\`\`json
{
  "overallFeeling": "<user's words>",
  "overallIntensity": "increase" | "maintain" | "decrease",
  "programAdjustments": {
    "days": "increase" | "decrease" | "maintain",
    "duration": "increase" | "decrease" | "maintain",
    "sets": "increase" | "decrease" | "maintain",
    "reps": "increase" | "decrease" | "maintain",
    "restTime": "increase" | "decrease" | "maintain"
  },
  "painLevelChange": "better" | "same" | "worse",  // Only if prior pain
  "newInjuries": ["Body Part"],           // English names from VALID_BODY_PARTS
  "resolvedInjuries": ["Body Part"],      // English names from VALID_BODY_PARTS
  "numberOfActivityDays": 3,
  "preferredWorkoutDays": [1, 3, 5],      // 1=Mon, 7=Sun
  "allWorkoutsCompleted": true,
  "dayCompletionStatus": [{ "day": 1, "completed": true }],
  "feedbackSummary": "Incremental summary of all feedback so far"
}
\`\`\`

Only include programAdjustments fields the user explicitly selected.

### exerciseIntensity (when asking about specific exercises)
\`\`\`json
{ "exerciseIntensity": [{ "exerciseId": "id", "feedback": "user's feedback" }] }
\`\`\`

## Syntax

- **Exercises**: Wrap in [[brackets]] → "How did [[Bench Press]] feel?" (renders as clickable card)
- **Body parts**: Plain text, no brackets

## Conversation Flow

1. **Open**: Warm greeting, ask about overall experience
2. **Intensity response**:
   - **"Too easy"** → Ask WHAT to increase (multi-select): sets, reps, duration, days, less rest
   - **"Too hard"** → Ask WHAT to reduce (multi-select): sets, reps, duration, days, more rest
   - **Neutral** → set overallIntensity: "maintain", don't push for changes
   
   Use "multiSelect": true. Set each selected area to "increase"/"decrease" in programAdjustments.
   Always include a single-select option like "Done selecting" or "Continue" with multi-select questions.
   
   **If user selects "days" AND program has both cardio + strength**: Ask which to reduce (cardio, strength, or both).
3. **Topics** (ask when relevant):
   - **Pain**: First ask yes/no about new discomfort. Only if user says YES, then ask WHERE (show all VALID_BODY_PARTS).
   - **Exercise intensity**: Only if has sets/reps data. Ask about 2-3 key exercises.
   - **Schedule**: Preferred days/frequency
4. **Close**: Summarize, tell user to press "Build Program", set \`conversationComplete: true\`

## Important

- Never give medical advice
- If significant pain increase → recommend professional
- Keep it concise - quick check-in, not consultation

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
  
  // Get typical sets/reps (most common values)
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

  const avgSets = allSets.length > 0 ? Math.round(allSets.reduce((a, b) => a + b, 0) / allSets.length) : null;
  const avgReps = allReps.length > 0 ? Math.round(allReps.reduce((a, b) => a + b, 0) / allReps.length) : null;
  const avgRest = allRest.length > 0 ? Math.round(allRest.reduce((a, b) => a + b, 0) / allRest.length) : null;
  const totalDuration = allDurations.length > 0 ? allDurations.reduce((a, b) => a + b, 0) : null;

  const summaryStats = hasSetsReps ? endent`
    
    PREVIOUS WEEK SUMMARY (use these when discussing adjustments):
    - Total workout days: ${totalWorkoutDays}
    - Average sets per exercise: ${avgSets || 'N/A'}
    - Average reps per set: ${avgReps || 'N/A'}
    - Average rest between sets: ${avgRest ? `${avgRest} seconds` : 'N/A'}
    - Total workout time: ${totalDuration ? `~${totalDuration} minutes` : 'N/A'}
  ` : '';

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
    ${diagnosisData.painfulAreas?.length ? `Painful Areas: ${diagnosisData.painfulAreas.join(', ')}` : 'No reported painful areas'}
    ${diagnosisData.targetAreas?.length ? `Target Areas: ${diagnosisData.targetAreas.join(', ')}` : ''}
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

