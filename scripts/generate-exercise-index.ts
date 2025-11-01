/**
 * Generates a lightweight exercise index for LLM prompts
 * Extracts exercise names from JSON files, grouped by body part
 */

import * as fs from 'fs';
import * as path from 'path';

interface Exercise {
  id?: string;
  name: string;
  difficulty?: string;
  equipment?: string[];
  targetBodyParts?: string[];
}

interface ExerciseFile {
  bodyPart: string;
  exercises: Exercise[];
}

const EXERCISE_DIR_EN = path.join(process.cwd(), 'public/data/exercises/musco/json2');
const EXERCISE_DIR_NO = path.join(process.cwd(), 'public/data/exercises/musco/json2_no');

// Map file names to display names
const FILE_TO_BODY_PART: Record<string, string> = {
  'm_shoulders.json': 'Shoulders',
  'm_biceps.json': 'Upper Arms (Biceps)',
  'm_triceps.json': 'Upper Arms (Triceps)',
  'm_forearms.json': 'Forearms',
  'm_chest.json': 'Chest',
  'm_abs.json': 'Abdomen (Abs)',
  'm_obliques.json': 'Abdomen (Obliques)',
  'm_upper-back.json': 'Upper Back',
  'm_lats.json': 'Upper Back (Lats)',
  'm_lower-back.json': 'Lower Back',
  'm_glutes.json': 'Glutes',
  'm_quads.json': 'Upper Legs (Quads)',
  'm_hamstrings.json': 'Upper Legs (Hamstrings)',
  'm_calves.json': 'Lower Legs (Calves)',
  'warmups.json': 'Warmup',
  'cardio.json': 'Cardio',
};

interface ExerciseIndex {
  [bodyPart: string]: {
    total: number;
    exercises: string[];
    equipment: Set<string>;
    difficulties: Set<string>;
  };
}

