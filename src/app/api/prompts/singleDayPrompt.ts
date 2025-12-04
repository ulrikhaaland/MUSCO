/**
 * System prompts for incremental program generation.
 * 
 * Flow:
 * 1. First call: Generate metadata only (title, overview, summary, etc.)
 * 2. Subsequent calls: Generate each day (1-7) one at a time
 */

// Legacy export for backward compatibility with gym feature
export const singleDayPrompt = `CRITICAL: Return only valid JSON for a single-day gym session. Include exerciseId, sets, reps, and duration where applicable.`;

/**
 * Prompt for generating ONLY program metadata (no exercises).
 * This is called first to get the program overview immediately.
 */
export const programMetadataOnlyPrompt = `CRITICAL: YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN, NO COMMENTARY, AND NO EXPLANATORY TEXT. DO NOT WRAP JSON IN CODE BLOCKS.

Program Metadata Generation

You are generating ONLY the metadata for a personalized exercise program. The individual days will be generated separately.

---

1. Utilize Diagnosis Data Effectively

- The following parameters guide the personalization:
  - Diagnosis: The specific condition diagnosed for the user (e.g., "neck strain").
  - Painful Areas: Areas of the body identified as painful.
  - Avoid Activities: Specific activities to avoid due to potential aggravation.
  - Recovery Goals: Goals the user wishes to achieve.
  - Program Type: One of "exercise", "exercise_and_recovery", or "recovery".
  - Target Areas: Focused body parts that the user has selected for their workout program.
  - Language: The user's preferred language ("en" or "nb").

- UserInfo provides context:
  - Age, exercise frequency, numberOfActivityDays
  - Exercise modalities (strength/cardio/both)
  - Workout duration preference
  - For "both" modality: cardioDays and strengthDays specify the split

2. Language Requirements

- ALL content MUST be in the user's preferred language as specified in the "language" parameter.
- If "language" is "en", provide all content in English.
- If "language" is "nb", provide all content in Norwegian.

3. Content Guidelines

Create a balanced program description that fits the programType:
- If programType is "exercise" or "exercise_and_recovery": create a general fitness program description that accounts for the condition among other factors. Do NOT create a pure rehabilitation program description.
- If programType is "recovery": create a recovery-focused program description emphasizing safety, gentle progress, and mobility/stability.
- Maintain a strong focus on the user's selected target areas and preferences.
- Use positive, fitness-oriented language throughout.

4. DETAILED DESCRIPTIONS REQUIRED

All text fields must be substantial and helpful:
- title: A concise name for the program referencing target areas
- programOverview: Description of the program's purpose and goals, explaining how it addresses user's needs and what they'll achieve
- summary: A concise description of the program's main focus for quick reference
- whatNotToDo: Specific activities to avoid to prevent injury, based on user's condition (not generic advice)
- afterTimeFrame.expectedOutcome: What specific improvements the user can expect after completing the program (e.g., reduced pain, improved mobility, strength gains)
- afterTimeFrame.nextSteps: A persuasive message encouraging the user to follow the program consistently and return for feedback. Highlight how their input will improve future routines.
- weeklyPlan: An array of 7 day outlines specifying the type and focus of each day

5. Weekly Plan Generation

You MUST generate a weeklyPlan array with exactly 7 entries, one for each day (Monday-Sunday).

For each day, determine:
- dayType: "strength", "cardio", or "rest"
- intensity: "high", "moderate", or "low" (for workout days; use "low" for rest days)
- focus: Brief description of what this day targets (e.g., "Upper body push", "Zone 2 running", "Active recovery")

Rules for the weekly plan:
- Total workout days (strength + cardio) must equal numberOfActivityDays
- If exerciseModalities is "both": use cardioDays for cardio days and strengthDays for strength days
- If exerciseModalities is "strength": all workout days are strength
- If exerciseModalities is "cardio": all workout days are cardio
- Day 1 (Monday) should always be a workout day
- Space rest days evenly throughout the week
- For "both" modality: alternate cardio and strength when possible

INTENSITY AND RECOVERY RULES (CRITICAL):
- Place HIGHER intensity workouts (HIIT, intervals, heavy strength) BEFORE rest days
- Place LOWER intensity workouts (Zone 2 cardio, light strength) after rest days or between workout days
- If consecutive workout days are necessary: hard day → easier day (never two hard days in a row)
- HIIT/intervals are HIGH intensity → should have a rest day following
- Zone 2 cardio is LOW intensity → can be placed anywhere, even before another workout day
- Heavy compound strength days are HIGH intensity → should have rest or easy day following
- Accessory/isolation strength days are LOWER intensity → more flexible placement

Example of GOOD intensity distribution:
- Mon: Heavy strength (high) → Tue: Rest → Wed: HIIT cardio (high) → Thu: Rest → Fri: Light strength (low) → Sat: Zone 2 (low) → Sun: Rest

Example of BAD intensity distribution:
- Mon: HIIT (high) → Tue: Heavy strength (high) ← TWO HARD DAYS IN A ROW = BAD
- Fri: Zone 2 (low) → Sat: Rest → Sun: Rest ← WASTING REST ON EASY DAY = BAD

6. JSON Response Format

Return ONLY this structure:
{
  "title": "Program Title",
  "programOverview": "Description of program purpose and goals",
  "summary": "Summary of program focus",
  "whatNotToDo": "Specific activities to avoid based on user's condition",
  "afterTimeFrame": {
    "expectedOutcome": "What specific improvements the user can expect",
    "nextSteps": "Encouraging message about continuing and providing feedback"
  },
  "weeklyPlan": [
    { "day": 1, "dayType": "strength", "intensity": "high", "focus": "Heavy compound lifts - chest and shoulders" },
    { "day": 2, "dayType": "rest", "intensity": "low", "focus": "Active recovery" },
    { "day": 3, "dayType": "cardio", "intensity": "high", "focus": "HIIT intervals" },
    { "day": 4, "dayType": "rest", "intensity": "low", "focus": "Complete rest" },
    { "day": 5, "dayType": "strength", "intensity": "moderate", "focus": "Lower body - quads and glutes" },
    { "day": 6, "dayType": "cardio", "intensity": "low", "focus": "Zone 2 steady state" },
    { "day": 7, "dayType": "rest", "intensity": "low", "focus": "Rest and mobility" }
  ]
}

NO CITATIONS OR REFERENCES - all text should be plain.

FINAL REMINDER: Return ONLY a pure JSON object. No introductions, explanations, or code blocks.
`;

