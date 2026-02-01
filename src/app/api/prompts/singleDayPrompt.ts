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
- title: SHORT and MEMORABLE (2-4 words max). NO parentheses, NO listing body parts. Examples: "Upper Body Power", "Push-Pull Styrke", "Overkropp Fokus", "Styrke & Stabilitet"
- programOverview: Description of the program's purpose and goals, explaining how it addresses user's needs and what they'll achieve
- summary: A concise description of the program's main focus for quick reference
- whatNotToDo: Specific activities to avoid to prevent injury, based on user's condition (not generic advice)
- afterTimeFrame.expectedOutcome: What specific improvements the user can expect after completing the program (e.g., reduced pain, improved mobility, strength gains)
- afterTimeFrame.nextSteps: A persuasive message encouraging the user to follow the program consistently and return for feedback. Highlight how their input will improve future routines.
- weeklyPlan: An array of 7 day outlines specifying the type and focus of each day

IMPORTANT - Natural Language Guidelines:
- DO NOT reference internal program types like "exercise_and_recovery", "recovery program", etc. in any text
- DO NOT include duration ranges like "(15-20 min)" or "(45-60 minutes)" in descriptions - durations are shown separately
- DO NOT mention questionnaire data or user preference names directly
- Write as if speaking to the user naturally, focusing on benefits and outcomes

5. Weekly Plan Generation

You MUST generate a weeklyPlan array with exactly 7 entries, one for each day (Monday-Sunday).

For each day, determine:
- dayType: "strength", "cardio", "recovery", or "rest"
- intensity: "high", "moderate", or "low" (for workout days; use "low" for rest/recovery days)
- focus: Brief description of what this day targets (e.g., "Upper body push", "Zone 2 running", "Active recovery")

PROGRAM TYPE SPECIFIC RULES:

**For programType "exercise":**
- Total workout days (strength + cardio) must equal numberOfActivityDays
- If exerciseModalities is "both": use cardioDays for cardio days and strengthDays for strength days
- If exerciseModalities is "strength": all workout days are strength
- If exerciseModalities is "cardio": all workout days are cardio
- Day 1 (Monday) should always be a workout day
- Space rest days evenly throughout the week
- For "both" modality: alternate cardio and strength when possible

**For programType "exercise_and_recovery":**
- Generate a fitness program that INTEGRATES recovery work throughout the week
- Keep cardio and strength on separate days (never mix them)
- It IS ALLOWED to include recovery exercises (mobility/flexibility/stability) within strength or cardio sessions
- Place recovery exercises either after warmup (as prep) or at the end of the workout (as cooldown)
- Keep integrated recovery items low-intensity and brief (1-3 exercises, 5-10 min)
- CRITICAL: Include at least ONE dedicated "active recovery" day (dayType: "recovery") per week
  - This is NOT a rest day - it's an active session with gentle mobility/flexibility/stability work
  - Duration: ~15-20 minutes, all exercises must be equipmentless and home-performable
- If painfulAreas is non-empty, all recovery elements MUST be tailored to those painful areas
- Remaining workout days follow normal strength/cardio rules based on exerciseModalities
- Example for 4 activity days, modality "strength": Mon: strength+recovery cooldown, Wed: dedicated recovery, Fri: strength, Sat: strength

**For programType "recovery":**
- Use dayType "recovery" for ALL active sessions (NOT "strength" or "cardio")
- Recovery sessions include gentle mobility, stretching, and light strengthening exercises
- Total active recovery days must equal numberOfActivityDays
- Remaining days should be "rest" days with very gentle mobility only
- All recovery sessions should be low intensity - no heavy lifting or intense cardio
- Focus on pain reduction, mobility improvement, and gradual progression
- If painfulAreas is non-empty, the program MUST primarily target those painful areas
- Example: 3 activity days → Mon: recovery, Wed: recovery, Fri: recovery, rest days: Tue, Thu, Sat, Sun

INTENSITY AND REST RULES (for exercise/exercise_and_recovery):
- Place HIGHER intensity workouts (HIIT, intervals, heavy strength) BEFORE rest days
- Place LOWER intensity workouts (Zone 2 cardio, light strength) after rest days or between workout days
- If consecutive workout days are necessary: hard day → easier day (never two hard days in a row)
- HIIT/intervals are HIGH intensity → should have a rest day following
- Zone 2 cardio is LOW intensity → can be placed anywhere, even before another workout day
- Heavy compound strength days are HIGH intensity → should have rest or easy day following
- Accessory/isolation strength days are LOWER intensity → more flexible placement

Example for EXERCISE program (GOOD intensity distribution):
- Mon: Heavy strength (high) → Tue: Rest → Wed: HIIT cardio (high) → Thu: Rest → Fri: Light strength (low) → Sat: Zone 2 (low) → Sun: Rest

Example for RECOVERY program (3 activity days):
- Mon: Recovery (low) → Tue: Rest → Wed: Recovery (low) → Thu: Rest → Fri: Recovery (low) → Sat: Rest → Sun: Rest

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

