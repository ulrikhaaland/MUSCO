import { collection, addDoc, getDocs, query, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  getProgramBySlug,
  getUserProgramBySlug,
  getAvailableSlugs,
  programSlugs,
  localizeProgramDayDescriptions,
} from '../../../public/data/programs/recovery';

import { getCurrentWeekMonday, addWeeks } from '../utils/dateutils';
import { enrichExercisesWithFullData } from './exerciseProgramService';
import { ExerciseProgram, UserProgram } from '../types/program';
import { ProgramType } from '../../../shared/types';
import { User } from 'firebase/auth';

export interface RecoveryProgramSessionData {
  userProgram: UserProgram;
  formattedProgram: ExerciseProgram;
}

// Recovery program session storage key
const RECOVERY_PROGRAM_SESSION_KEY = 'currentRecoveryProgram';

/**
 * Get all available recovery program slugs
 */
export const getRecoveryProgramSlugs = (): string[] => {
  return getAvailableSlugs();
};

/**
 * Check if a slug corresponds to a recovery program
 */
export const isRecoveryProgramSlug = (slug: string): boolean => {
  return getRecoveryProgramSlugs().includes(slug.toLowerCase());
};

/**
 * Get a recovery program by slug (combined 28-day format)
 */
export const getRecoveryProgram = (slug: string): ExerciseProgram | null => {
  return getProgramBySlug(slug);
};

/**
 * Get a recovery program in user program format (4 separate weeks)
 */
export const getRecoveryUserProgram = (slug: string): UserProgram | null => {
  return getUserProgramBySlug(slug);
};

/**
 * Format and enrich a recovery program with exercise data and proper dates
 */
export const formatRecoveryProgram = async (
  slug: string,
  isNorwegian: boolean = false
): Promise<UserProgram | null> => {
  try {
    const userProgram = getRecoveryUserProgram(slug);
    if (!userProgram) {
      console.error('Recovery program not found for slug:', slug);
      return null;
    }

    // Update program dates to start from current week's Monday
    const baseDate = getCurrentWeekMonday();

    for (let i = 0; i < userProgram.programs.length; i++) {
      let weekProgram = userProgram.programs[i];

      // Set progressive dates: Week 1 = current week's Monday, Week 2 = next week's Monday, etc.
      const weekDate = addWeeks(baseDate, i);
      weekProgram.createdAt = weekDate;

      // Enrich with exercise data
      await enrichExercisesWithFullData(weekProgram, isNorwegian);

      // Localize only the day descriptions if Norwegian
      if (isNorwegian) {
        weekProgram = localizeProgramDayDescriptions(weekProgram, 'nb');
        userProgram.programs[i] = weekProgram;
      }
    }

    return userProgram;
  } catch (error) {
    console.error('Error formatting recovery program:', error);
    return null;
  }
};

/**
 * Store recovery program in session storage
 */
export const storeRecoveryProgramInSession = (
  data: RecoveryProgramSessionData
): void => {
  try {
    window.sessionStorage.setItem(
      RECOVERY_PROGRAM_SESSION_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error('Error storing recovery program in session:', error);
  }
};

/**
 * Get recovery program from session storage
 */
export const getRecoveryProgramFromSession =
  (): RecoveryProgramSessionData | null => {
    try {
      if (typeof window === 'undefined') return null;

      const stored = window.sessionStorage.getItem(
        RECOVERY_PROGRAM_SESSION_KEY
      );
      if (!stored) return null;

      return JSON.parse(stored) as RecoveryProgramSessionData;
    } catch (error) {
      console.error('Error getting recovery program from session:', error);
      return null;
    }
  };

/**
 * Clear recovery program from session storage
 */
export const clearRecoveryProgramFromSession = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(RECOVERY_PROGRAM_SESSION_KEY);
    }
  } catch (error) {
    console.error('Error clearing recovery program from session:', error);
  }
};

/**
 * Check if recovery program exists in session storage
 */
export const hasRecoveryProgramInSession = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem(RECOVERY_PROGRAM_SESSION_KEY) !== null
  );
};

/**
 * Load and prepare a recovery program for use
 */
