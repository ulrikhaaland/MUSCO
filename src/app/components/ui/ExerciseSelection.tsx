import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/app/i18n';
import { translateBodyPartGroupName } from '@/app/utils/bodyPartTranslation';

export function ExerciseSelection() {
  const { t } = useTranslation();
  const { selectedPainfulAreas } = useApp();

  return (
    <div className="flex flex-col gap-4">
      {/* Target Areas Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-white">{t('exerciseSelection.targetAreas')}</h3>
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
            <span>{t('profile.bodyRegions.fullBody')}</span>
          </div>
        </div>
      </div>

      {/* Painful Areas Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-white">{t('exerciseSelection.painfulAreas')}</h3>
        {selectedPainfulAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedPainfulAreas.map((group) => (
              <div
                key={group.id}
                className="bg-red-900/50 text-white px-3 py-1 rounded-full text-sm"
              >
                <span>{translateBodyPartGroupName(group, t)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t('exerciseSelection.noPainfulAreas')}</p>
        )}
      </div>
    </div>
  );
}
