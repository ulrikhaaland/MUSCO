import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';

// Type definitions (same as in the scraper)
interface Exercise {
  id: string;
  name: string;
  description: string;
  targetBodyParts: string[];
  exerciseType: string[];
  difficulty: string;
  equipment: string[];
  steps: string[];
  tips: string[];
  contraindications: string[];
  muscles: string[];
  alternatives: string[];
  repetitions: number;
  sets: number;
  restBetweenSets: number;
  videoUrl?: string; // Optional video URL
  imageUrl?: string; // Optional image URL
  viewCount?: number; // Optional view count
  popularity?: string; // Popularity level (high, medium, low)
  forceType?: string; // Force type (Push, Pull, etc.)
  mechanics?: string; // Mechanics (Compound, Isolation, etc.)
}

interface ExerciseGroup {
  bodyPart: string;
  exercises: Exercise[];
}

// Function to find alternative exercises based on similarity
function findAlternatives(exercise: Exercise, allExercises: Exercise[], maxAlternatives = 5): string[] {
  if (!exercise || !allExercises || allExercises.length === 0) {
    return [];
  }

  // Don't suggest the exercise itself as an alternative
  const otherExercises = allExercises.filter(e => e.id !== exercise.id);
  
  // Score each exercise based on similarity
  const scoredAlternatives = otherExercises.map(other => {
    let score = 0;
    
    // Same target body parts (high importance)
    const bodyPartMatch = exercise.targetBodyParts.some(part => 
      other.targetBodyParts.includes(part));
    if (bodyPartMatch) score += 3;
    
    // Same exercise type (medium-high importance)
    const exerciseTypeMatch = exercise.exerciseType.some(type => 
      other.exerciseType.includes(type));
    if (exerciseTypeMatch) score += 2;
    
    // Similar difficulty level (medium importance)
    if (exercise.difficulty === other.difficulty) score += 2;
    
    // Similar equipment (medium importance)
    const equipmentMatch = exercise.equipment.some(eq => 
      other.equipment.includes(eq));
    if (equipmentMatch) score += 2;
    
    // Target similar muscles (high importance)
    const muscleMatch = exercise.muscles.some(muscle => 
      other.muscles.includes(muscle));
    if (muscleMatch) score += 3;
    
    // Same mechanics (medium importance)
    if (exercise.mechanics && other.mechanics && 
        exercise.mechanics === other.mechanics) {
      score += 2;
    }
    
    // Same force type (medium importance)
    if (exercise.forceType && other.forceType && 
        exercise.forceType === other.forceType) {
      score += 2;
    }
    
    return { exercise: other, score };
  });
  
  // Sort by score (highest first) and take the top N
  const sortedAlternatives = scoredAlternatives
    .sort((a, b) => b.score - a.score)
    .slice(0, maxAlternatives);
  
  // Return just the IDs
  return sortedAlternatives.map(alt => alt.exercise.id);
}

