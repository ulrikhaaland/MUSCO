import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { ExerciseGroup, Exercise } from './types/exercises';
import * as dotenv from 'dotenv';

// Get the absolute path to the project root directory (one level up from scripts)
const rootDir = path.resolve(__dirname, '..');
// Load environment variables from .env.local in the root directory
const envPath = path.join(rootDir, '.env.local');

console.log(`Looking for .env.local at: ${envPath}`);
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env.local file not found at ${envPath}`);
  process.exit(1);
}

// Load the environment variables
dotenv.config({ path: envPath });
console.log('Environment variables loaded from .env.local');

// Initialize Firebase Admin SDK using environment variables
try {
  // Check if required environment variables are set
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing Firebase Admin SDK credentials in .env.local file');
    console.error('Please ensure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set');
    process.exit(1);
  }

  // Initialize Firebase Admin SDK with credentials from environment variables
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes with escaped newlines which need to be converted to actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }),
  });
  
  console.log('Firebase Admin SDK initialized successfully using environment variables');
} catch (error: any) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

// Reference to Firestore
const db = admin.firestore();

// Add a safe parser function as an alternative to eval
function safeParseExercise(exerciseText: string): any {
  // First attempt: try to convert to JSON by replacing TypeScript-specific syntax
  try {
    // Replace property names (without quotes) with quoted property names
    const jsonText = exerciseText
      .replace(/(\s+)(\w+):/g, '$1"$2":')
      // Replace single quotes with double quotes
      .replace(/'([^']*)'/g, '"$1"')
      // Handle template literals (basic support)
      .replace(/`([^`]*)`/g, (match, content) => {
        return JSON.stringify(content);
      });
    
    return JSON.parse(jsonText);
  } catch (e) {
    console.warn(`JSON parsing failed, trying alternative approach`);
    
    // Second attempt: Try to use Function constructor (safer than eval but still allows code execution)
    try {
      // This approach is still risky but better than direct eval
      // We're only using it on our own generated files which should be safe
      return Function(`"use strict"; return ${exerciseText}`)();
    } catch (e2: unknown) {
      // Fix for error: "e2 is of type unknown"
      const errorMessage = e2 instanceof Error ? e2.message : 'Unknown error';
      throw new Error(`Both parsing methods failed: ${errorMessage}`);
    }
  }
}

