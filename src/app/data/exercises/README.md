# Exercise Template System

This directory contains predefined exercise templates that are used by the AI to generate personalized exercise programs. Instead of having the LLM create exercises from scratch, it will select from this curated list, ensuring higher quality and consistency in the programs.

## Directory Structure

- `index.ts` - Exports all exercise groups and provides helper functions
- Individual files for each body part (e.g., `neck.ts`, `lower-back.ts`, etc.)

## Exercise Format

Each exercise follows this format:

```typescript
{
  id: string;                                  // Unique identifier for the exercise
  name: string;                                // Name of the exercise
  description: string;                         // Brief description of what the exercise does
  targetBodyParts: TargetBodyPart[];           // Which body parts this targets
  exerciseType: ExerciseType | ExerciseType[]; // Categories like 'strength', 'flexibility', etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
  equipment: string[];                         // Required equipment (empty for no equipment)
  steps: string[];                             // Step-by-step instructions
  imageUrl?: string;                           // Optional URL to an image
  videoUrl?: string;                           // Optional URL to a video
  tips?: string[];                             // Optional tips for proper execution
  contraindications?: string[];                // Conditions when the exercise should be avoided
  alternatives?: string[];                     // Alternative exercises
  muscles: string[];                           // Primary muscles targeted
  duration?: number;                           // Duration in seconds (for timed exercises)
  repetitions?: number;                        // Number of repetitions (for counted exercises)
  sets?: number;                               // Number of sets
  restBetweenSets?: number;                    // Rest between sets in seconds
}
```

## Exercise Types/Categories

Exercises are categorized by type to help the AI create balanced programs. Available categories:

| Category      | Description                                                 |
|---------------|-------------------------------------------------------------|
| strength      | Builds muscular strength and endurance                      |
| flexibility   | Improves range of motion and reduces muscle tension         |
| mobility      | Enhances joint movement and function                        |
| stability     | Improves balance and body control                           |
| balance       | Focuses on equilibrium and coordination                     |
| core          | Strengthens the central muscles that support the spine      |
| posture       | Improves alignment and reduces postural strain              |
| endurance     | Focuses on sustained activity and cardiovascular health     |
| coordination  | Enhances movement precision and neuromotor control          |
| relaxation    | Promotes muscle relaxation and tension relief               |

An exercise can belong to multiple categories, with the first category listed being considered the primary type.

## How to Add New Exercises

1. Create or edit the appropriate body part file (e.g., `shoulders.ts`)
2. Follow the pattern in existing files:
   ```typescript
   import { ExerciseGroup, ExerciseType } from '@/app/types/exercises';
   
   export const shouldersExercises: ExerciseGroup = {
     bodyPart: 'Shoulders',
     exercises: [
       {
         id: 'shoulders-1',
         name: 'Shoulder Rolls',
         description: '...',
         targetBodyParts: ['Shoulders'],
         exerciseType: ['mobility', 'relaxation'],
         // Other properties...
       }
     ]
   };
   ```
3. Make sure to update `index.ts` if you create a new file
4. Use proper TypeScript syntax and follow the defined interface

## How to Upload Templates to Firestore

After adding or modifying exercises, you can upload them to Firestore:

1. **Dev environment:**
   ```typescript
   import { uploadTemplates } from '@/app/utils/uploadExerciseTemplates';
   await uploadTemplates();
   ```

2. **API endpoint (requires authorization):**
   ```
   curl -X POST https://your-domain.com/api/templates \
   -H "Authorization: Bearer your-admin-token" \
   -H "Content-Type: application/json"
   ```

## Integration with AI Program Generation

The exercise templates are automatically integrated with the LLM prompt when generating exercise programs. The LLM will only choose exercises from this predefined list, based on the user's needs, target body parts, and preferences. 

The system also displays exercises grouped by category in the prompt, helping the LLM create balanced programs that include appropriate proportions of different exercise types. 