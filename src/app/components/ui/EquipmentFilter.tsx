import React, { useState, useEffect } from 'react';
import Chip from './Chip';
import { useTranslation } from '@/app/i18n';

interface EquipmentFilterProps {
  equipmentList: string[];
  onFilterChange: (removedEquipment: string[]) => void;
  initialRemovedEquipment?: string[];
}

export function EquipmentFilter({
  equipmentList,
  onFilterChange,
  initialRemovedEquipment = [],
}: EquipmentFilterProps) {
  const { t } = useTranslation();
  const [removedEquipment, setRemovedEquipment] = useState<string[]>(initialRemovedEquipment);

  useEffect(() => {
    onFilterChange(removedEquipment);
  }, [removedEquipment, onFilterChange]);

  const toggleEquipment = (equipment: string) => {
    setRemovedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  const resetFilters = () => {
    setRemovedEquipment([]);
  };

  const getTranslatedEquipment = (equipment: string) => {
    const key = `equipmentItem.${equipment.toLowerCase().replace(/ /g, '_')}`;
    const translated = t(key as any);
    if (translated && translated !== key) return translated;
    return equipment;
  };

  return (
    <div className="mb-4">
      <h4 className="text-gray-50 font-medium mb-4">{t('program.filterEquipment')}</h4>
      <div className="flex flex-wrap gap-2 pb-2">
        {equipmentList.map((equipment) => {
          const isRemoved = removedEquipment.includes(equipment);

          return (
            <Chip
              key={equipment}
              onClick={() => toggleEquipment(equipment)}
              size="md"
              variant={isRemoved ? 'inactive' : 'default'}
              className={`whitespace-nowrap ${isRemoved ? 'line-through' : ''}`}
              icon={
                isRemoved ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )
              }
            >
              {getTranslatedEquipment(equipment)}
            </Chip>
          );
        })}
      </div>

      {removedEquipment.length > 0 && (
        <button
          onClick={resetFilters}
          className="text-indigo-300 hover:text-indigo-200 mt-2 text-sm underline"
        >
          {t('program.resetFilters')}
        </button>
      )}
    </div>
  );
}

export default EquipmentFilter;
