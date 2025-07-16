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
import { useRouter, usePathname } from 'next/navigation';
import { enrichExercisesWithFullData } from '@/app/services/exerciseProgramService';
import { useLoader } from './LoaderContext';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { logAnalyticsEvent } from '../utils/analytics';
import { getProgramBySlug } from '../../../public/data/programs/recovery';

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

// Utility: combine multiple ExerciseProgram objects into a single "merged" program array with sequential week numbers
// Keeping it here (instead of a separate util file) for now to minimise the refactor footprint.
const mergePrograms = (
  programs: ExerciseProgram[]
): ExerciseProgram['program'] => {
  const allWeeks = programs.flatMap((p) => p?.program || []);
  return allWeeks.map((weekData, i) => ({
    ...weekData,
    week: i + 1, // renumber weeks sequentially starting at 1
  }));
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setIsLoading: showGlobalLoader } = useLoader();
  const { t, locale } = useTranslation();
  const isNorwegian = locale === 'nb';

  // Derive stable user identifiers for useEffect dependencies
  const userId = user?.uid;
  const isUserAuthenticated = !!user;

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
  const submissionInProgressRef = useRef(false);
  // Add a ref to track the currently active program ID
  const activeProgramIdRef = useRef<string | null>(null);

  // Helper that wires all related state when a program becomes the current one
  const prepareAndSetProgram = (userProgram: UserProgramWithId) => {
    activeProgramIdRef.current = userProgram.docId;
    setActiveProgram(userProgram);

    const combinedProgram: ExerciseProgram = {
      ...userProgram.programs[0],
      program: mergePrograms(userProgram.programs),
      docId: userProgram.docId,
    } as ExerciseProgram & { docId: string };

    setProgram(combinedProgram);
    setAnswers(userProgram.questionnaire);
    setDiagnosisData(userProgram.diagnosis);
  };

  // Helper to set a recovery program as the current program
  const setRecoveryProgram = async (recoveryProgram: ExerciseProgram) => {
    try {
      // Enrich the program with exercise data
      await enrichExercisesWithFullData(recoveryProgram, isNorwegian);
      
      // Get today's date for the program start
      const today = new Date();
      const todayISO = today.toISOString();
      
      // Convert Date objects to ISO strings and update dates to start from today
      const formattedProgram = {
        ...recoveryProgram,
        createdAt: todayISO, // Program starts today
        program: recoveryProgram.program.map((week, weekIdx) => {
          // Each week starts 7 days after the previous (Week 1 = today, Week 2 = +7 days, etc.)
          const weekStartDate = new Date(today.getTime() + weekIdx * 7 * 24 * 60 * 60 * 1000);
          return {
            ...week,
            createdAt: weekStartDate.toISOString()
          };
        })
      };
      
      // Store in sessionStorage for persistence across navigation
      window.sessionStorage.setItem('currentRecoveryProgram', JSON.stringify(formattedProgram));
      
      setProgram(formattedProgram as any);
      setActiveProgram(null); // No user program for recovery programs
      setProgramStatus(ProgramStatus.Done);
      setAnswers(null);
      setDiagnosisData(null);
      setIsLoading(false);
      showGlobalLoader(false);
    } catch (error) {
      console.error('Error enriching recovery program:', error);
      setIsLoading(false);
      showGlobalLoader(false);
    }
  };

  // Check if current path is a recovery program
  useEffect(() => {
    if (pathname && pathname.startsWith('/program/')) {
      const slug = pathname.replace('/program/', '');
      
      // Skip if it's a system path like 'day' or 'calendar'
      if (slug && !['day', 'calendar'].includes(slug.split('/')[0])) {
        const recoveryProgram = getProgramBySlug(slug);
        
        if (recoveryProgram) {
          showGlobalLoader(true, t('program.loadingData'));
          setRecoveryProgram(recoveryProgram);
          return;
        }
      }
    }
    
    // Check if we have a persisted recovery program in sessionStorage
    // This handles the case where user navigated away (e.g., to login) but should keep the program
    const persistedProgram = window.sessionStorage.getItem('currentRecoveryProgram');
    if (persistedProgram) {
      try {
        const recoveryProgram = JSON.parse(persistedProgram);
        console.log('Restoring recovery program from sessionStorage:', recoveryProgram.title);
        setProgram(recoveryProgram);
        setActiveProgram(null);
        setProgramStatus(ProgramStatus.Done);
        setAnswers(null);
        setDiagnosisData(null);
        setIsLoading(false);
        showGlobalLoader(false);
        return;
      } catch (error) {
        console.error('Error parsing persisted recovery program:', error);
        window.sessionStorage.removeItem('currentRecoveryProgram');
      }
    }
    
    // If we reach here and we're on login page without a recovery program, 
    // but user programs useEffect is blocked, we need to ensure loading states are handled
    if (pathname === '/login') {
      setIsLoading(false);
      showGlobalLoader(false);
    }
  }, [pathname, isNorwegian, t]);

  // Set up real-time listener for program status changes and latest program
  useEffect(() => {
    if (authLoading === undefined || authLoading === true) return;
    
    // Check if we're on a recovery program path - if so, skip user program loading
    if (pathname && pathname.startsWith('/program/')) {
      const slug = pathname.replace('/program/', '');
      if (slug && !['day', 'calendar'].includes(slug.split('/')[0])) {
        const recoveryProgram = getProgramBySlug(slug);
        if (recoveryProgram) {
          // Recovery program is being handled by the separate useEffect
          return;
        }
      }
    }
    
    // Check if we're in a save context (login page with save intent)
    const loginContext = window.sessionStorage.getItem('loginContext');
    const isInSaveContext = loginContext === 'saveProgram' || pathname === '/login';
    const hasPersistedRecovery = window.sessionStorage.getItem('currentRecoveryProgram');
    
    // If we're in save context and have a persisted recovery program, don't load user programs
    // This prevents clearing the recovery program during the save flow
    if (isInSaveContext && hasPersistedRecovery) {
      console.log('🔒 Save context detected with recovery program - skipping user program loading');
      return;
    }
    
    // If not in save context and we have a persisted recovery program, clear it
    // This ensures recovery programs don't persist when user navigates to regular user program areas
    if (!isInSaveContext && hasPersistedRecovery) {
      console.log('Clearing persisted recovery program - not in save context');
      window.sessionStorage.removeItem('currentRecoveryProgram');
    }
    
    let unsubscribe: (() => void) | null = null; // Initialize unsubscribe

    if (isUserAuthenticated && userId) { // Use derived values
      showGlobalLoader(true, t('program.loadingData'));
      // Show loader when starting to fetch data

      // Listen to all user programs
      const programsRef = collection(db, `users/${userId}/programs`); // Use derived userId
      const q = query(programsRef, orderBy('createdAt', 'desc'));

      // Assign the unsubscribe function returned by onSnapshot
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const programs: UserProgramWithId[] = [];
        let mostRecentStatus: ProgramStatus | null = null;
        let mostRecentProgram: UserProgramWithId | null = null;
        let mostRecentDate: Date | null = null;
        let activeProgram: UserProgramWithId | null = null;

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

        // First collect all programs
        for (const doc of snapshot.docs) {
          const data = doc.data();

          // Track the most recent status for any program
          if (!mostRecentStatus && data.status) {
            mostRecentStatus = data.status;
          }

          if (data.status === ProgramStatus.Done) {
            // Add all programs to the programs array for listing in UI
            const programsCollectionRef = collection(
              db,
              `users/${userId}/programs/${doc.id}/programs`
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
                  active: data.active ?? false,
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

                // If this program is active, store it separately
                if (data.active === true) {
                  activeProgram = userProgram;
                }

                // Track most recent program
                if (!mostRecentDate || updatedAt > mostRecentDate) {
                  mostRecentDate = updatedAt;
                  mostRecentProgram = userProgram;
                }
              }
            } catch (error) {
              // error captured but logging removed
            }
          }
        }

        // Set all programs regardless of which is active
        if (programs.length > 0) {
          setUserPrograms(programs);
        }

        // First priority: Process active program if found
        if (activeProgram) {
          const previousActiveProgramId = activeProgramIdRef.current; // Store previous ID

          setProgramStatus(ProgramStatus.Done);

          // Always refresh the program state in case new weeks were added
          prepareAndSetProgram(activeProgram);

          // Navigate to /program only if we're not already there AND
          // (it's the first time an active program is set OR the active program has changed meaningfully)
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/program') &&
            !window.location.pathname.includes('/exercises') &&
            (previousActiveProgramId === null || previousActiveProgramId !== activeProgram.docId)
          ) {
            router.push('/program');
          }

          // 250 ms delay to ensure the program is loaded
          setTimeout(() => {
            setIsLoading(false);
            showGlobalLoader(false);
          }, 500);
        }
        // Second priority: If no active program was found but we have programs, load the most recent
        else if (mostRecentProgram) {
          prepareAndSetProgram(mostRecentProgram);
          setIsLoading(false);
          showGlobalLoader(false);
        } else {
          // No active or most recent (status 'Done') program found.
          // This covers cases like: user has no programs, or programs exist but none are active/Done.
          // Ensure loaders are turned off as the initial loading/processing is complete.
          setIsLoading(false);
          showGlobalLoader(false);
        }

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
  }, [userId, isUserAuthenticated, authLoading, pathname, router, t, isNorwegian]); // Added pathname to dependencies

  // On initial load, check localStorage for pending questionnaire flag
  useEffect(() => {
    const hasPendingQuestionnaireFlag =
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';
    // removed logging

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
          // error captured but logging removed

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
      // removed logging
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
          logAnalyticsEvent('questionnaire_saved', { email });

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
          // error captured but logging removed
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
      logAnalyticsEvent('questionnaire_submitted', {
        programType: diagnosis.programType,
        programId,
      });

      submissionInProgressRef.current = false;
      return { programId };
    } catch (error) {
      // logging removed
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
          // removed logging
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
            // removed logging
            const storedQuestionnaire =
              await getPendingQuestionnaire(pendingEmail);

            if (storedQuestionnaire) {
              // removed logging
              await onQuestionnaireSubmit(
                storedQuestionnaire.diagnosis,
                storedQuestionnaire.answers
              );

              // Delete the pending questionnaire after submission
              await deletePendingQuestionnaire(pendingEmail);
            } else {
              // no questionnaire found, logging removed
            }
          }
        } catch (error) {
          // error captured but logging removed
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

    // If user has program already, select it
    if (userPrograms && userPrograms.length > index && userPrograms[index]) {
      const selectedProgram = userPrograms[index];

      // Make sure the program has a programs array and it's not empty
      if (
        !selectedProgram.programs ||
        !Array.isArray(selectedProgram.programs) ||
        selectedProgram.programs.length === 0
      ) {
        // invalid data, logging removed
        return;
      }

      setActiveProgram(selectedProgram);

      // Make sure we have at least one valid program with program array
      if (!selectedProgram.programs[0]) {
        // missing program data, logging removed
        return;
      }

      prepareAndSetProgram(selectedProgram);
    }
    showGlobalLoader(false);
  };

  // Toggle the active status of a program (optimistic UI, then Firestore)
  const toggleActiveProgram = (programIndex: number): Promise<void> => {
    if (!user) {
      // removed logging
      return Promise.reject(new Error(t('userContext.error.userLoggedIn')));
    }

    if (programIndex < 0 || programIndex >= userPrograms.length) {
      return Promise.reject(
        new Error(t('userContext.error.invalidProgramIndex'))
      );
    }

    const selectedProgram = userPrograms[programIndex];
    const newActiveStatus = !selectedProgram.active;
    logAnalyticsEvent('toggle_program', {
      programId: selectedProgram.docId,
      active: newActiveStatus,
    });

    // Optimistically update local state
    const updatedPrograms = userPrograms.map((p, idx) =>
      idx === programIndex ? { ...p, active: newActiveStatus } : p
    );
    setUserPrograms(updatedPrograms);

    // If activated, immediately reflect in UI
    if (newActiveStatus) {
      const updatedSelected = { ...selectedProgram, active: true };
      prepareAndSetProgram(updatedSelected);
      setProgramStatus(ProgramStatus.Done);
    }

    // Persist change
    return updateActiveProgramStatus(
      user.uid,
      selectedProgram.docId,
      selectedProgram.type,
      newActiveStatus
    )
      .then(() => undefined)
      .catch((error) => {
        // Revert local change on failure
        setUserPrograms(userPrograms);
        throw error;
      });
  };

  const generateFollowUpProgram = async () => {
    setProgramStatus(ProgramStatus.Generating);
    logAnalyticsEvent('generate_follow_up');
    router.push('/program');
  };

  return (
    <UserContext.Provider
      value={{
        onQuestionnaireSubmit,
        answers,
        diagnosisData,
        programStatus,
        setProgramStatus: (status: ProgramStatus) => setProgramStatus(status),
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
