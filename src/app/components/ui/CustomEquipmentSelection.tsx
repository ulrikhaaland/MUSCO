'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/app/i18n';
import { STRENGTH_EQUIPMENT, CARDIO_EQUIPMENT } from '@/app/types/program';

interface CustomEquipmentSelectionProps {
  selectedCategory: string | null;
  selectedEquipment: string[];
  onCategoryChange: (category: string) => void;
  onEquipmentChange: (equipment: string[]) => void;
  onContinue?: () => void;
}

export function CustomEquipmentSelection({
  selectedCategory,
  selectedEquipment,
  onCategoryChange,
  onEquipmentChange,
  onContinue,
}: CustomEquipmentSelectionProps) {
  const { t } = useTranslation();

  // For debuging
  useEffect(() => {
    console.log('CustomEquipmentSelection rendered:');
    console.log('- selectedCategory:', selectedCategory);
    console.log('- selectedEquipment:', selectedEquipment);
  }, [selectedCategory, selectedEquipment]);

  // Simplified approach - use a single handler for equipment toggle
  const handleEquipmentToggle = (equipment: string) => {
    console.log('Toggle equipment:', equipment);
    console.log('Current selectedEquipment:', selectedEquipment);

    let newEquipment: string[];

    if (selectedEquipment.includes(equipment)) {
      // Remove equipment if already selected
      newEquipment = selectedEquipment.filter((item) => item !== equipment);
    } else {
      // Add equipment if not already selected
      newEquipment = [...selectedEquipment, equipment];
    }

    console.log('New equipment selection:', newEquipment);
    onEquipmentChange(newEquipment);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-3">
        <p className="text-gray-300 font-medium mb-2">
          {t('questionnaire.selectEquipmentCategory')}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {['Strength', 'Cardio'].map((category) => (
            <label key={category} className="relative flex items-center">
              <input
                type="radio"
                name="equipmentCategory"
                value={category}
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="peer sr-only"
              />
              <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                {category === 'Strength'
                  ? t('questionnaire.strengthEquipment')
                  : t('questionnaire.cardioEquipment')}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Equipment Options (conditionally displayed) */}
      {selectedCategory && (
        <div className="space-y-3 pt-2 border-t border-gray-700/30">
          <p className="text-gray-300 font-medium mt-4 mb-2">
            {t('questionnaire.selectEquipment')}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {(selectedCategory === 'Strength'
              ? STRENGTH_EQUIPMENT
              : CARDIO_EQUIPMENT
            ).map((equipment) => (
              <label key={equipment} className="relative flex items-center">
                <input
                  type="checkbox"
                  name="customEquipment"
                  value={equipment}
                  checked={selectedEquipment.includes(equipment)}
                  onChange={() => handleEquipmentToggle(equipment)}
                  className="peer sr-only"
                />
                <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                  {equipment}
                </div>
              </label>
            ))}
          </div>

          {/* Continue button */}
          <div className="mt-6 text-right flex justify-end space-x-3">
            {onContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
              >
                {selectedEquipment.length > 0
                  ? t('questionnaire.continue')
                  : t('questionnaire.skipEquipment')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
