'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { TopBar } from './TopBar';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { 
  TARGET_BODY_PARTS, 
  UPPER_BODY_PARTS, 
  LOWER_BODY_PARTS, 
  ExerciseEnvironment,
  EXERCISE_ENVIRONMENTS,
  WORKOUT_DURATIONS,
  AGE_RANGES,
  EXERCISE_FREQUENCY_OPTIONS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
  EXERCISE_MODALITIES,
  PAIN_BODY_PARTS
} from '@/app/types/program';

import { useTranslation } from '@/app/i18n';
import {
  getTranslatedTargetBodyParts,
  getTranslatedExerciseEnvironments,
  getTranslatedWorkoutDurations,
  getTranslatedAgeRanges,
  getTranslatedExerciseFrequencyOptions,
  getTranslatedPlannedExerciseFrequencyOptions,
  getTranslatedExerciseModalities,
  getTranslatedPainBodyParts,
  translatePainBodyPart,
  getTranslatedBodyRegions,
  translateBodyPart
} from '@/app/utils/programTranslation';

interface ExerciseQuestionnaireProps {
  onClose: () => void;
  onSubmit: (answers: ExerciseQuestionnaireAnswers) => void;
  generallyPainfulAreas: string[];
  programType: ProgramType;
  targetAreas: BodyPartGroup[];
  fullBody: boolean;
}

// Map composite pain areas to their individual parts
const compositeAreaMapping: { [key: string]: string[] } = {
  'Upper & Middle Back': ['Upper Back', 'Middle Back'],
  'Lower Back, Pelvis & Hip Region': ['Lower Back', 'Pelvis & Hip Region'],
};

// Function to expand composite areas into individual parts
const expandPainAreas = (areas: string[], t: (key: string, options?: any) => string, translatedPainBodyParts: string[]): string[] => {
  const expandedAreas = new Set<string>();

  areas.forEach((area) => {
    if (!area) return;
    // Convert to lowercase for comparison
    const lowerArea = area.toLowerCase();
    const lowerCompositeMapping: { [key: string]: string[] } = {};

    // Create lowercase mapping for comparison
    Object.entries(compositeAreaMapping).forEach(([key, value]) => {
      lowerCompositeMapping[key.toLowerCase()] = value;
    });

    if (lowerArea in lowerCompositeMapping) {
      lowerCompositeMapping[lowerArea].forEach((part) =>
        expandedAreas.add(part)
      );
    } else {
      // Find the matching pain body part with correct capitalization
      const matchingPart = translatedPainBodyParts.find(
        (part) => part.toLowerCase() === lowerArea
      ) || PAIN_BODY_PARTS.find(
        (part) => part.toLowerCase() === lowerArea
      );
      expandedAreas.add(matchingPart || area);
    }
  });

  return Array.from(expandedAreas);
};

// Define recovery program duration options
const RECOVERY_WORKOUT_DURATIONS = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
] as const;

// Function to get the appropriate workout durations based on program type
const getWorkoutDurations = (programType: ProgramType) => {
  return programType === ProgramType.Recovery
    ? RECOVERY_WORKOUT_DURATIONS
    : WORKOUT_DURATIONS;
};


// Target body parts now imported from program.ts

function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const wasIntersectedOnce = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasIntersectedOnce.current) {
          setIsVisible(true);
          wasIntersectedOnce.current = true;
        }
      },
      { threshold: 0.1, ...options }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return [elementRef, isVisible];
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

