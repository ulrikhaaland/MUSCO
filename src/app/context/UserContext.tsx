'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../shared/types';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useAuth } from './AuthContext';
import { db } from '@/app/firebase/config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
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
import { useTranslation } from '@/app/i18n/TranslationContext';
import { logAnalyticsEvent } from '../utils/analytics';

import { 
  loadRecoveryProgram, 
  isRecoveryProgramSlug, 
  clearRecoveryProgramFromSession,
  hasRecoveryProgramInSession,
  getRecoveryProgramFromSession,
  
} from '../services/recoveryProgramService';



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
  loadUserPrograms: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

// Note: Removed mergePrograms function as it was causing duplicate days
// User programs and recovery programs should use the same structure

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Global loader removed
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
    console.log('🔧 Setting program:', userProgram.title, '(', userProgram.docId, ')');

    activeProgramIdRef.current = userProgram.docId;
    setActiveProgram(userProgram);

    // Use the first program (Week 1) as the primary program for display
    // but keep the full programs array in userProgram for multi-week support
    const primaryProgram: ExerciseProgram = {
      ...userProgram.programs[0], // Week 1 metadata and date
      docId: userProgram.docId,
      createdAt: userProgram.programs[0]?.createdAt || new Date(),
    } as ExerciseProgram & { docId: string };

    setProgram(primaryProgram);
    setAnswers(userProgram.questionnaire);
    setDiagnosisData(userProgram.diagnosis);
  };

  // Helper to set a recovery program as the current program
  const setRecoveryProgram = async (slug: string) => {
    try {
      const sessionData = await loadRecoveryProgram(slug, isNorwegian);
      if (!sessionData) {
        console.error('Recovery program not found for slug:', slug);
        setIsLoading(false);
        return;
      }

      // Use the existing prepareAndSetProgram helper to set up the program properly
      prepareAndSetProgram(sessionData.userProgram as UserProgramWithId);
      
      setProgramStatus(ProgramStatus.Done);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading recovery program:', error);
      setIsLoading(false);
    }
  };

  // Check if current path is a recovery program
  useEffect(() => {
    if (pathname && pathname.startsWith('/program/')) {
      const slug = pathname.replace('/program/', '');
      
      // Skip if it's a system path like 'day' or 'calendar'
      if (slug && !['day', 'calendar'].includes(slug.split('/')[0])) {
        if (isRecoveryProgramSlug(slug)) {
          // loader removed
          setRecoveryProgram(slug);
          return;
        }
      }
    }
    
    // Check if we have a persisted recovery program in sessionStorage
    // This handles the case where user navigated away (e.g., to login) but should keep the program
    const sessionData = getRecoveryProgramFromSession();
    if (sessionData) {
      try {
        console.log('Restoring recovery program from sessionStorage:', sessionData.userProgram.title);
        
        // Convert string dates back to Date objects
        const userProgram: UserProgramWithId = {
          ...sessionData.userProgram,
          docId: 'temp-recovery-program', // Temporary ID for unsaved recovery programs
          createdAt: sessionData.userProgram.createdAt,
          updatedAt: new Date(sessionData.userProgram.updatedAt),
          programs: sessionData.userProgram.programs.map((prog: any) => ({
            ...prog,
            createdAt: new Date(prog.createdAt)
          }))
        };
        
        prepareAndSetProgram(userProgram);
        setProgramStatus(ProgramStatus.Done);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error restoring recovery program from session:', error);
        clearRecoveryProgramFromSession();
      }
    }
    
    // If we reach here and we're on login page without a recovery program, 
    // but user programs useEffect is blocked, we need to ensure loading states are handled
    if (pathname === '/login') {
      setIsLoading(false);
    }
  }, [pathname, isNorwegian, t]);

  // Check for save context and handle recovery program clearing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loginContext = window.sessionStorage.getItem('loginContext');
    const isInSaveContext = loginContext === 'saveProgram' || pathname === '/login';
    const hasPersistedRecovery = hasRecoveryProgramInSession();
    
    // If not in save context and we have a persisted recovery program, clear it
    // This ensures recovery programs don't persist when user navigates to regular user program areas
    if (!isInSaveContext && hasPersistedRecovery) {
      console.log('Clearing persisted recovery program - not in save context');
      clearRecoveryProgramFromSession();
    }
  }, [pathname]);

  // Set up real-time listener for program status changes and latest program
  useEffect(() => {
    console.log('🔍 UserContext main useEffect - auth state:', { authLoading, userId, isUserAuthenticated });
    
    // Only wait for auth loading if we don't have a user yet
    // If we have a user but authLoading is stuck, proceed anyway
    if (authLoading === true && !user) {
      console.log('🔍 Early return due to auth loading (no user yet)');
      return;
    }
    
    // Check if we're on a recovery program path - if so, skip user program loading
    if (pathname && pathname.startsWith('/program/')) {
      const slug = pathname.replace('/program/', '');
      if (slug && !['day', 'calendar'].includes(slug.split('/')[0])) {
        if (isRecoveryProgramSlug(slug)) {
          // Recovery program is being handled by the separate useEffect
          return;
        }
      }
    }
    
    // Debug: Check current session storage state
    const loginContext = window.sessionStorage.getItem('loginContext');
    const hasPersistedRecovery = hasRecoveryProgramInSession();
    console.log('🔍 UserContext debug:', { 
      loginContext, 
      hasPersistedRecovery, 
      pathname,
      userId: !!userId,
      isUserAuthenticated 
    });
    
    // Temporarily removed save context check to debug
    // if (loginContext === 'saveProgram' && hasPersistedRecovery) {
    //   console.log('🔒 Save context detected with recovery program - skipping user program loading');
    //   return;
    // }
    
    let unsubscribe: (() => void) | null = null; // Initialize unsubscribe

    if (isUserAuthenticated && userId) { // Use derived values
      // loader removed

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
              orderBy('createdAt', 'asc') // Changed to ascending so Week 1 comes first
            );

            try {
              const programSnapshot = await getDocs(programQ);
              


              if (!programSnapshot.empty) {
                const exercisePrograms = await Promise.all(
                  programSnapshot.docs.map(async (programDoc) => {
                    const programData = programDoc.data();
                    const program = programData as ExerciseProgram;
                    
                    // Convert Firestore Timestamp to JavaScript Date
                    if (programData.createdAt && typeof (programData.createdAt as any).toDate === 'function') {
                      program.createdAt = (programData.createdAt as any).toDate();
                    } else if (typeof programData.createdAt === 'string') {
                      program.createdAt = new Date(programData.createdAt);
                    }
                    
                    await enrichExercisesWithFullData(program, isNorwegian);
                    return program;
                  })
                );

                // Parse createdAt consistently
                const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
                  ? data.createdAt.toDate()
                  : typeof data.createdAt === 'string'
                    ? new Date(data.createdAt)
                    : new Date();

                // Parse updatedAt consistently  
                const updatedAt = data.updatedAt
                  ? (typeof data.updatedAt.toDate === 'function' 
                      ? data.updatedAt.toDate() 
                      : new Date(data.updatedAt))
                  : createdAt;

                const userProgram: UserProgramWithId = {
                  programs: exercisePrograms,
                  diagnosis: data.diagnosis,
                  questionnaire: data.questionnaire,
                  active: data.active ?? false,
                  createdAt: createdAt.toISOString(),
                  updatedAt: updatedAt,
                  type: data.type,
                  title: data.title || 'Exercise Program',
                  timeFrame: data.timeFrame,
                  docId: doc.id,
                };

                // Add to programs array
                programs.push(userProgram);

                // Track most recent program by updatedAt (for newly created programs)
                // Use updatedAt for comparison since it reflects the latest changes
                if (!mostRecentDate || updatedAt.getTime() > mostRecentDate.getTime()) {
                  mostRecentDate = updatedAt;
                  mostRecentProgram = userProgram;
                }

                // If this program is active, store it separately
                if (data.active === true) {
                  activeProgram = userProgram;
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

        // Determine which program to display: prioritize the most recent active program
        let programToDisplay: UserProgramWithId | null = null;
        
        if (activeProgram && mostRecentProgram) {
          // If we have both active and most recent, compare their dates
          const activeDate = new Date(activeProgram.updatedAt || activeProgram.createdAt);
          const recentDate = new Date(mostRecentProgram.updatedAt || mostRecentProgram.createdAt);
          
          // Use the most recent one, but prefer active if dates are very close (within 1 second)
          if (Math.abs(activeDate.getTime() - recentDate.getTime()) < 1000) {
            programToDisplay = activeProgram;
          } else {
            programToDisplay = activeDate.getTime() > recentDate.getTime() ? activeProgram : mostRecentProgram;
          }
        } else {
          // Fallback to whichever one we have
          programToDisplay = activeProgram || mostRecentProgram;
        }

        if (programToDisplay) {
          const previousActiveProgramId = activeProgramIdRef.current; // Store previous ID

          console.log('🔄 Auto-selected program:', programToDisplay.title);

          setProgramStatus(ProgramStatus.Done);

          // Always refresh the program state in case new weeks were added
          prepareAndSetProgram(programToDisplay);

          // Navigate to /program only if explicitly in a program context
          // Avoid redirecting generic sign-ins to /program
          const loginContext =
            typeof window !== 'undefined'
              ? window.sessionStorage.getItem('loginContext')
              : null;
          const isProgramFlow = loginContext === 'saveProgram';
          if (
            typeof window !== 'undefined' &&
            isProgramFlow &&
            !window.location.pathname.includes('/program') &&
            !window.location.pathname.includes('/exercises') &&
            (previousActiveProgramId === null || previousActiveProgramId !== programToDisplay.docId)
          ) {
            router.push('/program');
          }

          // 250 ms delay to ensure the program is loaded
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          // No active or most recent (status 'Done') program found.
          // This covers cases like: user has no programs, or programs exist but none are active/Done.
          // Ensure loaders are turned off as the initial loading/processing is complete.
          setIsLoading(false);
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
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Call the unsubscribe function if it exists
      }
      // loader removed
    };
  }, [userId, isUserAuthenticated, authLoading, isNorwegian]);

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

      // loader removed

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
      if (diagnosis.programType === ProgramType.Exercise || diagnosis.programType === ProgramType.ExerciseAndRecovery) {
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
    console.log('👆 selectProgram called with index:', index, '- selecting:', userPrograms[index]?.title);

    // If user has program already, select it
    if (userPrograms && userPrograms.length > index && userPrograms[index]) {
      const selectedProgram = userPrograms[index];

      // Make sure the program has a programs array and it's not empty
      if (
        !selectedProgram.programs ||
        !Array.isArray(selectedProgram.programs) ||
        selectedProgram.programs.length === 0
      ) {
        console.error('❌ Invalid program data - no programs array');
        return;
      }

      setActiveProgram(selectedProgram);

      // Make sure we have at least one valid program with program array
      if (!selectedProgram.programs[0]) {
        console.error('❌ Missing program data - no programs[0]');
        return;
      }

      prepareAndSetProgram(selectedProgram);
    } else {
      console.error('❌ Invalid index or no programs available:', { index, userProgramsLength: userPrograms?.length });
    }
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
    // loader removed
    logAnalyticsEvent('generate_follow_up');
    router.push('/program');
  };

  const loadUserPrograms = async () => {
    if (!userId || !isUserAuthenticated) return;
    
    // loader removed
    
    try {
      const programsRef = collection(db, `users/${userId}/programs`);
      const q = query(programsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const programs: UserProgramWithId[] = [];
      let mostRecentActiveProgram: UserProgramWithId | null = null;
      let mostRecentActiveDate: Date | null = null;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        if (data.status === ProgramStatus.Done) {
          const programsCollectionRef = collection(db, `users/${userId}/programs/${doc.id}/programs`);
          const programQ = query(programsCollectionRef, orderBy('createdAt', 'asc'));
          
          try {
            const programSnapshot = await getDocs(programQ);
            
            if (!programSnapshot.empty) {
              const exercisePrograms = await Promise.all(
                programSnapshot.docs.map(async (programDoc) => {
                  const programData = programDoc.data();
                  const program = programData as ExerciseProgram;
                  
                  if (programData.createdAt && typeof (programData.createdAt as any).toDate === 'function') {
                    program.createdAt = (programData.createdAt as any).toDate();
                  } else if (typeof programData.createdAt === 'string') {
                    program.createdAt = new Date(programData.createdAt);
                  }
                  
                  await enrichExercisesWithFullData(program, isNorwegian);
                  return program;
                })
              );

              // Parse createdAt consistently
              const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
                ? data.createdAt.toDate()
                : typeof data.createdAt === 'string'
                  ? new Date(data.createdAt)
                  : new Date();

              // Parse updatedAt consistently  
              const updatedAt = data.updatedAt
                ? (typeof data.updatedAt.toDate === 'function' 
                    ? data.updatedAt.toDate() 
                    : new Date(data.updatedAt))
                : createdAt;

              const userProgram: UserProgramWithId = {
                programs: exercisePrograms,
                diagnosis: data.diagnosis,
                questionnaire: data.questionnaire,
                active: data.active ?? false,
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt,
                type: data.type,
                title: data.title || 'Exercise Program',
                timeFrame: data.timeFrame,
                docId: doc.id,
              };

              programs.push(userProgram);

              // Track most recent active program
              if (data.active === true) {
                if (!mostRecentActiveDate || updatedAt.getTime() > mostRecentActiveDate.getTime()) {
                  mostRecentActiveDate = updatedAt;
                  mostRecentActiveProgram = userProgram;
                }
              }
            }
          } catch (error) {
            console.error('Error processing program', doc.id, ':', error);
          }
        }
      }
      
      setUserPrograms(programs);
      
      // Set the most recent active program
      if (mostRecentActiveProgram) {
        prepareAndSetProgram(mostRecentActiveProgram);
        setProgramStatus(ProgramStatus.Done);
      }
      
    } catch (error) {
      console.error('Error loading user programs:', error);
    } finally {
      // loader removed
    }
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
        loadUserPrograms,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
