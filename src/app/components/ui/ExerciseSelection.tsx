import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { useApp } from '@/app/context/AppContext';

interface ExerciseSelectionProps {
  isMobile: boolean;
}

// Function to map anatomical groups to target areas
function mapAnatomicalGroupToTargetArea(group: BodyPartGroup): string | null {
  const groupId = group.id.toLowerCase();

  // Map specific anatomical groups to target areas
  if (groupId.includes('shoulder')) return 'Shoulders';
  if (groupId.includes('upper_arm')) return 'Upper Arms';
  if (groupId.includes('forearm')) return 'Forearms';
  if (groupId.includes('chest')) return 'Chest';
  if (groupId.includes('torso')) return 'Abdomen';
  if (groupId.includes('back')) return 'Upper Back';
  if (groupId.includes('pelvis')) return 'Lower Back';
  if (groupId.includes('glutes')) return 'Glutes';
  if (groupId.includes('thigh')) return 'Upper Legs';
  if (groupId.includes('lower_leg')) return 'Lower Legs';
  if (groupId.includes('neck')) return 'Neck';

  return null;
}

export function ExerciseSelection({ isMobile }: ExerciseSelectionProps) {
  const {
    selectedExerciseGroups,
    selectedPainfulAreas,
    isSelectingExerciseBodyParts,
  } = useApp();

  // Function to get unique target areas from selected groups
  const getUniqueTargetAreas = (
    groups: BodyPartGroup[]
  ): { area: string; groups: BodyPartGroup[] }[] => {
    const areaMap = new Map<string, BodyPartGroup[]>();

    groups.forEach((group) => {
      const area = mapAnatomicalGroupToTargetArea(group);
      if (area) {
        if (!areaMap.has(area)) {
          areaMap.set(area, []);
        }
        areaMap.get(area)!.push(group);
      }
    });

    return Array.from(areaMap.entries()).map(([area, groups]) => ({
      area,
      groups,
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Target Areas Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-white">Target Areas</h3>
        {selectedExerciseGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {getUniqueTargetAreas(selectedExerciseGroups).map(
              ({ area, groups }) => (
                <div
                  key={area}
                  className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{area}</span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No target areas selected</p>
        )}
      </div>

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
                  <span>{group.name}</span>
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
