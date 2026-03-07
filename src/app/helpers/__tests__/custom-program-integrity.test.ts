import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
  rehabPrograms,
  localizeProgramDayDescriptions,
} from '../../../../public/data/programs/recovery';
import {
  exercisePrograms,
  localizeExerciseProgramContent,
} from '../../../../public/data/programs/exercise-custom';

type ExerciseLike = { id?: string; exerciseId?: string; name?: string };

const readExercisesFromDir = (
  dirPath: string,
  acc: ExerciseLike[] = []
): ExerciseLike[] => {
  if (!fs.existsSync(dirPath)) return acc;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      readExercisesFromDir(fullPath, acc);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    const exercises = Array.isArray(parsed?.exercises) ? parsed.exercises : [];
    for (const exercise of exercises) {
      acc.push(exercise as ExerciseLike);
    }
  }

  return acc;
};

const getReferencedExerciseIds = (): Set<string> => {
  const ids = new Set<string>();
  const allPrograms = [...rehabPrograms, ...exercisePrograms];

  for (const program of allPrograms) {
    for (const day of program.days || []) {
      for (const exercise of day.exercises || []) {
        if (exercise?.exerciseId) ids.add(String(exercise.exerciseId));
      }
    }
  }

  return ids;
};

describe('Custom program integrity', () => {
  const projectRoot = process.cwd();

  const englishExercises = readExercisesFromDir(
    path.join(projectRoot, 'public/data/exercises/musco/json2')
  ).concat(
    readExercisesFromDir(path.join(projectRoot, 'public/data/exercises/json'))
  );

  const norwegianExercises = readExercisesFromDir(
    path.join(projectRoot, 'public/data/exercises/musco/json2_no')
  ).concat(
    readExercisesFromDir(path.join(projectRoot, 'public/data/exercises/json'))
  );

  const englishIds = new Set(
    englishExercises.flatMap((exercise) =>
      [exercise.id, exercise.exerciseId].filter(Boolean) as string[]
    )
  );

  const norwegianById = new Map<string, ExerciseLike>();
  for (const exercise of norwegianExercises) {
    if (exercise.id) norwegianById.set(exercise.id, exercise);
    if (exercise.exerciseId) norwegianById.set(exercise.exerciseId, exercise);
  }

  it('uses only exercise IDs that exist in the English catalog', () => {
    const referencedIds = getReferencedExerciseIds();
    const missing = Array.from(referencedIds).filter((id) => !englishIds.has(id));
    expect(missing).toEqual([]);
  });

  it('uses only exercise IDs that exist in the Norwegian catalog', () => {
    const referencedIds = getReferencedExerciseIds();
    const missing = Array.from(referencedIds).filter((id) => !norwegianById.has(id));
    expect(missing).toEqual([]);
  });

  it('has a non-empty Norwegian exercise name for every referenced ID', () => {
    const referencedIds = getReferencedExerciseIds();
    const missingName = Array.from(referencedIds).filter((id) => {
      const exercise = norwegianById.get(id);
      return !exercise || !String(exercise.name || '').trim();
    });
    expect(missingName).toEqual([]);
  });

  it('includes explicit dayType for every program day', () => {
    const allPrograms = [...rehabPrograms, ...exercisePrograms];
    const invalid = allPrograms.flatMap((program, programIndex) =>
      (program.days || [])
        .map((day, dayIndex) => ({ programIndex, dayIndex, day }))
        .filter(
          ({ day }) =>
            !day?.dayType ||
            !['strength', 'cardio', 'recovery', 'rest'].includes(String(day.dayType))
        )
    );
    expect(invalid).toEqual([]);
  });

  it('does not fall back to generic "Hviledag" for localized recovery rest days', () => {
    const fallback = rehabPrograms.flatMap((program, programIndex) => {
      const localized = localizeProgramDayDescriptions(program, 'nb');
      return (localized.days || [])
        .filter((day) => day.isRestDay === true && day.description === 'Hviledag')
        .map((day) => ({ programIndex, day: day.day }));
    });
    expect(fallback).toEqual([]);
  });

  it('localizes recovery overview and workout-day text without depending on exact summary text', () => {
    const source = rehabPrograms[0];
    const mutated = {
      ...source,
      summary: `${source.summary} (edited copy variant)`,
    };
    const localized = localizeProgramDayDescriptions(mutated as any, 'nb');
    expect(localized.summary).not.toEqual(mutated.summary);
    expect(localized.programOverview).not.toEqual(source.programOverview);
    expect(localized.days[0]?.description).toContain('Zone 2 + leggstyrke');
  });

  it('localizes exercise day descriptions by slug/day without depending on english copy', () => {
    const source = exercisePrograms.find((program) => program.slug === 'full-body-strength');
    expect(source).toBeTruthy();

    const mutated = {
      ...source,
      summary: `${source.summary} (edited copy variant)`,
      days: (source.days || []).map((day) =>
        day.day === 1 ? { ...day, description: 'Focus: Temporary text override.' } : day
      ),
    };

    const localized = localizeExerciseProgramContent(mutated as any, 'nb');
    const day1 = (localized.days || []).find((day: any) => day.day === 1);
    const restDay = (localized.days || []).find((day: any) => day.day === 2);

    expect(day1?.description).toContain('Helkroppsøkt med jevn belastning på store muskelgrupper.');
    expect(day1?.description).not.toContain('Focus:');
    expect(restDay?.description).toBe('Hviledag med lett mobilitet for hofter og brystrygg, samt rolig gange for sirkulasjon.');
  });

  it('uses adaptive nextSteps wording instead of fixed progression promises', () => {
    const allPrograms = [...rehabPrograms, ...exercisePrograms];
    const nonAdaptive = allPrograms
      .map((program, programIndex) => ({
        programIndex,
        nextSteps: String(program.afterTimeFrame?.nextSteps || ''),
      }))
      .filter(({ nextSteps }) => {
        const value = nextSteps.toLowerCase();
        return !(
          value.includes('tailored') ||
          value.includes('may') ||
          value.includes('tilpasses') ||
          value.includes('kan')
        );
      });
    expect(nonAdaptive).toEqual([]);
  });

  it('keeps recovery workout-day durations in a practical 20-40 minute range', () => {
    const outOfRange = rehabPrograms.flatMap((program, programIndex) =>
      (program.days || [])
        .filter((day) => !day.isRestDay)
        .filter((day) => typeof day.duration !== 'number' || day.duration < 20 || day.duration > 40)
        .map((day) => ({ programIndex, day: day.day, duration: day.duration }))
    );
    expect(outOfRange).toEqual([]);
  });
});
