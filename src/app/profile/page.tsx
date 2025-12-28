'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/firebase/config';
import PhoneInput, { formatPhoneNumberIntl } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  TARGET_BODY_PARTS,
  EXERCISE_ENVIRONMENTS,
  WORKOUT_DURATIONS,
  PAIN_BODY_PARTS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
} from '@/app/types/program';
import { UserProfile } from '@/app/types/user';
import { useTranslation } from '../i18n';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import {
  getTranslatedTargetBodyParts,
  getTranslatedExerciseEnvironments,
  getTranslatedWorkoutDurations,
  getTranslatedPainBodyParts,
  getTranslatedPlannedExerciseFrequencyOptions,
} from '@/app/utils/programTranslation';
import { SUBSCRIPTIONS_ENABLED } from '@/app/lib/featureFlags';

// Extracted constants and utilities
import {
  getFitnessLevels,
  PROFILE_EXERCISE_MODALITIES,
  getHealthGoalsOptions,
  getDietaryPreferencesOptions,
  sectionContentStyle,
  fadeInAnimation,
} from './constants';
import { normalizeBodyPartName as normalizeBodyPartNameUtil } from './utils';
import { ProfileValueDisplay, ExpandedIcon, CollapsedIcon, ProfileDesktopLayout, ProfilePhotoCropper, PrivacyContent, PrivacyPolicyContent, InfoBanner } from './components';
import { useResponsiveProfile, SectionId } from './hooks/useResponsiveProfile';

