# Program Rules

## Program Types

There are three distinct program types in the application:

| Type | Enum Value | Description |
|------|------------|-------------|
| Exercise | `exercise` | General fitness/strength training programs |
| Recovery | `recovery` | Rehabilitation and recovery-focused programs |
| Exercise & Recovery | `exercise_and_recovery` | Combined programs addressing both fitness and recovery |

```typescript
// shared/types.ts
enum ProgramType {
  Exercise = 'exercise',
  Recovery = 'recovery',
  ExerciseAndRecovery = 'exercise_and_recovery'
}
```

## App Launch - Default Display Program

**Critical:** When the app launches and the user has programs, the app displays the **most recently updated program** (by `updatedAt` field).

```typescript
// Query for display - gets most recent program
const displayQuery = query(
  programsRef,
  where('status', '==', 'done'),
  orderBy('updatedAt', 'desc'),
  limit(1)
);
```

**Why this matters:**
- Users expect to see their latest work immediately
- If a user just created a Recovery program, they should see it on launch—not an older Exercise program
- The `updatedAt` field captures both creation and modifications, ensuring fresh content surfaces first

## App Launch Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                      APP LAUNCH                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  User authenticated?  │
                └───────────────────────┘
                     │            │
                    Yes           No
                     │            │
                     ▼            ▼
          ┌──────────────────┐   Login Page
          │ Fetch programs   │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────────────────┐
          │ Has programs with            │
          │ status='done'?               │
          └──────────────────────────────┘
                │              │
               Yes             No
                │              │
                ▼              ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ Select MOST RECENT  │   │ Show empty state    │
    │ program (by         │   │ Prompt to create    │
    │ updatedAt desc)     │   │ first program       │
    └─────────────────────┘   └─────────────────────┘
                │
                ▼
            ┌─────────────────────┐
            │  Navigate to        │
            │  /program page      │
            │  Display selected   │
            └─────────────────────┘
```

**Key requirement:** The program displayed on launch MUST be the most recently updated/created program. This ensures users always see their latest work first, regardless of program type.

## Weekly Generation Limit Per Type

**Only ONE program generation (new or follow-up) is allowed per week per program type.**

This prevents abuse and ensures users engage with their programs before generating new ones.

| Program Type | Max Generations Per Week |
|--------------|--------------------------|
| Exercise | 1 |
| Recovery | 1 |
| Exercise & Recovery | 1 |

**Week Definition:** A week starts on Monday 00:00:00.000 (local time) and ends Sunday 23:59:59.999. The same `getStartOfWeek()` function used for follow-up program date calculation is used to determine the current week.

**What counts as a generation:**
- Creating a new program via questionnaire
- Generating a follow-up week for an existing program

**Database Schema:**
```typescript
// Firestore: users/{userId}
interface UserDocument {
  // ... other fields
  weeklyProgramGenerations?: {
    exercise?: string;              // ISO date of week start when last generated
    recovery?: string;              // ISO date of week start when last generated
    exercise_and_recovery?: string; // ISO date of week start when last generated
  };
}
```

**Check Logic (pseudo-code):**
```typescript
async function canGenerateProgram(userId: string, programType: ProgramType): Promise<boolean> {
  const currentWeekStart = getStartOfWeek(new Date()).toISOString();
  const userDoc = await getDoc(userRef);
  const generations = userDoc.data()?.weeklyProgramGenerations || {};
  
  // If no record for this type, or recorded week is different from current week → allowed
  const lastGeneratedWeek = generations[programType];
  return !lastGeneratedWeek || lastGeneratedWeek !== currentWeekStart;
}
```

**Record Generation (pseudo-code):**
```typescript
async function recordProgramGeneration(userId: string, programType: ProgramType): Promise<void> {
  const currentWeekStart = getStartOfWeek(new Date()).toISOString();
  await updateDoc(userRef, {
    [`weeklyProgramGenerations.${programType}`]: currentWeekStart
  });
}
```

**Implementation Locations:**
| Location | Responsibility |
|----------|----------------|
| `src/app/services/programGenerationLimits.ts` | Client-side `canGenerateProgram()` check |
| `src/app/services/programGenerationLimitsAdmin.ts` | Server-side `recordProgramGenerationAdmin()` |
| `src/app/services/questionnaire.ts` | Check limit before creating new program |
| `src/app/services/programFeedbackService.ts` | Check limit before generating follow-up |
| `src/app/api/programs/generate-incremental/route.ts` | Record limit when day 7 completes |
| `src/app/api/assistant/openai-server.ts` | Record limit when program/follow-up completes |

**Important:** The limit is **checked** on the client before initiating generation, but **recorded** on the server only after the program is successfully completed. This ensures users aren't locked out if generation fails.

**Error Handling:**
When a user attempts to generate a program but has already generated one this week for that type:
- Return a specific error: `WEEKLY_LIMIT_REACHED`
- UI should display a user-friendly message indicating when they can generate again (next Monday)

## Implementation Locations

| Location | Responsibility |
|----------|----------------|
| `src/app/services/questionnaire.ts` | Creates new programs |
| `src/app/services/recoveryProgramService.ts` | Handles recovery program creation |
| `src/app/api/assistant/openai-server.ts` | Generates programs after submission |
| `src/app/api/programs/generate-incremental/route.ts` | Incremental day-by-day generation |
| `src/app/context/UserContext.tsx` | Selects most recent program for display |

## Database Schema

```typescript
// Firestore: users/{userId}/programs/{programId}
interface ProgramDocument {
  type: ProgramType;           // 'exercise' | 'recovery' | 'exercise_and_recovery'
  status: ProgramStatus;       // 'generating' | 'done' | 'error'
  createdAt: Timestamp;
  updatedAt: Timestamp;        // Used to determine most recent program
  // ... other fields
}
```

## Firestore Indexes Required

For the program queries to work efficiently:

```
Collection: users/{userId}/programs
Fields:
  - status (Ascending)  
  - updatedAt (Descending)
```

## Edge Cases

1. **User with no programs**: Display empty state, prompt to create first program
2. **Program generation in progress**: Show generating skeleton, block other loads from overriding
3. **Weekly limit reached**: User must wait until next Monday to generate another program of that type
4. **Multiple programs of same type**: Most recent by `updatedAt` is displayed on app launch