function RevealOnScroll({ children, className = '' }: RevealOnScrollProps) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function renderSelectedAnswers(answers: string | string[], onEdit: () => void) {
  if (!answers || (Array.isArray(answers) && answers.length === 0)) return null;

  const answerArray = Array.isArray(answers)
    ? answers
    : answers === 'Both'
    ? ['Cardio', 'Strength']
    : [answers];

  return (
    <div onClick={onEdit} className="group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-2">
          {answerArray.map((answer) => (
            <div
              key={answer}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500 text-white text-sm"
            >
              {answer}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ExerciseQuestionnaire({
  onClose,
  onSubmit,
  generallyPainfulAreas,
  programType,
  targetAreas,
  fullBody,
}: ExerciseQuestionnaireProps) {
  const { t } = useTranslation();
  
  // Get translated options
  const translatedTargetBodyParts = getTranslatedTargetBodyParts(t);
  const translatedExerciseEnvironments = getTranslatedExerciseEnvironments(t);
  const translatedAgeRanges = getTranslatedAgeRanges(t);
  const translatedExerciseFrequencyOptions = getTranslatedExerciseFrequencyOptions(t);
  const translatedPlannedFrequencyOptions = getTranslatedPlannedExerciseFrequencyOptions(t);
  const translatedExerciseModalities = getTranslatedExerciseModalities(t);
  const translatedPainBodyParts = getTranslatedPainBodyParts(t);
  const translatedBodyRegions = getTranslatedBodyRegions(t);
  
  // Translate workout durations based on program type
  const TRANSLATED_RECOVERY_WORKOUT_DURATIONS = RECOVERY_WORKOUT_DURATIONS.map(
    duration => t(`program.duration.${duration.toLowerCase().replace(/\s+/g, '_')}`)
  );
  
  const translatedWorkoutDurations = programType === ProgramType.Recovery
    ? TRANSLATED_RECOVERY_WORKOUT_DURATIONS
    : getTranslatedWorkoutDurations(t);
  
  // Normalize and expand the incoming pain areas while preserving proper capitalization
  const normalizedPainAreas = expandPainAreas(generallyPainfulAreas || [], t, translatedPainBodyParts);

  const [targetAreasReopened, setTargetAreasReopened] = useState(false);
  const [editingField, setEditingField] = useState<
    keyof ExerciseQuestionnaireAnswers | null
  >(null);

  const [selectedTargetAreas, setSelectedTargetAreas] = useState<
    (typeof TARGET_BODY_PARTS)[number][]
  >(() => {
    // If fullBody is true, return all target areas
    if (fullBody) {
      return [...TARGET_BODY_PARTS];
    }

    // Otherwise initialize with preselected areas from targetAreas prop
    const preselectedAreas = targetAreas
      .map((group) => {
        const groupId = group.id.toLowerCase();
        // Map to exact string literals from TARGET_BODY_PARTS
        if (groupId.includes('shoulder')) return 'Shoulders' as const;
        if (groupId.includes('upper_arm')) return 'Upper Arms' as const;
        if (groupId.includes('forearm')) return 'Forearms' as const;
        if (groupId.includes('chest')) return 'Chest' as const;
        if (groupId.includes('torso')) return 'Abdomen' as const;
        if (groupId.includes('back')) return 'Upper Back' as const;
        if (groupId.includes('pelvis')) return 'Lower Back' as const;
        if (groupId.includes('glutes')) return 'Glutes' as const;
        if (groupId.includes('thigh')) return 'Upper Legs' as const;
        if (groupId.includes('lower_leg')) return 'Lower Legs' as const;
        if (groupId.includes('neck')) return 'Neck' as const;
        return null;
      })
      .filter(
        (area): area is (typeof TARGET_BODY_PARTS)[number] => area !== null
      );
    return [...new Set(preselectedAreas)]; // Remove duplicates
  });

  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers>(() => ({
    age: '',
    lastYearsExerciseFrequency: '',
    numberOfActivityDays: '',
    generallyPainfulAreas: normalizedPainAreas,
    exerciseModalities: '',
    exerciseEnvironments: '',
    workoutDuration: '',
    targetAreas: selectedTargetAreas,
  }));

  // Update answers when selectedTargetAreas changes
  useEffect(() => {
    setAnswers((prev) => ({
      ...prev,
      targetAreas: selectedTargetAreas,
    }));
  }, [selectedTargetAreas]);

  const handleEdit = (field: keyof ExerciseQuestionnaireAnswers) => {
    // Only set targetAreasReopened if:
    // 1. We're editing target areas
    // 2. We're not currently editing target areas
    // 3. We have already answered exercise environments (meaning it was collapsed)
    if (
      field === 'targetAreas' &&
      editingField !== 'targetAreas' &&
      !!answers.exerciseEnvironments
    ) {
      setTargetAreasReopened(true);
    }

    if (field === 'generallyPainfulAreas') {
      if (answers.generallyPainfulAreas.length === 0) {
        setAnswers((prev) => ({ ...prev, generallyPainfulAreas: [' '] }));
      }
    }

    setEditingField(field);
  };

  const shouldCollapseField = (field: keyof ExerciseQuestionnaireAnswers) => {
    // Special handling for targetAreas
    if (field === 'targetAreas') {
      return !targetAreasReopened && !!answers.exerciseEnvironments;
    }

    // For all other fields, keep the existing behavior
    const fields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'generallyPainfulAreas',
      'exerciseModalities',
      'exerciseEnvironments',
      'workoutDuration',
    ];

    const currentIndex = fields.indexOf(field);
    if (currentIndex === -1) return false;

    const nextField = fields[currentIndex + 1];
    if (!nextField) return false;

    return shouldShowQuestion(nextField);
  };

  // Create refs for each question section
  const ageRef = useRef<HTMLDivElement>(null);
  const lastYearRef = useRef<HTMLDivElement>(null);
  const plannedRef = useRef<HTMLDivElement>(null);
  const painAreasRef = useRef<HTMLDivElement>(null);
  const exerciseModalitiesRef = useRef<HTMLDivElement>(null);
  const exerciseEnvironmentRef = useRef<HTMLDivElement>(null);
  const workoutDurationRef = useRef<HTMLDivElement>(null);
  const targetAreasRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const scrollToNextUnansweredQuestion = async (
    currentRef: React.RefObject<HTMLDivElement>,
    forceScroll?: boolean
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const refs = [
      ageRef,
      lastYearRef,
      plannedRef,
      painAreasRef,
      exerciseModalitiesRef,
      exerciseEnvironmentRef,
      workoutDurationRef,
      targetAreasRef,
    ];

    const fields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'generallyPainfulAreas',
      'exerciseModalities',
      'exerciseEnvironments',
      'workoutDuration',
      'targetAreas',
    ];

    const currentIndex = refs.indexOf(currentRef);

    if (currentIndex < refs.length - 1 && formRef.current) {
      // If forceScroll is true, scroll to the next ref immediately
      if (forceScroll && refs[currentIndex + 1].current) {
        const nextElement = refs[currentIndex + 1].current;
        const formElement = formRef.current;
        const formRect = formElement.getBoundingClientRect();
        const elementRect = nextElement.getBoundingClientRect();
        const relativeTop =
          elementRect.top - formRect.top + formElement.scrollTop;

        formElement.scrollTo({
          top: relativeTop - 60,
          behavior: 'smooth',
        });
        return;
      }

      // Otherwise, find the next unanswered question
      for (let i = currentIndex + 1; i < refs.length; i++) {
        const field = fields[i];
        const isEmpty = Array.isArray(answers[field])
          ? (answers[field] as any[]).length === 0
          : !answers[field];

        if (isEmpty && refs[i].current && shouldShowQuestion(field)) {
          const nextElement = refs[i].current;
          const formElement = formRef.current;
          const formRect = formElement.getBoundingClientRect();
          const elementRect = nextElement.getBoundingClientRect();
          const relativeTop =
            elementRect.top - formRect.top + formElement.scrollTop;

          formElement.scrollTo({
            top: relativeTop - 60,
            behavior: 'smooth',
          });
          break;
        }
      }
    } else if (currentIndex === refs.length - 1 && formRef.current) {
      // If we're at the last question, scroll to the bottom
      formRef.current.scrollTo({
        top: formRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleInputChange = (
    field: keyof ExerciseQuestionnaireAnswers,
    value: string | number | string[],
    ref?: React.RefObject<HTMLDivElement>
  ) => {
    const normalizedValue =
      field === 'generallyPainfulAreas'
        ? Array.isArray(value)
          ? value
          : value
        : value;

    // For single-choice fields, if the same value is selected again, just minimize the question
    const singleChoiceFields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'exerciseModalities',
      'workoutDuration',
    ];

    // Auto-collapse for "No, I don&apos;t have any pain" selection (when generallyPainfulAreas is set to empty array)
    if (
      field === 'generallyPainfulAreas' &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      setAnswers((prev) => ({
        ...prev,
        [field]: value,
      }));
      setEditingField(null);

      // Schedule scrolling after state update
      setTimeout(() => {
        if (ref) {
          scrollToNextUnansweredQuestion(ref, true);
        }
      }, 150);
      return;
    }

    if (
      singleChoiceFields.includes(field) &&
      answers[field] === normalizedValue
    ) {
      setEditingField(null);
      return;
    }

    // Update state
    setAnswers((prev) => ({
      ...prev,
      [field]: normalizedValue,
    }));

    // Only clear editing state for non-pain areas or when selecting "No, I don&apos;t have any pain"
    if (
      field !== 'generallyPainfulAreas' ||
      (Array.isArray(normalizedValue) && normalizedValue.length === 0)
    ) {
      setEditingField(null);
    }

    // Schedule scrolling after state update
    setTimeout(() => {
      if (!ref) {
        return;
      }

      // Check if this is the last question being answered
      const isLastQuestion = field === 'workoutDuration';

      // If it's the last question and we're setting a value, scroll to bottom
      if (isLastQuestion && normalizedValue) {
        if (formRef.current) {
          formRef.current.scrollTo({
            top: formRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
        return;
      }

      // Special case for exercise modalities
      if (field === 'exerciseModalities') {
        if (normalizedValue === 'Strength' || normalizedValue === 'Both') {
          // Scroll to target areas
          if (targetAreasRef.current) {
            const formElement = formRef.current;
            if (formElement) {
              const formRect = formElement.getBoundingClientRect();
              const elementRect =
                targetAreasRef.current.getBoundingClientRect();
              const relativeTop =
                elementRect.top - formRect.top + formElement.scrollTop;

              formElement.scrollTo({
                top: relativeTop - 60,
                behavior: 'smooth',
              });
            }
          }
        } else {
          // For Cardio, scroll to exercise environments
          scrollToNextUnansweredQuestion(ref, true);
        }
        return;
      }

      // Special case for target areas - only auto-scroll if selecting a body region
      if (field === 'targetAreas' && Array.isArray(normalizedValue)) {
        const isFullBody = normalizedValue.length === TARGET_BODY_PARTS.length;
        const isUpperBody =
          UPPER_BODY_PARTS.every((part) => normalizedValue.includes(part)) &&
          normalizedValue.length === UPPER_BODY_PARTS.length;
        const isLowerBody =
          LOWER_BODY_PARTS.every((part) => normalizedValue.includes(part)) &&
          normalizedValue.length === LOWER_BODY_PARTS.length;

        if (isFullBody || isUpperBody || isLowerBody) {
          scrollToNextUnansweredQuestion(ref, true);
        }
        return;
      }

      // Auto-scroll for single-choice fields
      if (singleChoiceFields.includes(field)) {
        scrollToNextUnansweredQuestion(ref, true);
        return;
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform 'Both' to ['Strength', 'Cardio']
    if (answers.exerciseModalities === 'Both') {
      answers.exerciseModalities = 'Strength and Cardio';
    }

    onSubmit(answers);
  };

  const handleNoPainAreas = () => {
    setAnswers((prev) => ({ ...prev, generallyPainfulAreas: [] }));
    setEditingField(null);
    if (painAreasRef.current) {
      scrollToNextUnansweredQuestion(painAreasRef, true);
    }
  };

  const shouldShowQuestion = (field: keyof ExerciseQuestionnaireAnswers) => {
    // For recovery programs, don't show exercise modalities question
    if (programType === ProgramType.Recovery && field === 'exerciseModalities') {
      return false;
    }

    switch (field) {
      case 'age':
        return true;
      case 'lastYearsExerciseFrequency':
        return !!answers.age;
      case 'numberOfActivityDays':
        return !!answers.lastYearsExerciseFrequency;
      case 'generallyPainfulAreas':
        return !!answers.numberOfActivityDays;
      case 'exerciseModalities':
        return (
          programType === ProgramType.Exercise &&
          !!answers.numberOfActivityDays &&
          (!!answers.generallyPainfulAreas ||
            answers.generallyPainfulAreas.length === 0)
        );
      case 'targetAreas':
        // Check for Strength or Both in a translation-safe way by looking at the underlying value
        // or comparing with translated strings
        return (
          programType === ProgramType.Exercise &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Strength' ||
           answers.exerciseModalities === t('program.modality.strength') ||
           answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'exerciseEnvironments':
        if (programType === ProgramType.Recovery) {
          // For recovery, show after having exercise frequency
          return !!answers.numberOfActivityDays;
        }
        // For exercise, show after exercise modalities
        return !!answers.exerciseModalities;
      case 'workoutDuration':
        return !!answers.exerciseEnvironments;
      default:
        return false;
    }
  };

  // Get the appropriate workout durations based on program type
  const workoutDurations = getWorkoutDurations(programType);

  return (
    <div className="min-h-screen from-gray-900 to-gray-800 h-[calc(100dvh)]">
      <TopBar onBack={onClose} className="fixed top-0 left-0 right-0 z-50" />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="h-screen overflow-y-auto pt-8 pb-32 sm:pb-8"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {programType === ProgramType.Exercise
                  ? t('questionnaire.exerciseTitle')
                  : t('questionnaire.recoveryTitle')}
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                {programType === ProgramType.Exercise
                  ? t('questionnaire.exerciseDescription')
                  : t('questionnaire.recoveryDescription')}
              </p>
            </div>
          </RevealOnScroll>

          {/* Age */}
          <RevealOnScroll>
            <div
              ref={ageRef}
              onClick={() => handleEdit('age')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
            >
              <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                <svg
                  className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t('questionnaire.age')}
              </h3>
              {answers.age &&
              editingField !== 'age' &&
              shouldCollapseField('age') ? (
                renderSelectedAnswers(answers.age, () => handleEdit('age'))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {translatedAgeRanges.map((range, index) => (
                    <label
                      key={range}
                      className="relative flex items-center"
                    >
                      <input
                        type="radio"
                        name="age"
                        value={AGE_RANGES[index]}
                        checked={answers.age === AGE_RANGES[index]}
                        onChange={(e) =>
                          handleInputChange('age', e.target.value, ageRef)
                        }
                        className="peer sr-only"
                        required
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                        {range}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* Past Exercise Frequency */}
          {shouldShowQuestion('lastYearsExerciseFrequency') && (
            <RevealOnScroll>
              <div
                ref={lastYearRef}
                onClick={() => handleEdit('lastYearsExerciseFrequency')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
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
                  {t('questionnaire.pastExercise')}
                </h3>
                {answers.lastYearsExerciseFrequency &&
                editingField !== 'lastYearsExerciseFrequency' &&
                shouldCollapseField('lastYearsExerciseFrequency') ? (
                  renderSelectedAnswers(
                    answers.lastYearsExerciseFrequency,
                    () => handleEdit('lastYearsExerciseFrequency')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedExerciseFrequencyOptions.map((option, index) => (
                      <label
                        key={option}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="lastYearsExerciseFrequency"
                          value={EXERCISE_FREQUENCY_OPTIONS[index]}
                          checked={
                            answers.lastYearsExerciseFrequency === EXERCISE_FREQUENCY_OPTIONS[index]
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'lastYearsExerciseFrequency',
                              e.target.value,
                              lastYearRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          {option}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Planned Exercise Frequency */}
          {shouldShowQuestion('numberOfActivityDays') && (
            <RevealOnScroll>
              <div
                ref={plannedRef}
                onClick={() => handleEdit('numberOfActivityDays')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  {programType === ProgramType.Exercise
                    ? t('questionnaire.exerciseDays')
                    : t('questionnaire.recoveryDays')}
                </h3>
                {answers.numberOfActivityDays &&
                editingField !== 'numberOfActivityDays' &&
                shouldCollapseField('numberOfActivityDays') ? (
                  renderSelectedAnswers(
                    answers.numberOfActivityDays,
                    () => handleEdit('numberOfActivityDays')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedPlannedFrequencyOptions.map((option, index) => (
                      <label
                        key={option}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="numberOfActivityDays"
                          value={PLANNED_EXERCISE_FREQUENCY_OPTIONS[index]}
                          checked={
                            answers.numberOfActivityDays === PLANNED_EXERCISE_FREQUENCY_OPTIONS[index]
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'numberOfActivityDays',
                              e.target.value,
                              plannedRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          {option}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Pain Areas */}
          {shouldShowQuestion('generallyPainfulAreas') && (
            <RevealOnScroll>
              <div
                ref={painAreasRef}
                onClick={() => handleEdit('generallyPainfulAreas')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {t('questionnaire.painAreas')}
                </h3>

                {editingField !== 'generallyPainfulAreas' ||
                answers.generallyPainfulAreas.length === 0 ? (
                  renderSelectedAnswers(
                    answers.generallyPainfulAreas.length === 0
                      ? ["No, I don't have any pain"]
                      : answers.generallyPainfulAreas,
                    () => handleEdit('generallyPainfulAreas')
                  )
                ) : (
                  <>
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleNoPainAreas}
                        className={`w-full p-4 rounded-xl ${
                          answers.generallyPainfulAreas.length === 0
                            ? 'bg-red-500/10 ring-red-500 text-white'
                            : 'bg-gray-900/50 ring-gray-700/30 text-gray-400 hover:bg-gray-900/70'
                        } ring-1 transition-all duration-200 text-left`}
                      >
                        {t('questionnaire.noPain')}
                      </button>
                    </div>
                    <p className="text-gray-400 font-medium text-base mb-4">
                      {t('questionnaire.selectAll')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {translatedPainBodyParts.map((part) => (
                        <label
                          key={part}
                          className="relative flex items-center"
                        >
                          <input
                            type="checkbox"
                            value={part}
                            checked={answers.generallyPainfulAreas.includes(
                              part
                            )}
                            onChange={(e) => {
                              const newPainAreas = e.target.checked
                                ? [...answers.generallyPainfulAreas, part]
                                : answers.generallyPainfulAreas.filter(
                                    (p) => p !== part
                                  );
                              handleInputChange(
                                'generallyPainfulAreas',
                                newPainAreas,
                                painAreasRef
                              );
                            }}
                            className="peer sr-only"
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-red-500/10 peer-checked:ring-red-500 cursor-pointer transition-all duration-200">
                            {part}
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Training Type */}
          {shouldShowQuestion('exerciseModalities') && (
            <RevealOnScroll>
              <div
                ref={exerciseModalitiesRef}
                onClick={() => handleEdit('exerciseModalities')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                  {t('questionnaire.trainingType')}
                </h3>
                {answers.exerciseModalities &&
                editingField !== 'exerciseModalities' &&
                shouldCollapseField('exerciseModalities') ? (
                  renderSelectedAnswers(answers.exerciseModalities, () =>
                    handleEdit('exerciseModalities')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {translatedExerciseModalities.map((option, index) => {
                      // Use the actual value from EXERCISE_MODALITIES array based on index to maintain order
                      const modalityValue = EXERCISE_MODALITIES[index];
                        
                      return (
                        <label
                          key={option}
                          className="relative flex items-center"
                        >
                          <input
                            type="radio"
                            name="exerciseModalities"
                            value={modalityValue}
                            checked={answers.exerciseModalities === modalityValue}
                            onChange={(e) =>
                              handleInputChange(
                                'exerciseModalities',
                                e.target.value,
                                exerciseModalitiesRef
                              )
                            }
                            className="peer sr-only"
                            required
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                            {option}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Target Areas */}
          {shouldShowQuestion('targetAreas') && (
            <RevealOnScroll>
              <div
                ref={targetAreasRef}
                onClick={() => handleEdit('targetAreas')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('questionnaire.targetAreas')}
                </h3>
                {answers.targetAreas.length > 0 &&
                editingField !== 'targetAreas' &&
                shouldCollapseField('targetAreas') ? (
                  renderSelectedAnswers(
                    answers.targetAreas.length === TARGET_BODY_PARTS.length
                      ? 'Full Body'
                      : UPPER_BODY_PARTS.every((part) =>
                          answers.targetAreas.includes(part)
                        ) &&
                        answers.targetAreas.length === UPPER_BODY_PARTS.length
                      ? 'Upper Body'
                      : LOWER_BODY_PARTS.every((part) =>
                          answers.targetAreas.includes(part)
                        ) &&
                        answers.targetAreas.length === LOWER_BODY_PARTS.length
                      ? 'Lower Body'
                      : answers.targetAreas,
                    () => handleEdit('targetAreas')
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Body Regions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {translatedBodyRegions.map((region, index) => {
                        // Map to consistent English values for comparison
                        const regionValue = index === 0 
                          ? 'Full Body' 
                          : index === 1 
                            ? 'Upper Body' 
                            : 'Lower Body';
                        
                        return (
                          <label
                            key={region}
                            className="relative flex items-center"
                          >
                            <input
                              type="radio"
                              name="bodyRegion"
                              value={regionValue}
                              checked={
                                regionValue === 'Full Body'
                                  ? answers.targetAreas.length ===
                                    TARGET_BODY_PARTS.length
                                  : regionValue === 'Upper Body'
                                  ? UPPER_BODY_PARTS.every((part) =>
                                      answers.targetAreas.includes(part)
                                    ) &&
                                    answers.targetAreas.length ===
                                      UPPER_BODY_PARTS.length
                                  : regionValue === 'Lower Body'
                                  ? LOWER_BODY_PARTS.every((part) =>
                                      answers.targetAreas.includes(part)
                                    ) &&
                                    answers.targetAreas.length ===
                                      LOWER_BODY_PARTS.length
                                  : false
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  let newTargetAreas: string[] = [];
                                  if (regionValue === 'Full Body') {
                                    newTargetAreas = [...TARGET_BODY_PARTS];
                                  } else if (regionValue === 'Upper Body') {
                                    newTargetAreas = [...UPPER_BODY_PARTS];
                                  } else if (regionValue === 'Lower Body') {
                                    newTargetAreas = [...LOWER_BODY_PARTS];
                                  }
                                  handleInputChange(
                                    'targetAreas',
                                    newTargetAreas
                                  );
                                }
                              }}
                              className="peer sr-only"
                            />
                            <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                              {region}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Individual Body Parts */}
                    <div>
                      <p className="text-gray-400 font-medium text-base mb-4">
                        {t('questionnaire.selectSpecific')}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {TARGET_BODY_PARTS.map((part) => {
                          // Get translated body part name for display
                          const translatedPart = translateBodyPart(part, t);
                          
                          return (
                            <label
                              key={part}
                              className="relative flex items-center"
                            >
                              <input
                                type="checkbox"
                                value={part}
                                checked={answers.targetAreas.includes(part)}
                                onChange={(e) => {
                                  const newTargetAreas = e.target.checked
                                    ? [...answers.targetAreas, part]
                                    : answers.targetAreas.filter(
                                        (p) => p !== part
                                      );
                                  handleInputChange(
                                    'targetAreas',
                                    newTargetAreas
                                  );
                                }}
                                className="peer sr-only"
                              />
                              <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                                {translatedPart}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Training Location */}
          {shouldShowQuestion('exerciseEnvironments') && (
            <RevealOnScroll>
              <div
                ref={exerciseEnvironmentRef}
                onClick={() => handleEdit('exerciseEnvironments')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {programType === ProgramType.Exercise
                    ? t('questionnaire.exerciseLocation')
                    : t('questionnaire.recoveryLocation')}
                </h3>
                {answers.exerciseEnvironments &&
                editingField !== 'exerciseEnvironments' &&
                shouldCollapseField('exerciseEnvironments') ? (
                  renderSelectedAnswers(answers.exerciseEnvironments, () =>
                    handleEdit('exerciseEnvironments')
                  )
                ) : (
                  <div className="space-y-4">
                    {translatedExerciseEnvironments.map((environment, index) => (
                      <label
                        key={environment.name}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="exerciseEnvironments"
                          value={EXERCISE_ENVIRONMENTS[index].name}
                          checked={
                            answers.exerciseEnvironments === EXERCISE_ENVIRONMENTS[index].name
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'exerciseEnvironments',
                              e.target.value,
                              exerciseEnvironmentRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          <div className="font-medium">{environment.name}</div>
                          <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                            {environment.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Workout Duration */}
          {shouldShowQuestion('workoutDuration') && (
            <RevealOnScroll>
              <div
                ref={workoutDurationRef}
                onClick={() => handleEdit('workoutDuration')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
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
                  {programType === ProgramType.Exercise
                    ? t('questionnaire.workoutDuration')
                    : t('questionnaire.recoveryDuration')}
                </h3>
                {answers.workoutDuration &&
                editingField !== 'workoutDuration' &&
                shouldCollapseField('workoutDuration') ? (
                  renderSelectedAnswers(answers.workoutDuration, () =>
                    handleEdit('workoutDuration')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedWorkoutDurations.map((duration, index) => {
                      // Get the original English value based on program type
                      const originalDuration = programType === ProgramType.Recovery
                        ? RECOVERY_WORKOUT_DURATIONS[index]
                        : WORKOUT_DURATIONS[index];
                      
                      return (
                        <label
                          key={duration}
                          className="relative flex items-center"
                        >
                          <input
                            type="radio"
                            name="workoutDuration"
                            value={originalDuration}
                            checked={answers.workoutDuration === originalDuration}
                            onChange={(e) =>
                              handleInputChange(
                                'workoutDuration',
                                e.target.value,
                                workoutDurationRef
                              )
                            }
                            className="peer sr-only"
                            required
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                            {duration}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-colors duration-200"
              >
                {t('questionnaire.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
              >
                {t('questionnaire.createProgram')}
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </form>
    </div>
  );
}
