import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
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

// Ensure output directory exists
const outputDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

// Function to fetch exercises for a specific body part
async function fetchExercisesByBodyPart(bodyPart: string): Promise<any[]> {
  try {
    console.log(`Fetching exercises for body part: ${bodyPart}`);
    
    const exercisesRef = db.collection('exercises').doc(bodyPart).collection('exercises');
    const snapshot = await exercisesRef.get();
    
    if (snapshot.empty) {
      console.log(`No exercises found for ${bodyPart}`);
      return [];
    }
    
    const exercises: any[] = [];
    snapshot.forEach(doc => {
      exercises.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${exercises.length} exercises for ${bodyPart}`);
    return exercises;
  } catch (error: any) {
    console.error(`Error fetching exercises for ${bodyPart}: ${error.message}`);
    return [];
  }
}

// Function to save exercises to a JSON file
function saveExercisesToFile(bodyPart: string, exercises: any[]): void {
  if (exercises.length === 0) {
    console.log(`Skipping empty exercise list for ${bodyPart}`);
    return;
  }
  
  try {
    // Create a nicely formatted JSON file
    const exerciseGroup = {
      bodyPart,
      exercises
    };
    
    const filePath = path.join(outputDir, `${bodyPart}.json`);
    fs.writeFileSync(filePath, JSON.stringify(exerciseGroup, null, 2), 'utf8');
    console.log(`Saved ${exercises.length} exercises to ${filePath}`);
  } catch (error: any) {
    console.error(`Error saving exercises for ${bodyPart}: ${error.message}`);
  }
}

// Function to fetch all body parts from Firestore
async function fetchAllBodyParts(): Promise<string[]> {
  try {
    console.log('Fetching all body parts from Firestore');
    
    const exercisesRef = db.collection('exercises');
    const snapshot = await exercisesRef.listDocuments();
    
    const bodyParts = snapshot.map(doc => doc.id);
    console.log(`Found ${bodyParts.length} body parts: ${bodyParts.join(', ')}`);
    
    return bodyParts;
  } catch (error: any) {
    console.error(`Error fetching body parts: ${error.message}`);
    return [];
  }
}

// Function to download exercises for a specific body part
async function downloadExercisesByBodyPart(bodyPart: string): Promise<void> {
  try {
    const exercises = await fetchExercisesByBodyPart(bodyPart);
    saveExercisesToFile(bodyPart, exercises);
  } catch (error: any) {
    console.error(`Error downloading exercises for ${bodyPart}: ${error.message}`);
  }
}

// Main function to download all exercises
async function downloadAllExercises(): Promise<void> {
  try {
    const bodyParts = await fetchAllBodyParts();
    
    if (bodyParts.length === 0) {
      console.error('No body parts found in Firestore');
      return;
    }
    
    console.log(`Downloading exercises for ${bodyParts.length} body parts`);
    
    // Process each body part sequentially
    for (const bodyPart of bodyParts) {
      await downloadExercisesByBodyPart(bodyPart);
    }
    
    console.log('All exercises downloaded successfully');
  } catch (error: any) {
    console.error('Error downloading exercises:', error.message);
  }
}

// Allow specifying a single body part to download or download all
const targetBodyPart = process.argv[2];

if (targetBodyPart) {
  // Download a specific body part
  console.log(`Downloading exercises for body part: ${targetBodyPart}`);
  downloadExercisesByBodyPart(targetBodyPart)
    .then(() => console.log('Download complete'))
    .catch(error => console.error('Download failed:', error.message));
} else {
  // Download all body parts
  console.log('Downloading exercises for all body parts');
  downloadAllExercises()
    .then(() => console.log('All downloads complete'))
    .catch(error => console.error('Download process failed:', error.message));
} 