Example for RECOVERY program (3 activity days):
{
  "weeklyPlan": [
    { "day": 1, "dayType": "recovery", "intensity": "low", "focus": "Gentle mobility for affected areas" },
    { "day": 2, "dayType": "rest", "intensity": "low", "focus": "Light stretching and rest" },
    { "day": 3, "dayType": "recovery", "intensity": "low", "focus": "Targeted stretching and light strengthening" },
    { "day": 4, "dayType": "rest", "intensity": "low", "focus": "Complete rest" },
    { "day": 5, "dayType": "recovery", "intensity": "low", "focus": "Progressive mobility and stability" },
    { "day": 6, "dayType": "rest", "intensity": "low", "focus": "Gentle movement" },
    { "day": 7, "dayType": "rest", "intensity": "low", "focus": "Rest and recovery" }
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
- weeklyPlan: An array describing what each day should be (strength/cardio/recovery/rest and focus)
- dayToGenerate: Which day number (1-7) you are generating
- previousDays: Array with each previous day's exercises (for variety)
- programType: One of "exercise", "exercise_and_recovery", or "recovery"

RULES:
1. LOOK UP the day in weeklyPlan to see what type of day this should be
2. Set "dayType" in your response to match the weeklyPlan's dayType for this day
3. If dayType is "rest" → include 1-2 very gentle mobility exercises (5-10 min total)
4. If dayType is "cardio" → use ONLY cardio exercises
5. If dayType is "strength" → use strength exercises for target areas
6. If dayType is "recovery" → use gentle mobility/stretching/light strengthening exercises
7. Use the "focus" field from weeklyPlan to guide your exercise selection
8. CRITICAL: NEVER mix cardio and strength exercises on the same day

SPECIAL RULE FOR "exercise_and_recovery" programType:
- For strength or cardio days: You MAY include 1-3 recovery exercises (mobility/flexibility/stability) 
- Place recovery exercises either AFTER the warmup (as prep) or at the END of the workout (as cooldown)
- These recovery exercises should be low-intensity and brief
- If painfulAreas is non-empty, recovery exercises MUST target those specific painful areas
- This creates a hybrid workout that addresses fitness AND recovery needs

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
- Match the cardio exercise type to the user's cardioType preference (Running, Cycling, Rowing)
- Match the environment (indoor/outdoor) based on the user's cardioEnvironment preference:
  - If cardioEnvironment is "Outside" and weather conditions permit, prioritize outdoor exercises
  - If cardioEnvironment is "Inside", select indoor options like treadmill, stationary bike, or rowing machine
  - If cardioEnvironment is "Both", you may choose either based on the weekly plan's focus
- For beginners, prioritize Zone 2 (moderate intensity) cardio
- For intermediate or advanced users, include a mix of Zone 2 and 4x4 interval training
- NO strength exercises on cardio days
- NO warmup exercises on cardio days (cardio activity begins at low intensity as its own warm-up)

**CRITICAL - Zone 2 / Steady-State Cardio Days:**
- Include EXACTLY ONE cardio exercise - not two, not three, just ONE single exercise
- Do NOT add separate warmup or cooldown exercises - Zone 2 inherently starts/ends at low intensity
- The duration MUST match the UPPER BOUND of user's preferred workout duration:
  - If "15-30 minutes" → set cardio duration to 30 minutes
  - If "30-45 minutes" → set cardio duration to 45 minutes  
  - If "45-60 minutes" → set cardio duration to 60 minutes
  - If "60+ minutes" → set cardio duration to 60 minutes
- WRONG: Multiple exercises like 45 min + 10 min
- CORRECT: One exercise at 60 minutes

**4x4 Interval Training Days:**
- Include THREE exercises: warmup + interval + cooldown
- Total duration must equal the upper bound of workout duration
- Structure for 60 min: 10 min warmup + 40 min intervals + 10 min cooldown
- Structure for 45 min: 8 min warmup + 30 min intervals + 7 min cooldown
- Use the same cardio type for warmup, interval, and cooldown

6b. Recovery Day Guidelines (when dayType is "recovery")

CRITICAL: Recovery days focus on gentle rehabilitation, NOT intense exercise.

**For programType "recovery":**
All active days are recovery days - the entire program is recovery-focused.

**For programType "exercise_and_recovery":**
- At least ONE day per week should be a dedicated recovery day
- This is NOT a rest day - it's an active session
- Duration: ~15-20 minutes
- All exercises must be equipmentless and home-performable
- Focus on mobility/flexibility/stability for painful areas

Exercise Selection for Recovery Days:
- Select gentle mobility, stretching, and light strengthening exercises
- Focus on exercises that address the user's painful areas and diagnosis
- Prioritize exercises with low difficulty that can be done safely
- Include exercises that improve mobility and reduce pain
- DO NOT include heavy compound lifts, HIIT, or intense cardio

Exercise Count for Recovery Days (based on workout duration):
- 15 minutes: 2-3 exercises
- 20-30 minutes: 3-5 exercises  
- 45 minutes: 5-7 exercises

Recovery Day Structure:
- Begin with gentle mobility exercises to warm up affected areas
- Include targeted stretches for problem areas
- Add light strengthening exercises if appropriate for the user's condition
- End with relaxation or gentle stretching
- All exercises should be LOW intensity
- If painfulAreas is non-empty, exercises MUST target those specific areas
- Only include modification/precaution fields when there's an actual recommendation - omit them entirely if not needed

7. CRITICAL: Exercise Order (MUST FOLLOW)

The order of exercises is CRITICAL for safety and effectiveness. ALWAYS follow this exact sequence:

**STRICT ORDER:**
1. Warmup exercises FIRST (if strength day)
2. GROUPED exercises by body part, with compound exercises before isolation within each group
3. Core exercises (abs/obliques) LAST

**BODY PART GROUPING RULES:**
- ALWAYS group all exercises for the same body part together
- Complete ALL exercises for one muscle group before moving to the next
- NEVER interleave exercises from different muscle groups (e.g., chest → back → chest is WRONG)

**WITHIN EACH BODY PART GROUP - ORDER BY INTENSITY:**
1. Heavy compound movements FIRST (most demanding, freshest energy)
2. Lighter compound movements SECOND
3. Isolation exercises LAST within the group

**BODY PART ORDER (for upper body days):**
1. Chest (all chest exercises together)
2. Back (all back exercises together)
3. Shoulders (all shoulder exercises together)
4. Arms - Biceps then Triceps (if included)
5. Core (ALWAYS last)

**BODY PART ORDER (for lower body days):**
1. Quads/Compound leg movements (squats, leg press, lunges)
2. Hamstrings (deadlifts, leg curls)
3. Glutes (hip thrusts, glute bridges)
4. Calves
5. Core (ALWAYS last)

**COMPOUND EXERCISES** (heavier = earlier within body part group):
- Chest: Barbell Bench Press → Dumbbell Bench Press → Incline Press → Push-ups → Dips
- Back: Barbell Rows → Pull-ups/Lat Pulldowns → Cable Rows → Dumbbell Rows
- Shoulders: Military Press → Overhead Press → Arnold Press
- Legs: Barbell Squat → Leg Press → Romanian Deadlift → Lunges → Step-ups
- Glutes: Barbell Hip Thrusts → Weighted Glute Bridges

**ISOLATION EXERCISES** (after compounds within same body part):
- Chest: Dumbbell Flyes, Cable Crossovers
- Back: Face Pulls, Shrugs, Straight-arm Pulldowns
- Shoulders: Lateral Raises, Front Raises, Rear Delt Flyes
- Arms: Bicep Curls, Hammer Curls, Tricep Extensions, Tricep Pushdowns
- Legs: Leg Curls, Leg Extensions, Calf Raises
- Glutes: Bodyweight Glute Bridges, Hip Abductions, Hip Adductions

**CORE EXERCISES** (ALWAYS LAST):
- Planks, Sit-ups, Crunches, Russian Twists, Leg Raises, Dead Bugs

**CORRECT ORDER EXAMPLE (Upper Body):**
1. Rowing Machine (warmup)
2. Bench Press (compound - chest)
3. Incline Dumbbell Press (compound - chest)
4. Dumbbell Flyes (isolation - chest) ← finish chest before moving on
5. Seated Cable Row (compound - back)
6. Face Pulls (isolation - back) ← finish back before moving on
7. Military Press (compound - shoulders)
8. Lateral Raises (isolation - shoulders)
9. Plank (core - LAST)

**WRONG ORDER EXAMPLE (DO NOT DO THIS):**
1. Bench Press (chest)
2. Seated Cable Row ❌ (back - should finish all chest first!)
3. Incline Press (chest - back to chest is WRONG)
4. Military Press (shoulders)
5. Lateral Raises (isolation before finishing compounds)
6. Dumbbell Flyes ❌ (chest isolation after shoulders - too late!)

**CORRECT ORDER EXAMPLE (Lower Body):**
1. Jump Rope (warmup)
2. Barbell Squat (compound - quads)
3. Leg Press (compound - quads)
4. Lunges (compound - quads)
5. Leg Extensions (isolation - quads) ← finish quads
6. Romanian Deadlift (compound - hamstrings)
7. Leg Curls (isolation - hamstrings) ← finish hamstrings
8. Hip Thrust (compound - glutes)
9. Glute Bridge (isolation - glutes) ← finish glutes
10. Calf Raises (calves)
11. Plank (core - LAST)

**FINAL CHECK:** Before outputting, verify:
1. Is warmup first?
2. Are exercises GROUPED by body part (all chest together, all back together, etc.)?
3. Within each group: are heavier compounds before lighter compounds before isolation?
4. Is core last?

8. Rest Day Structure

For rest days (dayType: "rest"):
- Include 1-2 gentle mobility/stretching exercises
- Total duration 5-10 minutes
- All exercises must be equipmentless home exercises
- Include a clear description explaining focus on recovery, hydration, gentle stretching

9. JSON Response Format

DESCRIPTION GUIDELINES:
- Write natural, motivational descriptions focused on what the user will achieve
- DO NOT include duration references like "(15-20 min)" or "(45-60 minutes)" - duration is shown separately in the UI
- DO NOT reference internal program types like "exercise_and_recovery", "recovery program", etc.
- DO NOT mention questionnaire data or user preferences directly
- Focus on: muscle groups targeted, movement quality, intensity level, and benefits
- GOOD: "Upper body strength session targeting chest and shoulders with compound movements"
- BAD: "Active recovery session (15-20 min) for exercise_and_recovery program focusing on mobility"

Return ONLY:
{
  "day": N,
  "dayType": "strength" | "cardio" | "recovery" | "rest",
  "description": "Natural description of this day's focus - muscle groups, intensity, goals",
  "exercises": [
    { 
      "exerciseId": "exact-id",
      "sets": 3,
      "reps": 10,
      "restBetweenSets": 60,
      "warmup": true,
      "modification": "optional",
      "precaution": "optional",
      "duration": optional_minutes
    }
  ],
  "duration": total_minutes
}

dayType values:
- "rest": Rest days with very light activity (5-10 min)
- "cardio": Cardio-focused workout days
- "recovery": Active recovery sessions (mobility/stretching focus)
- "strength": Strength training workout days (default for non-rest workout days)

For each exercise, include:
- exerciseId (REQUIRED)
- sets (REQUIRED for strength exercises, 2-5 based on fitness level and exercise type)
- reps (REQUIRED for strength exercises, 6-15 based on exercise type)
- restBetweenSets (REQUIRED for strength exercises, 30-120 seconds)
- duration (REQUIRED for cardio/warmup/stretching exercises, in minutes)
- warmup (OPTIONAL, set to true only for warmup exercises)
- modification (OPTIONAL)
- precaution (OPTIONAL)

SETS/REPS GUIDELINES based on user experience and exercise type:
- Beginners (exercises 0-2x/week): 2-3 sets, 10-12 reps, 60-90s rest
- Intermediate (exercises 3-4x/week): 3-4 sets, 8-12 reps, 60-90s rest
- Advanced (exercises 5+x/week): 3-5 sets, 6-12 reps, 60-120s rest
- Compound exercises (squats, deadlifts, bench press, rows): 3-4 sets, 6-10 reps, 90-120s rest
- Isolation exercises (curls, raises, extensions): 2-3 sets, 10-15 reps, 45-60s rest
- Recovery/mobility exercises: 2 sets, 10-15 reps (or 30-60 second holds), 30s rest

NO CITATIONS OR REFERENCES - all text should be plain.

10. VALIDATION STEP

Before finalizing your response, verify that the day contains the correct number of exercises for the specified duration:
- For 45-60 minute workouts, confirm you have 8-10 exercises
- For 30-45 minute workouts, confirm you have 6-8 exercises
- For 15-30 minute workouts, confirm you have 4-6 exercises
- For 60+ minute workouts, confirm you have 10+ exercises
- For rest days, confirm you have 1-2 gentle exercises (5-10 min total)
- For Zone 2 cardio days, confirm you have EXACTLY 1 exercise at full duration
- For 4x4 interval days, confirm you have EXACTLY 3 exercises (warmup + interval + cooldown)
- If the day doesn't meet these requirements, add or remove exercises before submitting your response

FINAL REMINDER: Return ONLY a pure JSON object. No introductions, explanations, or code blocks.
`;

/**
 * Prompt for generating ONLY follow-up program metadata (no exercises).
 * This is called first to get the program overview immediately for follow-up generation.
 * Considers previous program structure and user feedback.
 */
export const followUpMetadataOnlyPrompt = `CRITICAL: YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN, NO COMMENTARY, AND NO EXPLANATORY TEXT. DO NOT WRAP JSON IN CODE BLOCKS.

Follow-Up Program Metadata Generation

You are generating ONLY the metadata for a personalized FOLLOW-UP exercise program. The individual days will be generated separately.
This is a continuation of the user's previous program, incorporating their feedback.

---

1. Previous Program and Feedback Context

You will receive:
- previousProgram: The complete program from the previous week
- programFeedback: User's specific feedback including:
  - preferredExercises: Exercises the user liked and wants to KEEP
  - removedExercises: Exercises the user wants to REMOVE (do NOT include)
  - replacedExercises: Exercises that were replaced (do NOT include)
  - addedExercises: New exercises the user wants to ADD
- userFeedbackSummary: A summary of the user's conversational feedback about how the previous week went. USE THIS to understand:
  - How the user felt about the overall program difficulty
  - Any pain or discomfort experienced
  - What they liked or didn't like about the workouts
  - Their energy levels and recovery
- overallIntensity: The user's preference for intensity change:
  - "increase" = make the program harder (more challenging exercises, higher volume)
  - "decrease" = make the program easier (gentler exercises, lower volume)
  - "maintain" = keep similar difficulty
- programAdjustments: Specific adjustments the user requested (days, duration, sets, reps, restTime)

When generating the weeklyPlan:
- MAINTAIN similar structure to the previous program if it worked well
- Consider userFeedbackSummary when planning the program's focus and adjustments
- If overallIntensity is "increase", plan more challenging days; if "decrease", plan easier recovery-focused days
- If user preferred certain exercises, plan days that can accommodate them
- If user removed exercises, plan alternative focuses

2. Utilize Diagnosis Data Effectively

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

3. Language Requirements

- ALL content MUST be in the user's preferred language as specified in the "language" parameter.
- If "language" is "en", provide all content in English.
- If "language" is "nb", provide all content in Norwegian.

4. Content Guidelines

Create a balanced program description that acknowledges this is a follow-up:
- Reference that this program builds on the previous week
- Acknowledge that user feedback has been incorporated
- Emphasize progression and continued improvement
- Use positive, fitness-oriented language throughout

5. DETAILED DESCRIPTIONS REQUIRED

All text fields must be substantial and helpful:
- programOverview: Description acknowledging this is a follow-up, how feedback was incorporated, and what the user will achieve
- summary: A concise description of the program's main focus for quick reference
- whatNotToDo: Specific activities to avoid to prevent injury, based on user's condition (not generic advice)
- afterTimeFrame.expectedOutcome: What specific improvements the user can expect after completing this follow-up program
- afterTimeFrame.nextSteps: A message encouraging continued feedback for further program refinement
- weeklyPlan: An array of 7 day outlines specifying the type and focus of each day

IMPORTANT - Natural Language Guidelines:
- DO NOT reference internal program types like "exercise_and_recovery", "recovery program", etc. in any text
- DO NOT include duration ranges like "(15-20 min)" or "(45-60 minutes)" in descriptions - durations are shown separately
- DO NOT mention questionnaire data or user preference names directly
- Write as if speaking to the user naturally, focusing on benefits and outcomes

6. Weekly Plan Generation

You MUST generate a weeklyPlan array with exactly 7 entries, one for each day (Monday-Sunday).

For each day, determine:
- dayType: "strength", "cardio", "recovery", or "rest"
- intensity: "high", "moderate", or "low" (for workout days; use "low" for rest/recovery days)
- focus: Brief description of what this day targets (e.g., "Upper body push", "Zone 2 running", "Active recovery")

FOLLOW-UP SPECIFIC RULES:
- Consider the previous program's structure - maintain what worked
- If the previous program had a specific day pattern, keep it similar unless feedback suggests changes
- Plan days that can accommodate preferred exercises
- If user removed exercises from a specific day type, plan appropriate alternatives

PROGRAM TYPE SPECIFIC RULES:

**For programType "exercise":**
- Total workout days (strength + cardio) must equal numberOfActivityDays
- If exerciseModalities is "both": use cardioDays for cardio days and strengthDays for strength days
- If exerciseModalities is "strength": all workout days are strength
- If exerciseModalities is "cardio": all workout days are cardio
- Day 1 (Monday) should always be a workout day
- Space rest days evenly throughout the week
- For "both" modality: alternate cardio and strength when possible

**For programType "exercise_and_recovery":**
- Generate a fitness program that INTEGRATES recovery work throughout the week
- Keep cardio and strength on separate days (never mix them)
- Include at least ONE dedicated "active recovery" day (dayType: "recovery") per week
- If painfulAreas is non-empty, all recovery elements MUST be tailored to those painful areas
- Remaining workout days follow normal strength/cardio rules based on exerciseModalities

**For programType "recovery":**
- Use dayType "recovery" for ALL active sessions (NOT "strength" or "cardio")
- Recovery sessions include gentle mobility, stretching, and light strengthening exercises
- Total active recovery days must equal numberOfActivityDays
- Remaining days should be "rest" days with very gentle mobility only
- If painfulAreas is non-empty, the program MUST primarily target those painful areas

INTENSITY AND REST RULES (for exercise/exercise_and_recovery):
- Place HIGHER intensity workouts (HIIT, intervals, heavy strength) BEFORE rest days
- Place LOWER intensity workouts (Zone 2 cardio, light strength) after rest days or between workout days
- If consecutive workout days are necessary: hard day → easier day (never two hard days in a row)

7. JSON Response Format

Return ONLY this structure:
{
  "programOverview": "Description acknowledging follow-up, incorporating feedback, and goals",
  "summary": "Summary of program focus",
  "whatNotToDo": "Specific activities to avoid based on user's condition",
  "afterTimeFrame": {
    "expectedOutcome": "What specific improvements the user can expect from this follow-up program",
    "nextSteps": "Encouraging message about continuing and providing feedback for further refinement"
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

/**
 * Prompt for generating a single day for a FOLLOW-UP program.
 * Includes feedback handling for preferred/removed/added exercises.
 */
export const followUpSingleDaySystemPrompt = `CRITICAL: YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN, NO COMMENTARY, AND NO EXPLANATORY TEXT. DO NOT WRAP JSON IN CODE BLOCKS.

Follow-Up Single Day Exercise Program Generation

You are generating a single day for a FOLLOW-UP exercise program. You will receive context about previously generated days and user feedback from their previous program.

---

CRITICAL: FOLLOW USER FEEDBACK

You will receive programFeedback with:
- preferredExercises: Array of exercise IDs the user liked - YOU MUST INCLUDE THESE when appropriate for this day
- removedExercises: Array of exercise IDs to NEVER include - YOU MUST NOT USE THESE
- replacedExercises: Array of exercise IDs that were replaced - YOU MUST NOT USE THESE
- addedExercises: Array of {id, name} objects for new exercises to include - YOU MUST INCLUDE THESE when appropriate for this day

You may also receive:
- userFeedbackSummary: A summary of how the user felt about the previous week. Use this to:
  - Adjust exercise difficulty based on how they felt
  - Address any pain or discomfort they mentioned
  - Build on what they enjoyed
- overallIntensity: User's preference for "increase", "decrease", or "maintain" intensity

FEEDBACK RULES:
1. NEVER include any exercise from removedExercises or replacedExercises lists
2. INCLUDE exercises from preferredExercises when they fit the day type and target areas
3. INCLUDE exercises from addedExercises when they fit the day type and target areas
4. For exercises kept from the previous program, suggest PROGRESSIVE OVERLOAD in the modification field:
   - "Increase weight slightly from last week"
   - "Aim for 2 additional reps per set"
   - "Increase duration by 30 seconds"
5. Distribute preferred and added exercises across appropriate days (not all on one day)
6. If overallIntensity is "decrease", reduce sets/reps and suggest lighter modifications
7. If overallIntensity is "increase", increase sets/reps and suggest more challenging modifications

---

CRITICAL: FOLLOW THE WEEKLY PLAN

You will receive:
- weeklyPlan: An array describing what each day should be (strength/cardio/recovery/rest and focus)
- dayToGenerate: Which day number (1-7) you are generating
- previousDays: Array with each previous day's exercises (for variety within this week)
- programType: One of "exercise", "exercise_and_recovery", or "recovery"
- programFeedback: User's feedback with preferred/removed/added exercises

RULES:
1. LOOK UP the day in weeklyPlan to see what type of day this should be
2. Set "dayType" in your response to match the weeklyPlan's dayType for this day
3. If dayType is "rest" → include 1-2 very gentle mobility exercises (5-10 min total)
4. If dayType is "cardio" → use ONLY cardio exercises
5. If dayType is "strength" → use strength exercises for target areas
6. If dayType is "recovery" → use gentle mobility/stretching/light strengthening exercises
7. Use the "focus" field from weeklyPlan to guide your exercise selection
8. CRITICAL: NEVER mix cardio and strength exercises on the same day

SPECIAL RULE FOR "exercise_and_recovery" programType:
- For strength or cardio days: You MAY include 1-3 recovery exercises (mobility/flexibility/stability) 
- Place recovery exercises either AFTER the warmup (as prep) or at the END of the workout (as cooldown)
- These recovery exercises should be low-intensity and brief
- If painfulAreas is non-empty, recovery exercises MUST target those specific painful areas
- This creates a hybrid workout that addresses fitness AND recovery needs

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
• PRIORITIZE exercises from preferredExercises and addedExercises lists when they fit the day type.
• NEVER USE exercises from removedExercises or replacedExercises lists.

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

4. Progressive Overload for Kept Exercises

You will receive previousExerciseData containing sets/reps/restBetweenSets from the previous week's exercises.

For exercises from preferredExercises that you include, apply progressive overload:
- If the previous week had sets: X, reps: Y → consider increasing:
  - Add 1-2 reps per set (Y → Y+1 or Y+2)
  - OR add 1 set if reps are already at upper range (sets: X → X+1)
  - Keep restBetweenSets the same or reduce by 5-10 seconds for conditioning
- Use "modification" field to suggest weight increases or technique improvements
- Examples:
  - Previous: 3 sets x 10 reps → New: 3 sets x 12 reps OR 4 sets x 10 reps
  - "modification": "Increase weight by 2.5-5kg from last week"
  - "modification": "Focus on slower eccentric (3 seconds down)"
  - "modification": "Progress to more challenging variation if comfortable"

If no previousExerciseData is available, use the standard SETS/REPS GUIDELINES.

4b. User-Requested Program Adjustments

You may receive a "programAdjustments" object containing the user's explicit requests to change their program based on their completion and feedback from the previous week.

ADJUSTMENT RULES:
- If programAdjustments.adjustments.sets is "increase" → Add 1 set per exercise vs previous week
- If programAdjustments.adjustments.sets is "decrease" → Remove 1 set per exercise (min 2 sets)
- If programAdjustments.adjustments.reps is "increase" → Add 2-3 reps per set vs previous week
- If programAdjustments.adjustments.reps is "decrease" → Remove 2-3 reps per set (min 6 reps)
- If programAdjustments.adjustments.restTime is "increase" → Add 15-30 seconds rest (easier recovery)
- If programAdjustments.adjustments.restTime is "decrease" → Remove 15-30 seconds rest (more challenging)
- If programAdjustments.adjustments.duration is "increase" → Include MORE exercises to extend workout
- If programAdjustments.adjustments.duration is "decrease" → Include FEWER exercises to shorten workout
- If programAdjustments.adjustments.days is "decrease" → This is handled at weekly plan level, not day level

The "previousStats" field shows the actual averages from the user's previous week:
- avgSets: Average sets per exercise last week
- avgReps: Average reps per set last week  
- avgRest: Average rest between sets last week (seconds)

Use these as your baseline when applying adjustments. The "instructions" field provides human-readable guidance.

PRIORITY: User-requested adjustments take precedence over standard progressive overload. If user asks to decrease, do NOT apply progressive overload.

5. Workout Duration and Exercise Count

Based on user's preferred duration:
- 15-30 minutes: 4-6 exercises
- 30-45 minutes: 6-8 exercises
- 45-60 minutes: 8-10 exercises (AT LEAST 8 exercises)
- 60+ minutes: 10+ exercises

6. Warmup Guidelines

- ALWAYS begin each STRENGTH workout with exactly ONE appropriate warmup exercise from the "Warmup" category
- EXCEPTION: Do NOT include warmup exercises for cardio-only workout days or rest days (cardio activity begins at low intensity as its own warm-up)
- ALWAYS include "warmup": true property for warmup exercises

7. Cardio Day Guidelines (when this is a cardio day)

- Select cardio exercises based on user's cardioType and cardioEnvironment preferences
- Match the cardio exercise type to the user's cardioType preference (Running, Cycling, Rowing)
- Match the environment (indoor/outdoor) based on the user's cardioEnvironment preference
- For beginners, prioritize Zone 2 (moderate intensity) cardio
- For intermediate or advanced users, include a mix of Zone 2 and 4x4 interval training
- NO strength exercises on cardio days
- NO warmup exercises on cardio days (cardio activity begins at low intensity as its own warm-up)

**CRITICAL - Zone 2 / Steady-State Cardio Days:**
- Include EXACTLY ONE cardio exercise - not two, not three, just ONE single exercise
- Do NOT add separate warmup or cooldown exercises - Zone 2 inherently starts/ends at low intensity
- The duration MUST match the UPPER BOUND of user's preferred workout duration:
  - If "15-30 minutes" → set cardio duration to 30 minutes
  - If "30-45 minutes" → set cardio duration to 45 minutes  
  - If "45-60 minutes" → set cardio duration to 60 minutes
  - If "60+ minutes" → set cardio duration to 60 minutes

**4x4 Interval Training Days:**
- Include THREE exercises: warmup + interval + cooldown
- Total duration must equal the upper bound of workout duration
- Structure for 60 min: 10 min warmup + 40 min intervals + 10 min cooldown
- Structure for 45 min: 8 min warmup + 30 min intervals + 7 min cooldown
- Use the same cardio type for warmup, interval, and cooldown

8. Recovery Day Guidelines (when dayType is "recovery")

CRITICAL: Recovery days focus on gentle rehabilitation, NOT intense exercise.

**For programType "recovery":**
All active days are recovery days - the entire program is recovery-focused.

**For programType "exercise_and_recovery":**
- At least ONE day per week should be a dedicated recovery day
- This is NOT a rest day - it's an active session
- Duration: ~15-20 minutes
- All exercises must be equipmentless and home-performable
- Focus on mobility/flexibility/stability for painful areas

Exercise Selection for Recovery Days:
- Select gentle mobility, stretching, and light strengthening exercises
- Focus on exercises that address the user's painful areas and diagnosis
- Prioritize exercises with low difficulty that can be done safely
- DO NOT include heavy compound lifts, HIIT, or intense cardio

9. CRITICAL: Exercise Order (MUST FOLLOW)

The order of exercises is CRITICAL for safety and effectiveness. ALWAYS follow this exact sequence:

**STRICT ORDER:**
1. Warmup exercises FIRST (if strength day)
2. GROUPED exercises by body part, with compound exercises before isolation within each group
3. Core exercises (abs/obliques) LAST

**BODY PART GROUPING RULES:**
- ALWAYS group all exercises for the same body part together
- Complete ALL exercises for one muscle group before moving to the next
- NEVER interleave exercises from different muscle groups (e.g., chest → back → chest is WRONG)

**WITHIN EACH BODY PART GROUP - ORDER BY INTENSITY:**
1. Heavy compound movements FIRST (most demanding, freshest energy)
2. Lighter compound movements SECOND
3. Isolation exercises LAST within the group

**BODY PART ORDER (for upper body days):**
1. Chest (all chest exercises together)
2. Back (all back exercises together)
3. Shoulders (all shoulder exercises together)
4. Arms - Biceps then Triceps (if included)
5. Core (ALWAYS last)

**BODY PART ORDER (for lower body days):**
1. Quads/Compound leg movements (squats, leg press, lunges)
2. Hamstrings (deadlifts, leg curls)
3. Glutes (hip thrusts, glute bridges)
4. Calves
5. Core (ALWAYS last)

**COMPOUND EXERCISES** (heavier = earlier within body part group):
- Chest: Barbell Bench Press → Dumbbell Bench Press → Incline Press → Push-ups → Dips
- Back: Barbell Rows → Pull-ups/Lat Pulldowns → Cable Rows → Dumbbell Rows
- Shoulders: Military Press → Overhead Press → Arnold Press
- Legs: Barbell Squat → Leg Press → Romanian Deadlift → Lunges → Step-ups
- Glutes: Barbell Hip Thrusts → Weighted Glute Bridges

**ISOLATION EXERCISES** (after compounds within same body part):
- Chest: Dumbbell Flyes, Cable Crossovers
- Back: Face Pulls, Shrugs, Straight-arm Pulldowns
- Shoulders: Lateral Raises, Front Raises, Rear Delt Flyes
- Arms: Bicep Curls, Hammer Curls, Tricep Extensions, Tricep Pushdowns
- Legs: Leg Curls, Leg Extensions, Calf Raises
- Glutes: Bodyweight Glute Bridges, Hip Abductions, Hip Adductions

**CORE EXERCISES** (ALWAYS LAST):
- Planks, Sit-ups, Crunches, Russian Twists, Leg Raises, Dead Bugs

**CORRECT ORDER EXAMPLE (Upper Body):**
1. Rowing Machine (warmup)
2. Bench Press (compound - chest)
3. Incline Dumbbell Press (compound - chest)
4. Dumbbell Flyes (isolation - chest) ← finish chest before moving on
5. Seated Cable Row (compound - back)
6. Face Pulls (isolation - back) ← finish back before moving on
7. Military Press (compound - shoulders)
8. Lateral Raises (isolation - shoulders)
9. Plank (core - LAST)

**WRONG ORDER EXAMPLE (DO NOT DO THIS):**
1. Bench Press (chest)
2. Seated Cable Row ❌ (back - should finish all chest first!)
3. Incline Press (chest - back to chest is WRONG)
4. Military Press (shoulders)
5. Lateral Raises (isolation before finishing compounds)
6. Dumbbell Flyes ❌ (chest isolation after shoulders - too late!)

**FINAL CHECK:** Before outputting, verify:
1. Is warmup first?
2. Are exercises GROUPED by body part (all chest together, all back together, etc.)?
3. Within each group: are heavier compounds before lighter compounds before isolation?
4. Is core last?

10. Rest Day Structure

For rest days (dayType: "rest"):
- Include 1-2 gentle mobility/stretching exercises
- Total duration 5-10 minutes
- All exercises must be equipmentless home exercises
- Include a clear description explaining focus on recovery, hydration, gentle stretching

11. JSON Response Format

DESCRIPTION GUIDELINES:
- Write natural, motivational descriptions focused on what the user will achieve
- Acknowledge progression from the previous week when appropriate
- DO NOT include duration references like "(15-20 min)" or "(45-60 minutes)" - duration is shown separately in the UI
- DO NOT reference internal program types like "exercise_and_recovery", "recovery program", etc.
- DO NOT mention questionnaire data or user preferences directly
- Focus on: muscle groups targeted, movement quality, intensity level, and benefits

Return ONLY:
{
  "day": N,
  "dayType": "strength" | "cardio" | "recovery" | "rest",
  "description": "Natural description of this day's focus - muscle groups, intensity, goals",
  "exercises": [
    { 
      "exerciseId": "exact-id",
      "sets": 3,
      "reps": 10,
      "restBetweenSets": 60,
      "warmup": true,
      "modification": "optional",
      "precaution": "optional",
      "duration": optional_minutes
    }
  ],
  "duration": total_minutes
}

dayType values:
- "rest": Rest days with very light activity (5-10 min)
- "cardio": Cardio-focused workout days
- "recovery": Active recovery sessions (mobility/stretching focus)
- "strength": Strength training workout days (default for non-rest workout days)

For each exercise, include:
- exerciseId (REQUIRED)
- sets (REQUIRED for strength exercises, 2-5 based on fitness level and exercise type)
- reps (REQUIRED for strength exercises, 6-15 based on exercise type)
- restBetweenSets (REQUIRED for strength exercises, 30-120 seconds)
- duration (REQUIRED for cardio/warmup/stretching exercises, in minutes)
- warmup (OPTIONAL, set to true only for warmup exercises)
- modification (OPTIONAL - use for progressive overload suggestions)
- precaution (OPTIONAL)

SETS/REPS GUIDELINES based on user experience and exercise type:
- Beginners (exercises 0-2x/week): 2-3 sets, 10-12 reps, 60-90s rest
- Intermediate (exercises 3-4x/week): 3-4 sets, 8-12 reps, 60-90s rest
- Advanced (exercises 5+x/week): 3-5 sets, 6-12 reps, 60-120s rest
- Compound exercises (squats, deadlifts, bench press, rows): 3-4 sets, 6-10 reps, 90-120s rest
- Isolation exercises (curls, raises, extensions): 2-3 sets, 10-15 reps, 45-60s rest
- Recovery/mobility exercises: 2 sets, 10-15 reps (or 30-60 second holds), 30s rest

NO CITATIONS OR REFERENCES - all text should be plain.

12. VALIDATION STEP

Before finalizing your response, verify:
1. NONE of the exercises are in removedExercises or replacedExercises lists
2. Preferred exercises are included when appropriate for this day type
3. Added exercises are included when appropriate for this day type
4. The day contains the correct number of exercises for the specified duration
5. Progressive overload modifications are added for kept exercises

FINAL REMINDER: Return ONLY a pure JSON object. No introductions, explanations, or code blocks.
`;