export const loadRecoveryProgram = async (
  slug: string,
  isNorwegian: boolean = false
): Promise<RecoveryProgramSessionData | null> => {
  try {
    const formattedProgram = await formatRecoveryProgram(slug, isNorwegian);
    if (!formattedProgram) return null;

    const sessionData: RecoveryProgramSessionData = {
      userProgram: formattedProgram,
      formattedProgram: formattedProgram.programs[0], // Use first week as display program
    };

    storeRecoveryProgramInSession(sessionData);
    return sessionData;
  } catch (error) {
    console.error('Error loading recovery program:', error);
    return null;
  }
};

/**
 * Save a recovery program to user's Firestore account
 */
export const saveRecoveryProgramToAccount = async (
  user: User,
  recoveryData: UserProgram
): Promise<string | null> => {
  try {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    // Check for existing recovery programs and deactivate them
    const programsRef = collection(db, `users/${user.uid}/programs`);
    const existingRecoveryQuery = query(programsRef, where('type', '==', ProgramType.Recovery));
    const existingRecoverySnapshot = await getDocs(existingRecoveryQuery);

    console.log(
      `📊 User has ${existingRecoverySnapshot.size} existing recovery programs`
    );

    // Deactivate all existing recovery programs
    const deactivationPromises = existingRecoverySnapshot.docs.map(async (docSnapshot) => {
      const docRef = doc(db, `users/${user.uid}/programs`, docSnapshot.id);
      await updateDoc(docRef, { active: false, updatedAt: new Date() });
      console.log(`🔄 Deactivated recovery program: ${docSnapshot.id}`);
    });

    await Promise.all(deactivationPromises);

    // Create main program document (always active for recovery programs)
    const programDoc = {
      diagnosis: recoveryData.diagnosis,
      questionnaire: recoveryData.questionnaire,
      active: true, // Recovery programs are always set to active when saved
      status: 'done',
      type: ProgramType.Recovery,
      title: recoveryData.title,
      timeFrame: recoveryData.timeFrame,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📄 Creating recovery program document:', {
      ...programDoc,
      reason: 'Recovery program - setting as active and deactivating other recovery programs',
    });

    const programDocRef = await addDoc(programsRef, programDoc);
    console.log(
      '✅ Recovery program document created with ID:',
      programDocRef.id
    );

    // Save weekly program data in subcollection
    const innerProgramsRef = collection(
      db,
      `users/${user.uid}/programs/${programDocRef.id}/programs`
    );
    const baseDate = getCurrentWeekMonday();

    for (let i = 0; i < recoveryData.programs.length; i++) {
      const weekProgram = recoveryData.programs[i];
      const weekDate = addWeeks(baseDate, i);

      const programDataDoc = {
        ...weekProgram,
        createdAt: weekDate.toISOString(),
      };

      await addDoc(innerProgramsRef, programDataDoc);
    }

    console.log('🎉 Recovery program successfully saved to user account!');
    return programDocRef.id;
  } catch (error) {
    console.error('❌ Error saving recovery program:', error);
    throw error;
  }
};

/**
 * Detect if current path is a recovery program path
 */
export const isRecoveryProgramPath = (pathname: string): boolean => {
  if (!pathname.startsWith('/program/')) return false;

  const slug = pathname.split('/program/')[1]?.split('/')[0];
  return slug ? isRecoveryProgramSlug(slug) : false;
};

/**
 * Extract recovery program slug from pathname
 */
export const extractRecoveryProgramSlug = (pathname: string): string | null => {
  if (!isRecoveryProgramPath(pathname)) return null;

  return pathname.split('/program/')[1]?.split('/')[0] || null;
};

/**
 * Check if user is viewing a custom recovery program (not saved to account)
 */
export const isViewingCustomRecoveryProgram = (pathname: string): boolean => {
  return isRecoveryProgramPath(pathname) && hasRecoveryProgramInSession();
};

/**
 * Get recovery program metadata by slug
 */