// Function to import an exercise file
async function importExerciseFile(filePath: string): Promise<void> {
  try {
    console.log(`Processing file: ${filePath}`);
    
    // Dynamic import of the exercise file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the variable name (e.g., absExercises, shouldersExercises)
    const variableMatch = fileContent.match(/export const (\w+):/);
    if (!variableMatch) {
      console.error(`Could not find variable name in ${filePath}`);
      return;
    }
    
    // Try multiple regex patterns to extract bodyPart
    let bodyPart: string | null = null;
    
    // Method 1: Try the standard format - bodyPart: "Value"
    const bodyPartMatch1 = fileContent.match(/bodyPart:\s*['"]([^'"]+)['"]/i);
    if (bodyPartMatch1) {
      bodyPart = bodyPartMatch1[1];
      console.log(`Found bodyPart (method 1): ${bodyPart}`);
    }
    
    // Method 2: Try an alternative format - "bodyPart": "Value" (JSON style)
    if (!bodyPart) {
      const bodyPartMatch2 = fileContent.match(/"bodyPart"\s*:\s*['"]([^'"]+)['"]/i);
      if (bodyPartMatch2) {
        bodyPart = bodyPartMatch2[1];
        console.log(`Found bodyPart (method 2): ${bodyPart}`);
      }
    }
    
    // Method 3: Extract from variable name (e.g., trapsExercises -> traps)
    if (!bodyPart && variableMatch[1]) {
      const varName = variableMatch[1];
      if (varName.endsWith('Exercises')) {
        bodyPart = varName.replace(/Exercises$/, '').toLowerCase();
        console.log(`Derived bodyPart from variable name (method 3): ${bodyPart}`);
      }
    }
    
    // Method 4: Extract from filename (e.g., traps.ts -> traps)
    if (!bodyPart) {
      const fileName = path.basename(filePath, path.extname(filePath));
      bodyPart = fileName.toLowerCase();
      console.log(`Derived bodyPart from filename (method 4): ${bodyPart}`);
    }
    
    if (!bodyPart) {
      console.error(`Could not determine bodyPart in ${filePath} using any method`);
      return;
    }
    
    // Try different methods to extract exercises
    let exercises: any[] = [];
    
    // Method 1: Use regex to extract each exercise (original method)
    console.log("Trying exercise extraction method 1...");
    try {
      const exercisePattern1 = /\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?(?=\s*\}\s*,\s*\{|\s*\}\s*\])/g;
      const matches1 = Array.from(fileContent.matchAll(exercisePattern1));
      
      if (matches1.length > 0) {
        console.log(`Method 1 found ${matches1.length} potential exercise matches`);
        
        for (const match of matches1) {
          try {
            // Extract the whole exercise object text
            const exerciseText = match[0] + '}';
            
            // Try to parse using our safer method
            const exerciseObj = safeParseExercise(exerciseText);
            exercises.push(exerciseObj);
          } catch (error: any) {
            console.error(`Error parsing exercise with method 1: ${error.message}`);
          }
        }
      } else {
        console.log("Method 1 found no matches");
      }
    } catch (error: any) {
      console.error(`Error in exercise extraction method 1: ${error.message}`);
    }
    
    // Method 2: Try a more relaxed pattern if method 1 didn't work
    if (exercises.length === 0) {
      console.log("Trying exercise extraction method 2...");
      try {
        // Look for objects with an ID property in any format
        const exercisePattern2 = /\{\s*["']?id["']?\s*:\s*["']([^"']+)["'][\s\S]*?(?=\s*\}\s*,\s*\{|\s*\}\s*\])/g;
        const matches2 = Array.from(fileContent.matchAll(exercisePattern2));
        
        if (matches2.length > 0) {
          console.log(`Method 2 found ${matches2.length} potential exercise matches`);
          
          for (const match of matches2) {
            try {
              // Extract the whole exercise object text
              const exerciseText = match[0] + '}';
              
              // Try to parse using our safer method
              const exerciseObj = safeParseExercise(exerciseText);
              exercises.push(exerciseObj);
            } catch (error: any) {
              console.error(`Error parsing exercise with method 2: ${error.message}`);
            }
          }
        } else {
          console.log("Method 2 found no matches");
        }
      } catch (error: any) {
        console.error(`Error in exercise extraction method 2: ${error.message}`);
      }
    }
    
    // Method 3: Try to parse the whole exercises array as JSON
    if (exercises.length === 0) {
      console.log("Trying exercise extraction method 3...");
      try {
        // Find the exercises array in the file
        const exercisesArrayMatch = fileContent.match(/exercises"?\s*:\s*\[([\s\S]*?)\]\s*\}/);
        
        if (exercisesArrayMatch && exercisesArrayMatch[1]) {
          console.log("Found exercises array, attempting to parse");
          
          // Try to extract the exercises array content and wrap it in square brackets
          const exercisesArrayText = '[' + exercisesArrayMatch[1] + ']';
          
          // Preprocess the text to make it more JSON-like
          const jsonReadyText = exercisesArrayText
            .replace(/(\s+)(\w+):/g, '$1"$2":')  // Convert property names to quoted format
            .replace(/'([^']*)'/g, '"$1"')       // Replace single quotes with double quotes
            .replace(/`([^`]*)`/g, (match, content) => JSON.stringify(content)); // Handle template literals
          
          try {
            // Try to parse as JSON
            const parsedExercises = JSON.parse(jsonReadyText);
            if (Array.isArray(parsedExercises) && parsedExercises.length > 0) {
              exercises = parsedExercises;
              console.log(`Method 3 successfully parsed ${exercises.length} exercises`);
            }
          } catch (parseError: any) {
            console.error(`JSON parsing failed in method 3: ${parseError.message}`);
            
            // If JSON parsing fails, try function constructor approach as a last resort
            try {
              const parsedExercises = Function(`"use strict"; return ${exercisesArrayText}`)();
              if (Array.isArray(parsedExercises) && parsedExercises.length > 0) {
                exercises = parsedExercises;
                console.log(`Method 3 (fallback) successfully parsed ${exercises.length} exercises`);
              }
            } catch (evalError: any) {
              console.error(`Function constructor evaluation failed in method 3: ${evalError.message}`);
            }
          }
        } else {
          console.log("Could not find exercises array in the file");
        }
      } catch (error: any) {
        console.error(`Error in exercise extraction method 3: ${error.message}`);
      }
    }
    
    // Last resort: If all methods fail, write debug info to a file
    if (exercises.length === 0) {
      const debugFilePath = path.join(path.dirname(filePath), `debug-${path.basename(filePath)}.txt`);
      fs.writeFileSync(debugFilePath, fileContent, 'utf8');
      console.error(`No exercises found. Debug info written to: ${debugFilePath}`);
      console.error("Please check the file format and structure");
      return;
    }
    
    console.log(`Found ${exercises.length} exercises for ${bodyPart}`);
    
    // Ensure bodyPart is lowercase for Firestore (consistency)
    const bodyPartLower = bodyPart.toLowerCase();
    console.log(`Using normalized body part for Firestore: ${bodyPartLower}`);
    
    // Upload each exercise to Firestore
    let currentBatch = db.batch();
    let count = 0;
    let batchCount = 1;
    
    for (const exercise of exercises) {
      const docRef = db.collection('exercises').doc(bodyPartLower).collection('exercises').doc(exercise.id);
      currentBatch.set(docRef, exercise);
      count++;
      
      // Firestore has a limit of 500 operations per batch
      if (count >= 400) {
        console.log(`Committing batch ${batchCount} (${count} exercises)...`);
        await currentBatch.commit();
        console.log(`Batch ${batchCount} committed successfully`);
        
        // Reset for next batch
        count = 0;
        batchCount++;
        // Create a new batch
        currentBatch = db.batch();
      }
    }
    
    // Commit any remaining exercises
    if (count > 0) {
      console.log(`Committing final batch (${count} exercises)...`);
      await currentBatch.commit();
      console.log(`Final batch committed successfully`);
    }
    
    console.log(`Successfully uploaded ${exercises.length} exercises for ${bodyPartLower} to Firestore`);
  } catch (error: any) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Main function to process all exercise files
async function uploadAllExercises(): Promise<void> {
  try {
    // Get all exercise files from the output directory
    const outputDir = path.join(__dirname, 'output');
    
    if (!fs.existsSync(outputDir)) {
      console.error(`Output directory not found: ${outputDir}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.ts') && 
              !file.includes('.bak') && 
              !file.includes('.json'));
    
    console.log(`Found ${files.length} exercise files to process`);
    
    // Process each file sequentially to avoid overwhelming Firestore
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      await importExerciseFile(filePath);
    }
    
    console.log('All exercise files processed successfully');
  } catch (error: any) {
    console.error('Error processing exercise files:', error.message);
  }
}

// Allow specifying a single file to upload or upload all
const targetFile = process.argv[2];

if (targetFile) {
  // Upload a specific file
  const filePath = path.resolve(targetFile);
  console.log(`Uploading single file: ${filePath}`);
  importExerciseFile(filePath)
    .then(() => console.log('Upload complete'))
    .catch(error => console.error('Upload failed:', error.message));
} else {
  // Upload all files
  console.log('Uploading all exercise files');
  uploadAllExercises()
    .then(() => console.log('All uploads complete'))
    .catch(error => console.error('Upload process failed:', error.message));
} 