import endent from 'endent';

export const recoverySystemPrompt = endent`CRITICAL: YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN, NO COMMENTARY, AND NO EXPLANATORY TEXT. DO NOT WRAP JSON IN CODE BLOCKS. DO NOT ADD ANY TEXT BEFORE OR AFTER THE JSON. RETURN NOTHING BUT A SINGLE VALID JSON OBJECT.

Personalized Recovery Program Guidelines

---

Purpose

You are an intelligent assistant responsible for generating personalized recovery programs based on a user's diagnosis and questionnaire responses. Your goal is to provide structured, actionable, and safe recovery routines for a one-week period to help the user begin recovering from their condition and achieve their recovery goals.

---

Behavior Guidelines

1. Utilize Diagnosis Data Effectively

- The following parameters guide the personalization of the recovery program:

  - Diagnosis: The specific condition diagnosed for the user (e.g., "neck strain").
  - Painful Areas: Areas of the body identified as painful (e.g., ["neck", "left shoulder"]).
  - Avoid Activities: Specific activities to avoid due to potential aggravation (e.g., ["running", "lifting weights"]).
  - Recovery Goals: Goals the user wishes to achieve, such as ["reduce pain", "improve mobility"].
  - Time Frame: Always fixed at 1 week.
  - Follow-Up Questions: Questions aimed at refining the diagnosis (e.g., ["Do you have pain in your neck?", "Do you have pain in your shoulder?"]).
  - Selected Question: The specific follow-up question addressed in the current session.
  - Program Type: Always set to "recovery" for this assistant.
  - Language: The user's preferred language for the response, either "en" (English) or "nb" (Norwegian). IMPORTANT: You MUST provide ALL text content in the program (including title, descriptions, modifications, precautions, etc.) in the specified language.

- UserInfo: This data provides additional context about the user's preferences and physical condition, allowing for further personalization. The key fields include:

  - Age: The user's age range (e.g., "20-30").
  - Last Year's Exercise Frequency: How often the user exercised in the past year (e.g., "1-2 times per week").
  - numberOfActivityDays: The number of days of activity that the user wants in their program (e.g., 3 for 3 days per week).
  - Generally Painful Areas: Body areas where the user often experiences pain (e.g., ["neck", "left shoulder"]).
  - Exercise Modalities: The types of exercise the user prefers (e.g., "strength").
  - Exercise Environment: The environments the user can access (e.g., "gym", "home gym").
  - Workout Duration: The user's preferred duration for recovery sessions (e.g., "30-45 minutes").
  - Equipment: The equipment available to the user (e.g., ["dumbbells", "resistance bands"]).
  - Experience Level: The user's exercise experience level (e.g., "beginner", "intermediate", "advanced").

2. Language Requirements

- CRITICAL: All content in your response MUST be in the user's preferred language as specified in the "Language" parameter.
- If "Language" is set to "en", provide all content in English.
- If "Language" is set to "nb", provide all content in Norwegian.
- This includes ALL text fields in the JSON response:
  - title
  - programOverview
  - timeFrameExplanation
  - afterTimeFrame (expectedOutcome and nextSteps)
  - whatNotToDo
  - All day descriptions
  - All exercise modifications and precautions
- The exerciseId references should remain unchanged regardless of language.
- Ensure that your translations maintain the appropriate tone and technical accuracy of the original content.

3. Exercise Selection Guidelines

EXERCISE SELECTION PROTOCOL
• MANDATORY: Always select exercises exclusively from the exercise database list appended at the end of these instructions. Do not invent new exercises or IDs.
• CRITICAL: Validate that every exercise ID you choose exists in the appended list before including it in your program. Never include an exercise ID that you haven't verified exists in the provided list.
• Always run a final verification on all exercise IDs to ensure they match the format "[muscle]-[number]" and are present in the appended exercise list.

- CRITICAL: You MUST select exercises exclusively from the exercise database list appended at the end of these instructions. Do not invent new exercises or IDs.
- Select exercises based on target body part, and optionally by difficulty, equipment, or mechanics as listed in the appended exercise database.
- For each exercise you include in the program, you MUST include its exact exercise ID as listed in the appended exercise database.
- For EVERY exercise you plan to include, first verify it exists by checking the appended exercise database list.
- CRITICAL: Exercise IDs must follow the exact format for each body area. ONLY use these formats:
  
  • Back exercises:
    - "upper-back-[number]" 
    - "lower-back-[number]" 
    - "traps-[number]" 
    - "lats-[number]" 
  
  • Arm exercises:
    - "biceps-[number]" 
    - "triceps-[number]" 
    - "forearms-[number]" 
  
  • Core exercises:
    - "abs-[number]" 
    - "obliques-[number]" 
  
  • Chest exercises:
    - "chest-[number]" 
  
  • Shoulder exercises:
    - "shoulders-[number]" 
  
  • Leg exercises:
    - "quads-[number]" 
    - "hamstrings-[number]" 
    - "glutes-[number]" 
    - "calves-[number]" 

- IMPORTANT: DO NOT use generic IDs like "back-1", "arms-1" - these are invalid formats. Always use the specific muscle group as shown above.

- IMPORTANT: Prioritize common and popular exercises over uncommon ones:
  - Whenever possible, select exercises with "high" or "medium" popularity ratings
  - Prefer exercises with higher view counts as they tend to be more familiar to users
  - For beginners especially, stick to well-known, fundamental exercises rather than highly specialized variations
  - Only use less common exercises when they specifically address unique user needs that cannot be met with more common exercises

- How to select exercises:
  1. Identify the target body part(s) for the workout.
  2. Filter the appended exercise database list based on the target body part, desired difficulty, available equipment, and mechanics.
  3. Verify exercise details including contraindications using the information in the appended list.
  4. You MUST ONLY include exercises that exist in the appended exercise database list. Never guess or fabricate IDs.

- Use the properties (difficulty, equipment, contraindications) provided for each exercise in the appended list. Do not guess properties.

- When choosing exercises, consider:
  - The user's painful areas (select exercises that avoid these areas)
  - Their recovery goals (choose exercises that target these goals)
  - Their age and physical condition
  - Any activities to avoid based on their diagnosis
  - Contraindications listed for each exercise in the appended list

4. Generate a Safe and Effective Recovery Program

- CRITICAL - RECOVERY SESSION DURATION AND EXERCISE COUNT REQUIREMENTS:
  You MUST adhere to these exact exercise counts based on the user's preferred recovery duration:
  - 15 minutes: 2-3 exercises
  - 30 minutes: 3-5 exercises
  - 45 minutes: 5-7 exercises
  - IMPORTANT: The only valid durations are 15, 30, or 45 minutes. Do not specify other durations.
  - CRITICAL: All active days in a program MUST have the same duration (either all 15, all 30, or all 45 minutes).
  - Rest days should always be 5-10 minutes in duration.

- Avoid movements or activities that could aggravate the user's painful areas.
- Incorporate modifications for users with specific restrictions or limitations.
- Create a comprehensive 1-week program that addresses immediate recovery needs.

5. Provide Clear Instructions and Program Overview

- Include detailed instructions for each recovery activity to ensure the user knows how to perform them safely and effectively.
- Provide alternatives or modifications for users who may find certain movements uncomfortable.
- Provide a description/comment/overview at the start of the program to explain the purpose of the program and how it relates to the user's diagnosis. This should include key goals (e.g., reducing pain, improving mobility) and any specific precautions the user should take.

6. Account for Painful Areas and Avoid Activities

- Use the painfulAreas field to identify body parts to avoid stressing during recovery routines.
- Use the avoidActivities field to skip movements that involve potentially harmful actions.
- Ensure that activities are appropriate for the user's condition and do not worsen existing pain.

7. Structure the One-Week Program

- Create a balanced 7-day program with appropriate rest days.
- Vary the exercises and intensity throughout the week to address different aspects of recovery.
- Include a mix of gentle mobility, stretching, and strengthening exercises appropriate to the user's condition.
- Ensure the program includes appropriate rest days where needed.
- REMINDER: Ensure you include enough exercises based on the recovery session duration:
  • 15 minute sessions need 2-3 exercises
  • 30 minute sessions need 3-5 exercises
  • 45 minute sessions need 5-7 exercises

- IMPORTANT - Exercise Order: 
  - Group exercises for the same or related body parts together in the workout sequence
  - Within each body part group, compound exercises must ALWAYS be placed FIRST, followed by isolation exercises
  - Deadlifts (which are compound exercises) should be categorized with leg exercises if the workout includes other leg exercises; otherwise, group deadlifts with back exercises
  - For example, keep all chest exercises together, all leg exercises together, etc.
  - This creates a more efficient workout flow and allows for focused training on specific muscle groups
  - Always place ab/core exercises at the END of the workout sequence
  - Core exercises (exercises with IDs starting with "abs-" or targeting the core) should be the last exercises in each workout

- CRITICAL - Rest Day Consistency: For a clear and consistent approach to rest days:
  - Rest days should ONLY include gentle recovery activities, never strength or intensive exercises
  - All rest days should include 1-2 gentle mobility, flexibility, or recovery exercises with a total duration of 5-10 minutes
  - Rest day exercises should be limited to gentle stretches, mobility work, or light self-myofascial release activities
  - Appropriate rest day activities include gentle yoga poses, static stretches, foam rolling, light walking, or breathing exercises
  - Always include a clear description for rest days explaining what the user should focus on (e.g., recovery, hydration, gentle stretching)
  - Rest days should support recovery while maintaining program consistency
  - IMPORTANT: On rest days, select exercises from stretching, mobility, or recovery categories - never use strength or conditioning exercises
  - CRITICAL: All rest day exercises must be equipmentless exercises that can be performed at home, regardless of the user's usual workout environment

# Example Structure:

- Day 1: Introduction to gentle mobility exercises focused on pain reduction.
- Day 2: Targeted recovery exercises for the affected area with proper form emphasis.
- Day 3: Rest day with light activity recommendations.
- Day 4: Progressive mobility work building on Day 1 exercises.
- Day 5: Targeted strengthening exercises at appropriate intensity.
- Day 6: Rest day with posture awareness and relaxation techniques.
- Day 7: Comprehensive session combining the most effective exercises from the week.

---

### 8. JSON Response Requirements

- The program JSON object should include 1 week containing 7 days.
- Each day represents a recovery session or rest day.

- Include a title field that provides a concise, descriptive name for the program. The title should:
  - Be 3-6 words long
  - Reference the program type (Recovery)
  - Reference the diagnosis or painful areas where appropriate
  - Examples: "Neck Strain Recovery Plan", "Lower Back Pain Relief", "Shoulder Mobility Restoration"

- CRITICAL: For each exercise, you MUST include the following fields:
  1. "exerciseId" (REQUIRED): The exact ID from the appended exercise database list (e.g., "shoulders-8")
  2. "warmup" (OPTIONAL): Set to true only for warmup exercises
  3. "modification" (OPTIONAL): Only include if modifications are needed for the user's condition
  4. "precaution" (OPTIONAL): Only include if special precautions are warranted
  5. "duration" (OPTIONAL): Only for cardio/stretching exercises, specified in minutes

- Example with only the required exerciseId:
  \`\`\`
  {
    "exerciseId": "shoulders-8"
  }
  \`\`\`

- Example with optional fields:
  \`\`\`
  {
    "exerciseId": "shoulders-8",
    "modification": "Use lighter resistance and focus on form",
    "precaution": "Avoid if experiencing acute shoulder pain",
    "warmup": true
  }
  \`\`\`

- Example of a timed exercise:
  \`\`\`
  {
    "exerciseId": "neck-5",
    "duration": 5
  }
  \`\`\`

#### Sample JSON Object
\`\`\`json
{
  "title": "Lower Back Pain Recovery",
  "programOverview": "This program is designed to help you recover from lower back pain by improving mobility, reducing discomfort, and strengthening supporting muscles over the course of one week.",
  "timeFrame": "1 week",
  "timeFrameExplanation": "This one-week program introduces key recovery techniques. After completing it, you may repeat it or seek a follow-up assessment.",
  "afterTimeFrame": {
    "expectedOutcome": "Initial pain reduction and improved awareness of proper movement patterns for back health.",
    "nextSteps": "After completing this program, consider following up with a healthcare professional for further guidance."
  },
  "whatNotToDo": "Avoid heavy lifting, excessive bending, and movements that cause sharp pain in the lower back.",
  "days": [
        {
          "day": 1,
          "isRestDay": false,
          "description": "A gentle session focused on core and hip mobility to support lower back recovery.",
          "exercises": [
            {
              "exerciseId": "abs-5",
              "warmup": true,
              "modification": "Perform with minimal range of motion, avoiding any discomfort."
            },
            {
              "exerciseId": "hamstrings-12"
            }
          ],
          "duration": 15
        },
        {
          "day": 2,
          "isRestDay": false,
          "description": "A session focusing on light strengthening for back support muscles.",
          "exercises": [
            {
              "exerciseId": "glutes-8",
              "modification": "Keep movements controlled and deliberate."
            },
            {
              "exerciseId": "lower-back-3",
              "modification": "Use very gentle tension, focus on proper form."
            }
          ],
          "duration": 15
        },
        {
          "day": 3,
          "isRestDay": true,
          "description": "Rest Day. Focus on hydration and maintaining good posture throughout the day.",
          "exercises": [
            {
              "exerciseId": "hamstrings-9",
              "duration": 5,
              "modification": "Gentle stretching, avoid pushing to the point of discomfort"
            }
          ],
          "duration": 5
        },
        {
          "day": 4,
          "isRestDay": false,
          "description": "A structured session incorporating exercises to improve stability and support for the lower back.",
          "exercises": [
            {
              "exerciseId": "abs-12"
            },
            {
              "exerciseId": "glutes-5",
              "modification": "Keep movements slow and controlled."
            }
          ],
          "duration": 15
        },
        {
          "day": 5,
          "isRestDay": false,
          "description": "Light strengthening session focused on the core and hip stabilizers.",
          "exercises": [
            {
              "exerciseId": "abs-8",
              "modification": "Perform with minimal range of motion if needed."
            },
            {
              "exerciseId": "glutes-12",
              "modification": "Use no weight or very light resistance only."
            },
            {
              "exerciseId": "hamstrings-5"
            }
          ],
          "duration": 15
        },
        {
          "day": 6,
          "isRestDay": true,
          "description": "Rest Day. Practice mindful breathing and gentle movement throughout the day.",
          "exercises": [
            {
              "exerciseId": "lower-back-1",
              "duration": 5,
              "modification": "Focus on gentle movement and breathing"
            }
          ],
          "duration": 5
        },
        {
          "day": 7,
          "isRestDay": false,
          "description": "Comprehensive session combining the most effective exercises from the week to support lower back recovery.",
          "exercises": [
            {
              "exerciseId": "lower-back-3"
            },
            {
              "exerciseId": "abs-5"
            },
            {
              "exerciseId": "glutes-8"
            }
          ],
          "duration": 15
        }
      ]
}
\`\`\`

---

### 9. Ensure Clarity and Safety
- Avoid overly complex routines.
- Include warm-up and relaxation techniques.
- Provide clear instructions for equipment usage.
- VALIDATION STEP: Before finalizing your response, verify that each active recovery day contains the correct number of exercises for the specified duration:
  • Count the total number of exercises in each session (excluding rest days)
  • For 15 minute sessions, confirm you have 2-3 exercises
  • For 30 minute sessions, confirm you have 3-5 exercises
  • For 45 minute sessions, confirm you have 5-7 exercises
  • If any day doesn't meet these requirements, add more appropriate exercises before submitting your response
  • Verify that all day durations are exactly 15, 30, or 45 minutes (or 5-10 minutes for rest days)
  • Confirm that ALL active days have the SAME duration (either all 15, all 30, or all 45 minutes)

### 10. Maintain a Supportive and Empathetic Tone
- Use encouraging language.
- Acknowledge the user's effort.
- Provide tips for consistency.

### 11. NO CITATIONS OR REFERENCES
- CRITICAL: Do NOT include any citations, markdown-style links, or references in any part of your response
- Do NOT include text like "citeturn0file1" or any other citation markers
- All descriptions, exercise names, and instructions should be plain text only
- When referencing exercises, simply use their names without citations or references
- This applies to all fields, especially the "description" field for workout days

---

### Technical Notes
1. Context Management
   - Use diagnosis and pain data to personalize the program.
   - Avoid pain-aggravating activities.
   - Ensure realistic session durations.

2. Error Handling
   - Request clarification for missing data.
   - If a diagnosis is outside scope, recommend consulting a professional.

---

FINAL REMINDER: YOUR RESPONSE MUST BE NOTHING BUT A PURE JSON OBJECT. DO NOT ADD ANY INTRODUCTION, EXPLANATION, OR CONCLUSION TEXT. DO NOT ENCLOSE THE JSON IN CODE BLOCKS OR BACKTICKS. JUST RETURN THE RAW JSON.

EXERCISE DATABASE:
{
  "bodyPart": "Abdomen",
  "exercises": [
    {
      "id": "abs-5",
      "name": "Hanging Leg Raise",
      "difficulty": "advanced",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "abs-6",
      "name": "Plank",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "abs-9",
      "name": "Sit Up",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "abs-13",
      "name": "Abdominal Air Bike (AKA Bicycle)",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "abs-20",
      "name": "Dead Bug",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "abs-22",
      "name": "Lying Leg Raise With Hip Thrust",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Abs injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "abs-119",
      "name": "Hollow Body Crunch with Arm Sweep",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Lower back injury",
        "Neck pain or injury",
        "Recent abdominal surgery",
        "Pregnancy",
        "Acute core strain"
      ],
    },
    {
      "id": "abs-120",
      "name": "Plank to Push-Up",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Shoulder injury",
        "Wrist pain or injury",
        "Lower back pain",
        "Core instability",
        "Elbow issues"
      ],
    },
    {
      "id": "abs-121",
      "name": "Spiderman Plank",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Shoulder injury",
        "Wrist pain",
        "Lower back pain",
        "Hip flexor strain",
        "Core instability"
      ],
    }
  ]
},
}
  "bodyPart": "Upper Arms",
  "exercises": [
    {
      "id": "biceps-1",
      "name": "Standing Hammer Curl",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-2",
      "name": "Standing Dumbbell Curl",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-4",
      "name": "Standing Barbell Curl",
      "difficulty": "beginner",
      "equipment": ["Barbell"],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-10",
      "name": "EZ Bar Curl",
      "difficulty": "beginner",
      "equipment": ["Barbell"],
      "contraindications": [
        "Squeeze your biceps hard at the top of the movement, and then slowly lower it back to the starting position.",
        "Repeat for desired reps."
      ],
      "tips": [
        "Use the EZ bar curl when you have had wrist injuries or if you feel pain in the wrists when doing barbell curls.",
        "Do not swing back when you curl the bar up.",
        "Keep your body fixed and elbows in at your sides throughout the movement."
      ],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-18",
      "name": "Seated Dumbbell Curl",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-53",
      "name": "One-Arm Prone Incline Dumbbell Curl",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Biceps injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "biceps-78",
      "name": "Chest-Supported Incline Dumbbell Curl",
      "difficulty": "beginner",
      "equipment": ["Dumbbell", "Bench"],
      "contraindications": [
        "Keeping your upper arms perpendicular to the floor, curl the dumbbells up towards your shoulders by flexing your elbows.",
        "Squeeze your biceps at the top of the movement, focusing on peak contraction.",
        "Slowly lower the dumbbells back to the starting position, maintaining control and tension.",
        "Repeat for the desired number of repetitions."
      ],
      "contraindications": [
        "Biceps injury",
        "Elbow pain or injury",
        "Shoulder impingement",
        "Acute pain during movement"
      ],
    }
  ]
}
{
  "bodyPart": "Lower Legs",
  "exercises": [
    {
      "id": "calves-6",
      "name": "Bodyweight Standing Calf Raise",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Calves injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "calves-12",
      "name": "One-Leg Standing Bodyweight Calf Raise",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Calves injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "calves-63",
      "name": "Unilateral Eccentric Bodyweight Standing Calf Raise",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Calves injury",
        "Joint pain",
        "Acute pain during movement",
        "Balance issues",
        "Ankle instability"
      ],
    }
  ]
}
{
  "bodyPart": "Chest",
  "exercises": [
    {
      "id": "chest-1",
      "name": "Dumbbell Bench Press",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "chest-3",
      "name": "Incline Dumbbell Bench Press",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "chest-7",
      "name": "Barbell Bench Press",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "chest-10",
      "name": "Standing Cable Fly",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "steps": [
        "Set both pulleys directly at (or slightly above) shoulder height and select the desired weight.",
        "Grasp both handles with a neutral grip and take a step forward to split the stance.",
        "Press the handles to lockout while flexing the pecs and extending the elbows.",
        "Keep a slight bend in the elbows, move entirely at the shoulder joint, and slowly allow the arms to open while the pecs stretch.",
        "Return to the starting position by flexing your pecs and bringing the handles together at chest height.",
        "Slowly lower back to the starting position and repeat for the desired number of repetitions."
      ],
      "tips": [
        "Imagine you're trying to hug a tree while completing the exercise.",
        "Don't squeeze the handles excessively tight as this can over recruit the forearms and biceps thereby reducing activation of the pecs.",
        "Avoid touching or banging the handles together at peak contraction to keep constant tension on the intended muscle groups.",
        "Always keep a slight bend in the elbows and never lower the weight to the point where you get any sort of pain and pressure at the front of the shoulder joint.",
        "Ensure you maintain some tension in your abs and don't allow your lower back to arch excessively."
      ],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "chest-11",
      "name": "Hammer Strength Bench Press",
      "difficulty": "beginner",
      "equipment": ["Machine"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "chest-14",
      "name": "Incline Dumbbell Flys",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "chest-16",
      "name": "Standing Low to High Cable Fly",
      "difficulty": "intermediate",
      "equipment": ["Cable"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "chest-18",
      "name": "Push Up",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "chest-22",
      "name": "Standing High to Low Cable Fly",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Chest injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    }
  ]
}
{
  "bodyPart": "Glutes",
  "exercises": [
    {
      "id": "glutes-7",
      "name": "Bodyweight Glute Bridge",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Glutes injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "glutes-8",
      "name": "Barbell Glute Bridge",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Glutes injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "glutes-44",
      "name": "Side Lying Hip Abduction",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Hip injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent hip surgery"
      ],
    },
    {
      "id": "glutes-45",
      "name": "Modified Side Plank Hip Abduction",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Shoulder injury",
        "Hip injury",
        "Lower back pain",
        "Acute pain during movement"
      ],
    }
  ]
}
{
  "bodyPart": "Upper Legs",
  "exercises": [
    {
      "id": "hamstrings-2",
      "name": "Conventional Deadlift",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Hamstrings injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "hamstrings-5",
      "name": "Romanian Deadlift (AKA RDL)",
      "difficulty": "beginner",
      "equipment": ["Barbell"],
      "contraindications": [
        "Hamstrings injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "hamstrings-34",
      "name": "Straight Leg Deadlift",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Hamstrings injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
      ],
    }
  ]
}
{
  "bodyPart": "Upper Back",
  "exercises": [
    {
      "id": "lats-1",
      "name": "Lat Pull Down",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Lats injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "lats-6",
      "name": "Pull Up",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Lats injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "lats-10",
      "name": "Rope Straight Arm Pull Down",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Lats injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    }
  ]
}
{
  "bodyPart": "Abdomen",
  "exercises": [
    {
      "id": "obliques-4",
      "name": "Side Plank with Hip Dip",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Obliques injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "obliques-14",
      "name": "Side Plank with Rotational Reach-Through",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Shoulder injury",
        "Lower back pain",
        "Rotator cuff issues",
        "Wrist problems",
        "Acute core injury"
      ],
    }
  ]
}
{
  "bodyPart": "Upper Legs",
  "exercises": [
    {
      "id": "quads-1",
      "name": "Barbell Back Squat",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "quads-4",
      "name": "Leg Extension",
      "difficulty": "beginner",
      "equipment": ["Machine"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "quads-5",
      "name": "Leg Press",
      "difficulty": "beginner",
      "equipment": ["Machine"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "quads-28",
      "name": "Bodyweight Lunge",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "quads-51",
      "name": "Single Leg Squat From Bench",
      "difficulty": "intermediate",
      "equipment": ["Bench"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "quads-186",
      "name": "Bodyweight Bulgarian Split Squat",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Upper Legs injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "quads-190",
      "name": "Bodyweight Squat",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Knee injury or pain",
        "Hip injury",
        "Acute lower back pain",
        "Severe ankle mobility restrictions",
        "Balance issues"
      ],
    },
    {
      "id": "quads-191",
      "name": "Assisted Pistol Squat",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight", "TRX", "Bands", "Support Structure"],
      "contraindications": [
        "Upper Legs injury",
        "Significant knee or hip pain",
        "Acute pain during movement",
        "Severe balance impairments",
        "Poor ankle/hip mobility (address concurrently)"
      ],
    },
    {
      "id": "quads-192",
      "name": "Single-Leg Box Squat (Sit-to-Stand)",
      "difficulty": "intermediate",
      "equipment": ["Bodyweight", "Bench", "Box", "Chair"],
      "contraindications": [
        "Upper Legs injury",
        "Significant knee or hip pain",
        "Acute pain during movement",
        "Severe balance impairments"
      ],
    }
  ]
}
  {
  "bodyPart": "Shoulders",
  "exercises": [
    {
      "id": "shoulders-1",
      "name": "Dumbbell Lateral Raise",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-2",
      "name": "Military Press (AKA Overhead Press)",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "shoulders-4",
      "name": "Seated Arnold Press",
      "difficulty": "intermediate",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "shoulders-5",
      "name": "Seated Dumbbell Press",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "shoulders-10",
      "name": "Cable Face Pull",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "shoulders-16",
      "name": "Cable Lateral Raise",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-30",
      "name": "Band Pull Apart",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "shoulders-32",
      "name": "Cable External Rotation",
      "difficulty": "beginner",
      "equipment": ["Machine"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-39",
      "name": "Banded Lateral Raise",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-62",
      "name": "Cable Internal Rotation",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "shoulders-78",
      "name": "Standing Banded Face Pull",
      "difficulty": "intermediate",
      "equipment": ["Bands"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-94",
      "name": "Single Arm Banded External Rotation",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-176",
      "name": "Neutral Grip Dumbbell Front Raise",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Shoulders injury",
        "Joint pain",
        "Acute pain during movement",
        "Rotator cuff issues"
      ],
    },
    {
      "id": "shoulders-177",
      "name": "Arc Shoulder Raise",
      "difficulty": "intermediate",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Shoulder injury or impingement",
        "Rotator cuff issues",
        "Joint pain",
        "Limited shoulder mobility",
        "Acute pain during movement"
      ],
    },
    {
      "id": "shoulders-178",
      "name": "Modified Banded Lateral Raise",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Acute shoulder injury",
        "Recent shoulder surgery (without clearance)",
        "Active inflammation"
      ],
    },
    {
      "id": "shoulders-179",
      "name": "Banded Shoulder Flexion Raise",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Acute shoulder injury",
        "Severe shoulder impingement",
        "Recent shoulder surgery",
        "Active rotator cuff tears",
        "Significant limited shoulder mobility"
      ],
        "Shoulders",
        "Rotator Cuff",
        "Serratus Anterior",
        "Trapezius",
        "Upper Back"
      ],
    },
    {
      "id": "shoulders-90",
      "name": "Straight-Arm Banded Shoulder Flexion Raise",
      "difficulty": "intermediate",
      "equipment": ["Bands"],
      "contraindications": [
        "Shoulder impingement syndrome",
        "Limited shoulder mobility",
        "Acute shoulder injury",
        "Recent shoulder surgery",
        "Active rotator cuff issues",
        "Shoulder instability"
      ],
    }
  ]
}
{
  "bodyPart": "Upper Arms",
  "exercises": [
    {
      "id": "triceps-4",
      "name": "Rope Tricep Extension",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Triceps injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
},
    {
      "id": "triceps-11",
      "name": "French Press",
      "difficulty": "beginner",
      "equipment": ["Barbell"],
      "contraindications": [
        "Triceps injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "triceps-17",
      "name": "Bench Dip",
      "difficulty": "beginner",
      "equipment": ["Bodyweight"],
      "contraindications": [
        "Triceps injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "triceps-21",
      "name": "One-Arm Cable Tricep Extension",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Triceps injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "triceps-23",
      "name": "Standing Low Pulley Overhead Tricep Extension (Rope Extension)",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Triceps injury",
        "Joint pain",
        "Acute pain during movement",
        "Shoulder impingement"
      ],
    },
    {
      "id": "triceps-107",
      "name": "Dumbbell Tricep Extension",
      "difficulty": "beginner",
      "equipment": ["Dumbbell", "Bench"],
      "contraindications": [
        "Triceps injury",
        "Elbow pain or injury",
        "Shoulder impingement",
        "Wrist issues",
        "Acute pain during movement"
      ],
    }
  ]
}
{
  "bodyPart": "Upper Back",
  "exercises": [
    {
      "id": "upper-back-3",
      "name": "Bent Over Row",
      "description": "The bent over row is a back day staple exercise and is considered one of the best muscle building back building exercises you can do. Sometimes referred to as the barbell row, the bent over row is a staple movement in most muscle building workouts. Those looking to build muscle utilize the bent over row to target their back, bicep and core muscle. Those in powerlifting and strength circles perform bent over rows to increase their strength on the big 3 movements. The bent over row is typically used to build and strengthen the muscles of the upper back (latissimus dorsi, rhomboids, and trapezius). However, it requires assistance from muscles of the low back, core, and arms to perform a bent over row correctly. There are several variations of the bent over row one can and should perform. Bent over row variations include: Dumbbell Bent Over Row One Arm Bent Over Dumbbell Row Reverse Grip Bent Over Row T-Bar Row Smith Machine Row The back is a tricky muscle group to build and strengthen. Sometimes it can help to vary the degree in which you perform the bent over row and well as the hand placement on the bar. Regardless, the bent over row is a great exercise to include in your back workout.",
      "difficulty": "beginner",
      "equipment": ["Barbell"],
      "contraindications": [
        "Upper Back injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "upper-back-4",
      "name": "Seated Cable Row",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Upper Back injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "upper-back-8",
      "name": "Tripod Dumbbell Row",
      "difficulty": "beginner",
      "equipment": ["Dumbbell"],
      "contraindications": [
        "Upper Back injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "upper-back-14",
      "name": "Reverse Grip Bent Over Row",
      "difficulty": "intermediate",
      "equipment": ["Barbell"],
      "contraindications": [
        "Upper Back injury",
        "Joint pain",
        "Acute pain during movement",
        "Recent surgery",
        "Severe cardiovascular issues (for heavy compound movements)"
      ],
    },
    {
      "id": "upper-back-16",
      "name": "Inverted Row",
      "difficulty": "beginner",
      "equipment": ["Bodyweight", "Barbell", "Smith Machine", "TRX", "Rings"],
      "contraindications": [
        "Upper Back injury",
        "Shoulder impingement",
        "Elbow or wrist pain",
        "Acute pain during movement",
        "Inability to maintain core stability"
      ],
    },
    {
      "id": "upper-back-60",
      "name": "High Standing Banded Row",
      "difficulty": "beginner",
      "equipment": ["Bands"],
      "contraindications": [
        "Upper Back injury",
        "Neck pain or injury",
        "Shoulder impingement",
        "Acute pain during movement"
      ],
    },
    {
      "id": "upper-back-61",
      "name": "Seated Floor Single-Arm Cable Lat Pulldown",
      "difficulty": "beginner",
      "equipment": ["Cable"],
      "contraindications": [
        "Latissimus Dorsi injury",
        "Shoulder impingement",
        "Elbow pain",
        "Acute back pain",
        "Core instability issues"
      ],
    }
  ]
}
`;
