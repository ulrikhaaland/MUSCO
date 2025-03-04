import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProgramType } from '../shared/types';

/**
 * Updates the active status of programs in Firebase
 * Only one program of each type (exercise or recovery) can be active at a time
 */
export async function updateActiveProgramStatus(
  userId: string, 
  programDocId: string, 
  programType: ProgramType, 
  active: boolean
) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Reference to the program document to be updated
    const programRef = doc(db, `users/${userId}/programs`, programDocId);
    
    // Update the active status of the program without changing updatedAt
    await updateDoc(programRef, {
      active
    });

    // If setting to active, we need to deactivate other programs of the same type
    if (active) {
      // Get all programs of the same type except the one we just updated
      const programsRef = collection(db, `users/${userId}/programs`);
      const q = query(
        programsRef, 
        where('type', '==', programType),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      // Update each program to be inactive if it's not the one we're activating
      const updatePromises = snapshot.docs
        .filter(doc => doc.id !== programDocId)
        .map(doc => 
          updateDoc(doc.ref, {
            active: false
          })
        );
      
      // Wait for all updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating program active status:', error);
    throw error;
  }
} 