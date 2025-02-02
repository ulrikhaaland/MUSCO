import { useApp } from '@/app/context/AppContext';

interface ExerciseFooterProps {
  onReset: (resetSelectionState?: boolean) => void;
  onAreasSelected: () => void;
}

export function ExerciseFooter({ onReset, onAreasSelected }: ExerciseFooterProps) {
  const { 
    selectedExerciseGroups, 
    selectedPainfulAreas,
    completeExerciseSelection, 
    isSelectingExerciseBodyParts 
  } = useApp();

  const buttonText = isSelectingExerciseBodyParts 
    ? 'Continue to Painful Areas' 
    : 'Create Exercise Program';

  const isDisabled = isSelectingExerciseBodyParts 
    ? selectedExerciseGroups.length === 0
    : selectedExerciseGroups.length === 0;

  const handleClick = () => {
    if (isSelectingExerciseBodyParts) {
      onReset(false);
    } else {
      onAreasSelected();
    }
    completeExerciseSelection();
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          w-full px-6 py-3 rounded-xl font-medium text-base
          shadow-lg transform transition-all duration-200
          ${
            isDisabled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] hover:shadow-xl'
          }
        `}
      >
        {buttonText}
      </button>
    </div>
  );
} 