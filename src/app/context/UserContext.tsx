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
  where,
  limit,
} from 'firebase/firestore';
import {
  ProgramStatus,
  ExerciseProgram,
  UserProgram,
  ProgramDay,
} from '@/app/types/program';
import {
  submitQuestionnaireIncremental,
  storePendingQuestionnaire,
  getPendingQuestionnaire,
  deletePendingQuestionnaire,
} from '@/app/services/questionnaire';
import { PartialProgram } from '@/app/types/incremental-program';
import { partialToDisplayProgram } from '@/app/services/incrementalProgramService';
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
  // Incremental generation state
  generatingDay: number | null; // Which day is currently being generated (1-7), null if not generating
  generatedDays: number[]; // Array of day numbers that have been generated
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
  
  // Incremental generation state
  const [generatingDay, setGeneratingDay] = useState<number | null>(null);
  const [generatedDays, setGeneratedDays] = useState<number[]>([]);
  const [_partialProgram, setPartialProgram] = useState<PartialProgram | null>(null);

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
    
    // Mark all days as generated for existing programs (not incrementally generating)
    setGeneratedDays([1, 2, 3, 4, 5, 6, 7]);
    setGeneratingDay(null);
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

  // Helper to fetch a single program document with its weeks/exercises
  const fetchProgramWithWeeks = async (
    uid: string,
    docId: string,
    docData: any
  ): Promise<UserProgramWithId | null> => {
    const programsCollectionRef = collection(db, `users/${uid}/programs/${docId}/programs`);
    const programQ = query(programsCollectionRef, orderBy('createdAt', 'asc'));

    try {
      const programSnapshot = await getDocs(programQ);
      if (programSnapshot.empty) return null;

      const exercisePrograms = await Promise.all(
        programSnapshot.docs.map(async (programDoc) => {
          const programData = programDoc.data();
          const prog = programData as ExerciseProgram;

          // Convert Firestore Timestamp to JavaScript Date
          if (programData.createdAt && typeof (programData.createdAt as any).toDate === 'function') {
            prog.createdAt = (programData.createdAt as any).toDate();
          } else if (typeof programData.createdAt === 'string') {
            prog.createdAt = new Date(programData.createdAt);
          }

          await enrichExercisesWithFullData(prog, isNorwegian);
          return prog;
        })
      );

      // Parse dates
      const createdAt = docData.createdAt?.toDate?.() 
        ?? (typeof docData.createdAt === 'string' ? new Date(docData.createdAt) : new Date());
      const updatedAt = docData.updatedAt?.toDate?.() 
        ?? (typeof docData.updatedAt === 'string' ? new Date(docData.updatedAt) : createdAt);

      return {
        programs: exercisePrograms,
        diagnosis: docData.diagnosis,
        questionnaire: docData.questionnaire,
        active: docData.active ?? false,
        createdAt: createdAt.toISOString(),
        updatedAt,
        type: docData.type,
        title: docData.title || 'Exercise Program',
        timeFrame: docData.timeFrame,
        docId,
      };
    } catch {
      return null;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    let unsubscribe: (() => void) | null = null;
    let initialLoadDone = false;

    if (isUserAuthenticated && userId) {
      const programsRef = collection(db, `users/${userId}/programs`);

      // OPTIMIZATION: First, quickly fetch only the active program for immediate display
      const loadActiveProgram = async () => {
        try {
          // Query for active program first (fast path)
          const activeQuery = query(
            programsRef,
            where('active', '==', true),
            where('status', '==', ProgramStatus.Done),
            limit(1)
          );
          const activeSnapshot = await getDocs(activeQuery);

          if (!activeSnapshot.empty) {
            const doc = activeSnapshot.docs[0];
            const data = doc.data();
            const userProgram = await fetchProgramWithWeeks(userId, doc.id, data);
            
            if (userProgram) {
              console.log('⚡ Fast-loaded active program:', userProgram.title);
              prepareAndSetProgram(userProgram);
              setUserPrograms([userProgram]); // Set initial array with just active program
              setProgramStatus(ProgramStatus.Done);
              setIsLoading(false);
              initialLoadDone = true;
              return;
            }
          }

          // No active program found, try most recent
          const recentQuery = query(
            programsRef,
            where('status', '==', ProgramStatus.Done),
            orderBy('updatedAt', 'desc'),
            limit(1)
          );
          const recentSnapshot = await getDocs(recentQuery);

          if (!recentSnapshot.empty) {
            const doc = recentSnapshot.docs[0];
            const data = doc.data();
            const userProgram = await fetchProgramWithWeeks(userId, doc.id, data);
            
            if (userProgram) {
              console.log('⚡ Fast-loaded most recent program:', userProgram.title);
              prepareAndSetProgram(userProgram);
              setUserPrograms([userProgram]);
              setProgramStatus(ProgramStatus.Done);
              setIsLoading(false);
              initialLoadDone = true;
            }
          } else {
            // No programs at all
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error in fast program load:', error);
          // Fall through to onSnapshot for full load
        }
      };

      // Start fast load
      loadActiveProgram();

      // Set up real-time listener for generation status and updates
      const listenerQuery = query(programsRef, orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(listenerQuery, async (snapshot) => {
        // Check if any program is currently being generated
        const generatingDoc = snapshot.docs.find(
          (doc) => doc.data().status === ProgramStatus.Generating
        );

        // Handle incremental generation updates (high priority)
        if (generatingDoc) {
          const data = generatingDoc.data();
          setProgramStatus(ProgramStatus.Generating);
          
          // Update incremental generation state from Firebase
          if (data.generatingDay !== undefined) {
            setGeneratingDay(data.generatingDay);
          }
          
          // If we have days, build the program for display
          if (data.days && Array.isArray(data.days)) {
            const generatedDayNumbers = data.days.map((d: ProgramDay) => d.day);
            setGeneratedDays(generatedDayNumbers);
            
            // Build display program from Firebase data
            const displayProgram: ExerciseProgram = {
              title: data.title || '',
              programOverview: data.programOverview || '',
              summary: data.summary || '',
              timeFrameExplanation: '',
              whatNotToDo: data.whatNotToDo || '',
              afterTimeFrame: data.afterTimeFrame || { expectedOutcome: '', nextSteps: '' },
              targetAreas: data.questionnaire?.targetAreas || [],
              bodyParts: data.questionnaire?.targetAreas || [],
              createdAt: data.createdAt?.toDate?.() || new Date(),
              days: [1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const existingDay = data.days.find((d: ProgramDay) => d.day === dayNum);
                return existingDay || {
                  day: dayNum,
                  description: '',
                  isRestDay: false,
                  exercises: [],
                  duration: 0,
                };
              }),
            };
            
            // Enrich exercises with full data
            await enrichExercisesWithFullData(displayProgram, isNorwegian);
            setProgram(displayProgram);
          } else {
            // No days yet, show skeleton
            const skeletonProgram: ExerciseProgram = {
              title: data.title || '',
              programOverview: data.programOverview || '',
              summary: data.summary || '',
              timeFrameExplanation: '',
              whatNotToDo: data.whatNotToDo || '',
              afterTimeFrame: data.afterTimeFrame || { expectedOutcome: '', nextSteps: '' },
              targetAreas: data.questionnaire?.targetAreas || [],
              bodyParts: data.questionnaire?.targetAreas || [],
              createdAt: new Date(),
              days: [1, 2, 3, 4, 5, 6, 7].map((day) => ({
                day,
                description: '',
                isRestDay: false,
                exercises: [],
                duration: 0,
              })),
            };
            setProgram(skeletonProgram);
          }
          
          // Navigate to program page if not already there
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/program')
          ) {
            router.push('/program');
          }
          return;
        }

        // If initial load already done and not generating, skip heavy processing
        // The user will call loadUserPrograms() when they need all programs
        if (initialLoadDone) {
          // Just check if we need to update the current program (e.g., new week added)
          const currentDocId = activeProgramIdRef.current;
          if (currentDocId) {
            const updatedDoc = snapshot.docs.find(doc => doc.id === currentDocId);
            if (updatedDoc) {
              const data = updatedDoc.data();
              // Check if program was updated (e.g., new week)
              const updatedProgram = await fetchProgramWithWeeks(userId, currentDocId, data);
              if (updatedProgram) {
                prepareAndSetProgram(updatedProgram);
                // Update in userPrograms array
                setUserPrograms(prev => {
                  const idx = prev.findIndex(p => p.docId === currentDocId);
                  if (idx >= 0) {
                    const newList = [...prev];
                    newList[idx] = updatedProgram;
                    return newList;
                  }
                  return prev;
                });
              }
            }
          }
          return;
        }

        // Full load only if fast load didn't work (fallback)
        const programs: UserProgramWithId[] = [];
        let mostRecentProgram: UserProgramWithId | null = null;
        let mostRecentDate: Date | null = null;
        let foundActiveProgram: UserProgramWithId | null = null;

        for (const doc of snapshot.docs) {
          const data = doc.data();

          if (data.status === ProgramStatus.Done) {
            const userProgram = await fetchProgramWithWeeks(userId, doc.id, data);
            if (userProgram) {
              programs.push(userProgram);

              const updatedAt = new Date(userProgram.updatedAt || userProgram.createdAt);
              if (!mostRecentDate || updatedAt.getTime() > mostRecentDate.getTime()) {
                mostRecentDate = updatedAt;
                mostRecentProgram = userProgram;
              }

              if (data.active === true) {
                foundActiveProgram = userProgram;
              }
            }
          }
        }

        if (programs.length > 0) {
          setUserPrograms(programs);
        }

        const programToDisplay = foundActiveProgram || mostRecentProgram;

        if (programToDisplay) {
          const previousActiveProgramId = activeProgramIdRef.current;

          console.log('🔄 Auto-selected program:', programToDisplay.title);
          setProgramStatus(ProgramStatus.Done);
          prepareAndSetProgram(programToDisplay);

          // Navigate to /program only if explicitly in a program context
          const ctx = typeof window !== 'undefined'
            ? window.sessionStorage.getItem('loginContext')
            : null;
          const isProgramFlow = ctx === 'saveProgram';
          if (
            typeof window !== 'undefined' &&
            isProgramFlow &&
            !window.location.pathname.includes('/program') &&
            !window.location.pathname.includes('/exercises') &&
            (previousActiveProgramId === null || previousActiveProgramId !== programToDisplay.docId)
          ) {
            router.push('/program');
          }

          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          // No active or most recent (status 'Done') program found.
          setIsLoading(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch {
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
      // Clear existing program state
      setActiveProgram(null);
      
      // Reset incremental generation state (0 = generating metadata, 1-7 = generating days)
      setGeneratingDay(0);
      setGeneratedDays([]);
      setPartialProgram(null);

      // Create skeleton program immediately so UI shows full week from start
      const skeletonProgram: ExerciseProgram = {
        title: '',
        programOverview: '',
        summary: '',
        timeFrameExplanation: '',
        whatNotToDo: '',
        afterTimeFrame: { expectedOutcome: '', nextSteps: '' },
        targetAreas: answers.targetAreas,
        bodyParts: answers.targetAreas,
        createdAt: new Date(),
        days: [1, 2, 3, 4, 5, 6, 7].map((day) => ({
          day,
          description: '',
          isRestDay: false,
          exercises: [],
          duration: 0,
        })),
      };
      setProgram(skeletonProgram);

      // Update local state
      setAnswers(answers);
      setDiagnosisData(diagnosis);
      // Set program status to generating after setting skeleton program
      setProgramStatus(ProgramStatus.Generating);

      // loader removed

      // Clear pending questionnaire data to prevent duplicate submissions
      window.localStorage.removeItem('hasPendingQuestionnaire');
      window.localStorage.removeItem('pendingQuestionnaireEmail');
      window.sessionStorage.removeItem('pendingDiagnosis');
      window.sessionStorage.removeItem('pendingAnswers');
      setPendingQuestionnaire(null);

      // Navigate immediately - don't wait for Firebase operations
      router.push('/program');

      //remove neck from answers.targetAreas
      if (diagnosis.programType === ProgramType.Exercise || diagnosis.programType === ProgramType.ExerciseAndRecovery) {
        answers.targetAreas = answers.targetAreas.filter(
          (area) => area !== 'Neck'
        );
      }

      // Submit questionnaire and generate program incrementally
      // Don't await - let Firebase operations happen in background while user sees the program page
      submitQuestionnaireIncremental(
        user.uid,
        diagnosis,
        answers,
        {
          onMetadataReady: async (partial) => {
            console.log('[UserContext] Metadata ready, starting day generation');
            setPartialProgram(partial);
            // Metadata done, now starting day 1 generation
            setGeneratingDay(1);
            // Update skeleton program with metadata (keep placeholder days)
            setProgram((prev) => prev ? {
              ...prev,
              title: partial.title,
              programOverview: partial.programOverview,
              summary: partial.summary,
              whatNotToDo: partial.whatNotToDo,
              afterTimeFrame: partial.afterTimeFrame,
            } : partialToDisplayProgram(partial));
          },
          onDayGenerated: async (day, dayNumber, partial) => {
            console.log(`[UserContext] Day ${dayNumber} generated`);
            setPartialProgram(partial);
            setGeneratedDays((prev) => [...prev, dayNumber]);
            setGeneratingDay(dayNumber < 7 ? dayNumber + 1 : null);
            // Update display program with new day
            const displayProgram = partialToDisplayProgram(partial);
            // Enrich exercises with full data
            await enrichExercisesWithFullData(displayProgram, isNorwegian);
            setProgram(displayProgram);
          },
          onComplete: async (finalProgram) => {
            console.log('[UserContext] Program generation complete');
            // Log the full program for debugging
            console.log('\n========== GENERATED PROGRAM ==========');
            console.log('Title:', finalProgram.title);
            console.log('Overview:', finalProgram.programOverview);
            console.log('\n--- WEEKLY SCHEDULE ---');
            finalProgram.days?.forEach((day) => {
              console.log(`\nDAY ${day.day}: ${day.isRestDay ? '(REST)' : day.isCardioDay ? '(CARDIO)' : '(STRENGTH)'}`);
              console.log('Description:', day.description);
              console.log('Duration:', day.duration, 'min');
              console.log('Exercises:');
              day.exercises?.forEach((ex, i) => {
                const label = ex.warmup ? '[WARMUP]' : '';
                const bodyPart = ex.bodyPart || 'unknown';
                console.log(`  ${i + 1}. ${ex.name || ex.exerciseId} ${label} - ${bodyPart}`);
              });
            });
            console.log('\n========================================\n');
            // Enrich final program
            await enrichExercisesWithFullData(finalProgram, isNorwegian);
            setProgram(finalProgram);
            setPartialProgram(null);
            setGeneratingDay(null);
            setGeneratedDays([1, 2, 3, 4, 5, 6, 7]);
            setProgramStatus(ProgramStatus.Done);
          },
          onError: (error) => {
            console.error('[UserContext] Program generation error:', error);
            setProgramStatus(ProgramStatus.Error);
            setGeneratingDay(null);
          },
        }
      ).then((programId) => {
        logAnalyticsEvent('questionnaire_submitted', {
          programType: diagnosis.programType,
          programId,
        });
      }).catch((error) => {
        console.error('[UserContext] Program submission error:', error);
        setProgramStatus(ProgramStatus.Error);
      });

      submissionInProgressRef.current = false;
      return {};
    } catch (error) {
      // logging removed
      setProgramStatus(ProgramStatus.Error);
      setGeneratingDay(null);
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
        } catch {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Load all user programs (call lazily, e.g., when user opens program selector)
  const loadUserPrograms = async () => {
    if (!userId || !isUserAuthenticated) return;
    
    console.log('📦 Loading all user programs...');
    
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
          const userProgram = await fetchProgramWithWeeks(userId, doc.id, data);
          if (userProgram) {
            programs.push(userProgram);

            // Track most recent active program
            if (data.active === true) {
              const updatedAt = new Date(userProgram.updatedAt || userProgram.createdAt);
              if (!mostRecentActiveDate || updatedAt.getTime() > mostRecentActiveDate.getTime()) {
                mostRecentActiveDate = updatedAt;
                mostRecentActiveProgram = userProgram;
              }
            }
          }
        }
      }
      
      console.log(`📦 Loaded ${programs.length} programs`);
      setUserPrograms(programs);
      
      // Set the most recent active program if not already set
      if (mostRecentActiveProgram && !activeProgramIdRef.current) {
        prepareAndSetProgram(mostRecentActiveProgram);
        setProgramStatus(ProgramStatus.Done);
      }
    } catch (error) {
      console.error('Error loading user programs:', error);
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
        // Incremental generation state
        generatingDay,
        generatedDays,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
