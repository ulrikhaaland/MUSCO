import { getDocs, collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { ProgramStatus, ExerciseProgram } from '@/app/types/program';
import { ProgramFeedback } from '../components/ui/ProgramFeedbackQuestionnaire';
import { Locale } from '../i18n/translations';
import { getSavedLocalePreference } from '../i18n/utils';

// Extended ExerciseQuestionnaireAnswers to include feedback fields
interface FeedbackEnhancedQuestionnaire extends ExerciseQuestionnaireAnswers {
  feedbackDifficulty?: string;
  feedbackIntensity?: string;
  feedbackEffectiveExercises?: string;
  feedbackIneffectiveExercises?: string;
  feedbackAdditionalNotes?: string;
}

// Extended ExerciseProgram interface to include feedback-related properties
interface ProgramWithFeedbackData extends ExerciseProgram {
  questionnaire?: ExerciseQuestionnaireAnswers;
  diagnosis?: Partial<DiagnosisAssistantResponse>;
  docId?: string; // The ID of the program document
}

/**
 * Submits feedback for a completed program and generates a new program week for the next week
 * @param userId The user ID for whom to generate the next program
 * @param currentProgram The current program to build upon
 * @param feedback The user's feedback on the current program
 * @param assistantId Optional assistant ID for the follow-up program generation
 * @returns The ID of the program document
 */
export const 
submitProgramFeedback = async (
  userId: string,
  currentProgram: ProgramWithFeedbackData,
  feedback: ProgramFeedback,
  assistantId?: string
): Promise<string> => {
  try {
    // Create a modified questionnaire based on the feedback
    const previousAnswers = currentProgram.questionnaire || {} as ExerciseQuestionnaireAnswers;
    
    // Find exercise names from IDs for effective and ineffective exercises
    const getExerciseNameById = (exerciseId: string): string => {
      // Search through all weeks and days to find the exercise with this ID
      for (const week of currentProgram.program || []) {
        for (const day of week.days) {
          const exercise = day.exercises?.find(ex => 
            (ex.id === exerciseId || ex.exerciseId === exerciseId || ex.name === exerciseId)
          );
          if (exercise) {
            return exercise.name || exerciseId;
          }
        }
      }
      return exerciseId;
    };
    
    // Convert arrays of IDs to comma-separated strings of exercise names
    const effectiveExerciseNames = feedback.mostEffectiveExercises
      .map(id => getExerciseNameById(id))
      .join(', ');
      
    const ineffectiveExerciseNames = feedback.leastEffectiveExercises
      .map(id => getExerciseNameById(id))
      .join(', ');
    
    // Adjust the existing questionnaire answers based on feedback
    const updatedAnswers: FeedbackEnhancedQuestionnaire = {
      age: previousAnswers.age || '',
      lastYearsExerciseFrequency: previousAnswers.lastYearsExerciseFrequency || '',
      numberOfActivityDays: previousAnswers.numberOfActivityDays || '',
      generallyPainfulAreas: feedback.experiencedPain && feedback.painDetails
        ? [...(previousAnswers.generallyPainfulAreas || []), feedback.painDetails]
        : previousAnswers.generallyPainfulAreas || [],
      
      // Update preferences based on feedback
      exerciseModalities: feedback.focusForNextWeek === 'More cardio' 
        ? 'Cardio' 
        : feedback.focusForNextWeek === 'More strength' 
          ? 'Strength' 
          : 'Both',
      exerciseEnvironments: previousAnswers.exerciseEnvironments || '',
      workoutDuration: previousAnswers.workoutDuration || '',
      targetAreas: previousAnswers.targetAreas || [],
      
      // Add feedback-specific fields
      feedbackDifficulty: feedback.difficultyLevel,
      feedbackIntensity: feedback.intensityPreference,
      feedbackEffectiveExercises: effectiveExerciseNames,
      feedbackIneffectiveExercises: ineffectiveExerciseNames,
      feedbackAdditionalNotes: feedback.additionalFeedback,
    };
    
    // Add any additional fields from the original questionnaire that we want to preserve
    if (previousAnswers.equipment) {
      updatedAnswers.equipment = previousAnswers.equipment;
    }
    
    if (previousAnswers.experienceLevel) {
      updatedAnswers.experienceLevel = previousAnswers.experienceLevel;
    }
    
    if (previousAnswers.weeklyFrequency) {
      updatedAnswers.weeklyFrequency = previousAnswers.weeklyFrequency;
    }
    
    // Create a modified diagnosis that includes the feedback information
    const currentDiagnosis = currentProgram.diagnosis || {};
    const diagnosisWithFeedback = {
      // Required fields from DiagnosisAssistantResponse
      diagnosis: currentDiagnosis.diagnosis || 'General fitness',
      painfulAreas: currentDiagnosis.painfulAreas || [],
      avoidActivities: currentDiagnosis.avoidActivities || [],
      recoveryGoals: currentDiagnosis.recoveryGoals || ['improve fitness'],
      timeFrame: currentDiagnosis.timeFrame || '1 week',
      followUpQuestions: currentDiagnosis.followUpQuestions || [],
      programType: currentDiagnosis.programType || ProgramType.Exercise,
      
      // Add feedback information as custom properties
      feedbackOverallExperience: feedback.overallExperience,
      feedbackCompletionRate: feedback.completedAllWorkouts,
      feedbackImprovements: feedback.noticedImprovements,
      feedbackWeek: currentProgram.program?.[0]?.week + 1 || 1, // Increment week number with fallback
      
      // Store the exercise IDs as separate properties
      feedbackEffectiveExerciseIds: feedback.mostEffectiveExercises,
      feedbackIneffectiveExerciseIds: feedback.leastEffectiveExercises,
    } as DiagnosisAssistantResponse & {
      feedbackOverallExperience: number;
      feedbackCompletionRate: string;
      feedbackImprovements: string;
      feedbackWeek: number;
      feedbackEffectiveExerciseIds: string[];
      feedbackIneffectiveExerciseIds: string[];
    };
    
    // Add progressive property if it exists in the original diagnosis
    if (currentDiagnosis.progressive !== undefined) {
      diagnosisWithFeedback.progressive = currentDiagnosis.progressive;
    }
    
    // Instead of creating a new program, add a follow-up week to the existing program
    // Get the programId from the current program
    const programId = currentProgram.docId || '';
    
    if (!programId) {
      throw new Error("Current program doesn't have an ID");
    }
    
    // Set the program status to generating while we create the follow-up
    const programRef = doc(db, `users/${userId}/programs/${programId}`);
      
    await updateDoc(programRef, {
      status: ProgramStatus.Generating,
      updatedAt: new Date().toISOString(),
    });
    
    try {
      // Get user's language preference
      const userLanguage: Locale = typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';
      
      // Call the API to generate a follow-up program
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_follow_up_program',
          payload: {
            diagnosisData: diagnosisWithFeedback,
            userInfo: updatedAnswers,
            userId: userId,
            programId: programId,
            assistantId: assistantId || 'asst_PjMTzHis7vLSeDZRhbBB1tbe',
            previousProgram: currentProgram.program || [], // Pass the program data
            language: userLanguage, // Pass the user's language preference
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate follow-up program');
      }
      
      const result = await response.json();
      console.log('Follow-up program generated successfully', result);
      
        return programId;  // Return the existing program ID
    } catch (error) {
      // If there's an error, update the program status back to Done
      await updateDoc(programRef, {
        status: ProgramStatus.Done,
        updatedAt: new Date().toISOString(),
      });
      throw error;
    }
  } catch (error) {
    console.error('Error submitting program feedback:', error);
    throw error;
  }
};
