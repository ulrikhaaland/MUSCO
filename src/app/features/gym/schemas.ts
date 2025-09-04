import { z } from 'zod';

const ExerciseId = z.string().regex(
  /^(warmup|cardio|chest|shoulders|upper-back|lower-back|traps|lats|biceps|triceps|forearms|abs|obliques|quads|hamstrings|glutes|calves)-\d+$/,
  'Invalid exerciseId format'
);

const ExerciseOut = z.object({
  exerciseId: ExerciseId,
  warmup: z.literal(true).optional(),
  modification: z.string().min(1).max(240).optional(),
  precaution: z.string().min(1).max(240).optional(),
  duration: z.number().int().positive().max(180).optional(),
}).strict();

export const SingleDayProgramResultSchema = z
  .object({
    gym: z.object({
      name: z.string(),
      slug: z.string(),
      brand: z
        .object({ color: z.string().optional(), logoUrl: z.string().optional() })
        .optional(),
    }),
    title: z.string().min(3).max(60),
    sessionOverview: z.string().min(20).max(600),
    summary: z.string().min(8).max(120),
    whatNotToDo: z.string().min(12).max(240),
    day: z.object({
      isRestDay: z.literal(false),
      description: z.string().min(12).max(400),
      exercises: z.array(ExerciseOut).min(4),
      duration: z.number().int().min(10).max(120),
    }),
  })
  .strict();

export type SingleDayProgramResultZ = z.infer<typeof SingleDayProgramResultSchema>;





