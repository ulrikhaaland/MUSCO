'use client';

import { useState, useRef } from 'react';
import { Exercise } from '@/app/types/program';

interface ProgramFeedbackQuestionnaireProps {
  onSubmit: (feedback: ProgramFeedback) => Promise<void>;
  onCancel: () => void;
  nextWeekDate: Date;
  isFeedbackDay: boolean;
  previousExercises: Exercise[]; // We'll still need this for display purposes
  mostEffectiveExercises?: string[]; // Added prop for most effective exercises
  leastEffectiveExercises?: string[]; // Added prop for least effective exercises
  onEditExercises?: (type: 'effective' | 'ineffective') => void; // Callback for editing selections
}

export interface ProgramFeedback {
  overallExperience: number;
  completedAllWorkouts: string;
  difficultyLevel: string;
  experiencedPain: boolean;
  painDetails?: string;
  noticedImprovements: string;
  mostEffectiveExercises: string[]; // Will be populated from the ExerciseSelectionPage
  leastEffectiveExercises: string[]; // Will be populated from the ExerciseSelectionPage
  focusForNextWeek: string;
  intensityPreference: string;
  additionalFeedback?: string;
}

export function ProgramFeedbackQuestionnaire({
  onSubmit,
  onCancel,
  nextWeekDate,
  isFeedbackDay,
  previousExercises = [],
  mostEffectiveExercises = [],
  leastEffectiveExercises = [],
  onEditExercises,
}: ProgramFeedbackQuestionnaireProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ProgramFeedback>({
    overallExperience: 3,
    completedAllWorkouts: '',
    difficultyLevel: '',
    experiencedPain: false,
    noticedImprovements: '',
    mostEffectiveExercises: mostEffectiveExercises, // Initialize with the passed props
    leastEffectiveExercises: leastEffectiveExercises, // Initialize with the passed props
    focusForNextWeek: '',
    intensityPreference: '',
    additionalFeedback: '',
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleInputChange = (
    field: keyof ProgramFeedback,
    value: string | number | boolean | string[]
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(feedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If it's not the feedback day, render the Coming Soon card
  if (!isFeedbackDay) {
    const formattedDate = nextWeekDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <svg
            className="w-12 h-12 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-app-title text-white">Coming Soon</h3>
          <p className="text-gray-300">
            Your next week's program will be available on {formattedDate}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-20 pt-8">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-app-title text-white">Share Your Feedback</h3>
          <p className="text-gray-300 mt-2">
            Help us create your next week&rsquo;s program by sharing your experience with this week&rsquo;s workouts
          </p>
        </div>

        {/* Overall Experience */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">How would you rate your overall experience?</h4>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Not good</span>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange('overallExperience', rating)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 
                    ${feedback.overallExperience === rating 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <span className="text-gray-400">Excellent</span>
          </div>
        </div>

        {/* Workout Completion */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">Were you able to complete all scheduled workouts?</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Yes', 'Partially', 'No'].map((option) => (
              <label key={option} className="relative flex items-center">
                <input
                  type="radio"
                  name="completedAllWorkouts"
                  value={option}
                  checked={feedback.completedAllWorkouts === option}
                  onChange={(e) => handleInputChange('completedAllWorkouts', e.target.value)}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">How challenging was the program?</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Too easy', 'Just right', 'Too difficult'].map((option) => (
              <label key={option} className="relative flex items-center">
                <input
                  type="radio"
                  name="difficultyLevel"
                  value={option}
                  checked={feedback.difficultyLevel === option}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pain/Discomfort */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">Did you experience any pain or discomfort beyond normal muscle fatigue?</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' }
            ].map((option) => (
              <label key={option.label} className="relative flex items-center">
                <input
                  type="radio"
                  name="experiencedPain"
                  value={option.value.toString()}
                  checked={feedback.experiencedPain === option.value}
                  onChange={(e) => handleInputChange('experiencedPain', e.target.value === 'true')}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option.label}
                </div>
              </label>
            ))}
          </div>
          
          {feedback.experiencedPain && (
            <div className="mt-4">
              <textarea
                placeholder="Please describe which exercises or body parts caused discomfort"
                value={feedback.painDetails || ''}
                onChange={(e) => handleInputChange('painDetails', e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-white placeholder-gray-500 focus:ring-indigo-500 focus:outline-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Improvements */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">Did you notice any improvements in your target areas?</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Yes', 'Somewhat', 'No'].map((option) => (
              <label key={option} className="relative flex items-center">
                <input
                  type="radio"
                  name="noticedImprovements"
                  value={option}
                  checked={feedback.noticedImprovements === option}
                  onChange={(e) => handleInputChange('noticedImprovements', e.target.value)}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Most Effective Exercises */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <div>
            <h4 className="text-white font-medium mb-4">Select Your Most Effective Exercises</h4>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Choose exercises from your previous program that gave you the best results
            </p>
          </div>
          <div 
            className="bg-gray-900/50 ring-1 ring-gray-700/30 rounded-xl p-4 cursor-pointer hover:ring-indigo-500/40 hover:bg-gray-800/60 transition-colors duration-200"
            onClick={() => onEditExercises && onEditExercises('effective')}
          >
            {feedback.mostEffectiveExercises.length === 0 ? (
              <div className="text-gray-400">
                You haven&rsquo;t selected any exercises.
                <span className="ml-2 text-indigo-400">
                  Add some?
                </span>
              </div>
            ) : (
              <ul className="text-white text-sm list-disc pl-5 space-y-1">
                {previousExercises
                  .filter(exercise => {
                    const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
                    return feedback.mostEffectiveExercises.includes(exerciseId);
                  })
                  .map(exercise => (
                    <li key={`effective-${exercise.id || exercise.exerciseId || exercise.name}`}>
                      {exercise.name}
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
        </div>

        {/* Exercises You Prefer Less */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <div>
            <h4 className="text-white font-medium mb-4">Select Exercises You'd Prefer Less Of</h4>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Choose exercises from your previous program that you found less enjoyable or effective
            </p>
          </div>
          <div 
            className="bg-gray-900/50 ring-1 ring-gray-700/30 rounded-xl p-4 cursor-pointer hover:ring-indigo-500/40 hover:bg-gray-800/60 transition-colors duration-200"
            onClick={() => onEditExercises && onEditExercises('ineffective')}
          >
            {feedback.leastEffectiveExercises.length === 0 ? (
              <div className="text-gray-400">
                You haven&rsquo;t selected any exercises.
                <span className="ml-2 text-indigo-400">
                  Add some?
                </span>
              </div>
            ) : (
              <ul className="text-white text-sm list-disc pl-5 space-y-1">
                {previousExercises
                  .filter(exercise => {
                    const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
                    return feedback.leastEffectiveExercises.includes(exerciseId);
                  })
                  .map(exercise => (
                    <li key={`ineffective-${exercise.id || exercise.exerciseId || exercise.name}`}>
                      {exercise.name}
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
        </div>

        {/* Focus for Next Week */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">What would you like to focus on next week?</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['More strength', 'More flexibility', 'More cardio', 'Same balance'].map((option) => (
              <label key={option} className="relative flex items-center">
                <input
                  type="radio"
                  name="focusForNextWeek"
                  value={option}
                  checked={feedback.focusForNextWeek === option}
                  onChange={(e) => handleInputChange('focusForNextWeek', e.target.value)}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Intensity Preference */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">How would you like to adjust the intensity?</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Increase', 'Keep the same', 'Decrease'].map((option) => (
              <label key={option} className="relative flex items-center">
                <input
                  type="radio"
                  name="intensityPreference"
                  value={option}
                  checked={feedback.intensityPreference === option}
                  onChange={(e) => handleInputChange('intensityPreference', e.target.value)}
                  className="peer sr-only"
                  required
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Feedback */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
          <h4 className="text-white font-medium mb-4">Is there anything else you'd like us to know?</h4>
          <textarea
            placeholder="Any other comments or suggestions to improve your next program"
            value={feedback.additionalFeedback || ''}
            onChange={(e) => handleInputChange('additionalFeedback', e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-white placeholder-gray-500 focus:ring-indigo-500 focus:outline-none"
            rows={3}
          />
        </div>
      </form>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Program...
              </>
            ) : (
              "Generate Next Week's Program"
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 