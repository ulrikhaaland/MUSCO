import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { useApp } from '@/app/context/AppContext';

interface ExerciseSelectionProps {
  isMobile: boolean;
}

export function ExerciseSelection({ isMobile }: ExerciseSelectionProps) {
  const { 
    selectedExerciseGroups, 
    selectedPainfulAreas, 
    isSelectingExerciseBodyParts,
    completeExerciseSelection 
  } = useApp();

  return (
    <div className="flex flex-col gap-4">
      {/* Target Areas Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-white">Target Areas</h3>
        {selectedExerciseGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedExerciseGroups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
              >
                {group.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No target areas selected</p>
        )}
      </div>

      {/* Next Button for Target Areas */}
      {isSelectingExerciseBodyParts && (
        <div className="flex flex-col gap-2 items-center mt-4">
          <p className="text-gray-300 text-sm text-center">
            Select all the body parts you want to target during exercise
          </p>
          <button
            onClick={completeExerciseSelection}
            disabled={selectedExerciseGroups.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedExerciseGroups.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next: Select Painful Areas
          </button>
        </div>
      )}

      {/* Painful Areas Section - Only show if we're past target selection */}
      {!isSelectingExerciseBodyParts && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-white">Painful Areas</h3>
          {selectedPainfulAreas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedPainfulAreas.map((group) => (
                <div
                  key={group.id}
                  className="bg-red-900/50 text-white px-3 py-1 rounded-full text-sm"
                >
                  {group.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No painful areas selected</p>
          )}
        </div>
      )}
    </div>
  );
} 