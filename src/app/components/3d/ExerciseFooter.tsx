import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/app/i18n';

interface ExerciseFooterProps {
  onReset: (resetSelectionState?: boolean) => void;
  onAreasSelected: () => void;
}

export function ExerciseFooter({
  onReset,
  onAreasSelected,
}: ExerciseFooterProps) {
  const { t } = useTranslation();
  const {
    selectedExerciseGroups,
    selectedPainfulAreas,
    completeExerciseSelection,
    isSelectingExerciseBodyParts,
    fullBodyRef,
  } = useApp();

  const buttonText = isSelectingExerciseBodyParts
    ? t('exerciseFooter.continueToPainful')
    : t('exerciseFooter.createProgram');

  const handleClick = () => {
    if (isSelectingExerciseBodyParts) {
      onReset();
    } else {
      onAreasSelected();
    }
    completeExerciseSelection();
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800">
      <button
        onClick={handleClick}
        className="w-full px-6 py-3 rounded-xl font-medium text-base shadow-lg transform transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]"
      >
        {buttonText}
      </button>
    </div>
  );
}