function generateIndex(exerciseDir: string): ExerciseIndex {
  const index: ExerciseIndex = {};

  for (const [fileName, bodyPart] of Object.entries(FILE_TO_BODY_PART)) {
    const filePath = path.join(exerciseDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${fileName}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: ExerciseFile = JSON.parse(fileContent);

    if (!index[bodyPart]) {
      index[bodyPart] = {
        total: 0,
        exercises: [],
        equipment: new Set(),
        difficulties: new Set(),
      };
    }

    // Collect exercise names and metadata
    data.exercises.forEach((ex) => {
      if (ex.name) {
        index[bodyPart].exercises.push(ex.name);
        index[bodyPart].total++;
        
        if (ex.difficulty) {
          index[bodyPart].difficulties.add(ex.difficulty);
        }
        
        if (ex.equipment) {
          ex.equipment.forEach(eq => index[bodyPart].equipment.add(eq));
        }
      }
    });
  }

  return index;
}

function formatIndexForPrompt(index: ExerciseIndex): string {
  let output = '**Available Exercises Database:**\n\n';
  
  // Group by main body parts for cleaner display
  const grouped: Record<string, string[]> = {};
  
  Object.entries(index).forEach(([bodyPart, data]) => {
    const mainPart = bodyPart.split('(')[0].trim();
    if (!grouped[mainPart]) {
      grouped[mainPart] = [];
    }
    grouped[mainPart].push(...data.exercises.slice(0, 8)); // Limit to 8 per category for token efficiency
  });

  // Format output
  Object.entries(grouped).forEach(([bodyPart, exercises]) => {
    // Deduplicate and limit
    const uniqueExercises = [...new Set(exercises)].slice(0, 12);
    output += `**${bodyPart}** (${uniqueExercises.length} shown):\n`;
    output += uniqueExercises.map(ex => `  - ${ex}`).join('\n');
    output += '\n\n';
  });

  output += `\n**Usage:**\n`;
  output += `- Reference specific exercise names when making recommendations\n`;
  output += `- Use <<EXERCISE_QUERY:bodypart:exercise_name>> to display exercise card\n`;
  output += `- Example: "Try **External Rotation** <<EXERCISE_QUERY:Shoulders:external rotation>>"\n`;
  
  return output;
}

function formatIndexCompact(index: ExerciseIndex): string {
  let output = '**Exercise Database** (reference for specific recommendations):\n';
  
  const grouped: Record<string, string[]> = {};
  Object.entries(index).forEach(([bodyPart, data]) => {
    const mainPart = bodyPart.split('(')[0].trim();
    if (!grouped[mainPart]) grouped[mainPart] = [];
    // Increased from 6 to 12 to include more bodyweight/band exercises
    grouped[mainPart].push(...data.exercises.slice(0, 12));
  });

  Object.entries(grouped).forEach(([bodyPart, exercises]) => {
    // Increased from 8 to 15 to include more variety
    const uniqueExercises = [...new Set(exercises)].slice(0, 15);
    output += `• ${bodyPart}: ${uniqueExercises.join(', ')}...\n`;
  });

  return output;
}

function generateStats(index: ExerciseIndex): void {
  console.log('\n📊 Exercise Database Statistics:\n');
  
  let totalExercises = 0;
  const allEquipment = new Set<string>();
  const allDifficulties = new Set<string>();

  Object.entries(index).forEach(([bodyPart, data]) => {
    console.log(`${bodyPart}: ${data.total} exercises`);
    totalExercises += data.total;
    data.equipment.forEach(eq => allEquipment.add(eq));
    data.difficulties.forEach(diff => allDifficulties.add(diff));
  });

  console.log(`\n✅ Total: ${totalExercises} exercises`);
  console.log(`✅ Equipment types: ${allEquipment.size}`);
  console.log(`✅ Difficulty levels: ${Array.from(allDifficulties).join(', ')}`);
}

// Main execution
if (require.main === module) {
  console.log('🔨 Generating exercise indexes for both languages...\n');
  
  // Generate English index
  console.log('📝 Processing English exercises...');
  const indexEn = generateIndex(EXERCISE_DIR_EN);
  console.log('\n📊 English Exercise Statistics:');
  generateStats(indexEn);
  
  // Generate Norwegian index
  console.log('\n📝 Processing Norwegian exercises...');
  const indexNo = generateIndex(EXERCISE_DIR_NO);
  console.log('\n📊 Norwegian Exercise Statistics:');
  generateStats(indexNo);
  
  // Generate both formats for each language
  const fullFormatEn = formatIndexForPrompt(indexEn);
  const compactFormatEn = formatIndexCompact(indexEn);
  
  const fullFormatNo = formatIndexForPrompt(indexNo);
  const compactFormatNo = formatIndexCompact(indexNo);
  
  // Save to file for easy import
  const outputDir = path.join(process.cwd(), 'src/app/api/prompts');
  const outputPath = path.join(outputDir, 'exerciseIndex.ts');
  
  const fileContent = `// AUTO-GENERATED by scripts/generate-exercise-index.ts
// Do not edit manually - regenerate using: npm run generate-exercise-index

// ========== ENGLISH INDEXES ==========
export const EXERCISE_INDEX_FULL_EN = \`${fullFormatEn.replace(/`/g, '\\`')}\`;

export const EXERCISE_INDEX_COMPACT_EN = \`${compactFormatEn.replace(/`/g, '\\`')}\`;

export const EXERCISE_INDEX_RAW_EN = ${JSON.stringify(indexEn, (key, value) => {
  if (value instanceof Set) {
    return Array.from(value);
  }
  return value;
}, 2)};

// ========== NORWEGIAN INDEXES ==========
export const EXERCISE_INDEX_FULL_NO = \`${fullFormatNo.replace(/`/g, '\\`')}\`;

export const EXERCISE_INDEX_COMPACT_NO = \`${compactFormatNo.replace(/`/g, '\\`')}\`;

export const EXERCISE_INDEX_RAW_NO = ${JSON.stringify(indexNo, (key, value) => {
  if (value instanceof Set) {
    return Array.from(value);
  }
  return value;
}, 2)};

// ========== LEGACY EXPORTS (for backwards compatibility) ==========
export const EXERCISE_INDEX_FULL = EXERCISE_INDEX_FULL_EN;
export const EXERCISE_INDEX_COMPACT = EXERCISE_INDEX_COMPACT_EN;
export const EXERCISE_INDEX_RAW = EXERCISE_INDEX_RAW_EN;
`;

  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  
  console.log(`\n✅ Exercise indexes saved to: ${outputPath}`);
  console.log(`\n📝 Token estimates:`);
  console.log(`   English Full: ~${Math.ceil(fullFormatEn.length / 4)} tokens`);
  console.log(`   English Compact: ~${Math.ceil(compactFormatEn.length / 4)} tokens`);
  console.log(`   Norwegian Full: ~${Math.ceil(fullFormatNo.length / 4)} tokens`);
  console.log(`   Norwegian Compact: ~${Math.ceil(compactFormatNo.length / 4)} tokens`);
}

export { generateIndex, formatIndexForPrompt, formatIndexCompact };