export const getRecoveryProgramMetadata = (
  slug: string
): {
  title: string;
  targetAreas: string[];
  baseIndex: number;
} | null => {
  const normalizedSlug = slug.toLowerCase();
  const baseIndex = programSlugs[normalizedSlug];

  if (typeof baseIndex !== 'number') return null;

  // Map slugs to human-readable titles and target areas
  const metadataMap: Record<string, { title: string; targetAreas: string[] }> =
    {
      lowback: {
        title: 'Lower Back Recovery',
        targetAreas: ['Lower Back', 'Core'],
      },
      'low-back': {
        title: 'Lower Back Recovery',
        targetAreas: ['Lower Back', 'Core'],
      },
      'lower-back': {
        title: 'Lower Back Recovery',
        targetAreas: ['Lower Back', 'Core'],
      },
      runnersknee: {
        title: "Runner's Knee Recovery",
        targetAreas: ['Knee', 'Quadriceps'],
      },
      'runners-knee': {
        title: "Runner's Knee Recovery",
        targetAreas: ['Knee', 'Quadriceps'],
      },
      shoulder: {
        title: 'Shoulder Recovery',
        targetAreas: ['Shoulder', 'Upper Back'],
      },
      'shoulder-impingement': {
        title: 'Shoulder Recovery',
        targetAreas: ['Shoulder', 'Upper Back'],
      },
      ankle: { title: 'Ankle Recovery', targetAreas: ['Ankle', 'Calves'] },
      'ankle-sprain': {
        title: 'Ankle Recovery',
        targetAreas: ['Ankle', 'Calves'],
      },
      'tennis-elbow': {
        title: 'Tennis Elbow Recovery',
        targetAreas: ['Elbow', 'Forearms'],
      },
      elbow: {
        title: 'Tennis Elbow Recovery',
        targetAreas: ['Elbow', 'Forearms'],
      },
      techneck: {
        title: 'Tech Neck Recovery',
        targetAreas: ['Neck', 'Upper Back'],
      },
      'plantar-fasciitis': {
        title: 'Plantar Fasciitis Recovery',
        targetAreas: ['Foot', 'Calves'],
      },
      plantarfasciitis: {
        title: 'Plantar Fasciitis Recovery',
        targetAreas: ['Foot', 'Calves'],
      },
      plantar: {
        title: 'Plantar Fasciitis Recovery',
        targetAreas: ['Foot', 'Calves'],
      },
      'hamstring-strain': {
        title: 'Hamstring Recovery',
        targetAreas: ['Hamstring', 'Glutes'],
      },
      hamstring: {
        title: 'Hamstring Recovery',
        targetAreas: ['Hamstring', 'Glutes'],
      },
      'upper-back-core': {
        title: 'Upper Back & Core Recovery',
        targetAreas: ['Upper Back', 'Core'],
      },
      upperbackcore: {
        title: 'Upper Back & Core Recovery',
        targetAreas: ['Upper Back', 'Core'],
      },
      'core-stability': {
        title: 'Core Stability Recovery',
        targetAreas: ['Core', 'Lower Back'],
      },
      corestability: {
        title: 'Core Stability Recovery',
        targetAreas: ['Core', 'Lower Back'],
      },
    };

  const metadata = metadataMap[normalizedSlug];
  if (!metadata) return null;

  return {
    ...metadata,
    baseIndex,
  };
};

/**
 * Create a minimal recovery program for legacy support
 */
export const createMinimalRecoveryProgram = (
  program: ExerciseProgram,
  title?: string
): UserProgram => {
  return {
    programs: [program],
    diagnosis: {
      diagnosis: title || 'Recovery Program',
      painfulAreas: (program.targetAreas?.join(', ') || '') as any,
      informationalInsights: program.programOverview || null,
      onset: 'gradual',
      painScale: 5,
      mechanismOfInjury: 'overuse',
      aggravatingFactors: null,
      relievingFactors: null,
      priorInjury: 'no',
      painPattern: 'activity-dependent',
      painLocation: null,
      painCharacter: 'dull',
      assessmentComplete: true,
      redFlagsPresent: false,
      avoidActivities: [] as any,
      timeFrame: '4 weeks',
      followUpQuestions: [],
      programType: ProgramType.Recovery,
      targetAreas: (program.targetAreas?.join(', ') || '') as any,
      summary: '',
    },
    questionnaire: {
      age: '30_40',
      lastYearsExerciseFrequency: '2_3_times_per_week',
      numberOfActivityDays: '2_3_times_per_week',
      generallyPainfulAreas: program.targetAreas || [],
      exerciseModalities: 'strength',
      modalitySplit: '50_50',
      cardioDays: 2,
      strengthDays: 3,
      exerciseEnvironments: 'at_home',
      workoutDuration: '30_45_minutes',
      targetAreas: program.targetAreas || [],
      equipment: [],
      experienceLevel: 'beginner',
      weeklyFrequency: '3',
      cardioType: 'running',
      cardioEnvironment: 'both',
    },
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date(),
    type: ProgramType.Recovery,
    title: title || 'Recovery Program',
    timeFrame: '4 weeks',
  };
};