export default function ProfilePage() {
  const { t } = useTranslation();

  // Wrapper for imported normalizeBodyPartName utility
  const normalizeBodyPartName = (bodyPart: string, tFn: (key: string) => string): string => {
    return normalizeBodyPartNameUtil(bodyPart, tFn);
  };

  const { user, logOut, updateUserProfile } = useAuth();
  const { userPrograms, answers: questionnaireAnswers } = useUser();
  const router = useRouter();

  // Responsive layout hook
  const { isDesktop, activeSection, setActiveSection } = useResponsiveProfile();

  // Get translated constants
  const _translatedTargetBodyParts = getTranslatedTargetBodyParts(t);
  const _translatedExerciseEnvironments = getTranslatedExerciseEnvironments(t);
  const translatedWorkoutDurations = getTranslatedWorkoutDurations(t);
  const translatedPainBodyParts = getTranslatedPainBodyParts(t);
  const translatedPlannedFrequencyOptions =
    getTranslatedPlannedExerciseFrequencyOptions(t);

  // Use the translation functions to get localized options
  const _healthGoalsOptions = getHealthGoalsOptions(t);
  const dietaryPreferencesOptions = getDietaryPreferencesOptions(t);

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [_dirty, setDirty] = useState(false);

  // Profile data states
  const [displayName, setDisplayName] = useState('');
  const [_name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  
  // Profile page state - persisted to localStorage
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'info' | 'privacy' | 'privacyPolicy'>('info');
  const [hasRestoredState, setHasRestoredState] = useState(false);
  
  const justSavedPhotoRef = useRef(false); // Flag to prevent photo being overwritten after save

  // Validation states
  const [phoneValid, setPhoneValid] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  // Refs
  const topRef = useRef<HTMLDivElement>(null);

  // Health basics
  const [userHeight, setUserHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Medical background
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  
  // Custom notes for AI context
  const [customNotes, setCustomNotes] = useState<string[]>([]);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [noteInputValue, setNoteInputValue] = useState('');

  // Fitness profile
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [sleepPattern, setSleepPattern] = useState('');

  // Exercise preferences (some can be populated from questionnaire)
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [painfulAreas, setPainfulAreas] = useState<string[]>([]);
  const [exerciseModalities, setExerciseModalities] = useState<string[]>([]);
  const [exerciseEnvironments, setExerciseEnvironments] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [targetAreas, setTargetAreas] = useState<string[]>([]);

  // Goals and preferences
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [timeAvailability, setTimeAvailability] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  // Section expansion states
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [healthBasicsExpanded, setHealthBasicsExpanded] = useState(false);
  const [medicalBackgroundExpanded, setMedicalBackgroundExpanded] =
    useState(false);
  const [fitnessProfileExpanded, setFitnessProfileExpanded] = useState(false);
  const [customNotesExpanded, setCustomNotesExpanded] = useState(false);
  const [_goalsPreferencesExpanded, setGoalsPreferencesExpanded] =
    useState(false);

  // Expand all sections on desktop
  useEffect(() => {
    if (isDesktop) {
      setGeneralExpanded(true);
      setHealthBasicsExpanded(true);
      setMedicalBackgroundExpanded(true);
      setFitnessProfileExpanded(true);
    }
  }, [isDesktop]);

  // Restore profile page state from localStorage on mount
  useEffect(() => {
    const savedInfoExpanded = localStorage.getItem('profile_isInfoExpanded');
    const savedActiveView = localStorage.getItem('profile_activeView');
    const savedActiveSection = localStorage.getItem('profile_activeSection');
    
    if (savedInfoExpanded === 'true') {
      setIsInfoExpanded(true);
    }
    if (savedActiveView === 'info' || savedActiveView === 'privacy' || savedActiveView === 'privacyPolicy') {
      setActiveView(savedActiveView);
    }
    if (savedActiveSection && ['general', 'healthBasics', 'fitnessProfile', 'medicalBackground', 'customNotes'].includes(savedActiveSection)) {
      setActiveSection(savedActiveSection as SectionId);
    }
    setHasRestoredState(true);
  }, [setActiveSection]);

  // Persist profile page state to localStorage (only after initial restore)
  useEffect(() => {
    if (!hasRestoredState) return;
    localStorage.setItem('profile_isInfoExpanded', String(isInfoExpanded));
  }, [isInfoExpanded, hasRestoredState]);

  useEffect(() => {
    if (!hasRestoredState) return;
    localStorage.setItem('profile_activeView', activeView);
  }, [activeView, hasRestoredState]);

  useEffect(() => {
    if (!hasRestoredState) return;
    localStorage.setItem('profile_activeSection', activeSection);
  }, [activeSection, hasRestoredState]);

  // Handle sidebar section click - now just sets the active section
  const handleSidebarSectionClick = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId);
  }, [setActiveSection]);

  // Handle info menu toggle
  const handleInfoToggle = useCallback(() => {
    setIsInfoExpanded((prev) => !prev);
    setActiveView('info');
  }, []);

  // Handle privacy click - on desktop show in second column, on mobile navigate
  const handlePrivacyClick = useCallback(() => {
    if (isDesktop) {
      setActiveView('privacy');
      setIsInfoExpanded(false); // Collapse info when showing privacy
    } else {
      router.push('/privacy');
    }
  }, [isDesktop, router]);

  // Handle privacy policy click - on desktop show in second column, on mobile navigate
  const handlePrivacyPolicyClick = useCallback(() => {
    if (isDesktop) {
      setActiveView('privacyPolicy');
      setIsInfoExpanded(false); // Collapse info when showing privacy policy
    } else {
      router.push('/privacy-policy');
    }
  }, [isDesktop, router]);

  useEffect(() => {
    // Log values for debugging translation issues
    console.log('Profile debug values:');
    console.log('Exercise modalities:', exerciseModalities);
    console.log('Exercise environment:', exerciseEnvironments);
    console.log('Workout duration:', workoutDuration);
    console.log('Health goals:', healthGoals);
    console.log('Painful areas:', painfulAreas);
  }, [
    exerciseModalities,
    exerciseEnvironments,
    workoutDuration,
    healthGoals,
    painfulAreas,
  ]);

  // Auto-dismiss messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load user profile data function - moved outside useEffect to reuse
  const loadUserProfile = async () => {
    if (!user) return;

    // Set basic profile info from auth
    if (user.displayName) {
      setDisplayName(user.displayName);
      setName(user.displayName);
    }

    // Only update photo if we didn't just save a new one
    // (prevents the photo from being overwritten by stale user data)
    if (user.photoURL && !justSavedPhotoRef.current) {
      setPhotoURL(user.photoURL);
      setPreviewURL(user.photoURL);
    }

    // Use profile data from the extended user if available
    if (user.profile) {
      const profile = user.profile;

      if (profile.displayName) setDisplayName(profile.displayName);
      if (profile.name) setName(profile.name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.height) setUserHeight(profile.height);
      if (profile.weight) setWeight(profile.weight);
      if (profile.gender) setGender(profile.gender);
      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth);

      // Handle array or comma-separated string values
      if (profile.medicalConditions) {
        setMedicalConditions(
          typeof profile.medicalConditions === 'string'
            ? profile.medicalConditions.split(',')
            : profile.medicalConditions
        );
      }

      if (profile.medications) {
        setMedications(
          typeof profile.medications === 'string'
            ? profile.medications.split(',')
            : profile.medications
        );
      }

      if (profile.injuries) {
        setInjuries(
          typeof profile.injuries === 'string'
            ? profile.injuries.split(',')
            : profile.injuries
        );
      }

      if (profile.familyHistory) {
        setFamilyHistory(
          typeof profile.familyHistory === 'string'
            ? profile.familyHistory.split(',')
            : profile.familyHistory
        );
      }
      
      if (profile.customNotes) {
        if (Array.isArray(profile.customNotes)) {
          setCustomNotes(profile.customNotes);
        } else if (typeof profile.customNotes === 'string') {
          // Migrate old string format to array
          const notes = profile.customNotes as unknown as string;
          if (notes.trim()) {
            setCustomNotes([notes]);
          }
        }
      }

      if (profile.fitnessLevel) setFitnessLevel(profile.fitnessLevel);
      if (profile.sleepPattern) setSleepPattern(profile.sleepPattern);
      if (profile.exerciseFrequency)
        setExerciseFrequency(profile.exerciseFrequency);

      if (profile.exerciseModalities) {
        if (Array.isArray(profile.exerciseModalities)) {
          // Normalize array values to lowercase for consistent comparison
          setExerciseModalities(
            profile.exerciseModalities.map((m) => m.toLowerCase())
          );
        } else if (typeof profile.exerciseModalities === 'string') {
          // Split comma-separated string, trim each value, and normalize to lowercase
          setExerciseModalities(
            profile.exerciseModalities
              .split(',')
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean)
          );
        }
      }

      if (profile.exerciseEnvironments) {
        if (
          Array.isArray(profile.exerciseEnvironments) &&
          profile.exerciseEnvironments.length > 0
        ) {
          setExerciseEnvironments(profile.exerciseEnvironments[0]);
        } else if (typeof profile.exerciseEnvironments === 'string') {
          setExerciseEnvironments(profile.exerciseEnvironments);
        }
      }

      if (profile.workoutDuration) setWorkoutDuration(profile.workoutDuration);
      if (profile.targetAreas) setTargetAreas(profile.targetAreas);
      if (profile.healthGoals) setHealthGoals(profile.healthGoals);
      if (profile.timeAvailability)
        setTimeAvailability(profile.timeAvailability);
      if (profile.dietaryPreferences)
        setDietaryPreferences(profile.dietaryPreferences);
      if (profile.painfulAreas) setPainfulAreas(profile.painfulAreas);
    } else {
      // If no profile data exists yet, try to load from Firestore as a fallback
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.displayName) setDisplayName(userData.displayName);
          if (userData.name) setName(userData.name);
          if (userData.phone) setPhone(userData.phone);
          if (userData.height) setUserHeight(userData.height);
          if (userData.weight) setWeight(userData.weight);
          if (userData.gender) setGender(userData.gender);
          if (userData.dateOfBirth) setDateOfBirth(userData.dateOfBirth);
          if (userData.medicalConditions)
            setMedicalConditions(userData.medicalConditions);
          if (userData.medications) setMedications(userData.medications);
          if (userData.injuries) setInjuries(userData.injuries);
          if (userData.familyHistory) setFamilyHistory(userData.familyHistory);
          if (userData.customNotes) {
            if (Array.isArray(userData.customNotes)) {
              setCustomNotes(userData.customNotes);
            } else if (typeof userData.customNotes === 'string') {
              const notes = userData.customNotes as string;
              if (notes.trim()) {
                setCustomNotes([notes]);
              }
            }
          }
          if (userData.fitnessLevel) setFitnessLevel(userData.fitnessLevel);
          if (userData.sleepPattern) setSleepPattern(userData.sleepPattern);
          if (userData.exerciseFrequency)
            setExerciseFrequency(userData.exerciseFrequency);
          if (userData.exerciseModalities) {
            if (Array.isArray(userData.exerciseModalities)) {
              // Normalize array values to lowercase for consistent comparison
              setExerciseModalities(
                userData.exerciseModalities.map((m) => m.toLowerCase())
              );
            } else if (typeof userData.exerciseModalities === 'string') {
              // Split comma-separated string, trim each value, and normalize to lowercase
              setExerciseModalities(
                userData.exerciseModalities
                  .split(',')
                  .map((item) => item.trim().toLowerCase())
                  .filter(Boolean)
              );
            }
          }
          if (userData.exerciseEnvironments) {
            if (
              Array.isArray(userData.exerciseEnvironments) &&
              userData.exerciseEnvironments.length > 0
            ) {
              setExerciseEnvironments(userData.exerciseEnvironments[0]);
            } else if (typeof userData.exerciseEnvironments === 'string') {
              setExerciseEnvironments(userData.exerciseEnvironments);
            }
          }
          if (userData.workoutDuration)
            setWorkoutDuration(userData.workoutDuration);
          if (userData.targetAreas) setTargetAreas(userData.targetAreas);
          if (userData.healthGoals) setHealthGoals(userData.healthGoals);
          if (userData.timeAvailability)
            setTimeAvailability(userData.timeAvailability);
          if (userData.dietaryPreferences)
            setDietaryPreferences(userData.dietaryPreferences);
          if (userData.painfulAreas) setPainfulAreas(userData.painfulAreas);
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
      }
    }

    // Try to set data from questionnaire if not set
    if (!dateOfBirth) {
      setDateOfBirthFromQuestionnaire();
    }
  };

  // Call loadUserProfile when component mounts or user changes
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Function to calculate date of birth from questionnaire age range
  const setDateOfBirthFromQuestionnaire = () => {
    if (!questionnaireAnswers || !questionnaireAnswers.age) return;

    // Parse age range like "20-30" and get the middle value
    const ageRange = questionnaireAnswers.age.split('-');
    if (ageRange.length === 2) {
      const minAge = parseInt(ageRange[0]);
      const maxAge = parseInt(ageRange[1]);
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        // Calculate the middle age
        const middleAge = Math.floor((minAge + maxAge) / 2);

        // Calculate birth year based on current year minus the middle age
        const today = new Date();
        const birthYear = today.getFullYear() - middleAge;

        // Set to January 1st of the birth year
        const dob = new Date(birthYear, 0, 1).toISOString().split('T')[0];

        // Only set if date of birth isn't already set
        if (!dateOfBirth && !user?.profile?.dateOfBirth) {
          setDateOfBirth(dob);
        }
      }
    }
  };

  // Update page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('profile.title') + ' | MUSCO';
    }
  }, [t]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logOut();
      // No need to navigate, logout function redirects to home
    } catch (err) {
      console.error('Logout error:', err);
      setError(t('profile.logoutError'));
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input value so the same file can be selected again
    e.target.value = '';

    let processedFile = file;

    // Check if the file is HEIC/HEIF format
    const isHeic = file.type === 'image/heic' || 
                   file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      try {
        setIsConvertingHeic(true);
        // Dynamically import heic2any to avoid SSR issues (it accesses window at module load)
        const heic2any = (await import('heic2any')).default;
        // Convert HEIC to JPEG
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });
        
        // heic2any can return an array of blobs for multi-image HEIC files
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        processedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), {
          type: 'image/jpeg',
        });
      } catch (error) {
        console.error('Error converting HEIC:', error);
        setMessage({ type: 'error', text: t('profile.heicConversionError') || 'Failed to convert image. Please try a different format.' });
        setIsConvertingHeic(false);
        return;
      } finally {
        setIsConvertingHeic(false);
      }
    }

    // Read the file and show the cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCropperImageSrc(e.target.result as string);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(processedFile);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewURL(e.target.result as string);
      }
    };
    reader.readAsDataURL(croppedBlob);
    setShowCropper(false);
    setCropperImageSrc('');
    setIsEditing(true); // Make sure we're in edit mode
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImageSrc('');
  };

  const validatePhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber) {
      setPhoneValid(true); // Empty is valid (optional field)
      setPhoneError('');
      return true;
    }

    // Basic validation - should be at least 8 digits after country code
    if (phoneNumber.replace(/\D/g, '').length < 8) {
      setPhoneValid(false);
      setPhoneError(t('profile.phoneError.tooShort'));
      return false;
    }

    setPhoneValid(true);
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhone(value || '');
    validatePhoneNumber(value);
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!user) return reject('No user logged in');

      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  // Save custom notes immediately to Firestore
  const saveCustomNotes = async (notes: string[]) => {
    if (!user) return;
    try {
      await updateUserProfile({
        customNotes: notes.filter(note => note.trim()),
      });
    } catch (err) {
      console.error('Failed to save custom notes:', err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate phone number before saving
    if (!validatePhoneNumber(phone)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');

      // Get the most recent program of each type
      const exercisePrograms = userPrograms?.filter((program) => program.type === 'exercise') ?? [];
      const recoveryPrograms = userPrograms?.filter((program) => program.type === 'recovery') ?? [];
      const exerciseAndRecoveryPrograms = userPrograms?.filter((program) => program.type === 'exercise_and_recovery') ?? [];
      
      // Sort by updatedAt descending and get the first (most recent)
      const sortByDate = (a: { updatedAt: Date }, b: { updatedAt: Date }) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      
      const activeExerciseProgram = exercisePrograms.sort(sortByDate)[0];
      const activeRecoveryProgram = recoveryPrograms.sort(sortByDate)[0];
      const activeExerciseAndRecoveryProgram = exerciseAndRecoveryPrograms.sort(sortByDate)[0];

      // Ensure recovery is included in exerciseModalities if there's an active recovery or exercise_and_recovery program
      const updatedExerciseModalities = [...exerciseModalities];
      if (
        (activeRecoveryProgram || activeExerciseAndRecoveryProgram) &&
        !updatedExerciseModalities.includes('recovery')
      ) {
        updatedExerciseModalities.push('recovery');
      }

      // Combine painful areas from both active programs
      const updatedPainfulAreas = [...painfulAreas];

      // Add areas from active exercise program if available
      if (activeExerciseProgram?.questionnaire?.generallyPainfulAreas) {
        activeExerciseProgram.questionnaire.generallyPainfulAreas.forEach(
          (area) => {
            if (!updatedPainfulAreas.includes(area)) {
              updatedPainfulAreas.push(area);
            }
          }
        );
      }

      // Add areas from active recovery program if available
      if (activeRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
        activeRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(
          (area) => {
            if (!updatedPainfulAreas.includes(area)) {
              updatedPainfulAreas.push(area);
            }
          }
        );
      }

      // Add areas from active exercise_and_recovery program if available
      if (activeExerciseAndRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
        activeExerciseAndRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(
          (area) => {
            if (!updatedPainfulAreas.includes(area)) {
              updatedPainfulAreas.push(area);
            }
          }
        );
      }

      // Prioritize exercise environments from active exercise program
      let updatedExerciseEnvironment = exerciseEnvironments;

      // Check active exercise program first
      if (
        activeExerciseProgram?.questionnaire?.exerciseEnvironments &&
        !updatedExerciseEnvironment
      ) {
        const exerciseEnvs =
          activeExerciseProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
          updatedExerciseEnvironment = exerciseEnvs[0];
        } else if (typeof exerciseEnvs === 'string') {
          updatedExerciseEnvironment = exerciseEnvs;
        }
      }
      // Then check active exercise_and_recovery program
      else if (
        activeExerciseAndRecoveryProgram?.questionnaire?.exerciseEnvironments &&
        !updatedExerciseEnvironment
      ) {
        const exerciseAndRecoveryEnvs =
          activeExerciseAndRecoveryProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(exerciseAndRecoveryEnvs) && exerciseAndRecoveryEnvs.length > 0) {
          updatedExerciseEnvironment = exerciseAndRecoveryEnvs[0];
        } else if (typeof exerciseAndRecoveryEnvs === 'string') {
          updatedExerciseEnvironment = exerciseAndRecoveryEnvs;
        }
      }
      // Finally check active recovery program
      else if (
        activeRecoveryProgram?.questionnaire?.exerciseEnvironments &&
        !updatedExerciseEnvironment
      ) {
        const recoveryEnvs =
          activeRecoveryProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(recoveryEnvs) && recoveryEnvs.length > 0) {
          updatedExerciseEnvironment = recoveryEnvs[0];
        } else if (typeof recoveryEnvs === 'string') {
          updatedExerciseEnvironment = recoveryEnvs;
        }
      }

      // Upload profile picture if there's a new one
      let profilePhotoURL = photoURL;
      const hasNewPhoto = previewURL && previewURL !== photoURL;
      
      if (hasNewPhoto) {
        // Set flag to prevent loadUserProfile from overwriting the photo
        justSavedPhotoRef.current = true;
        
        // Immediately show the new photo (optimistic update)
        // This ensures the photo doesn't disappear while uploading
        setPhotoURL(previewURL);
        
        // Convert data URL to file
        const response = await fetch(previewURL);
        const blob = await response.blob();
        const file = new File([blob], 'profile_picture.jpg', {
          type: 'image/jpeg',
        });

        // Upload the file
        profilePhotoURL = await uploadProfileImage(file);
        
        // Update with the actual Firebase Storage URL
        setPhotoURL(profilePhotoURL);
        
        // Reset the flag after a delay to allow for any user object updates
        setTimeout(() => {
          justSavedPhotoRef.current = false;
        }, 2000);
      }

      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName,
        photoURL: profilePhotoURL,
      });

      // Function to normalize body part to PAIN_BODY_PARTS format (e.g., "Left Hand")
      const normalizeBodyPartToKey = (bodyPart: string): string => {
        // If already in PAIN_BODY_PARTS, return as-is
        if (PAIN_BODY_PARTS.includes(bodyPart as any)) {
          return bodyPart;
        }

        // Try to find by translation match (for Norwegian input)
        const matchByTranslation = PAIN_BODY_PARTS.find((key) => {
          const translated = t(`bodyParts.${key}`);
          return translated.toLowerCase() === bodyPart.toLowerCase();
        });
        if (matchByTranslation) return matchByTranslation;

        // Try case-insensitive match
        const matchByCase = PAIN_BODY_PARTS.find(
          (key) => key.toLowerCase() === bodyPart.toLowerCase()
        );
        if (matchByCase) return matchByCase;

        // Convert snake_case to Title Case and try to match
        if (bodyPart.includes('_')) {
          const titleCase = bodyPart
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          if (PAIN_BODY_PARTS.includes(titleCase as any)) {
            return titleCase;
          }
        }

        // Convert camelCase to Title Case and try to match
        if (/[a-z][A-Z]/.test(bodyPart)) {
          const titleCase = bodyPart
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase());
          if (PAIN_BODY_PARTS.includes(titleCase as any)) {
            return titleCase;
          }
        }

        return bodyPart; // Return original as fallback
      };

      // Function to normalize gender to English values
      const normalizeGender = (genderValue: string): string => {
        // Map translated gender values to English keys
        const genderMap: Record<string, string> = {
          [t('profile.gender.male')]: 'male',
          [t('profile.gender.female')]: 'female',
          [t('profile.gender.nonBinary')]: 'non-binary',
          [t('profile.gender.preferNotToSay')]: 'prefer-not-to-say',
        };

        // Return English key if found, otherwise return original value (likely already English)
        return genderMap[genderValue] || genderValue;
      };

      // Function to normalize fitness level to English values
      // Fitness level is now stored directly as English key (Beginner, Intermediate, Advanced, Elite)
      const normalizeFitnessLevel = (levelValue: string): string => levelValue;

      // Function to normalize exercise frequency to English values
      const normalizeExerciseFrequency = (freqValue: string): string => {
        // Try to find the English key in planned frequency options
        for (const option of PLANNED_EXERCISE_FREQUENCY_OPTIONS) {
          try {
            const translatedOption = t(
              `exerciseFrequency.${option.toLowerCase().replace(/\s+/g, '')}`
            );
            if (translatedOption === freqValue) return option;
          } catch {
            // Continue to next option
          }
        }
        return freqValue; // If not found, likely already English
      };

      // Function to normalize workout duration to English values
      const normalizeWorkoutDuration = (durationValue: string): string => {
        // Try to find the English key in workout durations
        for (const duration of WORKOUT_DURATIONS) {
          try {
            const translatedDuration = t(
              `workoutDurations.${duration.toLowerCase().replace(/\s+/g, '')}`
            );
            if (translatedDuration === durationValue) return duration;
          } catch {
            // Continue to next option
          }
        }
        return durationValue; // If not found, likely already English
      };

      // Function to normalize exercise environment to English values
      const normalizeExerciseEnvironment = (envValue: string): string => {
        // Try to find the English key in exercise environments
        for (const env of EXERCISE_ENVIRONMENTS) {
          try {
            const envKey = typeof env === 'string' ? env : env.toString();
            const translatedEnv = t(
              `exerciseEnvironments.${envKey.toLowerCase().replace(/\s+/g, '')}`
            );
            if (translatedEnv === envValue) return envKey;
          } catch {
            // Continue to next option
          }
        }
        return envValue; // If not found, likely already English
      };

      // Function to normalize health goals to English values
      const normalizeHealthGoals = (goals: string[]): string[] => {
        // Get translated and English health goals options
        const translatedOptions = getHealthGoalsOptions(t);
        // Create a direct English version by using a pass-through translation function
        const englishOptions = getHealthGoalsOptions((key: string) =>
          key.replace('profile.goals.', '')
        );

        // Create a map from translated options to English options
        const translationMap = new Map<string, string>();
        translatedOptions.forEach((translatedOption, i) => {
          if (i < englishOptions.length) {
            translationMap.set(translatedOption, englishOptions[i]);
          }
        });

        // Map each goal to its English version
        return goals.map((goal) => translationMap.get(goal) || goal);
      };

      // Function to normalize dietary preferences to English values
      const normalizeDietaryPreferences = (preferences: string[]): string[] => {
        // Get translated and English dietary options
        const translatedOptions = getDietaryPreferencesOptions(t);
        // Create a direct English version by using a pass-through translation function
        const englishOptions = getDietaryPreferencesOptions((key: string) =>
          key.replace('profile.diet.', '')
        );

        // Create a map from translated options to English options
        const translationMap = new Map<string, string>();
        translatedOptions.forEach((translatedOption, i) => {
          if (i < englishOptions.length) {
            translationMap.set(translatedOption, englishOptions[i]);
          }
        });

        // Map each preference to its English version
        return preferences.map((pref) => translationMap.get(pref) || pref);
      };

      // Function to normalize target areas to English values
      const normalizeTargetAreas = (areas: string[]): string[] => {
        // Create a map of translated target body parts to English keys
        const targetBodyPartMap = new Map<string, string>();

        // Fill the map with translations
        TARGET_BODY_PARTS.forEach((bodyPart) => {
          try {
            const translated = t(`targetBodyParts.${bodyPart.toLowerCase()}`);
            targetBodyPartMap.set(translated, bodyPart);
          } catch {
            // Skip if translation fails
          }
        });

        // For common body parts that might be in both lists
        PAIN_BODY_PARTS.forEach((bodyPart) => {
          try {
            const translated = t(`bodyParts.${bodyPart}`);
            if (!targetBodyPartMap.has(translated)) {
              targetBodyPartMap.set(translated, bodyPart);
            }
          } catch {
            // Skip if translation fails
          }
        });

        // Map Norwegian terms to English for target areas
        const norwegianToEnglish: Record<string, string> = {
          Overkropp: 'Upper Body',
          Underkropp: 'Lower Body',
          Armer: 'Arms',
          Ben: 'Legs',
          Rygg: 'Back',
          Skuldre: 'Shoulders',
          Bryst: 'Chest',
          Kjerne: 'Core',
        };

        // Normalize each area
        return areas.map((area) => {
          // Check if it's a Norwegian term with direct mapping
          if (norwegianToEnglish[area]) {
            return norwegianToEnglish[area];
          }

          // Check if we have a mapping for this translated term
          if (targetBodyPartMap.has(area)) {
            return targetBodyPartMap.get(area) || area;
          }

          // Try to find in TARGET_BODY_PARTS directly
          const targetMatch = TARGET_BODY_PARTS.find(
            (bodyPart) => bodyPart.toLowerCase() === area.toLowerCase()
          );
          if (targetMatch) return targetMatch;

          // Return original if no match found
          return area;
        });
      };

      // Create profile data object with priority for exercise environments
      const profileData: Partial<UserProfile> = {
        displayName,
        photoURL: profilePhotoURL,
        phone,
        height: userHeight,
        weight,
        gender: normalizeGender(gender),
        dateOfBirth,
        medicalConditions: medicalConditions.join(','),
        medications: medications.join(','),
        injuries: injuries.join(','),
        familyHistory: familyHistory.join(','),
        customNotes: customNotes.filter(note => note.trim()),
        fitnessLevel: normalizeFitnessLevel(fitnessLevel),
        sleepPattern,
        exerciseFrequency: normalizeExerciseFrequency(exerciseFrequency),
        // Store exercise modalities in lowercase for consistency
        exerciseModalities: updatedExerciseModalities
          .map((m) => m.toLowerCase())
          .join(','),
        timeAvailability,
        dietaryPreferences: normalizeDietaryPreferences(dietaryPreferences),
        // For painfulAreas, normalize to PAIN_BODY_PARTS format for consistent storage
        painfulAreas: updatedPainfulAreas.map((area) =>
          normalizeBodyPartToKey(area)
        ),
        healthGoals: normalizeHealthGoals(healthGoals),
        targetAreas: normalizeTargetAreas(targetAreas),
      };

      // Add exercise environments with priority logic
      if (exerciseEnvironments) {
        // Use user's selected value if available, but normalize to English
        profileData.exerciseEnvironments =
          normalizeExerciseEnvironment(exerciseEnvironments);
      } else if (activeExerciseProgram?.questionnaire?.exerciseEnvironments) {
        // Prioritize exercise program environments
        const exerciseEnvs =
          activeExerciseProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
          profileData.exerciseEnvironments = exerciseEnvs[0];
        } else if (typeof exerciseEnvs === 'string') {
          profileData.exerciseEnvironments = exerciseEnvs;
        }
      } else if (activeRecoveryProgram?.questionnaire?.exerciseEnvironments) {
        // Fall back to recovery program environments
        const recoveryEnvs =
          activeRecoveryProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(recoveryEnvs) && recoveryEnvs.length > 0) {
          profileData.exerciseEnvironments = recoveryEnvs[0];
        } else if (typeof recoveryEnvs === 'string') {
          profileData.exerciseEnvironments = recoveryEnvs;
        }
      }

      // Add workout duration
      if (workoutDuration) {
        profileData.workoutDuration = normalizeWorkoutDuration(workoutDuration);
      }

      // Update user profile using the AuthContext method
      await updateUserProfile(profileData);

      setDirty(false);
      setIsLoading(false);
      setEditingField(null);
      setIsEditing(false);
      setPreviewURL(''); // Clear preview after successful save

      // Keep sections in their current expanded/collapsed state after saving

      // Show success message
      setMessage({
        type: 'success',
        text: t('profile.profileUpdated'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false);
      setError(
        error instanceof Error ? error.message : t('profile.updateError')
      );
      setMessage({
        type: 'error',
        text: t('profile.updateError'),
      });
    }
  };

  // Add an effect to pull questionnaire data
  useEffect(() => {
    // Get the most recent program of each type
    const exercisePrograms = userPrograms?.filter((program) => program.type === 'exercise') ?? [];
    const recoveryPrograms = userPrograms?.filter((program) => program.type === 'recovery') ?? [];
    const exerciseAndRecoveryPrograms = userPrograms?.filter((program) => program.type === 'exercise_and_recovery') ?? [];
    
    // Sort by updatedAt descending and get the first (most recent)
    const sortByDate = (a: { updatedAt: Date }, b: { updatedAt: Date }) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    
    const activeExerciseProgram = exercisePrograms.sort(sortByDate)[0];
    const activeRecoveryProgram = recoveryPrograms.sort(sortByDate)[0];
    const activeExerciseAndRecoveryProgram = exerciseAndRecoveryPrograms.sort(sortByDate)[0];

    // Collect questionnaire data from all active programs
    const questionnaires = [];

    // Add exercise program questionnaire if available
    if (activeExerciseProgram?.questionnaire) {
      questionnaires.push(activeExerciseProgram.questionnaire);
    }

    // Add exercise_and_recovery program questionnaire if available
    if (activeExerciseAndRecoveryProgram?.questionnaire) {
      questionnaires.push(activeExerciseAndRecoveryProgram.questionnaire);
    }

    // Add recovery program questionnaire if available
    if (activeRecoveryProgram?.questionnaire) {
      questionnaires.push(activeRecoveryProgram.questionnaire);
    }

    // Add standalone questionnaire answers if available
    if (questionnaireAnswers) {
      questionnaires.push(questionnaireAnswers);
    }

    // Only proceed if we have questionnaire data
    if (questionnaires.length > 0) {
      // Set date of birth from questionnaire only if not already set
      if (!dateOfBirth && !user?.profile?.dateOfBirth) {
        setDateOfBirthFromQuestionnaire();
      }

      // For each field, try to find a value from any of the questionnaires

      // Exercise frequency
      if (!exerciseFrequency && !user?.profile?.exerciseFrequency) {
        for (const questionnaireData of questionnaires) {
          if (questionnaireData.lastYearsExerciseFrequency) {
            setExerciseFrequency(questionnaireData.lastYearsExerciseFrequency);
            break;
          }
        }
      }

      // Workout duration
      if (!workoutDuration && !user?.profile?.workoutDuration) {
        for (const questionnaireData of questionnaires) {
          if (questionnaireData.workoutDuration) {
            setWorkoutDuration(questionnaireData.workoutDuration);
            break;
          }
        }
      }

      // Painful areas - combine from all active programs without duplicates
      if (painfulAreas.length === 0 && !user?.profile?.painfulAreas) {
        // Create a Set to track unique painful areas
        const uniquePainfulAreas = new Set<string>();

        // First check active exercise program
        if (activeExerciseProgram?.questionnaire?.generallyPainfulAreas) {
          activeExerciseProgram.questionnaire.generallyPainfulAreas.forEach(
            (area) => uniquePainfulAreas.add(normalizeBodyPartName(area, t))
          );
        }

        // Then check active exercise_and_recovery program
        if (activeExerciseAndRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
          activeExerciseAndRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(
            (area) => uniquePainfulAreas.add(normalizeBodyPartName(area, t))
          );
        }

        // Then check active recovery program
        if (activeRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
          activeRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(
            (area) => uniquePainfulAreas.add(normalizeBodyPartName(area, t))
          );
        }

        // Next check recovery programs for painful areas
        const recoveryAreas = getPainfulAreasFromRecoveryPrograms();
        recoveryAreas.forEach((area) =>
          uniquePainfulAreas.add(normalizeBodyPartName(area, t))
        );

        // Finally check other questionnaires
        for (const questionnaireData of questionnaires) {
          if (
            questionnaireData.generallyPainfulAreas &&
            questionnaireData.generallyPainfulAreas.length > 0
          ) {
            questionnaireData.generallyPainfulAreas.forEach((area) =>
              uniquePainfulAreas.add(normalizeBodyPartName(area, t))
            );
          }
        }

        // If we found any painful areas, set them
        if (uniquePainfulAreas.size > 0) {
          setPainfulAreas(Array.from(uniquePainfulAreas));
        }
      }

      // Exercise modalities
      if (
        exerciseModalities.length === 0 &&
        !user?.profile?.exerciseModalities
      ) {
        for (const questionnaireData of questionnaires) {
          if (questionnaireData.exerciseModalities) {
            if (Array.isArray(questionnaireData.exerciseModalities)) {
              // Normalize array values to lowercase for consistent comparison
              setExerciseModalities(
                questionnaireData.exerciseModalities.map((m) => m.toLowerCase())
              );
              break;
            } else if (
              typeof questionnaireData.exerciseModalities === 'string'
            ) {
              // Split comma-separated string, trim each value, and normalize to lowercase
              setExerciseModalities(
                questionnaireData.exerciseModalities
                  .split(',')
                  .map((item) => item.trim().toLowerCase())
                  .filter(Boolean)
              );
              break;
            }
          }
        }
      }

      // Ensure recovery is included in exerciseModalities if there's an active recovery program
      if (
        activeRecoveryProgram &&
        !exerciseModalities.includes('recovery') &&
        !user?.profile?.exerciseModalities?.includes('recovery')
      ) {
        setExerciseModalities((prev) => [...prev, 'recovery']);
      }

      // Target areas
      if (targetAreas.length === 0 && !user?.profile?.targetAreas) {
        for (const questionnaireData of questionnaires) {
          if (
            questionnaireData.targetAreas &&
            questionnaireData.targetAreas.length > 0
          ) {
            setTargetAreas(questionnaireData.targetAreas);
            break;
          }
        }
      }

      // Exercise environments - prioritize exercise program over recovery
      if (!exerciseEnvironments && !user?.profile?.exerciseEnvironments) {
        let environmentValue = null;

        // First check active exercise program
        if (activeExerciseProgram?.questionnaire?.exerciseEnvironments) {
          const exerciseEnvs =
            activeExerciseProgram.questionnaire.exerciseEnvironments;
          if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
            environmentValue = exerciseEnvs[0];
          } else if (typeof exerciseEnvs === 'string') {
            environmentValue = exerciseEnvs;
          }
        }
        // Then check active recovery program if no exercise program
        else if (activeRecoveryProgram?.questionnaire?.exerciseEnvironments) {
          const recoveryEnvs =
            activeRecoveryProgram.questionnaire.exerciseEnvironments;
          if (Array.isArray(recoveryEnvs) && recoveryEnvs.length > 0) {
            environmentValue = recoveryEnvs[0];
          } else if (typeof recoveryEnvs === 'string') {
            environmentValue = recoveryEnvs;
          }
        }
        // Finally check other questionnaires
        else {
          for (const questionnaireData of questionnaires) {
            if (questionnaireData.exerciseEnvironments) {
              if (
                Array.isArray(questionnaireData.exerciseEnvironments) &&
                questionnaireData.exerciseEnvironments.length > 0
              ) {
                environmentValue = questionnaireData.exerciseEnvironments[0];
                break;
              } else if (
                typeof questionnaireData.exerciseEnvironments === 'string'
              ) {
                environmentValue = questionnaireData.exerciseEnvironments;
                break;
              }
            }
          }
        }

        // Set the exercise environment if a value was found
        if (environmentValue) {
          setExerciseEnvironments(environmentValue);
        }
      }

      // Time availability - prioritize exercise program over recovery
      if (!timeAvailability && !user?.profile?.timeAvailability) {
        let timeAvailabilityValue = null;

        // First check active exercise program
        if (activeExerciseProgram?.questionnaire?.workoutDuration) {
          timeAvailabilityValue =
            activeExerciseProgram.questionnaire.workoutDuration;
        }
        // Then check active recovery program if no exercise program
        else if (activeRecoveryProgram?.questionnaire?.workoutDuration) {
          timeAvailabilityValue =
            activeRecoveryProgram.questionnaire.workoutDuration;
        }
        // Finally check other questionnaires
        else {
          for (const questionnaireData of questionnaires) {
            if (questionnaireData.workoutDuration) {
              timeAvailabilityValue = questionnaireData.workoutDuration;
              break;
            }
          }
        }

        // Set the time availability if a value was found
        if (timeAvailabilityValue) {
          setTimeAvailability(timeAvailabilityValue);
        }
      }

      // Infer health goals from target areas if not set
      if (
        targetAreas.length > 0 &&
        healthGoals.length === 0 &&
        !user?.profile?.healthGoals
      ) {
        setHealthGoals(['Improve strength', 'Build muscle']);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userPrograms,
    questionnaireAnswers,
    dateOfBirth,
    exerciseFrequency,
    workoutDuration,
    painfulAreas,
    exerciseModalities,
    exerciseEnvironments,
    targetAreas,
    timeAvailability,
    injuries,
    healthGoals,
    user,
  ]);

  // Add a function to mark form as dirty when changes are made
  const _markAsDirty = () => {
    setDirty(true);
  };

  // Update handleEdit to also set isEditing to true and expand the appropriate section
  const handleEdit = (field: string) => {
    setEditingField(field);
    setIsEditing(true); // Show the Save/Cancel buttons

    // Log exercise modalities if editing that field
    if (field === 'exerciseModalities') {
      console.log('Current exercise modalities:', exerciseModalities);
    }

    // For profile photo, enter edit mode and auto-launch file picker
    if (field === 'profilePhoto') {
      // Trigger file picker after a delay to allow state to update and render the input
      // Increased delay to account for Info menu expansion rendering
      setTimeout(() => {
        // Try desktop input first, then mobile
        const input = document.getElementById('profile-upload-desktop-general') as HTMLInputElement
          || document.getElementById('profile-upload-mobile') as HTMLInputElement
          || document.getElementById('profile-upload') as HTMLInputElement;
        input?.click();
      }, 300);
      return;
    }

    // Expand the appropriate section based on the field being edited
    if (['displayName', 'phone', 'dateOfBirth'].includes(field)) {
      setGeneralExpanded(true);
      // Add delay to allow state to update before scrolling
      setTimeout(() => {
        document
          .querySelector('[data-section="general"]')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (['userHeight', 'weight', 'gender'].includes(field)) {
      setHealthBasicsExpanded(true);
      setTimeout(() => {
        document
          .querySelector('[data-section="healthBasics"]')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'medicalConditions',
        'medications',
        'injuries',
        'painfulAreas',
        'familyHistory',
      ].includes(field)
    ) {
      setMedicalBackgroundExpanded(true);
      setTimeout(() => {
        document
          .querySelector('[data-section="medicalBackground"]')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'fitnessLevel',
        'exerciseFrequency',
        'exerciseModalities',
        'targetAreas',
        'sleepPattern',
      ].includes(field)
    ) {
      setFitnessProfileExpanded(true);
      setTimeout(() => {
        document
          .querySelector('[data-section="fitnessProfile"]')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'healthGoals',
        'exerciseEnvironments',
        'timeAvailability',
        'dietaryPreferences',
      ].includes(field)
    ) {
      setGoalsPreferencesExpanded(true);
      setTimeout(() => {
        document
          .querySelector('[data-section="goalsPreferences"]')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Function to reset view and collapse all sections except General
  const _resetViewAndCollapseSections = () => {
    // Collapse all sections except General
    setGeneralExpanded(true); // Keep general section expanded
    setHealthBasicsExpanded(false);
    setMedicalBackgroundExpanded(false);
    setFitnessProfileExpanded(false);
    setGoalsPreferencesExpanded(false);

    // Wait for state updates to be applied, then scroll
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 50);
  };

  // Function to handle canceling edits
  const handleCancelEdit = () => {
    setEditingField(null);
    setIsEditing(false);
    setPreviewURL(''); // Clear any unsaved photo preview

    // Keep sections in their current expanded/collapsed state

    // Reset any unsaved changes by reloading user profile data
    loadUserProfile();
    setDirty(false);
  };

  // Add function to get painful areas from recovery and exercise_and_recovery programs
  const getPainfulAreasFromRecoveryPrograms = () => {
    if (!userPrograms) return [];

    // Filter for recovery and exercise_and_recovery programs (both have recovery components)
    const recoveryPrograms = userPrograms.filter(
      (program) => program.type === 'recovery' || program.type === 'exercise_and_recovery'
    );

    // Collect all painful areas from these programs
    const allPainfulAreas = new Set<string>();

    recoveryPrograms.forEach((program) => {
      if (
        program.questionnaire &&
        program.questionnaire.generallyPainfulAreas
      ) {
        program.questionnaire.generallyPainfulAreas.forEach((area) => {
          allPainfulAreas.add(area);
        });
      }
    });

    return Array.from(allPainfulAreas);
  };

  return (
    <>
      <NavigationMenu mobileTitle={t('nav.profile')} />
      <style jsx global>{`
        .phone-input-container .PhoneInput {
          display: flex;
          align-items: stretch;
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: #2d3748;
          border: ${!phoneValid ? '1px solid #EF4444' : '1px solid #4a5568'};
          height: 42px;
        }

        .phone-input-container .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0 0.5rem 0 0.75rem;
          background-color: #2d3748;
          border-right: 1px solid #4a5568;
          min-width: 80px;
          position: relative;
        }

        .phone-input-container .PhoneInputCountryIcon {
          margin-right: 0.5rem;
        }

        .phone-input-container .PhoneInputCountrySelectArrow {
          border-style: solid;
          border-width: 0.35em 0.35em 0 0.35em;
          border-color: #a0aec0 transparent transparent transparent;
          margin-left: 0.5rem;
          transform: rotate(0deg); /* Ensure arrow points downward */
        }

        /* Add rotation for when the dropdown is open */
        .phone-input-container
          .PhoneInputCountrySelect[aria-expanded='true']
          + .PhoneInputCountrySelectArrow {
          transform: rotate(180deg);
        }

        .phone-input-container .PhoneInputInput {
          flex: 1;
          min-width: 0;
          background-color: #2d3748;
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          outline: none;
        }

        .phone-input-container .PhoneInputInput:focus {
          outline: none;
        }

        /* Make sure dropdown appears above other elements */
        body .PhoneInputCountrySelect-menuOpen {
          background-color: #1a202c !important;
          border: 1px solid #4a5568 !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
          margin-top: 4px !important;
          z-index: 9999 !important;
          position: absolute !important;
          max-height: 300px !important;
          overflow-y: auto !important;
        }

        .PhoneInputCountrySelect__option {
          padding: 0.5rem 1rem !important;
          color: #e2e8f0 !important;
        }

        .PhoneInputCountrySelect__option:hover,
        .PhoneInputCountrySelect__option--focused {
          background-color: #2d3748 !important;
        }

        .PhoneInputCountrySelect__option--selected {
          background-color: #4f46e5 !important;
          color: white !important;
        }
      `}</style>
      <style jsx global>
        {fadeInAnimation}
      </style>
      <div className="bg-gray-900 flex flex-col flex-1">
        {/* Message display */}
        {message && (
          <div
            className={`fixed top-16 left-0 right-0 mx-auto max-w-md z-50 p-3 rounded-lg shadow-lg ${
              message.type === 'success'
                ? 'bg-green-900/50 text-green-200 backdrop-blur-sm'
                : 'bg-red-900/50 text-red-200 backdrop-blur-sm'
            }`}
          >
            {message.text}
            <button
              className="float-right text-sm opacity-70 hover:opacity-100"
              onClick={() => setMessage(null)}
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Desktop Layout */}
        {isDesktop ? (
          <ProfileDesktopLayout
            photoURL={previewURL || photoURL}
            email={user?.email}
            activeSection={activeSection}
            activeView={activeView}
            onSectionClick={handleSidebarSectionClick}
            onDataControlsClick={handlePrivacyClick}
            onPrivacyPolicyClick={handlePrivacyPolicyClick}
            onLogoutClick={handleLogout}
            onPhotoClick={() => {
              setIsInfoExpanded(true);
              setActiveView('info');
              handleEdit('profilePhoto');
            }}
            isInfoExpanded={isInfoExpanded}
            onInfoToggle={handleInfoToggle}
            sectionCompletion={{
              general: !!(displayName && phone && dateOfBirth),
              healthBasics: !!(userHeight && weight && gender),
              fitnessProfile: !!(fitnessLevel && exerciseFrequency && exerciseModalities.length > 0),
              medicalBackground: !!(medicalConditions.length > 0 && medications.length > 0 && injuries.length > 0 && familyHistory.length > 0),
              customNotes: customNotes.length > 0,
            }}
          >
            {activeView === 'info' ? (
            <div ref={topRef} className={`${isEditing ? 'pb-32' : 'pb-8'}`}>
            {/* Info banner explaining data usage */}
            <div className="mb-6">
              <InfoBanner
                title={t('profile.dataUsageInfo.title')}
                subtitle={t('profile.dataUsageInfo.subtitle')}
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
              {/* Profile photo section hidden on desktop - it's in the sidebar */}
              <div className="hidden">
                {/* Profile Image Section START - Hidden on desktop */}
                <div className="relative mx-auto w-32 h-32 mb-4">
                  {isEditing ? (
                    <>
                      <input
                        type="file"
                        id="profile-upload"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="cursor-pointer block relative w-full h-full rounded-full overflow-hidden border-2 border-indigo-600"
                      >
                        {previewURL ? (
                          <img
                            src={previewURL}
                            alt={t('profile.profilePreview')}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                            <span>{t('profile.addPhoto')}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="bg-indigo-600 rounded-full p-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div
                      onClick={() => handleEdit('profilePhoto')}
                      className="cursor-pointer relative w-full h-full rounded-full overflow-hidden"
                    >
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={t('profile.profilePhoto')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                          <span>{t('profile.noPhoto')}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                        <div className="bg-indigo-600 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-center text-gray-400">{user?.email}</p>
              </div>
              {/* End of hidden profile photo section */}

              <div className="w-full text-left">
                <div className="">
                  {/* General Section START */}
                  {activeSection === 'general' && (
                  <div>
                    <div
                      className={`flex justify-between items-center py-4 rounded-lg transition-colors ${!isDesktop ? 'cursor-pointer hover:bg-gray-700/30' : ''}`}
                      onClick={() => !isDesktop && setGeneralExpanded(!generalExpanded)}
                      data-section="general"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-indigo-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium">
                          {t('profile.sections.general')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit icon - desktop only */}
                        {isDesktop && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                            }}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                            aria-label={t('profile.actions.editProfile')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                        {!isDesktop && (
                          <div className="text-gray-400 hover:text-white">
                            {generalExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* General section content */}
                  {generalExpanded && (
                    <div className="space-y-4" style={sectionContentStyle}>
                      {/* Profile Photo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.profilePhoto')}
                        </label>
                        <div className="relative w-20 h-20">
                          {isEditing ? (
                            <>
                              <input type="file" id="profile-upload-desktop-general" onChange={handleFileChange} accept="image/*" className="hidden" />
                              <label htmlFor="profile-upload-desktop-general" className="cursor-pointer block relative w-full h-full rounded-full overflow-hidden border-2 border-indigo-600">
                                {previewURL ? (
                                  <img src={previewURL} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : photoURL ? (
                                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                                    <span>{t('profile.addPhoto')}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                  <div className="bg-indigo-600 rounded-full p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </div>
                                </div>
                              </label>
                            </>
                          ) : (
                            <div onClick={() => handleEdit('profilePhoto')} className="cursor-pointer relative w-full h-full rounded-full overflow-hidden">
                              {photoURL ? (
                                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                                  <span>{t('profile.addPhoto')}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                                <div className="bg-indigo-600 rounded-full p-1.5 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.email')}
                        </label>
                        <p className="text-white text-left">{user?.email || t('profile.notSet')}</p>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.name')}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                          />
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('displayName')}
                          >
                            {displayName || t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.phone')}
                        </label>
                        {isEditing ? (
                          <div className="phone-input-container">
                            <div>
                              <PhoneInput
                                international
                                defaultCountry="NO"
                                value={phone}
                                onChange={handlePhoneChange}
                                countryCallingCodeEditable={false}
                                withCountryCallingCode
                                addInternationalOption={false}
                                focusInputOnCountrySelection
                              />
                            </div>
                            {!phoneValid && (
                              <p className="text-red-400 text-sm mt-1">
                                {phoneError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => setIsEditing(true)}
                          >
                            {phone ? formatPhoneNumberIntl(phone) : t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="pb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.dateOfBirth')}
                        </label>
                        {editingField === 'dateOfBirth' ? (
                          <div>
                            <input
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => {
                                setDateOfBirth(e.target.value);
                                // No auto-save, just wait for Save button
                              }}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white [color-scheme:dark]"
                              max={new Date().toISOString().split('T')[0]}
                              style={{ colorScheme: 'dark' }}
                              onBlur={() => setEditingField(null)}
                            />
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('dateOfBirth')}
                          >
                            {dateOfBirth
                              ? new Date(dateOfBirth).toLocaleDateString()
                              : t('profile.notSet')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                  {/* General Section END */}

                  {/* Health Basics Section START */}
                  {activeSection === 'healthBasics' && (
                  <div>
                    <div
                      className={`flex justify-between items-center py-4 rounded-lg transition-colors ${!isDesktop ? 'cursor-pointer hover:bg-gray-700/30' : ''}`}
                      onClick={() => !isDesktop && setHealthBasicsExpanded(!healthBasicsExpanded)}
                      data-section="healthBasics"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-indigo-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 00-.707.293l-4 4a1 1 0 01-1.414-1.414l4-4A3 3 0 0110 1a3 3 0 012.12.879l4 4a1 1 0 01-1.414 1.414l-4-4A1 1 0 0010 3zm0 9a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 01-.707-.293 1 1 0 010-1.414l4-4a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium">
                          {t('profile.sections.healthBasics')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit icon - desktop only */}
                        {isDesktop && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                            }}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                            aria-label={t('profile.actions.editProfile')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                        {!isDesktop && (
                          <div className="text-gray-400 hover:text-white">
                            {healthBasicsExpanded ? (
                              <ExpandedIcon />
                            ) : (
                              <CollapsedIcon />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Health Basics content */}
                  {healthBasicsExpanded && (
                    <div className="space-y-4" style={sectionContentStyle}>
                      {/* Height */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.height')}
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={userHeight}
                              onChange={(e) => setUserHeight(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 pr-10 text-white"
                              min="50"
                              max="250"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                              cm
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('userHeight')}
                          >
                            {userHeight
                              ? `${userHeight} cm`
                              : t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.weight')}
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 pr-10 text-white"
                              min="20"
                              max="300"
                              step="0.1"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                              kg
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('weight')}
                          >
                            {weight ? `${weight} kg` : t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="pb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.gender')}
                        </label>
                        {isEditing ? (
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                          >
                            <option value="">
                              {t('profile.selectGender')}
                            </option>
                            <option value="male">
                              {t('profile.gender.male')}
                            </option>
                            <option value="female">
                              {t('profile.gender.female')}
                            </option>
                            <option value="non-binary">
                              {t('profile.gender.nonBinary')}
                            </option>
                            <option value="prefer-not-to-say">
                              {t('profile.gender.preferNotToSay')}
                            </option>
                          </select>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                            onClick={() => handleEdit('gender')}
                          >
                            {gender
                              ? t(`profile.gender.${
                                  {
                                    'male': 'male',
                                    'female': 'female',
                                    'non-binary': 'nonBinary',
                                    'prefer-not-to-say': 'preferNotToSay',
                                  }[gender] || gender
                                }`)
                              : t('profile.notSet')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                  {/* Health Basics Section END */}

                  {/* Fitness Profile Section START */}
                  {activeSection === 'fitnessProfile' && (
                  <div>
                    <div
                      className={`flex justify-between items-center py-4 rounded-lg transition-colors ${!isDesktop ? 'cursor-pointer hover:bg-gray-700/30' : ''}`}
                      onClick={() => !isDesktop && setFitnessProfileExpanded(!fitnessProfileExpanded)}
                      data-section="fitnessProfile"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-indigo-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium">
                          {t('profile.sections.fitnessProfile')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit icon - desktop only */}
                        {isDesktop && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                            }}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                            aria-label={t('profile.actions.editProfile')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                        {!isDesktop && (
                          <div className="text-gray-400 hover:text-white">
                            {fitnessProfileExpanded ? (
                              <ExpandedIcon />
                            ) : (
                              <CollapsedIcon />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Fitness Profile content */}
                  {fitnessProfileExpanded && (
                    <div className="space-y-4" style={sectionContentStyle}>
                      {/* Fitness Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.fitnessLevel')}
                        </label>
                        {editingField === 'fitnessLevel' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              {getFitnessLevels(t).map((level) => (
                                <label
                                  key={level.id}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="fitnessLevel"
                                    value={level.id}
                                    checked={fitnessLevel === level.id}
                                    onChange={(e) => {
                                      setFitnessLevel(e.target.value);
                                    }}
                                    className="peer sr-only"
                                  />
                                  <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                    <div className="font-medium capitalize">
                                      {level.name}
                                    </div>
                                    <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                                      {level.description}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {/* Done button */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => setEditingField(null)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                              >
                                {t('common.done')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                            onClick={() => handleEdit('fitnessLevel')}
                          >
                            {fitnessLevel ? t(`profile.${fitnessLevel.toLowerCase()}.name`) : t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Exercise Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.exerciseFrequency')}
                        </label>
                        {isEditing ? (
                          <select
                            value={exerciseFrequency}
                            onChange={(e) =>
                              setExerciseFrequency(e.target.value)
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                          >
                            <option value="">
                              {t('profile.selectFrequency')}
                            </option>
                            {translatedPlannedFrequencyOptions.map(
                              (frequency) => (
                                <option key={frequency} value={frequency}>
                                  {frequency}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('exerciseFrequency')}
                          >
                            {exerciseFrequency || t('profile.notSet')}
                          </p>
                        )}
                      </div>

                      {/* Exercise Modalities */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.exerciseModalities')}
                        </label>
                        {editingField === 'exerciseModalities' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              {PROFILE_EXERCISE_MODALITIES.map((modality) => (
                                <label
                                  key={modality.name}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    name="exerciseModalities"
                                    value={modality.name}
                                    checked={exerciseModalities.some(
                                      (m) =>
                                        m.toLowerCase() ===
                                        modality.name.toLowerCase()
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setExerciseModalities([
                                          ...exerciseModalities,
                                          modality.name,
                                        ]);
                                      } else {
                                        setExerciseModalities(
                                          exerciseModalities.filter(
                                            (m) =>
                                              m.toLowerCase() !==
                                              modality.name.toLowerCase()
                                          )
                                        );
                                      }
                                    }}
                                    className="peer sr-only"
                                  />
                                  <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                    <div className="font-medium capitalize">
                                      {t(`profile.modality.${modality.name}`)}
                                    </div>
                                    <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                                      {modality.description(t)}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {/* Done button */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => setEditingField(null)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                              >
                                {t('common.done')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                            onClick={() => handleEdit('exerciseModalities')}
                          >
                            {exerciseModalities.length > 0 ? (
                              <ProfileValueDisplay
                                value={exerciseModalities}
                                translationPrefix="profile.modality"
                              />
                            ) : (
                              t('profile.notSet')
                            )}
                          </p>
                        )}
                      </div>

                      {/* Workout Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.workoutDuration')}
                        </label>
                        {editingField === 'workoutDuration' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {translatedWorkoutDurations.map((duration) => (
                                <label
                                  key={duration}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="workoutDuration"
                                    value={duration}
                                    checked={workoutDuration === duration}
                                    onChange={(e) => {
                                      setWorkoutDuration(e.target.value);
                                    }}
                                    className="peer sr-only"
                                  />
                                  <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                    {duration}
                                  </div>
                                </label>
                              ))}
                            </div>

                            {/* Done button */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => setEditingField(null)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                              >
                                {t('common.done')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('workoutDuration')}
                          >
                            {workoutDuration ? (
                              <ProfileValueDisplay
                                value={workoutDuration}
                                translationPrefix="profile.duration"
                              />
                            ) : (
                              t('profile.notSet')
                            )}
                          </p>
                        )}
                      </div>

                      {/* Dietary Preferences */}
                      <div className="pb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.dietaryPreferences')}
                        </label>
                        {editingField === 'dietaryPreferences' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {dietaryPreferencesOptions.map((diet) => {
                                // Create a translation helper to map between UI language and English storage values
                                const getDietEnglishKey = (
                                  displayValue: string
                                ): string => {
                                  if (!displayValue) return '';

                                  // Normalize the displayed value
                                  const normalizedDisplay = displayValue
                                    .toLowerCase()
                                    .replace(/\s+/g, '');

                                  // Special cases with spaces that might exist in the data
                                  const specialCases: Record<string, string> = {
                                    'low carb': 'lowCarb',
                                    'low fat': 'lowFat',
                                    'gluten free': 'glutenFree',
                                    'dairy free': 'dairyFree',
                                    'intermittent fasting':
                                      'intermittentFasting',
                                    'no specific diet': 'noSpecificDiet',
                                  };

                                  // Check if it's a special case with spaces
                                  if (
                                    specialCases[displayValue.toLowerCase()]
                                  ) {
                                    return specialCases[
                                      displayValue.toLowerCase()
                                    ];
                                  }

                                  // Map of displayed values (in any language) to English storage keys
                                  const displayToEnglish: Record<
                                    string,
                                    string
                                  > = {
                                    // Norwegian display values to English keys
                                    ingenspesifikkdiett: 'noSpecificDiet',
                                    vegetarianer: 'vegetarian',
                                    veganer: 'vegan',
                                    pescetarianer: 'pescatarian',
                                    paleo: 'paleo',
                                    keto: 'keto',
                                    kjøtteter: 'carnivore',
                                    lavkarbo: 'lowCarb',
                                    lavfett: 'lowFat',
                                    glutenfri: 'glutenFree',
                                    melkefri: 'dairyFree',
                                    middelhavskost: 'mediterranean',
                                    intermitterendefasting:
                                      'intermittentFasting',

                                    // English display values to English keys (for consistency)
                                    nospecificdiett: 'noSpecificDiet',
                                    vegetarian: 'vegetarian',
                                    vegan: 'vegan',
                                    pescatarian: 'pescatarian',
                                    carnivore: 'carnivore',
                                    lowcarb: 'lowCarb',
                                    lowfat: 'lowFat',
                                    glutenfree: 'glutenFree',
                                    dairyfree: 'dairyFree',
                                    mediterranean: 'mediterranean',
                                    intermittentfasting: 'intermittentFasting',
                                  };

                                  return (
                                    displayToEnglish[normalizedDisplay] ||
                                    displayValue
                                  );
                                };

                                // Get the English equivalent of this displayed diet option
                                const englishKey = getDietEnglishKey(diet);

                                // Check if this option is selected by comparing with stored values
                                const isSelected = dietaryPreferences.some(
                                  (pref) => {
                                    // Get the English key for the stored preference
                                    const normalizedPref = pref
                                      .toLowerCase()
                                      .replace(/\s+/g, '');
                                    const prefEnglishKey =
                                      normalizedPref === 'lowcarb' ||
                                      normalizedPref === 'low carb'
                                        ? 'lowCarb' // Special case for Low Carb
                                        : normalizedPref === 'kjøtteter' ||
                                            normalizedPref === 'carnivore'
                                          ? 'carnivore' // Special case for carnivore
                                          : getDietEnglishKey(pref);

                                    // Compare keys in a case-insensitive way
                                    return (
                                      prefEnglishKey.toLowerCase() ===
                                        englishKey.toLowerCase() ||
                                      pref.toLowerCase() === diet.toLowerCase()
                                    );
                                  }
                                );

                                return (
                                  <label
                                    key={diet}
                                    className="relative flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      name="dietaryPreference"
                                      value={diet}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        // Always store the English version in the state
                                        const englishValue =
                                          getDietEnglishKey(diet);

                                        if (e.target.checked) {
                                          // Add to selection - use the English key if available
                                          setDietaryPreferences([
                                            ...dietaryPreferences,
                                            englishValue,
                                          ]);
                                        } else {
                                          // Remove from selection - remove both translated and English versions
                                          setDietaryPreferences(
                                            dietaryPreferences.filter(
                                              (item) =>
                                                item.toLowerCase() !==
                                                englishValue.toLowerCase()
                                            )
                                          );
                                        }
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                      {diet}
                                    </div>
                                  </label>
                                );
                              })}
                              {/* Render custom diets that are not in predefined options */}
                              {dietaryPreferences
                                .filter((pref) => {
                                  // Check if this preference is NOT a predefined option
                                  const normalizedPref = pref.toLowerCase().replace(/\s+/g, '');
                                  const predefinedKeys = [
                                    'vegetarian', 'vegan', 'pescatarian', 'paleo', 'keto',
                                    'carnivore', 'lowcarb', 'lowfat', 'glutenfree', 'dairyfree',
                                    'mediterranean', 'intermittentfasting',
                                    // Norwegian variants
                                    'vegetarianer', 'veganer', 'pescetarianer', 'kjøtteter',
                                    'lavkarbo', 'lavfett', 'glutenfri', 'melkefri',
                                    'middelhavskost', 'intermitterendefasting'
                                  ];
                                  return !predefinedKeys.includes(normalizedPref);
                                })
                                .map((customDiet) => (
                                  <label
                                    key={`custom-${customDiet}`}
                                    className="relative flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={true}
                                      onChange={() => {
                                        setDietaryPreferences(
                                          dietaryPreferences.filter(
                                            (item) => item !== customDiet
                                          )
                                        );
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                      {customDiet}
                                    </div>
                                  </label>
                                ))}
                            </div>

                            {/* Custom diet input */}
                            <div>
                              <p className="text-gray-400 text-sm mb-2">
                                {t('profile.fields.addCustomDiet')}
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  id="custom-diet"
                                  placeholder={t(
                                    'profile.fields.enterCustomDiet'
                                  )}
                                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === 'Enter' &&
                                      e.currentTarget.value.trim()
                                    ) {
                                      const customDiet =
                                        e.currentTarget.value.trim();
                                      if (
                                        !dietaryPreferences.includes(customDiet)
                                      ) {
                                        setDietaryPreferences([
                                          ...dietaryPreferences,
                                          customDiet,
                                        ]);
                                      }
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const customDietInput =
                                      document.getElementById(
                                        'custom-diet'
                                      ) as HTMLInputElement;
                                    if (
                                      customDietInput &&
                                      customDietInput.value.trim()
                                    ) {
                                      const customDiet =
                                        customDietInput.value.trim();
                                      if (
                                        !dietaryPreferences.includes(customDiet)
                                      ) {
                                        setDietaryPreferences([
                                          ...dietaryPreferences,
                                          customDiet,
                                        ]);
                                      }
                                      customDietInput.value = '';
                                    }
                                  }}
                                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                                >
                                  {t('common.add')}
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                {t('common.done')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('dietaryPreferences')}
                          >
                            {dietaryPreferences.length > 0 ? (
                              <ProfileValueDisplay
                                value={dietaryPreferences}
                                translationPrefix="profile.diet"
                              />
                            ) : (
                              t('profile.notSet')
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                  {/* Goals and Preferences Section END */}
                  {/* Medical Background Section START */}
                  {activeSection === 'medicalBackground' && (
                  <div>
                    <div
                      className={`flex justify-between items-center py-4 rounded-lg transition-colors ${!isDesktop ? 'cursor-pointer hover:bg-gray-700/30' : ''}`}
                      onClick={() => !isDesktop && setMedicalBackgroundExpanded(!medicalBackgroundExpanded)}
                      data-section="medicalBackground"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-indigo-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium">
                          {t('profile.sections.medical')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit icon - desktop only */}
                        {isDesktop && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                            }}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                            aria-label={t('profile.actions.editProfile')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                        {!isDesktop && (
                          <div className="text-gray-400 hover:text-white">
                            {medicalBackgroundExpanded ? (
                              <ExpandedIcon />
                            ) : (
                              <CollapsedIcon />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Medical Background content */}
                  {medicalBackgroundExpanded && (
                    <div className="space-y-4" style={sectionContentStyle}>
                      {/* Medical Conditions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.medicalConditions')}
                        </label>
                        {isEditing ? (
                          <textarea
                            value={medicalConditions.join(', ')}
                            onChange={(e) =>
                              setMedicalConditions(
                                e.target.value
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                            placeholder={t(
                              'profile.separateWithCommas.medicalConditions'
                            )}
                          />
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('medicalConditions')}
                          >
                            {medicalConditions.length > 0
                              ? medicalConditions.join(', ')
                              : t('profile.noneSet')}
                          </p>
                        )}
                      </div>

                      {/* Medications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.medications')}
                        </label>
                        {isEditing ? (
                          <textarea
                            value={medications.join(', ')}
                            onChange={(e) =>
                              setMedications(
                                e.target.value
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                            placeholder={t(
                              'profile.separateWithCommas.medications'
                            )}
                          />
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('medications')}
                          >
                            {medications.length > 0
                              ? medications.join(', ')
                              : t('profile.noneSet')}
                          </p>
                        )}
                      </div>

                      {/* Previous Injuries */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.injuries')}
                        </label>
                        {isEditing ? (
                          <textarea
                            value={injuries.join(', ')}
                            onChange={(e) =>
                              setInjuries(
                                e.target.value
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                            placeholder={t(
                              'profile.separateWithCommas.injuries'
                            )}
                          />
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('injuries')}
                          >
                            {injuries.length > 0
                              ? injuries.join(', ')
                              : t('profile.noneSet')}
                          </p>
                        )}
                      </div>

                      {/* Painful Areas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.painfulAreas')}
                        </label>
                        {editingField === 'painfulAreas' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {translatedPainBodyParts.map((part) => {
                                // Function to convert body part display names to storage keys
                                const getBodyPartKey = (
                                  displayName: string
                                ): string => {
                                  // First try to find a direct match in PAIN_BODY_PARTS
                                  const directKey = Object.keys(
                                    PAIN_BODY_PARTS
                                  ).find((key) => {
                                    try {
                                      const translated = t(`bodyParts.${key}`);
                                      return translated === displayName;
                                    } catch {
                                      return false;
                                    }
                                  });

                                  if (directKey) return directKey;

                                  // Try camelCase to underscore conversion for common body parts
                                  const underscoreMap: Record<string, string> =
                                    {
                                      upperBack: 'upper_back',
                                      lowerBack: 'lower_back',
                                      middleBack: 'middle_back',
                                      leftShoulder: 'left_shoulder',
                                      rightShoulder: 'right_shoulder',
                                      leftUpperArm: 'left_upper_arm',
                                      rightUpperArm: 'right_upper_arm',
                                      leftElbow: 'left_elbow',
                                      rightElbow: 'right_elbow',
                                      leftForearm: 'left_forearm',
                                      rightForearm: 'right_forearm',
                                      leftHand: 'left_hand',
                                      rightHand: 'right_hand',
                                      pelvisAndHipRegion:
                                        'pelvis_and_hip_region',
                                      leftThigh: 'left_thigh',
                                      rightThigh: 'right_thigh',
                                      leftKnee: 'left_knee',
                                      rightKnee: 'right_knee',
                                      leftLowerLeg: 'left_lower_leg',
                                      rightLowerLeg: 'right_lower_leg',
                                      leftFoot: 'left_foot',
                                      rightFoot: 'right_foot',
                                    };

                                  // Try to find camelCase equivalent first
                                  for (const [
                                    camelKey,
                                    underscoreKey,
                                  ] of Object.entries(underscoreMap)) {
                                    try {
                                      const translated = t(
                                        `bodyParts.${camelKey}`
                                      );
                                      if (translated === displayName) {
                                        return underscoreKey;
                                      }
                                    } catch {
                                      // Continue to next key
                                    }
                                  }

                                  // Norwegian to English mapping
                                  const norwegianToEnglish: Record<
                                    string,
                                    string
                                  > = {
                                    'Øvre rygg': 'upper_back',
                                    Korsrygg: 'lower_back',
                                    Nakke: 'neck',
                                    Bryst: 'chest',
                                    Abdomen: 'abdomen',
                                    'Midtre rygg': 'middle_back',
                                    'Venstre skulder': 'left_shoulder',
                                    'Høyre skulder': 'right_shoulder',
                                    'Venstre overarm': 'left_upper_arm',
                                    'Høyre overarm': 'right_upper_arm',
                                    'Venstre albue': 'left_elbow',
                                    'Høyre albue': 'right_elbow',
                                    'Venstre underarm': 'left_forearm',
                                    'Høyre underarm': 'right_forearm',
                                    'Venstre hånd': 'left_hand',
                                    'Høyre hånd': 'right_hand',
                                    'Bekken- og hofteregion':
                                      'pelvis_and_hip_region',
                                    'Venstre lår': 'left_thigh',
                                    'Høyre lår': 'right_thigh',
                                    'Venstre kne': 'left_knee',
                                    'Høyre kne': 'right_knee',
                                    'Venstre legg': 'left_lower_leg',
                                    'Høyre legg': 'right_lower_leg',
                                    'Venstre fot': 'left_foot',
                                    'Høyre fot': 'right_foot',
                                  };

                                  // Check for Norwegian term
                                  if (norwegianToEnglish[displayName]) {
                                    return norwegianToEnglish[displayName];
                                  }

                                  // Fallback to the display name as the key
                                  return displayName;
                                };

                                // Function to check if a body part is selected
                                const isBodyPartSelected = (
                                  displayName: string
                                ): boolean => {
                                  if (painfulAreas.length === 0) return false;

                                  // First check direct match with display name
                                  if (painfulAreas.includes(displayName))
                                    return true;

                                  // Normalize display name for case-insensitive comparison
                                  const normalizedDisplayName =
                                    displayName.toLowerCase();
                                  if (
                                    painfulAreas.some(
                                      (area) =>
                                        area.toLowerCase() ===
                                        normalizedDisplayName
                                    )
                                  )
                                    return true;

                                  // Handle special cases for body parts with spaces
                                  const spaceToUnderscore: Record<
                                    string,
                                    string[]
                                  > = {
                                    'upper back': [
                                      'upper_back',
                                      'upperback',
                                      'upperBack',
                                    ],
                                    'lower back': [
                                      'lower_back',
                                      'lowerback',
                                      'lowerBack',
                                    ],
                                    'middle back': [
                                      'middle_back',
                                      'middleback',
                                      'middleBack',
                                    ],
                                    'left shoulder': [
                                      'left_shoulder',
                                      'leftshoulder',
                                      'leftShoulder',
                                    ],
                                    'right shoulder': [
                                      'right_shoulder',
                                      'rightshoulder',
                                      'rightShoulder',
                                    ],
                                    'left upper arm': [
                                      'left_upper_arm',
                                      'leftupperarm',
                                      'leftUpperArm',
                                    ],
                                    'right upper arm': [
                                      'right_upper_arm',
                                      'rightupperarm',
                                      'rightUpperArm',
                                    ],
                                    'left elbow': [
                                      'left_elbow',
                                      'leftelbow',
                                      'leftElbow',
                                    ],
                                    'right elbow': [
                                      'right_elbow',
                                      'rightelbow',
                                      'rightElbow',
                                    ],
                                    'left forearm': [
                                      'left_forearm',
                                      'leftforearm',
                                      'leftForearm',
                                    ],
                                    'right forearm': [
                                      'right_forearm',
                                      'rightforearm',
                                      'rightForearm',
                                    ],
                                    'left hand': [
                                      'left_hand',
                                      'lefthand',
                                      'leftHand',
                                    ],
                                    'right hand': [
                                      'right_hand',
                                      'righthand',
                                      'rightHand',
                                    ],
                                    'pelvis and hip region': [
                                      'pelvis_and_hip_region',
                                      'pelvisandhipregion',
                                      'pelvisAndHipRegion',
                                    ],
                                    'left thigh': [
                                      'left_thigh',
                                      'leftthigh',
                                      'leftThigh',
                                    ],
                                    'right thigh': [
                                      'right_thigh',
                                      'rightthigh',
                                      'rightThigh',
                                    ],
                                    'left knee': [
                                      'left_knee',
                                      'leftknee',
                                      'leftKnee',
                                    ],
                                    'right knee': [
                                      'right_knee',
                                      'rightknee',
                                      'rightKnee',
                                    ],
                                    'left lower leg': [
                                      'left_lower_leg',
                                      'leftlowerleg',
                                      'leftLowerLeg',
                                    ],
                                    'right lower leg': [
                                      'right_lower_leg',
                                      'rightlowerleg',
                                      'rightLowerLeg',
                                    ],
                                    'left foot': [
                                      'left_foot',
                                      'leftfoot',
                                      'leftFoot',
                                    ],
                                    'right foot': [
                                      'right_foot',
                                      'rightfoot',
                                      'rightFoot',
                                    ],
                                  };

                                  // Check common variations with spaces vs underscores
                                  const key = Object.keys(
                                    spaceToUnderscore
                                  ).find(
                                    (k) =>
                                      k.toLowerCase() === normalizedDisplayName
                                  );

                                  if (key) {
                                    const variations = spaceToUnderscore[key];
                                    return painfulAreas.some(
                                      (area) =>
                                        variations.includes(area) ||
                                        variations.includes(area.toLowerCase())
                                    );
                                  }

                                  // Get the storage key for this display name
                                  const storageKey =
                                    getBodyPartKey(displayName);

                                  // Check if the storage key is in painfulAreas
                                  if (
                                    painfulAreas.some(
                                      (area) =>
                                        area === storageKey ||
                                        area.toLowerCase() ===
                                          storageKey.toLowerCase()
                                    )
                                  ) {
                                    return true;
                                  }

                                  // Try converting display name format
                                  // From "Upper back" to "upper_back" or from "Upper Back" to "upper_back"
                                  const wordsToUnderscore = displayName
                                    .toLowerCase()
                                    .replace(/\s+/g, '_');
                                  if (
                                    painfulAreas.some(
                                      (area) =>
                                        area === wordsToUnderscore ||
                                        area.toLowerCase() === wordsToUnderscore
                                    )
                                  ) {
                                    return true;
                                  }

                                  // From "Upper back" to "upperBack"
                                  const wordsToCamel = displayName
                                    .toLowerCase()
                                    .replace(/\s+(.)/g, (_, char) =>
                                      char.toUpperCase()
                                    );
                                  if (
                                    painfulAreas.some(
                                      (area) =>
                                        area === wordsToCamel ||
                                        area.toLowerCase() ===
                                          wordsToCamel.toLowerCase()
                                    )
                                  ) {
                                    return true;
                                  }

                                  return false;
                                };

                                // Check if this body part is selected
                                const isSelected = isBodyPartSelected(part);

                                return (
                                  <label
                                    key={part}
                                    className="relative flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      value={part}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        let newPainfulAreas;
                                        if (e.target.checked) {
                                          // When selecting, store the English key with proper format
                                          const englishKey =
                                            getBodyPartKey(part);
                                          newPainfulAreas = [
                                            ...painfulAreas,
                                            englishKey,
                                          ];
                                        } else {
                                          // When deselecting, remove any variation of this body part
                                          const storageKey =
                                            getBodyPartKey(part);
                                          newPainfulAreas = painfulAreas.filter(
                                            (area) => {
                                              // Remove direct match with display name
                                              if (area === part) return false;

                                              // Remove match with storage key
                                              if (area === storageKey)
                                                return false;

                                              // Remove camelCase variations
                                              const camelCase =
                                                storageKey.replace(
                                                  /_([a-z])/g,
                                                  (match, letter) =>
                                                    letter.toUpperCase()
                                                );
                                              if (area === camelCase)
                                                return false;

                                              // Keep other areas
                                              return true;
                                            }
                                          );
                                        }

                                        setPainfulAreas(newPainfulAreas);
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                      {part}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="flex justify-end mt-3">
                              <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                {t('common.done')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('painfulAreas')}
                          >
                            {painfulAreas.length > 0 ? (
                              <ProfileValueDisplay
                                value={painfulAreas}
                                translationPrefix="bodyParts"
                                fallback="profile.fields.noPainAreas"
                              />
                            ) : (
                              t('profile.fields.noPainAreas')
                            )}
                          </p>
                        )}
                      </div>

                      {/* Family Medical History */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                          {t('profile.fields.familyHistory')}
                        </label>
                        {isEditing ? (
                          <textarea
                            value={familyHistory.join(', ')}
                            onChange={(e) =>
                              setFamilyHistory(
                                e.target.value
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                            placeholder={t(
                              'profile.separateWithCommas.familyHistory'
                            )}
                          />
                        ) : (
                          <p
                            className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                            onClick={() => handleEdit('familyHistory')}
                          >
                            {familyHistory.length > 0
                              ? familyHistory.join(', ')
                              : t('profile.notSet')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                  {/* Medical Background Section END */}
                  
                  {/* Custom Notes Section START */}
                  {activeSection === 'customNotes' && (
                  <div>
                    <div
                      className={`flex justify-between items-center py-4 rounded-lg transition-colors ${!isDesktop ? 'cursor-pointer hover:bg-gray-700/30' : ''}`}
                      onClick={() => !isDesktop && setCustomNotesExpanded(!customNotesExpanded)}
                      data-section="customNotes"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-indigo-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium">
                          {t('profile.customNotes.title')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Add note button - desktop only */}
                        {isDesktop && editingNoteIndex === null && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNoteIndex(-1);
                              setNoteInputValue('');
                            }}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                            aria-label={t('profile.customNotes.addNote')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                        {!isDesktop && (
                          <div className="text-gray-400 hover:text-white">
                            {customNotesExpanded ? (
                              <ExpandedIcon />
                            ) : (
                              <CollapsedIcon />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Custom Notes content - always show on desktop, use expansion on mobile */}
                  {(isDesktop || customNotesExpanded) && (
                    <div className="space-y-4" style={sectionContentStyle}>
                      <p className="text-sm text-gray-400 mb-4">
                        {t('profile.customNotes.description')}
                      </p>
                      
                      {/* List of existing notes */}
                      <div className="space-y-3">
                        {customNotes.map((note, index) => (
                          <div key={index}>
                            {editingNoteIndex === index ? (
                              <div className="space-y-2">
                                <textarea
                                  value={noteInputValue}
                                  onChange={(e) => setNoteInputValue(e.target.value)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white resize-none min-h-[100px]"
                                  placeholder={t('profile.customNotes.placeholder')}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={async () => {
                                      if (noteInputValue.trim()) {
                                        const newNotes = [...customNotes];
                                        newNotes[index] = noteInputValue.trim();
                                        setCustomNotes(newNotes);
                                        await saveCustomNotes(newNotes);
                                      }
                                      setEditingNoteIndex(null);
                                      setNoteInputValue('');
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm"
                                  >
                                    {t('common.save')}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNoteIndex(null);
                                      setNoteInputValue('');
                                    }}
                                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm"
                                  >
                                    {t('common.cancel')}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const newNotes = customNotes.filter((_, i) => i !== index);
                                      setCustomNotes(newNotes);
                                      await saveCustomNotes(newNotes);
                                      setEditingNoteIndex(null);
                                      setNoteInputValue('');
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 text-sm"
                                  >
                                    {t('common.delete')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingNoteIndex(index);
                                  setNoteInputValue(note);
                                }}
                                className="bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors group"
                              >
                                <p className="text-white whitespace-pre-wrap">{note}</p>
                                <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {t('profile.customNotes.clickToEdit')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new note */}
                      {editingNoteIndex === -1 ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteInputValue}
                            onChange={(e) => setNoteInputValue(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white resize-none min-h-[100px]"
                            placeholder={t('profile.customNotes.placeholder')}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={async () => {
                                if (noteInputValue.trim()) {
                                  const newNotes = [...customNotes, noteInputValue.trim()];
                                  setCustomNotes(newNotes);
                                  await saveCustomNotes(newNotes);
                                }
                                setEditingNoteIndex(null);
                                setNoteInputValue('');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm"
                            >
                              {t('common.save')}
                            </button>
                            <button
                              onClick={() => {
                                setEditingNoteIndex(null);
                                setNoteInputValue('');
                              }}
                              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      {/* Empty state */}
                      {customNotes.length === 0 && editingNoteIndex !== -1 && (
                        <p className="text-gray-500 italic text-center py-4">
                          {t('profile.customNotes.emptyState')}
                        </p>
                      )}
                    </div>
                  )}
                  </div>
                  )}
                  {/* Custom Notes Section END */}
                </div>
                {/* Profile Info Section END */}
              </div>
            </div>

            {/* Only show these sections when not in edit mode and on mobile (desktop has this in sidebar) */}
            {!isEditing && !isDesktop && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  {t('profile.account')}
                </h3>
                <div className="space-y-4">
                  {/* Subscription Card - only show when subscriptions are enabled */}
                  {SUBSCRIPTIONS_ENABLED && (
                    <div className="rounded-xl ring-1 ring-gray-700/50 bg-gray-900/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-medium">{t('profile.subscription.title')}</div>
                          <div className="text-sm text-gray-300 mt-1">
                            {(() => {
                              const status = user?.profile?.subscriptionStatus;
                              const isActive =
                                user?.profile?.isSubscriber === true ||
                                status === 'active' ||
                                status === 'trialing';
                              const until = user?.profile?.currentPeriodEnd
                                ? new Date(
                                    user.profile.currentPeriodEnd
                                  ).toLocaleDateString()
                                : null;
                              if (isActive) {
                                return until
                                  ? t('profile.subscription.activeWithRenewal', { date: until })
                                  : t('profile.subscription.active');
                              }
                              if (status) return `${t('profile.subscription.statusPrefix')} ${status}`;
                              return t('profile.subscription.none');
                            })()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!user?.uid) return;
                              try {
                                const res = await fetch('/api/subscribe/portal', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ uid: user.uid }),
                                });
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(data?.error || 'Portal error');
                                window.location.href = data.url;
                              } catch (e) {
                                console.error('Portal error', e);
                              }
                            }}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                          >
                            {t('profile.subscription.manage')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => router.push('/privacy')}
                    className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between"
                  >
                    <span>{t('profile.privacyControls')}</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full"
                  >
                    {t('profile.signOut')}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
                {error}
              </div>
            )}
            </div>
            ) : activeView === 'privacy' ? (
              <PrivacyContent isDesktop={true} />
            ) : (
              <PrivacyPolicyContent />
            )}
          </ProfileDesktopLayout>
        ) : (
          /* Mobile Layout - simpler wrapper without sidebar */
          <div className="flex-1">
            <div
              ref={topRef}
              className={`max-w-md mx-auto px-4 pt-6 ${isEditing ? 'pb-32' : 'pb-24'}`}
            >
              {/* Info banner explaining data usage */}
              <div className="mb-6">
                <InfoBanner
                  title={t('profile.dataUsageInfo.title')}
                  subtitle={t('profile.dataUsageInfo.subtitle')}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
                <div className="flex flex-col items-center mb-6 relative">
                  {/* Edit button - only visible when not in edit mode */}
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute top-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 transition-colors"
                      aria-label={t('profile.actions.editProfile')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}

                  {/* Profile Image Section */}
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    {isEditing ? (
                      <>
                        <input type="file" id="profile-upload-mobile" onChange={handleFileChange} accept="image/*" className="hidden" />
                        <label htmlFor="profile-upload-mobile" className="cursor-pointer block relative w-full h-full rounded-full overflow-hidden border-2 border-indigo-600">
                          {previewURL ? (
                            <img src={previewURL} alt="Profile Preview" className="w-full h-full object-cover" />
                          ) : photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                              <span>{t('profile.addPhoto')}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <div className="bg-indigo-600 rounded-full p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          </div>
                        </label>
                      </>
                    ) : (
                      <div onClick={() => handleEdit('profilePhoto')} className="cursor-pointer relative w-full h-full rounded-full overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                            <span>{t('profile.addPhoto')}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                          <div className="bg-indigo-600 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-gray-400">{user?.email}</p>
                </div>

                <div className="w-full text-left">
                  <div className="">
                    {/* General Section - Mobile */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                        onClick={() => setGeneralExpanded(!generalExpanded)}
                        data-section="general"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold flex items-center">
                            {t('profile.sections.general')}
                            {displayName && phone && dateOfBirth ? (
                              <svg className="ml-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </h3>
                        </div>
                        <div className="text-gray-400 hover:text-white">
                          {generalExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                        </div>
                      </div>
                    </div>
                    {generalExpanded && (
                      <div className="space-y-4" style={sectionContentStyle}>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.name')}</label>
                          {isEditing ? (
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white" />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('displayName')}>
                              {displayName || t('profile.notSet')}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.phone')}</label>
                          {isEditing ? (
                            <div className="phone-input-container">
                              <PhoneInput international defaultCountry="NO" value={phone} onChange={handlePhoneChange} countryCallingCodeEditable={false} withCountryCallingCode addInternationalOption={false} focusInputOnCountrySelection />
                              {!phoneValid && <p className="text-red-400 text-sm mt-1">{phoneError}</p>}
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => setIsEditing(true)}>
                              {phone ? formatPhoneNumberIntl(phone) : t('profile.notSet')}
                            </p>
                          )}
                        </div>
                        <div className="pb-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.dateOfBirth')}</label>
                          {editingField === 'dateOfBirth' ? (
                            <input type="date" value={dateOfBirth} onChange={(e) => { setDateOfBirth(e.target.value); }} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white [color-scheme:dark]" max={new Date().toISOString().split('T')[0]} onBlur={() => setEditingField(null)} />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('dateOfBirth')}>
                              {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : t('profile.notSet')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Health Basics Section - Mobile */}
                    <div className="border-t border-gray-700">
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                        onClick={() => setHealthBasicsExpanded(!healthBasicsExpanded)}
                        data-section="healthBasics"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold flex items-center">
                            {t('profile.sections.healthBasics')}
                            {userHeight && weight && gender ? (
                              <svg className="ml-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </h3>
                        </div>
                        <div className="text-gray-400 hover:text-white">
                          {healthBasicsExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                        </div>
                      </div>
                    </div>
                    {healthBasicsExpanded && (
                      <div className="space-y-4" style={sectionContentStyle}>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.height')}</label>
                          {isEditing ? (
                            <div className="relative">
                              <input type="number" value={userHeight} onChange={(e) => setUserHeight(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 pr-10 text-white" min="50" max="250" />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">cm</div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('userHeight')}>
                              {userHeight ? `${userHeight} cm` : t('profile.notSet')}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.weight')}</label>
                          {isEditing ? (
                            <div className="relative">
                              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 pr-10 text-white" min="20" max="300" step="0.1" />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">kg</div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('weight')}>
                              {weight ? `${weight} kg` : t('profile.notSet')}
                            </p>
                          )}
                        </div>
                        <div className="pb-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">{t('profile.fields.gender')}</label>
                          {isEditing ? (
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                              <option value="">{t('profile.selectGender')}</option>
                              <option value="male">{t('profile.gender.male')}</option>
                              <option value="female">{t('profile.gender.female')}</option>
                              <option value="non-binary">{t('profile.gender.nonBinary')}</option>
                              <option value="prefer-not-to-say">{t('profile.gender.preferNotToSay')}</option>
                            </select>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize" onClick={() => handleEdit('gender')}>
                              {gender ? t(`profile.gender.${{'male': 'male', 'female': 'female', 'non-binary': 'nonBinary', 'prefer-not-to-say': 'preferNotToSay'}[gender] || gender}`) : t('profile.notSet')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fitness Profile Section - Mobile (simplified for brevity) */}
                    <div className="border-t border-gray-700">
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                        onClick={() => setFitnessProfileExpanded(!fitnessProfileExpanded)}
                        data-section="fitnessProfile"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold flex items-center">
                            {t('profile.sections.fitnessProfile')}
                            {fitnessLevel && exerciseFrequency && exerciseModalities.length > 0 ? (
                              <svg className="ml-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </h3>
                        </div>
                        <div className="text-gray-400 hover:text-white">
                          {fitnessProfileExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                        </div>
                      </div>
                    </div>
                    {fitnessProfileExpanded && (
                      <div className="space-y-4 pb-4" style={sectionContentStyle}>
                        {/* Fitness Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.fitnessLevel')}
                          </label>
                          {editingField === 'fitnessLevel' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                {getFitnessLevels(t).map((level) => (
                                  <label key={level.id} className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="fitnessLevel"
                                      value={level.id}
                                      checked={fitnessLevel === level.id}
                                      onChange={(e) => setFitnessLevel(e.target.value)}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                      <div className="font-medium capitalize">{level.name}</div>
                                      <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">{level.description}</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                  {t('common.done')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize" onClick={() => handleEdit('fitnessLevel')}>
                              {fitnessLevel ? t(`profile.${fitnessLevel.toLowerCase()}.name`) : t('profile.notSet')}
                            </p>
                          )}
                        </div>

                        {/* Exercise Frequency */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.exerciseFrequency')}
                          </label>
                          {isEditing ? (
                            <select
                              value={exerciseFrequency}
                              onChange={(e) => setExerciseFrequency(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                            >
                              <option value="">{t('profile.selectFrequency')}</option>
                              {translatedPlannedFrequencyOptions.map((frequency) => (
                                <option key={frequency} value={frequency}>{frequency}</option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('exerciseFrequency')}>
                              {exerciseFrequency || t('profile.notSet')}
                            </p>
                          )}
                        </div>

                        {/* Exercise Modalities */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.exerciseModalities')}
                          </label>
                          {editingField === 'exerciseModalities' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                {PROFILE_EXERCISE_MODALITIES.map((modality) => (
                                  <label key={modality.name} className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      name="exerciseModalities"
                                      value={modality.name}
                                      checked={exerciseModalities.some((m) => m.toLowerCase() === modality.name.toLowerCase())}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setExerciseModalities([...exerciseModalities, modality.name]);
                                        } else {
                                          setExerciseModalities(exerciseModalities.filter((m) => m.toLowerCase() !== modality.name.toLowerCase()));
                                        }
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                      <div className="font-medium capitalize">{t(`profile.modality.${modality.name}`)}</div>
                                      <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">{modality.description(t)}</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                  {t('common.done')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize" onClick={() => handleEdit('exerciseModalities')}>
                              {exerciseModalities.length > 0 ? (
                                <ProfileValueDisplay value={exerciseModalities} translationPrefix="profile.modality" />
                              ) : (
                                t('profile.notSet')
                              )}
                            </p>
                          )}
                        </div>

                        {/* Workout Duration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.workoutDuration')}
                          </label>
                          {editingField === 'workoutDuration' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                {translatedWorkoutDurations.map((duration) => (
                                  <label key={duration} className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="workoutDuration"
                                      value={duration}
                                      checked={workoutDuration === duration}
                                      onChange={(e) => setWorkoutDuration(e.target.value)}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                      {duration}
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                  {t('common.done')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('workoutDuration')}>
                              {workoutDuration ? (
                                <ProfileValueDisplay value={workoutDuration} translationPrefix="profile.duration" />
                              ) : (
                                t('profile.notSet')
                              )}
                            </p>
                          )}
                        </div>

                        {/* Dietary Preferences */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.dietaryPreferences')}
                          </label>
                          {editingField === 'dietaryPreferences' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {dietaryPreferencesOptions.map((diet) => (
                                  <label key={diet} className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      name="dietaryPreferences"
                                      value={diet}
                                      checked={dietaryPreferences.some((d) => d.toLowerCase().replace(/\s+/g, '') === diet.toLowerCase().replace(/\s+/g, ''))}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setDietaryPreferences([...dietaryPreferences, diet]);
                                        } else {
                                          setDietaryPreferences(dietaryPreferences.filter((d) => d.toLowerCase().replace(/\s+/g, '') !== diet.toLowerCase().replace(/\s+/g, '')));
                                        }
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                      {diet}
                                    </div>
                                  </label>
                                ))}
                                {/* Custom diets as containers */}
                                {dietaryPreferences
                                  .filter((pref) => {
                                    const normalizedPref = pref.toLowerCase().replace(/\s+/g, '');
                                    const predefinedKeys = [
                                      'vegetarian', 'vegan', 'pescatarian', 'paleo', 'keto',
                                      'carnivore', 'lowcarb', 'lowfat', 'glutenfree', 'dairyfree',
                                      'mediterranean', 'intermittentfasting',
                                      'vegetarianer', 'veganer', 'pescetarianer', 'kjøtteter',
                                      'lavkarbo', 'lavfett', 'glutenfri', 'melkefri',
                                      'middelhavskost', 'intermitterendefasting'
                                    ];
                                    return !predefinedKeys.includes(normalizedPref);
                                  })
                                  .map((customDiet) => (
                                    <label key={`custom-${customDiet}`} className="relative flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={true}
                                        onChange={() => {
                                          setDietaryPreferences(dietaryPreferences.filter((item) => item !== customDiet));
                                        }}
                                        className="peer sr-only"
                                      />
                                      <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                        {customDiet}
                                      </div>
                                    </label>
                                  ))}
                              </div>
                              {/* Custom diet input */}
                              <div>
                                <p className="text-gray-400 text-sm mb-2">{t('profile.fields.addCustomDiet')}</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    id="custom-diet-mobile"
                                    placeholder={t('profile.fields.enterCustomDiet')}
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                        const customDiet = e.currentTarget.value.trim();
                                        if (!dietaryPreferences.includes(customDiet)) {
                                          setDietaryPreferences([...dietaryPreferences, customDiet]);
                                        }
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById('custom-diet-mobile') as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        const customDiet = input.value.trim();
                                        if (!dietaryPreferences.includes(customDiet)) {
                                          setDietaryPreferences([...dietaryPreferences, customDiet]);
                                        }
                                        input.value = '';
                                      }
                                    }}
                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                                  >
                                    {t('common.add')}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                  {t('common.done')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize" onClick={() => handleEdit('dietaryPreferences')}>
                              {dietaryPreferences.length > 0 ? (
                                <ProfileValueDisplay value={dietaryPreferences} translationPrefix="profile.diet" />
                              ) : (
                                t('profile.notSet')
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medical Background Section - Mobile (simplified for brevity) */}
                    <div className="border-t border-gray-700">
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                        onClick={() => setMedicalBackgroundExpanded(!medicalBackgroundExpanded)}
                        data-section="medicalBackground"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold flex items-center">
                            {t('profile.sections.medical')}
                            {medicalConditions.length > 0 && medications.length > 0 && injuries.length > 0 && familyHistory.length > 0 ? (
                              <svg className="ml-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </h3>
                        </div>
                        <div className="text-gray-400 hover:text-white">
                          {medicalBackgroundExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                        </div>
                      </div>
                    </div>
                    {medicalBackgroundExpanded && (
                      <div className="space-y-4 pb-4" style={sectionContentStyle}>
                        {/* Medical Conditions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.medicalConditions')}
                          </label>
                          {isEditing ? (
                            <textarea
                              value={medicalConditions.join(', ')}
                              onChange={(e) => setMedicalConditions(e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                              placeholder={t('profile.separateWithCommas.medicalConditions')}
                            />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('medicalConditions')}>
                              {medicalConditions.length > 0 ? medicalConditions.join(', ') : t('profile.noneSet')}
                            </p>
                          )}
                        </div>

                        {/* Medications */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.medications')}
                          </label>
                          {isEditing ? (
                            <textarea
                              value={medications.join(', ')}
                              onChange={(e) => setMedications(e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                              placeholder={t('profile.separateWithCommas.medications')}
                            />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('medications')}>
                              {medications.length > 0 ? medications.join(', ') : t('profile.noneSet')}
                            </p>
                          )}
                        </div>

                        {/* Previous Injuries */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.injuries')}
                          </label>
                          {isEditing ? (
                            <textarea
                              value={injuries.join(', ')}
                              onChange={(e) => setInjuries(e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                              placeholder={t('profile.separateWithCommas.injuries')}
                            />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('injuries')}>
                              {injuries.length > 0 ? injuries.join(', ') : t('profile.noneSet')}
                            </p>
                          )}
                        </div>

                        {/* Painful Areas */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.painfulAreas')}
                          </label>
                          {editingField === 'painfulAreas' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {translatedPainBodyParts.map((part) => (
                                  <label key={part} className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      name="painfulAreas"
                                      value={part}
                                      checked={painfulAreas.some((area) => area.toLowerCase() === part.toLowerCase())}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setPainfulAreas([...painfulAreas, part]);
                                        } else {
                                          setPainfulAreas(painfulAreas.filter((area) => area.toLowerCase() !== part.toLowerCase()));
                                        }
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full min-h-[52px] p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200 flex items-center justify-center text-center break-words text-sm">
                                      {part}
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                                  {t('common.done')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('painfulAreas')}>
                              {painfulAreas.length > 0 ? (
                              <ProfileValueDisplay
                                value={painfulAreas}
                                translationPrefix="bodyParts"
                                fallback="profile.noneSet"
                              />
                            ) : t('profile.noneSet')}
                            </p>
                          )}
                        </div>

                        {/* Family Medical History */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                            {t('profile.fields.familyHistory')}
                          </label>
                          {isEditing ? (
                            <textarea
                              value={familyHistory.join(', ')}
                              onChange={(e) => setFamilyHistory(e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white resize-none h-20"
                              placeholder={t('profile.separateWithCommas.familyHistory')}
                            />
                          ) : (
                            <p className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left" onClick={() => handleEdit('familyHistory')}>
                              {familyHistory.length > 0 ? familyHistory.join(', ') : t('profile.noneSet')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Notes Section - Mobile */}
                    <div className="border-t border-gray-700">
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                        onClick={() => setCustomNotesExpanded(!customNotesExpanded)}
                        data-section="customNotes"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold flex items-center">
                            {t('profile.customNotes.title')}
                            {customNotes.length > 0 ? (
                              <svg className="ml-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </h3>
                        </div>
                        <div className="text-gray-400 hover:text-white">
                          {customNotesExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                        </div>
                      </div>
                    </div>
                    {customNotesExpanded && (
                      <div className="space-y-4 pb-4" style={sectionContentStyle}>
                        <p className="text-sm text-gray-400">
                          {t('profile.customNotes.description')}
                        </p>
                        
                        {/* List of existing notes */}
                        <div className="space-y-3">
                          {customNotes.map((note, index) => (
                            <div key={index}>
                              {editingNoteIndex === index ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={noteInputValue}
                                    onChange={(e) => setNoteInputValue(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white resize-none min-h-[100px]"
                                    placeholder={t('profile.customNotes.placeholder')}
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={async () => {
                                        if (noteInputValue.trim()) {
                                          const newNotes = [...customNotes];
                                          newNotes[index] = noteInputValue.trim();
                                          setCustomNotes(newNotes);
                                          await saveCustomNotes(newNotes);
                                        }
                                        setEditingNoteIndex(null);
                                        setNoteInputValue('');
                                      }}
                                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm"
                                    >
                                      {t('common.save')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingNoteIndex(null);
                                        setNoteInputValue('');
                                      }}
                                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm"
                                    >
                                      {t('common.cancel')}
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const newNotes = customNotes.filter((_, i) => i !== index);
                                        setCustomNotes(newNotes);
                                        await saveCustomNotes(newNotes);
                                        setEditingNoteIndex(null);
                                        setNoteInputValue('');
                                      }}
                                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 text-sm"
                                    >
                                      {t('common.delete')}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingNoteIndex(index);
                                    setNoteInputValue(note);
                                  }}
                                  className="bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                                >
                                  <p className="text-white whitespace-pre-wrap">{note}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Add new note */}
                        {editingNoteIndex === -1 ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteInputValue}
                              onChange={(e) => setNoteInputValue(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white resize-none min-h-[100px]"
                              placeholder={t('profile.customNotes.placeholder')}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={async () => {
                                  if (noteInputValue.trim()) {
                                    const newNotes = [...customNotes, noteInputValue.trim()];
                                    setCustomNotes(newNotes);
                                    await saveCustomNotes(newNotes);
                                  }
                                  setEditingNoteIndex(null);
                                  setNoteInputValue('');
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm"
                              >
                                {t('common.save')}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNoteIndex(null);
                                  setNoteInputValue('');
                                }}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : editingNoteIndex === null && (
                          <button
                            onClick={() => {
                              setEditingNoteIndex(-1);
                              setNoteInputValue('');
                            }}
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{t('profile.customNotes.addNote')}</span>
                          </button>
                        )}
                        
                        {/* Empty state */}
                        {customNotes.length === 0 && editingNoteIndex !== -1 && (
                          <p className="text-gray-500 italic text-center py-4">
                            {t('profile.customNotes.emptyState')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account section - mobile */}
              {!isEditing && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
                  <h3 className="text-lg font-medium text-white mb-4">{t('profile.account')}</h3>
                  <div className="space-y-4">
                    {SUBSCRIPTIONS_ENABLED && (
                      <div className="rounded-xl ring-1 ring-gray-700/50 bg-gray-900/40 p-4">
                        <div className="text-white font-medium">{t('profile.subscription.title')}</div>
                        <div className="text-sm text-gray-300 mt-1">
                          {(() => {
                            const status = user?.profile?.subscriptionStatus;
                            const isActive = user?.profile?.isSubscriber === true || status === 'active' || status === 'trialing';
                            const until = user?.profile?.currentPeriodEnd ? new Date(user.profile.currentPeriodEnd).toLocaleDateString() : null;
                            if (isActive) return until ? t('profile.subscription.activeWithRenewal', { date: until }) : t('profile.subscription.active');
                            if (status) return `${t('profile.subscription.statusPrefix')} ${status}`;
                            return t('profile.subscription.none');
                          })()}
                        </div>
                      </div>
                    )}
                    <button onClick={() => router.push('/privacy')} className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between">
                      <span>{t('profile.privacyControls')}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button onClick={handleLogout} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full">
                      {t('profile.signOut')}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Fixed save/cancel bar that shows in edit mode */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 border-t border-gray-800 flex justify-center z-50">
            <div className="max-w-md w-full flex space-x-3">
              <button
                onClick={handleUpdateProfile}
                disabled={isLoading || !phoneValid}
                className={`px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex-1 font-medium shadow-lg ${
                  isLoading || !phoneValid
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isLoading ? t('profile.saving') : t('profile.saveChanges')}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex-1 font-medium shadow-lg"
              >
                {t('profile.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* HEIC Conversion Loading Indicator */}
        {isConvertingHeic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white">{t('profile.convertingImage') || 'Converting image...'}</p>
            </div>
          </div>
        )}

        {/* Image Cropper Modal */}
        {showCropper && cropperImageSrc && (
          <ProfilePhotoCropper
            imageSrc={cropperImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    </>
  );
}
