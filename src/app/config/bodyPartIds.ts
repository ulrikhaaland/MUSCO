export interface BodyPartId {
  id: string;          // The full ID as used in the 3D model
  name: string;        // The human-readable name
  description: string; // A brief description of the part
  type: 'muscular_system' | 'skeletal_system' | 'connective_tissue'; // The system it belongs to
  side?: 'left' | 'right' | 'bilateral'; // Which side of the body (if applicable)
  region: string;      // The general region (e.g., 'foot', 'hand', 'arm', etc.)
}

// Example of how to structure the data
export const bodyPartIds: BodyPartId[] = [
  {
    id: 'muscular_system-left_flexor_digitorum_brevis_ID',
    name: 'Flexor Digitorum Brevis',
    description: 'A muscle located in the sole of the foot that flexes the toes',
    type: 'muscular_system',
    side: 'left',
    region: 'foot'
  },
  {
    id: 'skeletal_system-left_calcaneus_ID',
    name: 'Calcaneus',
    description: 'The heel bone of the foot',
    type: 'skeletal_system',
    side: 'left',
    region: 'foot'
  },
  // ... more parts
];

// Optional: Helper functions to filter and search parts
export function getPartsByRegion(region: string): BodyPartId[] {
  return bodyPartIds.filter(part => part.region === region);
}

export function getPartsBySide(side: 'left' | 'right' | 'bilateral'): BodyPartId[] {
  return bodyPartIds.filter(part => part.side === side);
}

export function getPartsByType(type: BodyPartId['type']): BodyPartId[] {
  return bodyPartIds.filter(part => part.type === type);
}

// Optional: Type for grouping parts by region
export interface BodyPartsByRegion {
  [region: string]: BodyPartId[];
} 