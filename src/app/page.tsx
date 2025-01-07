'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { ExerciseQuestionnaire } from './components/ui/ExerciseQuestionnaire';
import { ExerciseProgramPage } from './components/ui/ExerciseProgramPage';
import { generateExerciseProgram } from './api/assistant/assistant';

function HumanViewerWrapper() {
  const searchParams = useSearchParams();
  const initialGender = (searchParams?.get('gender') as Gender) || 'male';
  const [gender, setGender] = useState<Gender>(initialGender);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [exerciseProgram, setExerciseProgram] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const handleGenderChange = useCallback((newGender: Gender) => {
    console.log('Changing gender to:', newGender);
    setGender(newGender);
  }, []);

  const handleQuestionClick = useCallback((question: any) => {
    if (question.generate) {
      setSelectedQuestion(question);
      setShowQuestionnaire(true);
    }
  }, []);

  const handleBack = useCallback(() => {
    if (showQuestionnaire) {
      setShowQuestionnaire(false);
    } else if (exerciseProgram) {
      setExerciseProgram(null);
      setIsGeneratingProgram(false);
    }
  }, [showQuestionnaire, exerciseProgram]);

  const handleQuestionnaireSubmit = useCallback(async (answers: Record<string, string | number | string[]>) => {
    setShowQuestionnaire(false);
    setIsGeneratingProgram(true);

    try {
      const program = await generateExerciseProgram(
        selectedQuestion?.diagnosis ?? '',
        {
          selectedBodyGroup: String(answers.selectedBodyGroup),
          selectedBodyPart: String(answers.selectedBodyPart),
          age: String(answers.age),
          pastExercise: String(answers.pastExercise),
          plannedExercise: String(answers.plannedExercise),
          painAreas: Array.isArray(answers.painAreas) ? answers.painAreas : [],
          exercisePain: String(answers.exercisePain).toLowerCase() === 'true',
          painfulAreas: Array.isArray(answers.painfulAreas)
            ? answers.painfulAreas
            : [],
          trainingType: String(answers.trainingType),
          trainingLocation: String(answers.trainingLocation),
        }
      );
      setExerciseProgram(program);
    } catch (error) {
      console.error('Error generating exercise program:', error);
    } finally {
      setIsGeneratingProgram(false);
    }
  }, [selectedQuestion]);

  return (
    <>
      <HumanViewer 
        gender={gender} 
        onGenderChange={handleGenderChange}
        onQuestionClick={handleQuestionClick}
      />

      {/* Overlays */}
      {(showQuestionnaire || isGeneratingProgram || exerciseProgram) && (
        <div className="fixed inset-0 bg-gray-900 z-50">
          {showQuestionnaire && !isGeneratingProgram && !exerciseProgram && (
            <ExerciseQuestionnaire
              onClose={handleBack}
              onSubmit={handleQuestionnaireSubmit}
            />
          )}
          {(isGeneratingProgram || exerciseProgram) && (
            <ExerciseProgramPage
              onBack={handleBack}
              isLoading={isGeneratingProgram}
              program={exerciseProgram}
            />
          )}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HumanViewerWrapper />
    </Suspense>
  );
}
