import { Question } from "@/app/types";
import { useState } from "react";

interface ExerciseQuestionnaireProps {
  onClose: () => void;
  onSubmit: (answers: Record<string, string | number | string[]>) => void;
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

export function ExerciseQuestionnaire({
  onClose,
  onSubmit,
}: ExerciseQuestionnaireProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | number | string[]>
  >({
    age: "",
    pastExercise: "",
    plannedExercise: "",
    painAreas: [],
    exercisePain: "no",
    painfulExerciseAreas: [],
    trainingType: "",
    trainingLocation: "",
  });

  const handleInputChange = (
    field: string,
    value: string | number | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
      // Reset painful exercise areas if exercise pain is set to 'no'
      ...(field === "exercisePain" && value === "no"
        ? { painfulExerciseAreas: [] }
        : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform 'Both' to ['Strength', 'Cardio']
    if (answers.trainingType === "Both") {
      answers.trainingType = "Strength and Cardio";
    }

    onSubmit(answers);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <div className="flex-none p-4 border-b border-gray-800">
        <button
          onClick={onClose}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Model
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Exercise Questionnaire
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Please answer the following questions to help us personalize your
              exercise program.
            </p>
          </div>

          <form className="space-y-8 pb-8" onSubmit={handleSubmit}>
            {/* Age */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                How old are you?
              </label>
              <div className="space-y-2">
                {ageRanges.map((range) => (
                  <label key={range} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="age"
                      value={range}
                      checked={answers.age === range}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Past Exercise Frequency */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                How often have you exercised in the past year?
              </label>
              <div className="space-y-2">
                {exerciseFrequencyOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="pastExercise"
                      value={option}
                      checked={answers.pastExercise === option}
                      onChange={(e) =>
                        handleInputChange("pastExercise", e.target.value)
                      }
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Planned Exercise Frequency */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                How much do you plan to exercise?
              </label>
              <div className="space-y-2">
                {exerciseFrequencyOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="plannedExercise"
                      value={option}
                      checked={answers.plannedExercise === option}
                      onChange={(e) =>
                        handleInputChange("plannedExercise", e.target.value)
                      }
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pain Areas */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                Do you have pain anywhere? (You can select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {bodyParts.map((part) => (
                  <label key={part} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={part}
                      checked={(answers.painAreas as string[]).includes(part)}
                      onChange={(e) => {
                        const newPainAreas = e.target.checked
                          ? [...(answers.painAreas as string[]), part]
                          : (answers.painAreas as string[]).filter(
                              (p) => p !== part
                            );
                        handleInputChange("painAreas", newPainAreas);
                      }}
                      className="text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-white capitalize">{part}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Exercise Pain */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                Do you experience pain in any of these areas when you exercise?
              </label>
              <div className="space-y-2">
                {["yes", "no"].map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="exercisePain"
                      value={option}
                      checked={answers.exercisePain === option}
                      onChange={(e) =>
                        handleInputChange("exercisePain", e.target.value)
                      }
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Painful Exercise Areas */}
            {answers.exercisePain === "yes" &&
              Array.isArray(answers.painAreas) &&
              answers.painAreas.length > 0 && (
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-white">
                    Which areas are painful when you exercise?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(answers.painAreas as string[]).map((part) => (
                      <label key={part} className="flex items-center space-x-3">
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
                              "painfulExerciseAreas",
                              newPainfulAreas
                            );
                          }}
                          className="text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-white capitalize">{part}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            {/* Training Type */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                What type of training do you want to do?
              </label>
              <div className="space-y-2">
                {["Cardio", "Strength", "Both"].map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="trainingType"
                      value={option}
                      checked={answers.trainingType === option}
                      onChange={(e) =>
                        handleInputChange("trainingType", e.target.value)
                      }
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Training Location */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white">
                How are you going to exercise?
              </label>
              <div className="space-y-2">
                {[
                  "At a Gym with Equipment",
                  "At Home with Dumbbells or Resistance Bands",
                  "Outdoors (e.g., Running, Bodyweight Exercises)",
                ].map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="trainingLocation"
                      value={option}
                      checked={answers.trainingLocation === option}
                      onChange={(e) =>
                        handleInputChange("trainingLocation", e.target.value)
                      }
                      className="text-indigo-600 focus:ring-indigo-600"
                      required
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-base font-medium text-gray-300 hover:text-white bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
