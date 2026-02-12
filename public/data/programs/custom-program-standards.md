# Custom Program Standards

This document defines the required quality standard for all custom programs in:

- `public/data/programs/recovery.ts`
- `public/data/programs/exercise-custom.ts`

## 1) Structural Standard

Every custom program must include:

- `title` (exercise programs) or clear program identity (recovery mapping)
- `summary`
- `programOverview`
- `timeFrameExplanation`
- `afterTimeFrame.expectedOutcome`
- `afterTimeFrame.nextSteps` (progression criteria, not a prescriptive next-week plan)
- `whatNotToDo`
- `days` (7-day week template)

Each day must include:

- `day` (1-7)
- `description`
- `duration`
- `exercises` (required for workout days; required for recovery rest days in current design)

## 2) Workout-Day Description Standard

All workout days must include an explicit progression rule in the day description.

- Recovery rule pattern: progress only when pain response and next-morning response are stable.
- Exercise rule pattern: progress load (typically 2-5%) only when reps and form targets are met.
- Do not prescribe a fixed “next week” plan in user-facing copy; next-phase generation is dynamic.

## 3) Exercise Ordering Standard

Canonical order in `day.exercises`:

1. Warm-up exercises (`warmup: true` or `exerciseId` prefixed `warmup-`)
2. Main + accessory work (as authored)
3. Finisher cardio (non-warmup `cardio-*`)

UI must render in data order (no hidden sort).

## 4) Duration Standard

For `exercise-custom.ts`, every non-rest workout day must estimate to **30-45 minutes** using deterministic duration logic.

Validation must fail hard if any day is outside range.

## 5) Copy Quality Standard

Program-level copy (`summary`, `programOverview`, `timeFrameExplanation`) must pass:

- Sentence length caps (guardrail limit per file validator)
- No vague filler phrases (`etc`, `and so on`, `things`, `stuff`)
- Outcome-oriented summary language
- Standard timeframe anchor phrase:
  - `"Train 3 non-consecutive sessions this week"`

Validation must fail hard on violations.

## 6) Manual Authoring Standard

- No runtime auto-generation of exercise notes for custom programs.
- `modification` and `precaution` should be manually authored where relevant.
- No hidden runtime “filler” exercises should be injected.

## 7) Verification Commands

Run these after any custom-program changes:

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' -e "require('./public/data/programs/recovery.ts'); require('./public/data/programs/exercise-custom.ts'); console.log('custom-program-qa-ok')"
npm run -s typecheck
npm run -s test -- src/app/helpers/__tests__/recovery-slug-mapping.test.ts src/app/helpers/__tests__/recovery-programs.test.ts
```

If any command fails, the change is not compliant and must be fixed before merge.
