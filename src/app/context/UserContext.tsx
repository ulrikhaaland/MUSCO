'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
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
import {
  ProgramStatus,
  ExerciseProgram,
  UserProgram,
} from '@/app/types/program';
import {
  submitQuestionnaire,
  storePendingQuestionnaire,
  getPendingQuestionnaire,
  deletePendingQuestionnaire,
} from '@/app/services/questionnaire';
import { updateActiveProgramStatus } from '@/app/services/program';
import { useRouter } from 'next/navigation';
import { enrichExercisesWithFullData } from '@/app/services/exerciseProgramService';

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
  userPrograms: UserProgramWithId[]; // Updated to use the extended interface
  activeProgram: UserProgramWithId | null; // Updated to use the extended interface
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
  toggleActiveProgram: (programIndex: number) => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers | null>(
    null
  );
  const [programStatus, setProgramStatus] = useState<ProgramStatus | null>(
    null
  );
  const [program, setProgram] = useState<ExerciseProgram | null>(null);
  const [userPrograms, setUserPrograms] = useState<UserProgramWithId[]>([]);
  const [activeProgram, setActiveProgram] = useState<UserProgramWithId | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState<{
    diagnosis: DiagnosisAssistantResponse;
    answers: ExerciseQuestionnaireAnswers;
  } | null>(null);
  const isMounted = useRef(false);
  const submissionInProgressRef = useRef(false);

  // Set up real-time listener for program status changes and latest program
  useEffect(() => {
    if (!user) {
      return;
    }

    // Listen to all user programs
    const programsRef = collection(db, `users/${user.uid}/programs`);
    const q = query(programsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const programs: UserProgramWithId[] = [];
      let mostRecentStatus: ProgramStatus | null = null;
      let mostRecentProgram: UserProgramWithId | null = null;
      let mostRecentDate: Date | null = null;

      // Check if any program is currently being generated
      const hasGeneratingProgram = snapshot.docs.some(
        (doc) => doc.data().status === ProgramStatus.Generating
      );

      // If a program is being generated, set status and redirect to program page
      if (hasGeneratingProgram) {
        setProgramStatus(ProgramStatus.Generating);
        // Only navigate to program page if we're not already there
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/program')
        ) {
          router.push('/program');
        }
      }

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
          const programQ = query(
            programsCollectionRef,
            orderBy('createdAt', 'desc')
          );
          const programSnapshot = await getDocs(programQ);

          if (!programSnapshot.empty) {
            const exercisePrograms = await Promise.all(
              programSnapshot.docs.map(async (programDoc) => {
                const program = programDoc.data() as ExerciseProgram;
                await enrichExercisesWithFullData(program);
                return program;
              })
            );

            const updatedAt = data.updatedAt
              ? new Date(data.updatedAt)
              : new Date(data.createdAt);
            const userProgram: UserProgramWithId = {
              programs: exercisePrograms,
              diagnosis: data.diagnosis,
              questionnaire: data.questionnaire,
              active: data.active ?? true, // Use active status from Firebase or default to true
              createdAt: new Date(data.createdAt),
              updatedAt: updatedAt,
              type: data.type,
              docId: doc.id, // Store the document ID
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

      if (mostRecentProgram && mostRecentStatus !== ProgramStatus.Generating) {
        // Set the most recent program as the active one
        setActiveProgram(mostRecentProgram);

        // Use the first program as the base and combine all program weeks
        const allWeeks = mostRecentProgram.programs.flatMap(
          (p) => p.program || []
        );
        const renumberedWeeks = allWeeks.map((weekData, i) => ({
          ...weekData,
          week: i + 1, // Renumber weeks sequentially starting from 1
        }));

        const combinedProgram = {
          ...mostRecentProgram.programs[0], // Get basics from first program
          program: renumberedWeeks,
          docId: mostRecentProgram.docId,
        };

        setProgram(combinedProgram);
        setAnswers(mostRecentProgram.questionnaire);

        // Only update the status to Done if we're not currently generating a new program
        if (
          programStatus !== ProgramStatus.Generating &&
          !hasGeneratingProgram
        ) {
          setProgramStatus(ProgramStatus.Done);
        }
      } else if (
        mostRecentStatus &&
        programStatus !== ProgramStatus.Generating
      ) {
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
        // Check if any program is currently generating
        const generatingProgramsRef = collection(
          db,
          `users/${user.uid}/programs`
        );
        const generatingQ = query(
          generatingProgramsRef,
          where('status', '==', ProgramStatus.Generating)
        );
        const generatingSnapshot = await getDocs(generatingQ);

        if (!generatingSnapshot.empty && isSubscribed) {
          setProgramStatus(ProgramStatus.Generating);
          // Only navigate to program page if we're not already there
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/program')
          ) {
            router.push('/program');
          }
          // Early return as we're now handling the generating state
          setIsLoading(false);
          return;
        }

        // Fetch the most recent program document
        const programsRef = collection(db, `users/${user.uid}/programs`);
        const q = query(programsRef, orderBy('createdAt', 'desc'), limit(1));
        const programsSnapshot = await getDocs(q);

        // At this point, we've completed the program fetching process, so we can set isLoading to false
        // but only if we're still subscribed
        if (isSubscribed) {
          if (!programsSnapshot.empty) {
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
              // Get all program documents in the subcollection
              const allProgramsQuery = query(
                programsCollectionRef,
                orderBy('createdAt', 'desc')
              );
              const allProgramsSnapshot = await getDocs(allProgramsQuery);

              if (!allProgramsSnapshot.empty) {
                // Get all program weeks and enrich them
                const programWeeks = await Promise.all(
                  allProgramsSnapshot.docs.map(async (doc) => {
                    const program = doc.data() as ExerciseProgram;
                    await enrichExercisesWithFullData(program);
                    return program;
                  })
                );

                // Use the first program as the base and combine all program weeks
                const allWeeks = programWeeks.flatMap((p) => p.program || []);
                const renumberedWeeks = allWeeks.map((weekData, i) => ({
                  ...weekData,
                  week: i + 1, // Renumber weeks sequentially starting from 1
                }));

                const combinedProgram = {
                  ...programWeeks[0],
                  program: renumberedWeeks,
                  docId: programDoc.id,
                };

                setProgram(combinedProgram);
              } else {
                setProgram(null);
              }
            } else {
              setProgram(null);
            }
          } else {
            setAnswers(null);
            setProgramStatus(null);
            setProgram(null);
          }
          router.push('/program');

          // Only set isLoading to false after we've completed all program fetching
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    fetchUserData();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [user, authLoading]);

  // On initial load, check localStorage for pending questionnaire flag
  useEffect(() => {
    const hasPendingQuestionnaireFlag =
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';
    console.log(
      'Checking for pending questionnaire flag:',
      hasPendingQuestionnaireFlag
    );

    if (hasPendingQuestionnaireFlag && !pendingQuestionnaire) {
      // Extract from session storage if available
      const pendingDiagnosisJSON =
        window.sessionStorage.getItem('pendingDiagnosis');
      const pendingAnswersJSON =
        window.sessionStorage.getItem('pendingAnswers');

      if (pendingDiagnosisJSON && pendingAnswersJSON) {
        try {
          const diagnosis = JSON.parse(
            pendingDiagnosisJSON
          ) as DiagnosisAssistantResponse;
          const answers = JSON.parse(
            pendingAnswersJSON
          ) as ExerciseQuestionnaireAnswers;

          // Set the actual data from session storage
          setPendingQuestionnaire({ diagnosis, answers });
        } catch (e) {
          console.error(
            'Error parsing pending questionnaire from session storage:',
            e
          );

          // Set an empty placeholder so the UI shows login requirement
          setPendingQuestionnaire({
            diagnosis: {} as DiagnosisAssistantResponse,
            answers: {} as ExerciseQuestionnaireAnswers,
          });
        }
      } else {
        // Set an empty placeholder so the UI shows login requirement
        setPendingQuestionnaire({
          diagnosis: {} as DiagnosisAssistantResponse,
          answers: {} as ExerciseQuestionnaireAnswers,
        });
      }
    }
  }, []);

  const onQuestionnaireSubmit = async (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ): Promise<{ requiresAuth?: boolean; programId?: string }> => {
    // Prevent duplicate submissions
    if (submissionInProgressRef.current) {
      console.log('Submission already in progress, ignoring duplicate request');
      return {};
    }

    // If user is not authenticated, store the data and return requiresAuth flag
    if (!user) {
      // Store in local state
      setPendingQuestionnaire({ diagnosis, answers });

      // Get email from answers if provided, or from any input field
      const email = window.localStorage.getItem('userEmail');

      if (email) {
        try {
          // Store in Firebase using the email
          await storePendingQuestionnaire(email, diagnosis, answers);
          console.log('Stored pending questionnaire for email:', email);

          // Set flag in localStorage to indicate pending questionnaire
          window.localStorage.setItem('hasPendingQuestionnaire', 'true');
          window.localStorage.setItem('pendingQuestionnaireEmail', email);

          // Store in session storage as backup
          window.sessionStorage.setItem(
            'pendingDiagnosis',
            JSON.stringify(diagnosis)
          );
          window.sessionStorage.setItem(
            'pendingAnswers',
            JSON.stringify(answers)
          );
        } catch (error) {
          console.error('Error storing pending questionnaire:', error);
        }
      } else {
        // Store in session storage as backup
        window.sessionStorage.setItem(
          'pendingDiagnosis',
          JSON.stringify(diagnosis)
        );
        window.sessionStorage.setItem(
          'pendingAnswers',
          JSON.stringify(answers)
        );
        window.localStorage.setItem('hasPendingQuestionnaire', 'true');
      }

      return { requiresAuth: true };
    }

    submissionInProgressRef.current = true;

    try {
      // Clear existing program state before navigation
      setProgram(null);
      setActiveProgram(null);

      // Update local state
      setAnswers(answers);

      // Set program status to generating after clearing program state
      setProgramStatus(ProgramStatus.Generating);

      // Clear pending questionnaire data to prevent duplicate submissions
      window.localStorage.removeItem('hasPendingQuestionnaire');
      window.localStorage.removeItem('pendingQuestionnaireEmail');
      window.sessionStorage.removeItem('pendingDiagnosis');
      window.sessionStorage.removeItem('pendingAnswers');
      setPendingQuestionnaire(null);

      // Delay navigation slightly to ensure state updates are processed
      setTimeout(() => {
        // Directly navigate to the program page
        router.push('/program');
      }, 10);

      //remove neck from answers.targetAreas
      if (diagnosis.programType === ProgramType.Exercise) {
        answers.targetAreas = answers.targetAreas.filter(
          (area) => area !== 'Neck'
        );
      }

      // Submit questionnaire and generate program
      const programId = await submitQuestionnaire(user.uid, diagnosis, answers);

      submissionInProgressRef.current = false;
      return { programId };
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setProgramStatus(ProgramStatus.Error);
      submissionInProgressRef.current = false;
      throw error;
    }
  };

  // Effect to handle successful login with pending questionnaire
  useEffect(() => {
    if (user && !authLoading) {
      const hasPendingQuestionnaireFlag =
        window.localStorage.getItem('hasPendingQuestionnaire') === 'true';
      const pendingEmail =
        window.localStorage.getItem('pendingQuestionnaireEmail') || user.email;

      const handlePendingQuestionnaire = async () => {
        // Don't process if another submission is in progress
        if (submissionInProgressRef.current) {
          console.log(
            'Another submission is already in progress, skipping automatic submission'
          );
          return;
        }

        try {
          // First check for pending questionnaire in state
          if (
            pendingQuestionnaire &&
            pendingQuestionnaire.diagnosis &&
            Object.keys(pendingQuestionnaire.diagnosis).length > 0
          ) {
            // Submit the questionnaire directly
            await onQuestionnaireSubmit(
              pendingQuestionnaire.diagnosis,
              pendingQuestionnaire.answers
            );
          }
          // Then try to get it from Firebase using email
          else if (pendingEmail) {
            console.log(
              'Checking for pending questionnaire for email:',
              pendingEmail
            );
            const storedQuestionnaire = await getPendingQuestionnaire(
              pendingEmail
            );

            if (storedQuestionnaire) {
              console.log('Found pending questionnaire in Firebase');
              await onQuestionnaireSubmit(
                storedQuestionnaire.diagnosis,
                storedQuestionnaire.answers
              );

              // Delete the pending questionnaire after submission
              await deletePendingQuestionnaire(pendingEmail);
            } else {
              console.log(
                'No pending questionnaire found for email:',
                pendingEmail
              );
            }
          }
        } catch (error) {
          console.error('Error processing pending questionnaire:', error);
        }
      };

      if (
        hasPendingQuestionnaireFlag ||
        (pendingQuestionnaire && Object.keys(pendingQuestionnaire).length > 0)
      ) {
        handlePendingQuestionnaire();
      }
    }
  }, [user, authLoading, pendingQuestionnaire]);

  // Function to select a specific program from the userPrograms array
  const selectProgram = (index: number) => {
    console.log(`Selecting program at index ${index}`);
    // If user has program already, select it
    if (userPrograms && userPrograms.length > index) {
      setActiveProgram(userPrograms[index]);

      // Log program info for debugging
      console.log('=== DEBUG: Selected userProgram ===');
      console.log(
        'Number of programs in collection:',
        userPrograms[index].programs.length
      );
      userPrograms[index].programs.forEach((p, i) => {
        console.log(`Program ${i + 1} weeks:`, p.program?.length || 0);
        if (p.program) {
          p.program.forEach((w, j) =>
            console.log(`Program ${i + 1} Week ${j + 1}:`, w.week)
          );
        }
      });

      const allWeeks = userPrograms[index].programs.flatMap(
        (p) => p.program || []
      );
      const renumberedWeeks = allWeeks.map((weekData, i) => ({
        ...weekData,
        week: i + 1, // Renumber weeks sequentially starting from 1
      }));

      const combinedProgram = {
        ...userPrograms[index].programs[0],
        program: renumberedWeeks,
        docId: userPrograms[index].docId,
      };

      console.log('=== DEBUG: combinedProgram in selectProgram ===');
      console.log(
        'Total weeks in combined program:',
        combinedProgram.program?.length || 0
      );
      if (combinedProgram.program) {
        combinedProgram.program.forEach((w, i) =>
          console.log(`Combined Week ${i + 1}:`, w.week)
        );
      }

      setProgram(combinedProgram);
      setAnswers(userPrograms[index].questionnaire);
    }
  };

  // Function to toggle the active status of a program
  const toggleActiveProgram = (programIndex: number): Promise<void> => {
    if (!user) {
      console.error('User must be logged in to toggle program status');
      return Promise.reject(new Error('User must be logged in'));
    }

    if (programIndex >= 0 && programIndex < userPrograms.length) {
      const selectedProgram = userPrograms[programIndex];
      const programType = selectedProgram.type;
      const newActiveStatus = !selectedProgram.active;

      // Create a new array with updated active status
      const updatedPrograms = userPrograms.map((program, index) => {
        // If we're activating a program and it's of the same type as selected program
        if (newActiveStatus && program.type === programType) {
          // Set it active if it's the selected program, inactive otherwise
          return {
            ...program,
            active: index === programIndex,
          };
        }
        // If we're deactivating and this is the selected program
        else if (!newActiveStatus && index === programIndex) {
          return {
            ...program,
            active: false,
          };
        }
        // Otherwise leave the program unchanged
        return program;
      });

      // For better responsiveness, update local state IMMEDIATELY
      setUserPrograms(updatedPrograms);

      // If we're setting the program to active, update the active program state
      if (newActiveStatus) {
        const updatedSelectedProgram = {
          ...selectedProgram,
          active: true,
        };
        setActiveProgram(updatedSelectedProgram);

        // Combine all program weeks into one program object and renumber them
        const allWeeks = updatedSelectedProgram.programs.flatMap(
          (p) => p.program || []
        );
        const renumberedWeeks = allWeeks.map((weekData, i) => ({
          ...weekData,
          week: i + 1, // Renumber weeks sequentially starting from 1
        }));

        const combinedProgram = {
          ...updatedSelectedProgram.programs[0],
          program: renumberedWeeks,
          docId: updatedSelectedProgram.docId,
        };

        setProgram(combinedProgram);
        setAnswers(updatedSelectedProgram.questionnaire);
        setProgramStatus(ProgramStatus.Done);
      }

      // Update Firebase in the background (don't block the UI)
      return updateActiveProgramStatus(
        user.uid,
        selectedProgram.docId,
        programType,
        newActiveStatus
      )
        .then(() => {
          // Return void to satisfy the Promise<void> return type
          return;
        })
        .catch((error) => {
          console.error('Error updating program active status:', error);

          // If Firebase update fails, revert the local state
          const revertedPrograms = [...userPrograms]; // Use the original state
          setUserPrograms(revertedPrograms);

          throw error; // Re-throw the error so it can be caught by the caller
        });
    }

    return Promise.reject(new Error('Invalid program index'));
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
