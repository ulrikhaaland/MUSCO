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

## Active Program Constraints

### Rule 1: One Active Per Type
**Only ONE program of each type can be active at any given time.**

| Type | Max Active |
|------|------------|
| Exercise | 1 |
| Recovery | 1 |
| Exercise & Recovery | 1 |

This means a user can have up to **3 active programs simultaneously** (one of each type), but never 2+ active programs of the same type.

### Rule 2: Auto-Deactivation on New Program
When a new program is created or activated:
1. Query for existing active programs **of the same type**
2. Deactivate all found programs (`active: false`)
3. Set the new program as active (`active: true`)

```typescript
// Pseudo-code for activation logic
async function activateProgram(userId, programId, programType) {
  // 1. Deactivate existing active programs of same type
  const existingActive = query(
    programsRef,
    where('type', '==', programType),
    where('active', '==', true)
  );
  
  for (doc of existingActive) {
    if (doc.id !== programId) {
      update(doc, { active: false });
    }
  }
  
  // 2. Activate the target program
  update(programId, { active: true });
}
```

### Rule 3: Update `updatedAt` on Program Extension
**Critical:** When a program is extended with a new week (follow-up program generation), the `updatedAt` field MUST be updated.

This ensures the extended program surfaces as the most recent on app launch.

```typescript
// When generating follow-up week, always update updatedAt
const userProgramUpdates = {
  status: ProgramStatus.Done,
  updatedAt: new Date().toISOString(),  // ← CRITICAL: Must update this!
  active: true,
};
batch.update(programRef, userProgramUpdates);
```

**Implementation:** `src/app/api/assistant/openai-server.ts` line ~884

**When `updatedAt` must be updated:**
| Action | Update `updatedAt`? |
|--------|---------------------|
| New program created | ✅ Yes (automatic via `serverTimestamp()`) |
| Follow-up week generated | ✅ Yes (explicit update required) |
| Program activated/deactivated | ❌ No (only `active` changes) |
| Program viewed | ❌ No |

**Why this is critical:**
The `updatedAt` field is the **sole determinant** of which program displays on app launch. If a follow-up generation doesn't update `updatedAt`, the user might see an older program instead of their freshly extended one.

### Rule 4: App Launch - Default Display Program
**Critical:** When the app launches and the user has programs, the app navigates to the program page and displays the **most recently updated active program** across all types.

Priority order for selecting the display program:
1. **Most recent active program** (by `updatedAt`, any type) → Primary choice
2. **Most recent program** (by `updatedAt`, if no active programs exist) → Fallback

```typescript
// Query for display - gets most recent active across ALL types
const displayQuery = query(
  programsRef,
  where('active', '==', true),
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
          │ Has active programs?         │
          └──────────────────────────────┘
                │              │
               Yes             No
                │              │
                ▼              ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ Select MOST RECENT  │   │ Select MOST RECENT  │
    │ active program      │   │ program (any)       │
    │ (by updatedAt)      │   │ (by updatedAt)      │
    └─────────────────────┘   └─────────────────────┘
                │              │
                └──────┬───────┘
                       ▼
            ┌─────────────────────┐
            │  Navigate to        │
            │  /program page      │
            │  Display selected   │
            └─────────────────────┘
```

**Key requirement:** The program displayed on launch MUST be the most recently updated/created program. This ensures users always see their latest work first, regardless of program type.

## Implementation Locations

| Location | Responsibility |
|----------|----------------|
| `src/app/services/questionnaire.ts` | Deactivates same-type programs when creating new program |
| `src/app/services/program.ts` | `updateActiveProgramStatus()` for manual toggling |
| `src/app/services/recoveryProgramService.ts` | Handles recovery program activation |
| `src/app/api/assistant/openai-server.ts` | Deactivates same-type programs after generation completes |
| `src/app/api/programs/generate-incremental/route.ts` | Deactivates same-type programs in incremental generation |
| `src/app/context/UserContext.tsx` | Selects most recent active for display |

## Database Schema

```typescript
// Firestore: users/{userId}/programs/{programId}
interface ProgramDocument {
  type: ProgramType;           // 'exercise' | 'recovery' | 'exercise_and_recovery'
  active: boolean;             // Only one true per type
  status: ProgramStatus;       // 'generating' | 'done' | 'error'
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // ... other fields
}
```

## Firestore Indexes Required

For the active program queries to work efficiently:

```
Collection: users/{userId}/programs
Fields:
  - active (Ascending)
  - status (Ascending)  
  - updatedAt (Descending)
```

### Rule 5: Weekly Generation Limit Per Type
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

## Edge Cases

1. **User with no programs**: Display empty state, prompt to create first program
2. **All programs inactive**: Display most recently updated program (regardless of active status)
3. **Program generation in progress**: Show generating skeleton, block other loads from overriding
4. **Multiple active of same type (data corruption)**: On next activation, all same-type programs are deactivated first, self-healing the state
5. **Weekly limit reached**: User must wait until next Monday to generate another program of that type

