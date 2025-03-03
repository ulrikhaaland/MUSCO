'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useAuth } from './AuthContext';
import { db } from '@/app/firebase/config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { ProgramStatus, ExerciseProgram, UserProgram } from '@/app/types/program';
import { submitQuestionnaire } from '@/app/services/questionnaire';
import { updateActiveProgramStatus } from '@/app/services/program';
import { useRouter } from 'next/navigation';

// Update UserProgram interface to include the document ID
interface UserProgramWithId extends UserProgram {
  docId: string;
}

interface UserContextType {
  onQuestionnaireSubmit: (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ) => Promise<{ requiresAuth?: boolean; programId?: string }>;
  answers: ExerciseQuestionnaireAnswers | null;
  programStatus: ProgramStatus | null;
  program: ExerciseProgram | null;
  userPrograms: UserProgramWithId[];  // Updated to use the extended interface
  activeProgram: UserProgramWithId | null;  // Updated to use the extended interface
  isLoading: boolean;
  pendingQuestionnaire: {
    diagnosis: DiagnosisAssistantResponse;
    answers: ExerciseQuestionnaireAnswers;
  } | null;
  setPendingQuestionnaire: (
    data: {
      diagnosis: DiagnosisAssistantResponse;
      answers: ExerciseQuestionnaireAnswers;
    } | null
  ) => void;
  selectProgram: (programIndex: number) => void;
  toggleActiveProgram: (programIndex: number) => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers | null>(null);
  const [programStatus, setProgramStatus] = useState<ProgramStatus | null>(null);
  const [program, setProgram] = useState<ExerciseProgram | null>(null);
  const [userPrograms, setUserPrograms] = useState<UserProgramWithId[]>([]);
  const [activeProgram, setActiveProgram] = useState<UserProgramWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState<{
    diagnosis: DiagnosisAssistantResponse;
    answers: ExerciseQuestionnaireAnswers;
  } | null>(null);
  const isMounted = useRef(false);

