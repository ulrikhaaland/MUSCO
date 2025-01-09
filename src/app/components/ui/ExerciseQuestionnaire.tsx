import { useState, useEffect, useRef, ReactNode } from "react";
import { TopBar } from './TopBar';

export interface ExerciseQuestionnaireAnswers {
  age: string;
  lastYearsExerciseFrequency: string;
  thisYearsPlannedExerciseFrequency: string;
  generallyPainfulAreas: string[];
  hasExercisePain: "yes" | "no";
  painfulExerciseAreas: string[];
  exerciseModalities: string;
  exerciseEnvironment: string;
}

interface ExerciseQuestionnaireProps {
  onClose: () => void;
  onSubmit: (answers: ExerciseQuestionnaireAnswers) => void;
  generallyPainfulAreas: string[];
}

const ageRanges = [
  "Under 20",
  "20-30",
  "30-40",
  "40-50",
  "50-60",
  "60-70",
  "70 or above",
];

const exerciseFrequencyOptions = [
  "0",
  "1-2 times per week",
  "2-3 times per week",
  "4-5 times per week",
  "Every day",
];

const bodyParts = [
  "neck",
  "left shoulder",
  "right shoulder",
  "left upper arm",
  "right upper arm",
  "left elbow",
  "right elbow",
  "left forearm",
  "right forearm",
  "left hand",
  "right hand",
  "chest",
  "torso",
  "back",
  "hip",
  "right thigh",
  "left thigh",
  "left knee",
  "right knee",
  "left lower leg",
  "right lower leg",
  "left foot",
  "right foot",
];

function useIntersectionObserver(options: IntersectionObserverInit = {}): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const wasIntersectedOnce = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !wasIntersectedOnce.current) {
        setIsVisible(true);
        wasIntersectedOnce.current = true;
      }
    }, { threshold: 0.1, ...options });

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

