'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useAuth } from './AuthContext';
import { db } from '@/app/firebase/config';
import { 
  doc, 
  addDoc, 
  updateDoc, 
  collection, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { ProgramStatus, ExerciseProgram } from '@/app/types/program';

interface UserContextType {
  onQuestionnaireSubmit: (diagnosis: DiagnosisAssistantResponse, answers: ExerciseQuestionnaireAnswers) => Promise<string>;
  answers: ExerciseQuestionnaireAnswers | null;
  programStatus: ProgramStatus | null;
  program: ExerciseProgram | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers | null>(null);
  const [programStatus, setProgramStatus] = useState<ProgramStatus | null>(null);
  const [program, setProgram] = useState<ExerciseProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  // Set up real-time listener for program status changes
  useEffect(() => {
    if (!user) return;

    // Only set up the listener if we're in generating state
    if (programStatus !== ProgramStatus.Generating) return;

    const userRef = doc(db, `users/${user.uid}`);
    const unsubscribeStatus = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const newStatus = userData.programStatus;
        setProgramStatus(newStatus);

        // If status changes to Done, fetch the latest program
        if (newStatus === ProgramStatus.Done) {
          const programsRef = collection(db, `users/${user.uid}/programs`);
          const programsQuery = query(programsRef, orderBy('createdAt', 'desc'), limit(1));
          getDocs(programsQuery).then((snapshot) => {
            if (!snapshot.empty) {
              const latestProgram = snapshot.docs[0].data();
              setProgram(latestProgram.program || null);
            }
          });
        }
      }
    });

    return () => unsubscribeStatus();
  }, [user, programStatus]);

  // Fetch initial user data when user logs in
  useEffect(() => {
    // Skip the first render in development due to strict mode
    if (process.env.NODE_ENV === 'development' && !isMounted.current) {
      isMounted.current = true;
      return;
    }

    let isSubscribed = true;

    async function fetchUserData() {
      if (!user) {
        setAnswers(null);
        setProgramStatus(null);
        setProgram(null);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user document
        const userRef = doc(db, `users/${user.uid}`);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && isSubscribed) {
          const userData = userDoc.data();
          setAnswers(userData.answers || null);
          setProgramStatus(userData.programStatus || null);
        }

        // Fetch latest program from programs subcollection
        const programsRef = collection(db, `users/${user.uid}/programs`);
        const programsQuery = query(programsRef, orderBy('createdAt', 'desc'), limit(1));
        const programsSnapshot = await getDocs(programsQuery);
        
        if (!programsSnapshot.empty && isSubscribed) {
          const latestProgram = programsSnapshot.docs[0].data();
          setProgram(latestProgram as ExerciseProgram);
        } else if (isSubscribed) {
          setProgram(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    fetchUserData();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [user]);

  const onQuestionnaireSubmit = async (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ): Promise<string> => {
    // If user is authenticated, save to Firestore
    if (user) {
      try {
        // Get reference to user document
        const userRef = doc(db, `users/${user.uid}`);
        
        // Check if user document exists
        const userDoc = await getDoc(userRef);
        
        // If user document doesn't exist, create it
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Update user document with answers and program status
        const newData = {
          answers,
          programStatus: ProgramStatus.Generating,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(userRef, newData);
        
        // Update local state
        setAnswers(answers);
        setProgramStatus(ProgramStatus.Generating);
        setProgram(null); // Clear existing program as we're generating a new one

        // Save diagnosis to subcollection with auto-generated ID
        const diagnosisRef = collection(db, `users/${user.uid}/diagnosis`);
        const docRef = await addDoc(diagnosisRef, {
          diagnosis,
          createdAt: new Date().toISOString()
        });

        // Generate the program
        try {
          const response = await fetch("/api/assistant", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "generate_exercise_program",
              payload: {
                diagnosisData: diagnosis,
                userInfo: answers,
                userId: user.uid,
                diagnosisId: docRef.id
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate program');
          }

          setProgramStatus(ProgramStatus.Done);

          const program = await response.json();
          setProgram(program.program);

          // The program generation and status updates are handled by the API endpoint
          // It will update the user's program status and save the program to Firestore

        } catch (error) {
          console.error('Error generating program:', error);
          // Update status to error if generation fails
          await updateDoc(userRef, {
            programStatus: ProgramStatus.Error,
          });
          throw error;
        }

        return docRef.id;
      } catch (error) {
        console.error('Error saving diagnosis to Firestore:', error);
        throw error;
      }
    }
    return '';
  };

  return (
    <UserContext.Provider value={{ 
      onQuestionnaireSubmit,
      answers,
      programStatus,
      program,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 