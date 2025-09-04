// Minimal normalization map for equipment names used by gyms and exercise JSON
// Keep aliases tight; expand later as needed
export const EQUIPMENT_ALIASES: Record<string, string> = {
  'kettlebell': 'Kettle Bell',
  'kettlebells': 'Kettle Bell',
  'kettle bells': 'Kettle Bell',
  'kettle bell': 'Kettle Bell',
  'db': 'Dumbbell',
  'dumbbells': 'Dumbbell',
  'barbells': 'Barbell',
  'trx suspension': 'TRX',
  'stationary bike': 'Exercise Bike',
  'bike': 'Exercise Bike',
  'rower': 'Rowing Machine',
  'elliptical trainer': 'Elliptical',
  'elliptical machine': 'Elliptical',
  'body weight': 'Bodyweight',
};

export function normalizeEquipmentName(name: string): string {
  const key = name.trim().toLowerCase();
  return EQUIPMENT_ALIASES[key] || capitalizeWords(name.trim());
}

function capitalizeWords(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}





