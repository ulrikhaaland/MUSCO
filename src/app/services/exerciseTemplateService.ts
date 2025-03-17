import { db } from '@/app/firebase/config';
import { collection, doc, setDoc, getDocs, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { Exercise, ExerciseGroup, ExercisesTemplate, TargetBodyPart } from '@/app/types/program';
import { allExercises } from '@/app/data/exercises';

/**
 * Uploads all exercise templates to Firestore
 * @returns Promise that resolves when all templates are uploaded
 */
export const uploadAllExerciseTemplates = async (): Promise<void> => {
  try {
    // Reference to the 'exerciseTemplates' collection
    const templatesCollectionRef = collection(db, 'exerciseTemplates');
    
    // Upload each exercise group as a separate document
    for (const group of allExercises) {
      await setDoc(
        doc(templatesCollectionRef, group.bodyPart.toLowerCase().replace(' ', '-')), 
        group
      );
      console.log(`Uploaded exercise template for ${group.bodyPart}`);
    }
    
    // Create a summary document with metadata about the templates
    await setDoc(
      doc(db, 'exerciseTemplates', 'metadata'), 
      {
        lastUpdated: new Date(),
        totalGroups: allExercises.length,
        totalExercises: allExercises.reduce((total, group) => total + group.exercises.length, 0),
        bodyParts: allExercises.map(group => group.bodyPart),
      }
    );
    
    console.log('All exercise templates uploaded successfully');
  } catch (error) {
    console.error('Error uploading exercise templates:', error);
    throw error;
  }
};

/**
 * Fetches all exercise templates from Firestore
 * @returns Promise that resolves with all exercise templates
 */
export const fetchAllExerciseTemplates = async (): Promise<ExercisesTemplate> => {
  try {
    const templatesCollectionRef = collection(db, 'exerciseTemplates');
    const querySnapshot = await getDocs(templatesCollectionRef);
    
    const templates: ExercisesTemplate = [];
    
    querySnapshot.forEach((doc) => {
      // Skip the metadata document
      if (doc.id !== 'metadata') {
        const data = doc.data() as ExerciseGroup;
        templates.push(data);
      }
    });
    
    return templates;
  } catch (error) {
    console.error('Error fetching exercise templates:', error);
    throw error;
  }
};

/**
 * Fetches exercises for specific body parts from Firestore with additional filtering options
 * @param bodyParts Array of body part names
 * @param options Optional filtering parameters
 * @returns Promise that resolves with exercises for the specified body parts
 */
export const fetchExercisesForBodyParts = async (
  bodyParts: string[],
  options: {
    equipment?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | string[];
    maxExercisesPerBodyPart?: number;
    exerciseType?: string[];
  } = {}
): Promise<Exercise[]> => {
  try {
    const { 
      equipment, 
      difficulty, 
      maxExercisesPerBodyPart = 15, // Default to 15 exercises per body part to manage token size
      exerciseType 
    } = options;
    
    const exercises: Exercise[] = [];
    
    for (const bodyPart of bodyParts) {
      const docId = bodyPart.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, 'exerciseTemplates', docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ExerciseGroup;
        let bodyPartExercises = [...data.exercises];
        
        // Apply filters if specified
        if (equipment && equipment.length > 0) {
          bodyPartExercises = bodyPartExercises.filter(exercise => 
            exercise.equipment.some(e => equipment.includes(e))
          );
        }
        
        if (difficulty) {
          const difficultyArray = Array.isArray(difficulty) ? difficulty : [difficulty];
          bodyPartExercises = bodyPartExercises.filter(exercise => 
            difficultyArray.includes(exercise.difficulty)
          );
        }
        
        if (exerciseType && exerciseType.length > 0) {
          bodyPartExercises = bodyPartExercises.filter(exercise => {
            const types = Array.isArray(exercise.exerciseType) 
              ? exercise.exerciseType 
              : [exercise.exerciseType];
            return types.some(t => exerciseType.includes(t));
          });
        }
        
        // Sort by popularity and view count to get the most relevant exercises
        bodyPartExercises.sort((a, b) => {
          // First prioritize by popularity
          const popularityOrder = { high: 3, medium: 2, low: 1 };
          const popA = popularityOrder[a.popularity as keyof typeof popularityOrder] || 0;
          const popB = popularityOrder[b.popularity as keyof typeof popularityOrder] || 0;
          
          if (popB - popA !== 0) return popB - popA;
          
          // Then by view count if popularity is the same
          return (b.viewCount || 0) - (a.viewCount || 0);
        });
        
        // Limit the number of exercises per body part
        bodyPartExercises = bodyPartExercises.slice(0, maxExercisesPerBodyPart);
        
        exercises.push(...bodyPartExercises);
      }
    }
    
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises for body parts:', error);
    throw error;
  }
}; 