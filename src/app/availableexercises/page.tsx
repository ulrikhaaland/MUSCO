'use client';

import { useEffect, useState, useCallback } from 'react';
import ExerciseCard from '../components/ui/ExerciseCard';
import { Exercise } from '../types/program';
import { exerciseFiles, loadExercisesFromJson } from '../services/exerciseProgramService';

interface BodyPartExercises {
  [bodyPart: string]: Exercise[];
}

export default function AvailableExercisesPage() {
  const [exercisesByBodyPart, setExercisesByBodyPart] = useState<BodyPartExercises>({});
  const [expanded, setExpanded] = useState<{ [bodyPart: string]: string[] }>({});

  useEffect(() => {
    const load = async () => {
      try {
        const bodyParts = Object.keys(exerciseFiles);
        const loaded = await loadExercisesFromJson(bodyParts);
        const grouped: BodyPartExercises = {};
        loaded.forEach((ex) => {
          const bp = ex.bodyPart || ex.targetBodyParts?.[0] || 'Other';
          grouped[bp] = grouped[bp] ? [...grouped[bp], ex] : [ex];
        });
        Object.keys(grouped).forEach((bp) => {
          grouped[bp].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });
        setExercisesByBodyPart(grouped);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const toggleExercise = useCallback((bodyPart: string, name: string) => {
    setExpanded((prev) => {
      const arr = prev[bodyPart] || [];
      return {
        ...prev,
        [bodyPart]: arr.includes(name) ? arr.filter((n) => n !== name) : [...arr, name],
      };
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-16">
      <h1 className="text-3xl font-bold text-center text-indigo-200 mb-12">Available Exercises</h1>
      {Object.keys(exercisesByBodyPart).length === 0 && <p className="text-center text-gray-400">Loading...</p>}
      {Object.entries(exercisesByBodyPart).map(([bodyPart, exercises]) => (
        <section key={bodyPart} className="space-y-6">
          <h2 className="text-2xl font-semibold text-indigo-300">{bodyPart}</h2>
          <div className="space-y-6">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id || ex.exerciseId || ex.name}
                exercise={ex}
                isExpanded={(expanded[bodyPart] || []).includes(ex.name)}
                onToggle={() => toggleExercise(bodyPart, ex.name)}
                onVideoClick={() => {}}
                compact={true}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 