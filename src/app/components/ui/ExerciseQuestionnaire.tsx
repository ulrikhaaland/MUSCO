import { useState, useEffect, useRef, ReactNode } from 'react';
import { TopBar } from './TopBar';

export interface ExerciseQuestionnaireAnswers {
  age: string;
  lastYearsExerciseFrequency: string;
  thisYearsPlannedExerciseFrequency: string;
  generallyPainfulAreas: string[];
  hasExercisePain: 'yes' | 'no' | '';
  painfulExerciseAreas: string[];
  exerciseModalities: string;
  exerciseEnvironments: string[];
  workoutDuration: string;
}

interface ExerciseQuestionnaireProps {
  onClose: () => void;
  onSubmit: (answers: ExerciseQuestionnaireAnswers) => void;
  generallyPainfulAreas: string[];
}

const ageRanges = [
  'Under 20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-70',
  '70 or above',
];

const exerciseFrequencyOptions = [
  '0',
  '1-2 times per week',
  '2-3 times per week',
  '4-5 times per week',
  'Every day',
];

const bodyParts = [
  'neck',
  'left shoulder',
  'right shoulder',
  'left upper arm',
  'right upper arm',
  'left elbow',
  'right elbow',
  'left forearm',
  'right forearm',
  'left hand',
  'right hand',
  'chest',
  'torso',
  'back',
  'hip',
  'right thigh',
  'left thigh',
  'left knee',
  'right knee',
  'left lower leg',
  'right lower leg',
  'left foot',
  'right foot',
];

const exerciseEnvironments = [
  {
    category: 'Home',
    options: [
      'Bodyweight Only',
      'Basic Equipment (Dumbbells/Bands)',
      'Full Home Gym',
    ],
  },
  {
    category: 'Gym',
    options: ['Commercial Gym', 'CrossFit Box', 'Personal Training Studio'],
  },
  {
    category: 'Outdoors',
    options: [
      'Park/Playground Workouts',
      'Running/Walking Trails',
      'Outdoor Fitness Equipment',
    ],
  },
];