  // Set up real-time listener for program status changes and latest program
  useEffect(() => {
    if (!user) return;

    // Listen to all user programs
    const programsRef = collection(db, `users/${user.uid}/programs`);
    const q = query(programsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const programs: UserProgramWithId[] = [];
      let mostRecentStatus: ProgramStatus | null = null;
      let mostRecentProgram: UserProgramWithId | null = null;
      let mostRecentDate: Date | null = null;

      // First pass: collect all programs
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Track the most recent status for any program
        if (!mostRecentStatus && data.status) {
          mostRecentStatus = data.status;
        }
        
        if (data.status === ProgramStatus.Done) {
          const programsCollectionRef = collection(
            db,
            `users/${user.uid}/programs/${doc.id}/programs`
          );
          const programQ = query(programsCollectionRef, orderBy('createdAt', 'desc'));
          const programSnapshot = await getDocs(programQ);

          if (!programSnapshot.empty) {
            const exercisePrograms = programSnapshot.docs.map(doc => 
              doc.data() as ExerciseProgram
            );
            
            const updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date(data.createdAt);
            const userProgram: UserProgramWithId = {
              programs: exercisePrograms,
              diagnosis: data.diagnosis,
              questionnaire: data.questionnaire,
              active: data.active ?? true, // Use active status from Firebase or default to true
              createdAt: new Date(data.createdAt),
              updatedAt: updatedAt,
              type: data.type,
              docId: doc.id // Store the document ID
            };
            programs.push(userProgram);

            // Check if this is the most recent program we've seen
            if (!mostRecentDate || updatedAt > mostRecentDate) {
              mostRecentDate = updatedAt;
              mostRecentProgram = userProgram;
            }
          }
        }
      }

      // Now set all state at once to prevent flickering
      setUserPrograms(programs);
      
      if (mostRecentProgram && mostRecentStatus !== ProgramStatus.Generating ) {
        // Set the most recent program as the active one
        setActiveProgram(mostRecentProgram);
        setProgram(mostRecentProgram.programs[0]);
        setAnswers(mostRecentProgram.questionnaire);
        
        // Only update the status to Done if we're not currently generating a new program
        if (programStatus !== ProgramStatus.Generating ) {
          setProgramStatus(ProgramStatus.Done);
        }
      } else if (mostRecentStatus && programStatus !== ProgramStatus.Generating) {
        // Only set status if no program was found AND we're not generating
        setProgramStatus(mostRecentStatus);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch initial user data when user logs in
  useEffect(() => {
    // Skip the first render in development due to strict mode
    if (process.env.NODE_ENV === 'development' && !isMounted.current) {
      isMounted.current = true;
      return;
    }
    // Don't start loading until auth is done
    if (authLoading) return;

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
        // Fetch the most recent program document
        const programsRef = collection(db, `users/${user.uid}/programs`);
        const q = query(programsRef, orderBy('createdAt', 'desc'), limit(1));
        const programsSnapshot = await getDocs(q);

        if (!programsSnapshot.empty && isSubscribed) {
          const programDoc = programsSnapshot.docs[0];
          const programData = programDoc.data();
          setAnswers(programData.questionnaire);
          setProgramStatus(programData.status);

          // Only fetch the program if status is Done
          if (programData.status === ProgramStatus.Done) {
            const programsCollectionRef = collection(
              db,
              `users/${user.uid}/programs/${programDoc.id}/programs`
            );
            const latestProgramQ = query(
              programsCollectionRef,
              orderBy('createdAt', 'desc'),
              limit(1)
            );
            const latestProgramSnapshot = await getDocs(latestProgramQ);

            if (!latestProgramSnapshot.empty) {
              const program =
                latestProgramSnapshot.docs[0].data() as ExerciseProgram;
              setProgram(program);
            } else {
              setProgram(null);
            }
          } else {
            setProgram(null);
          }
        } else if (isSubscribed) {
          setAnswers(null);
          setProgramStatus(null);
          setProgram(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [user, authLoading]);

  const onQuestionnaireSubmit = async (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ): Promise<{ requiresAuth?: boolean; programId?: string }> => {
    // If user is not authenticated, store the data and return requiresAuth flag
    if (!user) {
      setPendingQuestionnaire({ diagnosis, answers });
      return { requiresAuth: true };
    }

    try {
      // Clear existing program state before navigation
      setProgram(null);
      setActiveProgram(null);
      
      // Update local state
      setAnswers(answers);
      
      // Set program status to generating after clearing program state
      setProgramStatus(ProgramStatus.Generating);
      
      // Delay navigation slightly to ensure state updates are processed
      setTimeout(() => {
        // Directly navigate to the program page
        router.push('/program');
      }, 10);

      // Submit questionnaire and generate program
      const programId = await submitQuestionnaire(user.uid, diagnosis, answers);

      return { programId };
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setProgramStatus(ProgramStatus.Error);
      throw error;
    }
  };

  // Effect to handle successful login with pending questionnaire
  useEffect(() => {
    if (user && pendingQuestionnaire) {
      // Submit the pending questionnaire
      onQuestionnaireSubmit(
        pendingQuestionnaire.diagnosis,
        pendingQuestionnaire.answers
      ).catch(console.error);
      // Clear the pending questionnaire
      setPendingQuestionnaire(null);
    }
  }, [user, pendingQuestionnaire]);

  // Function to select a specific program from the userPrograms array
  const selectProgram = (programIndex: number) => {
    if (programIndex >= 0 && programIndex < userPrograms.length) {
      const selectedProgram = userPrograms[programIndex];
      setActiveProgram(selectedProgram);
      setProgram(selectedProgram.programs[0]);
      setAnswers(selectedProgram.questionnaire);
      setProgramStatus(ProgramStatus.Done);
    }
  };

  // Function to toggle the active status of a program
  const toggleActiveProgram = (programIndex: number) => {
    if (!user) {
      console.error('User must be logged in to toggle program status');
      return;
    }
    
    if (programIndex >= 0 && programIndex < userPrograms.length) {
      const selectedProgram = userPrograms[programIndex];
      const programType = selectedProgram.type;
      const newActiveStatus = !selectedProgram.active;
      
      // Create a new array with updated active status locally
      const updatedPrograms = userPrograms.map((program, index) => {
        // If program is of the same type as the selected program
        if (program.type === programType) {
          // Set active based on whether this is the selected program
          return {
            ...program,
            active: index === programIndex ? newActiveStatus : false,
          };
        }
        // Leave programs of other types unchanged
        return program;
      });
      
      // Update local state first for immediate feedback
      setUserPrograms(updatedPrograms);
      
      // If we're setting the program to active, update the active program state
      if (newActiveStatus) {
        const updatedSelectedProgram = {
          ...selectedProgram,
          active: true
        };
        setActiveProgram(updatedSelectedProgram);
        setProgram(updatedSelectedProgram.programs[0]);
        setAnswers(updatedSelectedProgram.questionnaire);
        setProgramStatus(ProgramStatus.Done);
      }
      
      // Update in Firebase
      updateActiveProgramStatus(
        user.uid, 
        selectedProgram.docId, 
        programType, 
        newActiveStatus
      ).catch(error => {
        console.error('Error updating program active status:', error);
        // Revert to the previous state if there was an error
        setUserPrograms(userPrograms);
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        onQuestionnaireSubmit,
        answers,
        programStatus,
        program,
        userPrograms,
        activeProgram,
        isLoading,
        pendingQuestionnaire,
        setPendingQuestionnaire,
        selectProgram,
        toggleActiveProgram,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
