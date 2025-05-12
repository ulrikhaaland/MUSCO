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
import { useLoader } from './LoaderContext';
import { useTranslation } from '@/app/i18n/TranslationContext';

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
  diagnosisData: DiagnosisAssistantResponse | null;
  programStatus: ProgramStatus | null;
  setProgramStatus: (status: ProgramStatus) => void;
  program: ExerciseProgram | null;
  userPrograms: UserProgramWithId[]; // Updated to use the extended interface
  activeProgram: UserProgramWithId | null; // Updated to use the extended interface
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
  generateFollowUpProgram: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { setIsLoading: showGlobalLoader } = useLoader();
  const { t, locale } = useTranslation();
  const isNorwegian = locale === 'nb';
  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers | null>(
    null
  );
  const [diagnosisData, setDiagnosisData] =
    useState<DiagnosisAssistantResponse | null>(null);

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
    if (authLoading === undefined || authLoading === true) return;
    let unsubscribe: (() => void) | null = null; // Initialize unsubscribe
    let hasSetInitialProgram = false; // Track if we've loaded the initial program

    if (user) {
      // Show loader when starting to fetch data

      // Listen to all user programs
      const programsRef = collection(db, `users/${user.uid}/programs`);
      const q = query(programsRef, orderBy('createdAt', 'desc'));

      // Assign the unsubscribe function returned by onSnapshot
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const programs: UserProgramWithId[] = [];
        let mostRecentStatus: ProgramStatus | null = null;
        let mostRecentProgram: UserProgramWithId | null = null;
        let mostRecentDate: Date | null = null;
        let foundActiveProgram = false;

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
          return;
        }

        // First, look for any active program as that should be loaded first
        for (const doc of snapshot.docs) {
          const data = doc.data();

          // Track the most recent status for any program
          if (!mostRecentStatus && data.status) {
            mostRecentStatus = data.status;
          }

          if (data.status === ProgramStatus.Done && data.active === true) {
            foundActiveProgram = true;
            setProgramStatus(ProgramStatus.Done);

            // Process this active program first
            const programsCollectionRef = collection(
              db,
              `users/${user.uid}/programs/${doc.id}/programs`
            );
            const programQ = query(
              programsCollectionRef,
              orderBy('createdAt', 'desc')
            );

            try {
              const programSnapshot = await getDocs(programQ);

              if (!programSnapshot.empty) {
                const exercisePrograms = await Promise.all(
                  programSnapshot.docs.map(async (programDoc) => {
                    const program = programDoc.data() as ExerciseProgram;
                    await enrichExercisesWithFullData(program, isNorwegian);
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
                  active: data.active ?? true,
                  createdAt:
                    data.createdAt &&
                    typeof data.createdAt.toDate === 'function'
                      ? data.createdAt.toDate().toISOString()
                      : typeof data.createdAt === 'string'
                        ? data.createdAt
                        : new Date().toISOString(),
                  updatedAt: updatedAt,
                  type: data.type,
                  docId: doc.id,
                };

                // Add to programs array
                programs.push(userProgram);

                // Set as most recent program
                mostRecentProgram = userProgram;
                mostRecentDate = updatedAt;

                // Since this is active, set it as the active program immediately
                setActiveProgram(userProgram);

                // Use the first program as the base and combine all program weeks
                const allWeeks = userProgram.programs.flatMap(
                  (p) => p.program || []
                );
                const renumberedWeeks = allWeeks.map((weekData, i) => ({
                  ...weekData,
                  week: i + 1, // Renumber weeks sequentially starting from 1
                }));

                const combinedProgram = {
                  ...userProgram.programs[0], // Get basics from first program
                  program: renumberedWeeks,
                  docId: userProgram.docId,
                };

                // Set the program and mark loading as complete
                setProgram(combinedProgram);
                setAnswers(userProgram.questionnaire);
                setDiagnosisData(userProgram.diagnosis);
              }
            } catch (error) {
              console.error(
                t('userContext.error.processingActiveProgram'),
                error
              );
            }

            // Break after processing the active program
            break;
          }
        }

        // If no active program was found, process the most recent program
        if (!foundActiveProgram) {
          for (const doc of snapshot.docs) {
            const data = doc.data();

            if (data.status === ProgramStatus.Done) {
              const programsCollectionRef = collection(
                db,
                `users/${user.uid}/programs/${doc.id}/programs`
              );
              const programQ = query(
                programsCollectionRef,
                orderBy('createdAt', 'desc')
              );

              try {
                const programSnapshot = await getDocs(programQ);

                if (!programSnapshot.empty) {
                  const exercisePrograms = await Promise.all(
                    programSnapshot.docs.map(async (programDoc) => {
                      const program = programDoc.data() as ExerciseProgram;
                      await enrichExercisesWithFullData(program, isNorwegian);
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
                    active: data.active ?? true,
                    createdAt:
                      data.createdAt &&
                      typeof data.createdAt.toDate === 'function'
                        ? data.createdAt.toDate().toISOString()
                        : typeof data.createdAt === 'string'
                          ? data.createdAt
                          : new Date().toISOString(),
                    updatedAt: updatedAt,
                    type: data.type,
                    docId: doc.id,
                  };

                  // Add to programs array
                  programs.push(userProgram);

                  // Check if this is the most recent program we've seen
                  if (!mostRecentDate || updatedAt > mostRecentDate) {
                    mostRecentDate = updatedAt;
                    mostRecentProgram = userProgram;
                  }

                  // If this is the first program we've processed, set it immediately
                  if (!hasSetInitialProgram) {
                    setActiveProgram(userProgram);

                    // Use the first program as the base and combine all program weeks
                    const allWeeks = userProgram.programs.flatMap(
                      (p) => p.program || []
                    );
                    const renumberedWeeks = allWeeks.map((weekData, i) => ({
                      ...weekData,
                      week: i + 1, // Renumber weeks sequentially starting from 1
                    }));

                    const combinedProgram = {
                      ...userProgram.programs[0], // Get basics from first program
                      program: renumberedWeeks,
                      docId: userProgram.docId,
                    };

                    setProgram(combinedProgram);
                    setAnswers(userProgram.questionnaire);
                    setDiagnosisData(userProgram.diagnosis);
                    setIsLoading(false);
                    showGlobalLoader(false);
                    hasSetInitialProgram = true;

                    // Break after handling the first program to speed up initial loading
                    break;
                  }
                }
              } catch (error) {
                console.error(t('userContext.error.processingProgram'), error);
              }
            }
          }
        }

        // Continue loading all programs in the background
        setTimeout(async () => {
          try {
            const allPrograms: UserProgramWithId[] = [];

            // Process all remaining programs
            for (const doc of snapshot.docs) {
              const data = doc.data();

              // Skip programs we've already processed
              if (programs.some((p) => p.docId === doc.id)) {
                allPrograms.push(programs.find((p) => p.docId === doc.id)!);
                continue;
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

                try {
                  const programSnapshot = await getDocs(programQ);

                  if (!programSnapshot.empty) {
                    const exercisePrograms = await Promise.all(
                      programSnapshot.docs.map(async (programDoc) => {
                        const program = programDoc.data() as ExerciseProgram;
                        await enrichExercisesWithFullData(program, isNorwegian);
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
                      active: data.active ?? true,
                      createdAt:
                        data.createdAt &&
                        typeof data.createdAt.toDate === 'function'
                          ? data.createdAt.toDate().toISOString()
                          : typeof data.createdAt === 'string'
                            ? data.createdAt
                            : new Date().toISOString(),
                      updatedAt: updatedAt,
                      type: data.type,
                      docId: doc.id,
                    };

                    allPrograms.push(userProgram);

                    // Check if this is the most recent program we've seen
                    if (!mostRecentDate || updatedAt > mostRecentDate) {
                      mostRecentDate = updatedAt;
                      mostRecentProgram = userProgram;
                    }
                  }
                } catch (error) {
                  console.error(
                    t('userContext.error.processingProgramBackground'),
                    error
                  );
                }
              }
            }

            // Update all programs
            if (allPrograms.length > 0) {
              setUserPrograms(allPrograms);
            }
          } catch (error) {
            console.error(
              t('userContext.error.loadingProgramsBackground'),
              error
            );
          }
        }, 100); // Small delay to let the UI render first

        // Set the program status if we found one
        if (
          mostRecentProgram &&
          mostRecentStatus !== ProgramStatus.Generating
        ) {
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
    } else {
      // Explicitly reset state when user is null (logged out)
      setProgram(null);
      setUserPrograms([]);
      setActiveProgram(null);
      setProgramStatus(null);
      setIsLoading(false);
      showGlobalLoader(false); // Hide loader when user is logged out
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Call the unsubscribe function if it exists
      }
      showGlobalLoader(false); // Ensure loader is hidden when component unmounts
    };
  }, [user, authLoading, router, t, isNorwegian]); // Added isNorwegian to dependencies

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

    // Safety timeout to ensure loading eventually completes
    const safetyTimer = setTimeout(() => {
      console.log(t('userContext.log.timeout'));
      if (isSubscribed) {
        setIsLoading(false);
        showGlobalLoader(false);
      }
    }, 15000); // 15 seconds max loading time

    async function fetchUserData() {
      if (!user) {
        setAnswers(null);
        setDiagnosisData(null);
        setProgramStatus(null);
        setProgram(null);
        setIsLoading(false);
        showGlobalLoader(false);
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
          // setIsLoading(false);
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
            setDiagnosisData(programData.diagnosis);
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
                    await enrichExercisesWithFullData(program, isNorwegian);
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
            setDiagnosisData(null);
            setProgramStatus(null);
            setProgram(null);
          }
          if (
            typeof window !== 'undefined' &&
            window.location.pathname == '/'
          ) {
            // Keep isLoading true until program page sets it to false
            setIsLoading(true);
            showGlobalLoader(true, t('userContext.loading.programPage'));

            // Navigate to program page, but don't set isLoading=false here
            router.push('/program');
            return;
          }

          // Only set isLoading to false after we've completed all program fetching
          // setIsLoading(false);
        }
      } catch (error) {
        console.error(t('userContext.error.fetchingUserData'), error);
        if (isSubscribed) {
          setIsLoading(false);
          showGlobalLoader(false);
        }
      }
    }

    fetchUserData();

    // Cleanup function
    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      showGlobalLoader(false); // Ensure loader is hidden when component unmounts
    };
  }, [user, authLoading, router, t, isNorwegian]); // Added isNorwegian to dependencies

  // On initial load, check localStorage for pending questionnaire flag
  useEffect(() => {
    const hasPendingQuestionnaireFlag =
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';
    console.log(
      t('userContext.log.checkingQuestionnaire'),
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
  }, [t]); // Added t to dependencies

  const onQuestionnaireSubmit = async (
    diagnosis: DiagnosisAssistantResponse,
    answers: ExerciseQuestionnaireAnswers
  ): Promise<{ requiresAuth?: boolean; programId?: string }> => {
    // Prevent duplicate submissions
    if (submissionInProgressRef.current) {
      console.log(t('userContext.log.submissionInProgress'));
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
          console.log(t('userContext.log.storedQuestionnaire'), email);

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
          console.error(t('userContext.error.storingQuestionnaire'), error);
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
      setDiagnosisData(diagnosis);
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
      console.error(t('userContext.error.submittingQuestionnaire'), error);
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
          console.log(t('userContext.log.skipAutomaticSubmission'));
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
              t('userContext.log.checkingQuestionnaire'),
              pendingEmail
            );
            const storedQuestionnaire =
              await getPendingQuestionnaire(pendingEmail);

            if (storedQuestionnaire) {
              console.log(t('userContext.log.foundQuestionnaire'));
              await onQuestionnaireSubmit(
                storedQuestionnaire.diagnosis,
                storedQuestionnaire.answers
              );

              // Delete the pending questionnaire after submission
              await deletePendingQuestionnaire(pendingEmail);
            } else {
              console.log(t('userContext.log.noQuestionnaire'), pendingEmail);
            }
          }
        } catch (error) {
          console.error(t('userContext.error.processingQuestionnaire'), error);
        }
      };

      if (
        hasPendingQuestionnaireFlag ||
        (pendingQuestionnaire && Object.keys(pendingQuestionnaire).length > 0)
      ) {
        handlePendingQuestionnaire();
      }
    }
  }, [user, authLoading, pendingQuestionnaire, t]); // Added t to dependencies

  // Function to select a specific program from the userPrograms array
  const selectProgram = (index: number) => {
    showGlobalLoader(true, t('userContext.loading.program'));
    console.log(`${t('userContext.log.selectingProgram')} ${index}`);
    
    // If user has program already, select it
    if (userPrograms && userPrograms.length > index && userPrograms[index]) {
      const selectedProgram = userPrograms[index];

      // Make sure the program has a programs array and it's not empty
      if (
        !selectedProgram.programs ||
        !Array.isArray(selectedProgram.programs) ||
        selectedProgram.programs.length === 0
      ) {
        console.error(
          'Invalid program data: programs array is missing or empty',
          selectedProgram
        );
        return;
      }

      setActiveProgram(selectedProgram);

      // Log program info for debugging
      console.log(t('userContext.debug.selectedProgram'));
      console.log(
        t('userContext.debug.numberPrograms'),
        selectedProgram.programs.length
      );
      selectedProgram.programs.forEach((p, i) => {
        console.log(`Program ${i + 1} weeks:`, p?.program?.length || 0);
        if (p?.program) {
          p.program.forEach((w, j) =>
            console.log(`Program ${i + 1} Week ${j + 1}:`, w?.week)
          );
        }
      });

      // Make sure we have at least one valid program with program array
      if (!selectedProgram.programs[0]) {
        console.error(
          'First program in collection is missing',
          selectedProgram
        );
        return;
      }

      const allWeeks = selectedProgram.programs.flatMap(
        (p) => p?.program || []
      );
      const renumberedWeeks = allWeeks.map((weekData, i) => ({
        ...weekData,
        week: i + 1, // Renumber weeks sequentially starting from 1
      }));

      const combinedProgram = {
        ...selectedProgram.programs[0],
        program: renumberedWeeks,
        docId: selectedProgram.docId,
      };

      console.log(t('userContext.debug.combinedProgram'));
      console.log(
        t('userContext.debug.totalWeeks'),
        combinedProgram?.program?.length || 0
      );
      if (combinedProgram?.program) {
        combinedProgram.program.forEach((w, i) =>
          console.log(
            `${t('userContext.debug.combinedWeek')} ${i + 1}:`,
            w?.week
          )
        );
      }

      setProgram(combinedProgram);
      setIsLoading(false);

      setAnswers(selectedProgram.questionnaire);
      setDiagnosisData(selectedProgram.diagnosis);
    } else {
      console.error(
        `Cannot select program at index ${index}: program not found`
      );
    }
    showGlobalLoader(false);
  };

  // Function to toggle the active status of a program
  const toggleActiveProgram = (programIndex: number): Promise<void> => {
    if (!user) {
      console.error(t('userContext.error.userLoggedIn'));
      return Promise.reject(new Error(t('userContext.error.userLoggedIn')));
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
        setIsLoading(false);

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

    return Promise.reject(
      new Error(t('userContext.error.invalidProgramIndex'))
    );
  };

  const generateFollowUpProgram = async () => {
    setProgramStatus(ProgramStatus.Generating);
    router.push('/program');
  };

  return (
    <UserContext.Provider
      value={{
        onQuestionnaireSubmit,
        answers,
        diagnosisData,
        programStatus,
        setProgramStatus: (status: ProgramStatus) => {
          setProgramStatus(status);
        },
        program,
        userPrograms,
        activeProgram,
        isLoading,
        setIsLoading,
        pendingQuestionnaire,
        setPendingQuestionnaire,
        selectProgram,
        toggleActiveProgram,
        generateFollowUpProgram,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