// Function to process a specific exercise file
async function generateAlternativesForCategory(categoryFilePath: string): Promise<void> {
  console.log(`Processing category file: ${categoryFilePath}`);
  try {
    // Check if the file exists
    if (!fs.existsSync(categoryFilePath)) {
      console.error(`File not found: ${categoryFilePath}`);
      return;
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(categoryFilePath, 'utf8');
    console.log(`File loaded, size: ${fileContent.length} bytes`);
    
    // Extract the export variable name
    const variableMatch = fileContent.match(/export const (\w+):\s*ExerciseGroup/);
    if (!variableMatch) {
      console.error(`Could not find export variable in ${categoryFilePath}`);
      console.log(`File starts with: ${fileContent.substring(0, 200)}...`);
      return;
    }
    const variableName = variableMatch[1];
    console.log(`Found variable name: ${variableName}`);
    
    // Extract the exercises data - more robust regex
    console.log('Extracting exercises data...');

    // Extract each exercise individually rather than the entire array at once
    const exerciseMatches = fileContent.matchAll(/\{\s*id:\s*['"`]([^'"`]+)['"`]/g);
    const exercises: Exercise[] = [];

    // Convert matches to an array
    const exerciseIds = Array.from(exerciseMatches).map(match => match[1]);
    console.log(`Found ${exerciseIds.length} exercise IDs in the file`);

    if (exerciseIds.length === 0) {
      console.error('No exercises found in the file');
      // Try to see if there's any exercises at all
      const anyExercisePattern = /\{\s*id:/g;
      const anyMatches = fileContent.match(anyExercisePattern);
      if (anyMatches) {
        console.log(`Found ${anyMatches.length} exercise-like patterns but couldn't extract IDs`);
      }
      
      // Write the file content to a debug file
      fs.writeFileSync(`${categoryFilePath}.content.txt`, fileContent);
      console.log(`Full file content written to ${categoryFilePath}.content.txt for debugging`);
      return;
    }

    // For each exercise ID, extract the complete exercise object
    for (const id of exerciseIds) {
      console.log(`Processing exercise: ${id}`);
      
      // Find the start of this exercise object
      const exerciseStartPattern = new RegExp(`\\{\\s*id:\\s*['"\`]${id}['"\`]`);
      const exerciseStart = fileContent.search(exerciseStartPattern);
      
      if (exerciseStart === -1) {
        console.error(`Could not find start of exercise ${id}`);
        continue;
      }
      
      // Count brackets to find the end of the exercise object
      let bracketCount = 1;
      let exerciseEnd = exerciseStart + 1;
      
      while (bracketCount > 0 && exerciseEnd < fileContent.length) {
        if (fileContent[exerciseEnd] === '{') bracketCount++;
        if (fileContent[exerciseEnd] === '}') bracketCount--;
        exerciseEnd++;
      }
      
      // Extract the exercise
      const exerciseStr = fileContent.substring(exerciseStart, exerciseEnd);
      console.log(`Extracted ${exerciseStr.length} characters for exercise ${id}`);
      
      // First, let's save the original content of string literals to protect them
      const stringLiterals: string[] = [];
      const stringProtectedContent = exerciseStr.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
        const index = stringLiterals.length;
        stringLiterals.push(match);
        return `__STRING_LITERAL_${index}__`;
      });

      // Convert to proper JSON
      let jsonStr = stringProtectedContent
        // Replace property names - ensure they're quoted (ONLY outside string literals)
        .replace(/(\s+)(\w+):/g, '$1"$2":')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1');

      // Restore string literals
      stringLiterals.forEach((literal, index) => {
        jsonStr = jsonStr.replace(`__STRING_LITERAL_${index}__`, literal);
      });

      // Now handle the string literals - replace single quotes and template literals with double quotes
      jsonStr = jsonStr
        // Better regex for handling single quotes, including edge cases
        // Instead of trying to match pairs of quotes, replace all single quotes with double quotes
        // but only if they're at the beginning or end of a value
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace 'value' with "value"
        .replace(/:\s*"/g, ': "') // Ensure consistent spacing after colons
        // Handle any remaining unpaired single quotes that might be part of property values
        .replace(/(\w)'(\w)/g, '$1\\\'$2') // Escape single quotes within words (e.g., don't -> don\'t)
        // Replace template literals with normal strings
        .replace(/`([^`]*)`/g, (match, content) => {
          // Escape double quotes and newlines in the content
          const escaped = content
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n');
          return `"${escaped}"`;
        });
      
      // Final check for any remaining single quotes that should be double quotes
      if (jsonStr.includes("'")) {
        console.warn(`Warning: String for ${id} still contains single quotes, attempting to fix`);
        
        // Try a more aggressive approach for remaining cases
        // This replaces property values that start with a single quote and end with 
        // something other than a single quote, or vice versa
        jsonStr = jsonStr
          .replace(/:\s*'([^']*[^'])"/g, ': "$1"') // Handle 'value" -> "value"
          .replace(/:\s*"([^"]*[^"])'/g, ': "$1"'); // Handle "value' -> "value"
          
        // As a last resort, replace any remaining single quotes with double quotes
        // Only do this if we're still seeing problems
        if (jsonStr.includes("'")) {
          jsonStr = jsonStr.replace(/'/g, '"');
          console.warn(`Applied aggressive quote replacement for ${id}`);
        }
      }
      
      // Parse the exercise
      try {
        const exercise = JSON.parse(jsonStr);
        exercises.push(exercise);
        console.log(`Successfully parsed exercise ${id}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error parsing exercise ${id}: ${errorMessage}`);
        
        // Write the problematic JSON to a file for debugging
        fs.writeFileSync(`${categoryFilePath}.${id}.json`, jsonStr);
        console.error(`Wrote problematic JSON for ${id} to ${categoryFilePath}.${id}.json for debugging`);
        
        // Instead of skipping this exercise, try to extract the original exercise from the file
        // and add it to our exercises array
        console.log(`Attempting to preserve the original exercise ${id} in the output`);
        
        try {
          // Find the exercise in the original content
          const originalExerciseMatch = fileContent.match(new RegExp(`\\{\\s*id:\\s*['"\`]${id}['"\`][\\s\\S]*?\\}(?=,\\s*\\{|\\s*\\])`));
          
          if (originalExerciseMatch) {
            const originalExercise = originalExerciseMatch[0];
            
            // Create a basic exercise object with at least the ID
            const basicExercise: Partial<Exercise> = { 
              id,
              name: id, // Use ID as fallback name
              alternatives: [], // Empty alternatives array that we'll populate
              targetBodyParts: [],
              exerciseType: [],
              difficulty: "unknown",
              equipment: [],
              steps: [],
              tips: [],
              contraindications: [],
              muscles: []
            };
            
            // Try to extract some basic properties
            const nameMatch = originalExercise.match(/name:\s*['"`]([^'"`]+)['"`]/);
            if (nameMatch) basicExercise.name = nameMatch[1];
            
            // Add this basic exercise to our array
            exercises.push(basicExercise as Exercise);
            console.log(`Added basic version of exercise ${id} to preserve it in output`);
          } else {
            console.error(`Could not find the original exercise ${id} in the file content`);
          }
        } catch (preserveErr: unknown) {
          const preserveErrorMessage = preserveErr instanceof Error ? preserveErr.message : 'Unknown error';
          console.error(`Error preserving exercise ${id}: ${preserveErrorMessage}`);
        }
      }
    }

    console.log(`Successfully parsed ${exercises.length} out of ${exerciseIds.length} exercises`);

    // If no exercises could be parsed, preserve the original file
    if (exercises.length === 0) {
      console.error('No exercises could be parsed, preserving original file');
      
      // Create a backup of the original file
      const backupPath = categoryFilePath + '.attempted.bak';
      fs.writeFileSync(backupPath, fileContent);
      console.log(`Created backup at ${backupPath}`);
      
      // Don't write anything back, just return
      return;
    }

    // Even if only some exercises were parsed, add a comment about any missing ones
    if (exercises.length < exerciseIds.length) {
      console.warn(`Warning: Only ${exercises.length} out of ${exerciseIds.length} exercises were successfully parsed`);
      console.warn(`The following exercises had parsing issues: ${exerciseIds.filter(id => !exercises.some(e => e.id === id)).join(', ')}`);
    }

    // Extract the body part from the file name or content
    console.log('Determining body part...');
    let bodyPart = 'Unknown';

    // Try to get body part from file name
    const fileNameMatch = categoryFilePath.match(/\/([^\/]+)\.ts$/);
    if (fileNameMatch) {
      const fileName = fileNameMatch[1];
      // Convert file name to title case
      bodyPart = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      console.log(`Extracted body part from file name: ${bodyPart}`);
    }

    // Try to get body part from file content
    const bodyPartMatch = fileContent.match(/bodyPart:\s*['"`]([^'"`]+)['"`]/);
    if (bodyPartMatch) {
      bodyPart = bodyPartMatch[1];
      console.log(`Extracted body part from file content: ${bodyPart}`);
    }

    // Create the exercise data object
    const exerciseData: ExerciseGroup = {
      bodyPart,
      exercises
    };
    
    // Generate alternatives for each exercise
    for (const exercise of exercises) {
      exercise.alternatives = findAlternatives(exercise, exercises);
      console.log(`Added ${exercise.alternatives.length} alternatives for ${exercise.name}`);
    }
    
    // Preserve any comments at the top of the file
    const headerMatch = fileContent.match(/^([\s\S]*?)export const/);
    const header = headerMatch ? headerMatch[1] : '';
    
    // Create updated content - pretty format the JSON output
    const updatedContent = `${header}export const ${variableName}: ExerciseGroup = ${JSON.stringify(exerciseData, null, 2)};`;
    
    // Create a backup of the original file
    const backupPath = categoryFilePath + '.bak';
    fs.writeFileSync(backupPath, fileContent);
    console.log(`Created backup at ${backupPath}`);
    
    // Write the updated content back to the file
    fs.writeFileSync(categoryFilePath, updatedContent);
    
    console.log(`Successfully updated ${categoryFilePath} with alternatives`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing ${categoryFilePath}: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
  }
}

// Main function to process a category
async function main() {
  // Get the category from command line argument
  const category = process.argv[2];
  if (!category) {
    console.error('Please specify a category (e.g. shoulders, abs, back, etc.)');
    process.exit(1);
  }
  
  console.log(`Running alternatives generator for category: ${category}`);
  
  // Determine the file path
  const outputDir = path.join(__dirname, 'output');
  const categoryFilePath = path.join(outputDir, `${category}.ts`);
  
  console.log(`File path: ${categoryFilePath}`);
  
  // Ensure the file exists
  if (!fs.existsSync(categoryFilePath)) {
    console.error(`File does not exist: ${categoryFilePath}`);
    process.exit(1);
  }
  
  try {
    await generateAlternativesForCategory(categoryFilePath);
    console.log('Alternatives generation complete!');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate alternatives: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the main function
main(); 