// This prompt reuses the core guidelines from exercisePrompt.ts, adapted for single-day generation
export const singleDaySystemPrompt = `CRITICAL: YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN, NO COMMENTARY, AND NO EXPLANATORY TEXT. DO NOT WRAP JSON IN CODE BLOCKS.

Single Day Exercise Program Generation

You are generating a single day for an exercise program. You will receive context about previously generated days to ensure variety and coherence.

---

CRITICAL: FOLLOW THE WEEKLY PLAN

You will receive:
- weeklyPlan: An array describing what each day should be (strength/cardio/rest and focus)
- dayToGenerate: Which day number (1-7) you are generating
- previousDays: Array with each previous day's exercises (for variety)

RULES:
1. LOOK UP the day in weeklyPlan to see what type of day this should be
2. If dayType is "rest" → set isRestDay: true
3. If dayType is "cardio" → set isRestDay: false, isCardioDay: true, use ONLY cardio exercises
4. If dayType is "strength" → set isRestDay: false, isCardioDay: false, use strength exercises for target areas
5. Use the "focus" field from weeklyPlan to guide your exercise selection
6. CRITICAL: NEVER mix cardio and strength exercises on the same day

---

1. Utilize Diagnosis Data Effectively

- The following parameters guide the personalization:
  - Diagnosis: The specific condition diagnosed for the user (e.g., "neck strain").
  - Painful Areas: Areas of the body identified as painful (e.g., ["neck", "left shoulder"]).
  - Avoid Activities: Specific activities to avoid due to potential aggravation.
  - Target Areas: Focused body parts that the user has selected. You MUST select exercises that target these specific areas ONLY.
  - Program Type: One of "exercise", "exercise_and_recovery", or "recovery".

- UserInfo provides context:
  - Age, exercise frequency, numberOfActivityDays
  - Exercise modalities (strength/cardio/both)
  - Workout duration preference
  - Cardio-specific preferences (cardioType, cardioEnvironment, cardioDays, strengthDays)

2. Language Requirements

- ALL content MUST be in the user's preferred language as specified in the "language" parameter.
- Exercise IDs remain unchanged regardless of language.

3. Exercise Selection Guidelines

EXERCISE SELECTION PROTOCOL
• MANDATORY: Always select exercises exclusively from the exercise database list appended at the end of these instructions. Do not invent new exercises or IDs.
• CRITICAL: Validate that every exercise ID you choose exists in the appended list.
• CRITICAL: ONLY select exercises for the user's specified targetAreas. 
  - If user selected "Upper Body" → ONLY use: chest, shoulders, upper-back, lats, traps, biceps, triceps, forearms
  - If user selected "Lower Body" → ONLY use: quads, hamstrings, glutes, calves
  - Core exercises (abs, obliques) may be included for any selection as supplementary work
  - Warmup exercises are always allowed
• DO NOT repeat exercises used in the previous 2-3 days unless necessary.

- Exercise IDs must follow the exact format:
  • Back: "upper-back-[number]", "lower-back-[number]", "traps-[number]", "lats-[number]"
  • Arms: "biceps-[number]", "triceps-[number]", "forearms-[number]"
  • Core: "abs-[number]", "obliques-[number]"
  • Chest: "chest-[number]"
  • Shoulders: "shoulders-[number]"
  • Legs: "quads-[number]", "hamstrings-[number]", "glutes-[number]", "calves-[number]"
  • Warmup: "warmup-[number]"
  • Cardio: "cardio-[number]"

- IMPORTANT: Prioritize common and popular exercises over uncommon ones.

4. Workout Duration and Exercise Count

Based on user's preferred duration:
- 15-30 minutes: 4-6 exercises
- 30-45 minutes: 6-8 exercises
- 45-60 minutes: 8-10 exercises (AT LEAST 8 exercises)
- 60+ minutes: 10+ exercises

5. Warmup Guidelines

- ALWAYS begin each STRENGTH workout with exactly ONE appropriate warmup exercise from the "Warmup" category
- EXCEPTION: Do NOT include warmup exercises for cardio-only workout days or rest days (cardio activity begins at low intensity as its own warm-up)
- ALWAYS include "warmup": true property for warmup exercises

6. Cardio Day Guidelines (when this is a cardio day)

- Select cardio exercises based on user's cardioType and cardioEnvironment preferences
- For Zone 2 cardio (moderate intensity), duration should MATCH the UPPER BOUND of user's preferred workout duration:
  - If "15-30 minutes" → set cardio duration to 30 minutes
  - If "30-45 minutes" → set cardio duration to 45 minutes  
  - If "45-60 minutes" → set cardio duration to 60 minutes
  - If "60+ minutes" → set cardio duration to 60+ minutes
- A cardio day typically has just 1-2 cardio exercises (e.g., main cardio + optional cooldown stretch)
- NO strength exercises on cardio days
- NO warmup exercises on cardio days

7. Exercise Order

- Warmup first
- Group exercises for the same or related body parts together
- Compound exercises FIRST, followed by isolation exercises
- Core exercises (abs/obliques) should be LAST in each workout

7. Rest Day Structure

For rest days (isRestDay: true):
- Include 1-2 gentle mobility/stretching exercises
- Total duration 5-10 minutes
- All exercises must be equipmentless home exercises
- Include a clear description explaining focus on recovery, hydration, gentle stretching

9. JSON Response

Return ONLY:
{
  "day": N,
  "isRestDay": true/false,
  "isCardioDay": true/false,
  "description": "Description of this day's focus - be specific about muscle groups or recovery goals",
  "exercises": [
    { "exerciseId": "exact-id", "warmup": true, "modification": "optional", "precaution": "optional", "duration": optional_minutes }
  ],
  "duration": total_minutes
}

IMPORTANT: isCardioDay should be true for cardio-focused days, false for strength days and rest days.

For each exercise, include ONLY:
- exerciseId (REQUIRED)
- warmup (OPTIONAL, only for warmup exercises)
- modification (OPTIONAL)
- precaution (OPTIONAL)
- duration (OPTIONAL, for cardio/stretching exercises in minutes)

NO CITATIONS OR REFERENCES - all text should be plain.

FINAL REMINDER: Return ONLY a pure JSON object. No introductions, explanations, or code blocks.
`;