function RevealOnScroll({ children, className = "" }: RevealOnScrollProps) {
  const [ref, isVisible] = useIntersectionObserver();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ExerciseQuestionnaire({
  onClose,
  onSubmit,
  generallyPainfulAreas,
}: ExerciseQuestionnaireProps) {
  // Normalize the incoming pain areas to lowercase for case-insensitive matching
  const normalizedPainAreas = generallyPainfulAreas?.map(area => area.toLowerCase()) || [];
  
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers>({
    age: "",
    lastYearsExerciseFrequency: "",
    thisYearsPlannedExerciseFrequency: "",
    generallyPainfulAreas: normalizedPainAreas,
    hasExercisePain: normalizedPainAreas.length > 0 ? "yes" : "no",
    painfulExerciseAreas: normalizedPainAreas,
    exerciseModalities: "",
    exerciseEnvironment: "",
  });

  // Create refs for each question section
  const ageRef = useRef<HTMLDivElement>(null);
  const lastYearRef = useRef<HTMLDivElement>(null);
  const plannedRef = useRef<HTMLDivElement>(null);
  const painAreasRef = useRef<HTMLDivElement>(null);
  const exercisePainRef = useRef<HTMLDivElement>(null);
  const exerciseModalitiesRef = useRef<HTMLDivElement>(null);
  const exerciseEnvironmentRef = useRef<HTMLDivElement>(null);

  const scrollToNextQuestion = (currentRef: React.RefObject<HTMLDivElement>) => {
    const refs = [
      ageRef,
      lastYearRef,
      plannedRef,
      painAreasRef,
      exercisePainRef,
      exerciseModalitiesRef,
      exerciseEnvironmentRef,
    ];

    const currentIndex = refs.indexOf(currentRef);
    if (currentIndex < refs.length - 1) {
      const nextRef = refs[currentIndex + 1];
      nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (
    field: keyof ExerciseQuestionnaireAnswers,
    value: string | number | string[],
    ref?: React.RefObject<HTMLDivElement>
  ) => {
    // For pain areas and painful exercise areas, ensure values are lowercase
    const normalizedValue = field === 'generallyPainfulAreas' || field === 'painfulExerciseAreas'
      ? (Array.isArray(value) ? value.map(v => v.toLowerCase()) : value)
      : value;

    setAnswers((prev) => ({
      ...prev,
      [field]: normalizedValue,
      // Reset painful exercise areas if exercise pain is set to 'no'
      ...(field === "hasExercisePain" && value === "no"
        ? { painfulExerciseAreas: [] }
        : {}),
    }));

    // Auto-scroll for single-choice questions
    if (ref && !Array.isArray(value)) {
      setTimeout(() => scrollToNextQuestion(ref), 150);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform 'Both' to ['Strength', 'Cardio']
    if (answers.exerciseModalities === "Both") {
      answers.exerciseModalities = "Strength and Cardio";
    }

    onSubmit(answers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <TopBar onBack={onClose} />

      <div className="pt-24 max-w-4xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight">Exercise Questionnaire</h2>
            <p className="mt-4 text-lg text-gray-400">Help us personalize your exercise program by answering a few questions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Age */}
            <RevealOnScroll>
              <div ref={ageRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  How old are you?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ageRanges.map((range) => (
                    <label key={range} className="relative flex items-center">
                      <input
                        type="radio"
                        name="age"
                        value={range}
                        checked={answers.age === range}
                        onChange={(e) => handleInputChange("age", e.target.value, ageRef)}
                        className="peer sr-only"
                        required
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                        {range}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Past Exercise Frequency */}
            <RevealOnScroll>
              <div ref={lastYearRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How often have you exercised in the past year?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exerciseFrequencyOptions.map((option) => (
                    <label key={option} className="relative flex items-center">
                      <input
                        type="radio"
                        name="lastYearsExerciseFrequency"
                        value={option}
                        checked={answers.lastYearsExerciseFrequency === option}
                        onChange={(e) => handleInputChange("lastYearsExerciseFrequency", e.target.value, lastYearRef)}
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
            </RevealOnScroll>

            {/* Planned Exercise Frequency */}
            <RevealOnScroll>
              <div ref={plannedRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  How much do you plan to exercise?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exerciseFrequencyOptions.map((option) => (
                    <label key={option} className="relative flex items-center">
                      <input
                        type="radio"
                        name="thisYearsPlannedExerciseFrequency"
                        value={option}
                        checked={answers.thisYearsPlannedExerciseFrequency === option}
                        onChange={(e) => handleInputChange("thisYearsPlannedExerciseFrequency", e.target.value, plannedRef)}
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
            </RevealOnScroll>

            {/* Pain Areas */}
            <RevealOnScroll>
              <div ref={painAreasRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Do you have pain anywhere? (You can select multiple)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bodyParts.map((part) => (
                    <label key={part} className="relative flex items-center">
                      <input
                        type="checkbox"
                        value={part}
                        checked={(answers.generallyPainfulAreas as string[]).includes(part)}
                        onChange={(e) => {
                          const newPainAreas = e.target.checked
                            ? [...(answers.generallyPainfulAreas as string[]), part]
                            : (answers.generallyPainfulAreas as string[]).filter(
                                (p) => p !== part
                              );
                          handleInputChange("generallyPainfulAreas", newPainAreas);
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-red-500/10 peer-checked:ring-red-500 cursor-pointer transition-all duration-200 capitalize">
                        {part}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Exercise Pain */}
            <RevealOnScroll>
              <div ref={exercisePainRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Do you experience pain in any of these areas when you exercise?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="relative flex items-center">
                      <input
                        type="radio"
                        name="hasExercisePain"
                        value={option}
                        checked={answers.hasExercisePain === option}
                        onChange={(e) => handleInputChange("hasExercisePain", e.target.value, exercisePainRef)}
                        className="peer sr-only"
                        required
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-yellow-500/10 peer-checked:ring-yellow-500 cursor-pointer transition-all duration-200 capitalize">
                        {option}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Painful Exercise Areas */}
            {answers.hasExercisePain === "yes" &&
              Array.isArray(answers.generallyPainfulAreas) &&
              answers.generallyPainfulAreas.length > 0 && (
                <RevealOnScroll>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                    <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                      <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Which areas are painful when you exercise?
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(answers.generallyPainfulAreas as string[]).map((part) => (
                        <label key={part} className="relative flex items-center">
                          <input
                            type="checkbox"
                            value={part}
                            checked={(answers.painfulExerciseAreas as string[]).includes(part)}
                            onChange={(e) => {
                              const newPainfulAreas = e.target.checked
                                ? [...(answers.painfulExerciseAreas as string[]), part]
                                : (answers.painfulExerciseAreas as string[]).filter(
                                    (p) => p !== part
                                  );
                              handleInputChange("painfulExerciseAreas", newPainfulAreas);
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
            <RevealOnScroll>
              <div ref={exerciseModalitiesRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  What type of training do you want to do?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Cardio", "Strength", "Both"].map((option) => (
                    <label key={option} className="relative flex items-center">
                      <input
                        type="radio"
                        name="exerciseModalities"
                        value={option}
                        checked={answers.exerciseModalities === option}
                        onChange={(e) => handleInputChange("exerciseModalities", e.target.value, exerciseModalitiesRef)}
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
            </RevealOnScroll>

            {/* Training Location */}
            <RevealOnScroll>
              <div ref={exerciseEnvironmentRef} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  How are you going to exercise?
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "At a Gym with Equipment",
                    "At Home with Dumbbells or Resistance Bands",
                    "Outdoors (e.g., Running, Bodyweight Exercises)",
                  ].map((option) => (
                    <label key={option} className="relative flex items-center">
                      <input
                        type="radio"
                        name="exerciseEnvironment"
                        value={option}
                        checked={answers.exerciseEnvironment === option}
                        onChange={(e) => handleInputChange("exerciseEnvironment", e.target.value)}
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
            </RevealOnScroll>

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
          </form>
        </div>
      </div>
    </div>
  );
}
