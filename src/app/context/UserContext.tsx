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
import { useRouter } from 'next/navigation';

interface UserContextType {
  onQuestionnaireSubmit: (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ) => Promise<{ requiresAuth?: boolean; programId?: string }>;
  answers: ExerciseQuestionnaireAnswers | null;
  programStatus: ProgramStatus | null;
  program: ExerciseProgram | null;
  userPrograms: UserProgram[];
  activeProgram: UserProgram | null;
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
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers | null>(null);
  const [programStatus, setProgramStatus] = useState<ProgramStatus | null>(null);
  const [program, setProgram] = useState<ExerciseProgram | null>(null);
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [activeProgram, setActiveProgram] = useState<UserProgram | null>(null);
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
      const programs: UserProgram[] = [];
      let mostRecentStatus: ProgramStatus | null = null;
      let mostRecentProgram: UserProgram | null = null;
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
            const userProgram: UserProgram = {
              programs: exercisePrograms,
              diagnosis: data.diagnosis,
              questionnaire: data.questionnaire,
              active: true, // Consider all programs as active
              createdAt: new Date(data.createdAt),
              updatedAt: updatedAt,
              type: data.type
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
      
      if (mostRecentProgram) {
        // Set the most recent program as the active one
        setActiveProgram(mostRecentProgram);
        setProgram(mostRecentProgram.programs[0]);
        setAnswers(mostRecentProgram.questionnaire);
        setProgramStatus(ProgramStatus.Done);
      } else if (mostRecentStatus) {
        // Only set status if no program was found
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
      setProgramStatus(ProgramStatus.Generating);
      
      // Update local state
      setAnswers(answers);
      setProgram(null); // Clear existing program as we're generating a new one

      // Directly navigate to the program page
      router.push('/program');

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