const workoutDurations = [
  '15-30 minutes',
  '30-45 minutes',
  '45-60 minutes',
  '60-90 minutes',
  'More than 90 minutes',
];

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
}: ExerciseQuestionnaireProps) {
  // Normalize the incoming pain areas to lowercase for case-insensitive matching
  const normalizedPainAreas =
    generallyPainfulAreas?.map((area) => area.toLowerCase()) || [];

  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers>({
    age: '',
    lastYearsExerciseFrequency: '',
    thisYearsPlannedExerciseFrequency: '',
    generallyPainfulAreas: normalizedPainAreas,
    hasExercisePain: normalizedPainAreas.length > 0 ? 'yes' : '',
    painfulExerciseAreas: normalizedPainAreas,
    exerciseModalities: '',
    exerciseEnvironments: [],
    workoutDuration: '',
  });

  // Create refs for each question section
  const ageRef = useRef<HTMLDivElement>(null);
  const lastYearRef = useRef<HTMLDivElement>(null);
  const plannedRef = useRef<HTMLDivElement>(null);
  const painAreasRef = useRef<HTMLDivElement>(null);
  const exercisePainRef = useRef<HTMLDivElement>(null);
  const exerciseModalitiesRef = useRef<HTMLDivElement>(null);
  const exerciseEnvironmentRef = useRef<HTMLDivElement>(null);
  const workoutDurationRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const scrollToNextUnansweredQuestion = async (
    currentRef: React.RefObject<HTMLDivElement>,
    forceScroll?: boolean
  ) => {
    console.log('scrollToNextUnansweredQuestion called with:', {
      currentRef: currentRef === plannedRef ? 'plannedRef' : 
                 currentRef === ageRef ? 'ageRef' : 
                 currentRef === lastYearRef ? 'lastYearRef' :
                 currentRef === painAreasRef ? 'painAreasRef' :
                 currentRef === exercisePainRef ? 'exercisePainRef' :
                 currentRef === exerciseModalitiesRef ? 'exerciseModalitiesRef' :
                 currentRef === exerciseEnvironmentRef ? 'exerciseEnvironmentRef' :
                 currentRef === workoutDurationRef ? 'workoutDurationRef' : 'unknown',
      forceScroll
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    const refs = [
      ageRef,
      lastYearRef,
      plannedRef,
      painAreasRef,
      exercisePainRef,
      exerciseModalitiesRef,
      exerciseEnvironmentRef,
      workoutDurationRef,
    ];

    const fields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'thisYearsPlannedExerciseFrequency',
      'generallyPainfulAreas',
      'hasExercisePain',
      'exerciseModalities',
      'exerciseEnvironments',
      'workoutDuration',
    ];

    const currentIndex = refs.indexOf(currentRef);
    console.log('Current index:', currentIndex);

    if (currentIndex < refs.length - 1 && formRef.current) {
      // If forceScroll is true, scroll to the next ref immediately
      if (forceScroll && refs[currentIndex + 1].current) {
        console.log('Force scrolling to next question');
        const nextElement = refs[currentIndex + 1].current;
        const formElement = formRef.current;
        const formRect = formElement.getBoundingClientRect();
        const elementRect = nextElement.getBoundingClientRect();
        const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;

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

        console.log('Checking field:', {
          field,
          isEmpty,
          shouldShow: shouldShowQuestion(field)
        });

        if (isEmpty && refs[i].current && shouldShowQuestion(field)) {
          console.log('Found next question to scroll to:', field);
          const nextElement = refs[i].current;
          const formElement = formRef.current;
          const formRect = formElement.getBoundingClientRect();
          const elementRect = nextElement.getBoundingClientRect();
          const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;

          formElement.scrollTo({
            top: relativeTop - 60,
            behavior: 'smooth',
          });
          break;
        }
      }
    }
  };

  const handleInputChange = (
    field: keyof ExerciseQuestionnaireAnswers,
    value: string | number | string[],
    ref?: React.RefObject<HTMLDivElement>
  ) => {
    console.log('handleInputChange called with:', {
      field,
      value,
      ref: ref === plannedRef ? 'plannedRef' : 
           ref === ageRef ? 'ageRef' : 
           ref === lastYearRef ? 'lastYearRef' :
           ref === painAreasRef ? 'painAreasRef' :
           ref === exercisePainRef ? 'exercisePainRef' :
           ref === exerciseModalitiesRef ? 'exerciseModalitiesRef' :
           ref === exerciseEnvironmentRef ? 'exerciseEnvironmentRef' :
           ref === workoutDurationRef ? 'workoutDurationRef' : 'unknown'
    });

    // For pain areas and painful exercise areas, ensure values are lowercase
    const normalizedValue =
      field === 'generallyPainfulAreas' || field === 'painfulExerciseAreas'
        ? Array.isArray(value)
          ? value.map((v) => v.toLowerCase())
          : value
        : value;

    // Clear editing state to minimize the question
    setEditingField(null);

    // Update state and wait for it to be processed
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [field]: normalizedValue,
        // Reset painful exercise areas if exercise pain is set to 'no'
        ...(field === 'hasExercisePain' && value === 'no'
          ? { painfulExerciseAreas: [] }
          : {}),
      };

      // Schedule scrolling after state update
      setTimeout(() => {
        if (!ref) {
          console.log('No ref provided, skipping scroll');
          return;
        }

        // Only auto-scroll for single-choice questions (not multi-select)
        const singleChoiceFields: (keyof ExerciseQuestionnaireAnswers)[] = [
          'age',
          'lastYearsExerciseFrequency',
          'thisYearsPlannedExerciseFrequency',
          'hasExercisePain',
          'exerciseModalities',
          'workoutDuration',
        ];

        console.log('Checking if should scroll:', {
          isSingleChoice: singleChoiceFields.includes(field),
          field
        });

        // Auto-scroll for single-choice fields
        if (singleChoiceFields.includes(field)) {
          scrollToNextUnansweredQuestion(ref, true);
          return;
        }

        // Special case: auto-scroll when all painful exercise areas are selected
        if (field === 'painfulExerciseAreas' && Array.isArray(normalizedValue)) {
          // If all generally painful areas have been selected as exercise pain areas
          if (normalizedValue.length === newAnswers.generallyPainfulAreas.length) {
            scrollToNextUnansweredQuestion(ref, true);
          }
        }
      }, 150);

      return newAnswers;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform 'Both' to ['Strength', 'Cardio']
    if (answers.exerciseModalities === 'Both') {
      answers.exerciseModalities = 'Strength and Cardio';
    }

    onSubmit(answers);
  };

  const [editingField, setEditingField] = useState<
    keyof ExerciseQuestionnaireAnswers | null
  >(null);

  const handleEdit = (field: keyof ExerciseQuestionnaireAnswers) => {
    setEditingField(field);
  };

  const shouldCollapseField = (field: keyof ExerciseQuestionnaireAnswers) => {
    const singleChoiceFields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'thisYearsPlannedExerciseFrequency',
      'hasExercisePain',
      'exerciseModalities',
      'workoutDuration',
      'generallyPainfulAreas',
    ];
    const isSingleChoice = singleChoiceFields.includes(field);
    return isSingleChoice;
  };

  const handleNoPainAreas = () => {
    // If "No" is already selected (empty array and hasExercisePain is 'no'), unselect it
    if (answers.generallyPainfulAreas.length === 0 && answers.hasExercisePain === 'no') {
      setAnswers(prev => ({
        ...prev,
        generallyPainfulAreas: [],
        hasExercisePain: '',
        painfulExerciseAreas: []
      }));
    } else {
      // Select "No" by clearing arrays and setting hasExercisePain to 'no'
      setAnswers(prev => ({
        ...prev,
        generallyPainfulAreas: [],
        hasExercisePain: 'no',
        painfulExerciseAreas: []
      }));
      // Clear editing state to minimize the question
      setEditingField(null);
      // Auto-scroll to next question
      setTimeout(() => scrollToNextUnansweredQuestion(painAreasRef), 150);
    }
  };

  const shouldShowQuestion = (field: keyof ExerciseQuestionnaireAnswers) => {
    switch (field) {
      case 'age':
        return true; // Always show first question
      case 'lastYearsExerciseFrequency':
        return !!answers.age;
      case 'thisYearsPlannedExerciseFrequency':
        return !!answers.lastYearsExerciseFrequency;
      case 'generallyPainfulAreas':
        return !!answers.thisYearsPlannedExerciseFrequency;
      case 'hasExercisePain':
        return !!answers.thisYearsPlannedExerciseFrequency && answers.generallyPainfulAreas.length > 0;
      case 'painfulExerciseAreas':
        return !!answers.thisYearsPlannedExerciseFrequency && answers.hasExercisePain === 'yes' && answers.generallyPainfulAreas.length > 0;
      case 'exerciseModalities':
        return !!answers.thisYearsPlannedExerciseFrequency && (
          (answers.generallyPainfulAreas.length === 0) ||
          (answers.hasExercisePain === 'no') ||
          (answers.hasExercisePain === 'yes' && answers.painfulExerciseAreas.length > 0)
        );
      case 'exerciseEnvironments':
        return !!answers.exerciseModalities;
      case 'workoutDuration':
        return answers.exerciseEnvironments.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <TopBar onBack={onClose} className="fixed top-0 left-0 right-0 z-50" />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="h-screen overflow-y-auto pt-8"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Exercise Questionnaire
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Help us personalize your exercise program by answering a few
                questions
              </p>
            </div>
          </RevealOnScroll>

          {/* Age */}
          <RevealOnScroll>
            <div
              ref={ageRef}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
            >
              <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-400"
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
                How old are you?
              </h3>
              {answers.age &&
              editingField !== 'age' &&
              shouldCollapseField('age') ? (
                renderSelectedAnswers(answers.age, () => handleEdit('age'))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ageRanges.map((range) => (
                    <label key={range} className="relative flex items-center">
                      <input
                        type="radio"
                        name="age"
                        value={range}
                        checked={answers.age === range}
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
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  How often have you exercised in the past year?
                </h3>
                {answers.lastYearsExerciseFrequency &&
                editingField !== 'lastYearsExerciseFrequency' &&
                shouldCollapseField('lastYearsExerciseFrequency') ? (
                  renderSelectedAnswers(answers.lastYearsExerciseFrequency, () =>
                    handleEdit('lastYearsExerciseFrequency')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exerciseFrequencyOptions.map((option) => (
                      <label key={option} className="relative flex items-center">
                        <input
                          type="radio"
                          name="lastYearsExerciseFrequency"
                          value={option}
                          checked={answers.lastYearsExerciseFrequency === option}
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
          {shouldShowQuestion('thisYearsPlannedExerciseFrequency') && (
            <RevealOnScroll>
              <div
                ref={plannedRef}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  How much do you plan to exercise?
                </h3>
                {answers.thisYearsPlannedExerciseFrequency &&
                editingField !== 'thisYearsPlannedExerciseFrequency' &&
                shouldCollapseField('thisYearsPlannedExerciseFrequency') ? (
                  renderSelectedAnswers(
                    answers.thisYearsPlannedExerciseFrequency,
                    () => handleEdit('thisYearsPlannedExerciseFrequency')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exerciseFrequencyOptions.map((option) => (
                      <label key={option} className="relative flex items-center">
                        <input
                          type="radio"
                          name="thisYearsPlannedExerciseFrequency"
                          value={option}
                          checked={
                            answers.thisYearsPlannedExerciseFrequency === option
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'thisYearsPlannedExerciseFrequency',
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
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-red-400"
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
                  Do you have pain anywhere?
                </h3>
                {answers.generallyPainfulAreas.length === 0 && answers.hasExercisePain === 'no' && editingField !== 'generallyPainfulAreas' ? (
                  renderSelectedAnswers("No, I don't have any pain", () => handleEdit('generallyPainfulAreas'))
                ) : (
                  <>
                    <div className="mb-6">
                      <button
                        type="button"
                        onClick={handleNoPainAreas}
                        className={`w-full p-4 rounded-xl ${
                          answers.generallyPainfulAreas.length === 0 && answers.hasExercisePain === 'no'
                            ? 'bg-red-500/10 ring-red-500 text-white'
                            : 'bg-gray-900/50 ring-gray-700/30 text-gray-400 hover:bg-gray-900/70'
                        } ring-1 transition-all duration-200 text-left`}
                      >
                        No, I don&apos;t have any pain
                      </button>
                    </div>
                    <p className="text-gray-400 font-medium text-base mb-4">
                      Select all that apply
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {bodyParts.map((part) => (
                        <label key={part} className="relative flex items-center">
                          <input
                            type="checkbox"
                            value={part}
                            checked={answers.generallyPainfulAreas.includes(part)}
                            onChange={(e) => {
                              const newPainAreas = e.target.checked
                                ? [...answers.generallyPainfulAreas, part]
                                : answers.generallyPainfulAreas.filter(
                                  (p) => p !== part
                                );
                              handleInputChange(
                                'generallyPainfulAreas',
                                newPainAreas
                              );
                            }}
                            className="peer sr-only"
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-red-500/10 peer-checked:ring-red-500 cursor-pointer transition-all duration-200 capitalize">
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

          {/* Exercise Pain */}
          {shouldShowQuestion('hasExercisePain') && (
            <RevealOnScroll>
              <div
                ref={exercisePainRef}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-400"
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
                  Do you experience pain in any of these areas when you exercise?
                </h3>
                {answers.hasExercisePain &&
                editingField !== 'hasExercisePain' &&
                shouldCollapseField('hasExercisePain') ? (
                  renderSelectedAnswers(answers.hasExercisePain, () =>
                    handleEdit('hasExercisePain')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['yes', 'no'].map((option) => (
                      <label key={option} className="relative flex items-center">
                        <input
                          type="radio"
                          name="hasExercisePain"
                          value={option}
                          checked={answers.hasExercisePain === option}
                          onChange={(e) =>
                            handleInputChange(
                              'hasExercisePain',
                              e.target.value,
                              exercisePainRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-yellow-500/10 peer-checked:ring-yellow-500 cursor-pointer transition-all duration-200 capitalize">
                          {option}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Painful Exercise Areas */}
          {shouldShowQuestion('painfulExerciseAreas') && (
            <RevealOnScroll>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-400"
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
                  Which areas are painful when you exercise?
                </h3>
                <p className="text-gray-400 font-medium text-base mb-4">
                  Select all that apply
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(answers.generallyPainfulAreas as string[]).map((part) => (
                    <label key={part} className="relative flex items-center">
                      <input
                        type="checkbox"
                        value={part}
                        checked={(
                          answers.painfulExerciseAreas as string[]
                        ).includes(part)}
                        onChange={(e) => {
                          const newPainfulAreas = e.target.checked
                            ? [
                                ...(answers.painfulExerciseAreas as string[]),
                                part,
                              ]
                            : (
                                answers.painfulExerciseAreas as string[]
                              ).filter((p) => p !== part);
                          handleInputChange(
                            'painfulExerciseAreas',
                            newPainfulAreas,
                            exercisePainRef
                          );
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-yellow-500/10 peer-checked:ring-yellow-500 cursor-pointer transition-all duration-200 capitalize">
                        {part}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Training Type */}
          {shouldShowQuestion('exerciseModalities') && (
            <RevealOnScroll>
              <div
                ref={exerciseModalitiesRef}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  What type of training do you want to do?
                </h3>
                {answers.exerciseModalities &&
                editingField !== 'exerciseModalities' &&
                shouldCollapseField('exerciseModalities') ? (
                  renderSelectedAnswers(answers.exerciseModalities, () =>
                    handleEdit('exerciseModalities')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Cardio', 'Strength', 'Both'].map((option) => (
                      <label key={option} className="relative flex items-center">
                        <input
                          type="radio"
                          name="exerciseModalities"
                          value={option}
                          checked={answers.exerciseModalities === option}
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
                    ))}
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
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  How will you exercise?
                </h3>
                <p className="text-gray-400 font-medium text-base mb-4">
                  Select all that apply
                </p>
                {answers.exerciseEnvironments.length > 0 &&
                editingField !== 'exerciseEnvironments' &&
                shouldCollapseField('exerciseEnvironments') ? (
                  renderSelectedAnswers(answers.exerciseEnvironments, () =>
                    handleEdit('exerciseEnvironments')
                  )
                ) : (
                  <div className="space-y-6">
                    {exerciseEnvironments.map((category) => (
                      <div key={category.category} className="space-y-3">
                        <h4 className="text-indigo-400 font-medium">
                          {category.category}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.options.map((option) => (
                            <label
                              key={option}
                              className="relative flex items-center"
                            >
                              <input
                                type="checkbox"
                                value={option}
                                checked={answers.exerciseEnvironments.includes(
                                  option
                                )}
                                onChange={(e) => {
                                  const newEnvironments = e.target.checked
                                    ? [...answers.exerciseEnvironments, option]
                                    : answers.exerciseEnvironments.filter(
                                        (env) => env !== option
                                      );
                                  handleInputChange(
                                    'exerciseEnvironments',
                                    newEnvironments
                                  );
                                }}
                                className="peer sr-only"
                              />
                              <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                                {option}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
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
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  How long do you prefer your workouts to be?
                </h3>
                {answers.workoutDuration &&
                editingField !== 'workoutDuration' &&
                shouldCollapseField('workoutDuration') ? (
                  renderSelectedAnswers(answers.workoutDuration, () =>
                    handleEdit('workoutDuration')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workoutDurations.map((duration) => (
                      <label
                        key={duration}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="workoutDuration"
                          value={duration}
                          checked={answers.workoutDuration === duration}
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
                    ))}
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
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-colors duration-200"
              >
                Create Program
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </form>
    </div>
  );
}
