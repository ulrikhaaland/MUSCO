import { bodyPartGroups as sharedBodyPartGroups } from '@shared/anatomy/body_part_groups';
import { AnatomyPart } from '../types/human';

export interface BodyPartGroup {
  id: string;
  name: string;
  parts: AnatomyPart[];
  keywords: string[];
  selectIds: string[];
  deselectIds: string[];
  zoomId: string;
}

function toAnatomyPart(part: { objectId: string; name: string }): AnatomyPart {
  return {
    objectId: part.objectId,
    name: part.name,
    description: '',
    available: true,
    shown: true,
    selected: false,
    parent: '',
    children: [],
  };
}

export const bodyPartGroups: { [key: string]: BodyPartGroup } = Object.fromEntries(
  Object.entries(sharedBodyPartGroups).map(([key, group]) => [
    key,
    {
      id: group.id,
      name: group.name,
      zoomId: group.zoomId,
      keywords: group.keywords || [],
      selectIds: group.selectIds || [],
      deselectIds: group.deselectIds || [],
      parts: (group.parts || []).map(toAnatomyPart),
    },
  ])
);
