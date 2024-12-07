export interface AnatomyPart {
  objectId: string;
  name: string;
  description: string;
  available: boolean;
  shown: boolean;
  selected: boolean;
  parent: string;
  children: AnatomyPart[];
}

// You might also want some helper types
export type PartId = string;

// If you need to extract just the essential info for the popup
export interface SelectedPartInfo {
  id: PartId;
  name: string;
  description: string;
} 