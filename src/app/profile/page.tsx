'use client';
import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/firebase/config';
import PhoneInput from 'react-phone-number-input';
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

// Custom hook to track window dimensions
const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

// Add a constant for getFitnessLevels with descriptions
const getFitnessLevels = (t: any) => [
  {
    name: t('profile.beginner.name'),
    description: t('profile.beginner.desc'),
  },
  {
    name: t('profile.intermediate.name'),
    description: t('profile.intermediate.desc'),
  },
  {
    name: t('profile.advanced.name'),
    description: t('profile.advanced.desc'),
  },
  {
    name: t('profile.elite.name'),
    description: t('profile.elite.desc'),
  },
];

// Add a constant for EXERCISE_MODALITIES with descriptions
const EXERCISE_MODALITIES = [
  {
    name: 'strength',
    description: (t) => t('profile.modality.strength.description'),
  },
  {
    name: 'cardio',
    description: (t) => t('profile.modality.cardio.description'),
  },
  {
    name: 'recovery',
    description: (t) => t('profile.modality.recovery.description'),
  },
];

// Common health goals options
const getHealthGoalsOptions = (t: any) => [
  t('profile.goals.weightLoss'),
  t('profile.goals.muscleGain'),
  t('profile.goals.improvedFitness'),
  t('profile.goals.strengthDevelopment'),
  t('profile.goals.injuryRecovery'),
  t('profile.goals.painReduction'),
  t('profile.goals.betterMobility'),
  t('profile.goals.sportsPerformance'),
  t('profile.goals.generalWellness'),
  t('profile.goals.stressReduction'),
  t('profile.goals.betterSleep'),
  t('profile.goals.improvedPosture'),
];

// Common dietary preference options
const getDietaryPreferencesOptions = (t: any) => [
  t('profile.diet.noSpecificDiet'),
  t('profile.diet.vegetarian'),
  t('profile.diet.vegan'),
  t('profile.diet.pescatarian'),
  t('profile.diet.paleo'),
  t('profile.diet.keto'),
  t('profile.diet.carnivore'),
  t('profile.diet.lowCarb'),
  t('profile.diet.lowFat'),
  t('profile.diet.glutenFree'),
  t('profile.diet.dairyFree'),
  t('profile.diet.mediterranean'),
  t('profile.diet.intermittentFasting'),
];

// Reusable icon components for section headers
const ExpandedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const CollapsedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function ProfilePage() {
  const { t } = useTranslation();

  // Helper function to normalize body part names between languages
  const normalizeBodyPartName = (bodyPart: string, t: any): string => {
    // Add function to check if a term is Norwegian
    const isNorwegianBodyPart = (term: string): boolean => {
      const norwegianTerms = [
        'Øvre rygg',
        'Korsrygg',
        'Nakke',
        'Bryst',
        'Abdomen',
        'Midtre rygg',
        'Venstre skulder',
        'Høyre skulder',
        'Venstre overarm',
        'Høyre overarm',
        'Venstre albue',
        'Høyre albue',
        'Venstre underarm',
        'Høyre underarm',
        'Venstre hånd',
        'Høyre hånd',
        'Bekken- og hofteregion',
        'Venstre lår',
        'Høyre lår',
        'Venstre kne',
        'Høyre kne',
        'Venstre legg',
        'Høyre legg',
        'Venstre fot',
        'Høyre fot',
        'Upper Back',
        'Lower Back',
        // Diet related Norwegian terms
        'kjøtteter',
        'lavkarbo',
      ];
      return (
        norwegianTerms.includes(term) ||
        norwegianTerms.some(
          (norwegian) => term.toLowerCase() === norwegian.toLowerCase()
        )
      );
    };

    // If it's already a Norwegian term, don't try to find an English key or translate
    if (isNorwegianBodyPart(bodyPart)) {
      return bodyPart;
    }

    // Try to get the English key for a translated body part
    const englishKey = Object.keys(PAIN_BODY_PARTS).find((key) => {
      try {
        const translatedValue = t(`bodyParts.${key}`);
        return translatedValue === bodyPart;
      } catch (e) {
        // If translation fails, it's not a match
        return false;
      }
    });

    if (englishKey) {
      return englishKey; // Return English key if found
    }

    // If we have an English key, get its translation
    if (PAIN_BODY_PARTS[bodyPart]) {
      try {
        const translated = t(`bodyParts.${bodyPart}`);
        if (translated !== `bodyParts.${bodyPart}`) {
          return translated;
        }
      } catch (e) {
        // Translation not found, continue with original
      }
    }

    return bodyPart; // Return original if no match found
  };

  const { user, logOut, updateUserProfile } = useAuth();
  const { userPrograms, answers: questionnaireAnswers } = useUser();
  const router = useRouter();

  // Get translated constants
  const translatedTargetBodyParts = getTranslatedTargetBodyParts(t);
  const translatedExerciseEnvironments = getTranslatedExerciseEnvironments(t);
  const translatedWorkoutDurations = getTranslatedWorkoutDurations(t);
  const translatedPainBodyParts = getTranslatedPainBodyParts(t);
  const translatedPlannedFrequencyOptions =
    getTranslatedPlannedExerciseFrequencyOptions(t);

  // Use the translation functions to get localized options
  const healthGoalsOptions = getHealthGoalsOptions(t);
  const dietaryPreferencesOptions = getDietaryPreferencesOptions(t);

  // CSS styles for smooth section transitions
  const sectionContentStyle = {
    transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
    overflow: 'hidden',
    opacity: 1,
    animation: 'fadeIn 0.3s ease-in-out',
  };

  // Define a fade-in animation
  const fadeInAnimation = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);

  // Profile data states
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState('');

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
  const [goalsPreferencesExpanded, setGoalsPreferencesExpanded] =
    useState(false);

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

    if (user.photoURL) {
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
      setError('Failed to log out. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewURL(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
      setPhoneError('Phone number is too short');
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

      // Get all active programs
      const activePrograms = userPrograms
        ? userPrograms.filter((program) => program.active)
        : [];
      const activeExerciseProgram = activePrograms.find(
        (program) => program.type === 'exercise'
      );
      const activeRecoveryProgram = activePrograms.find(
        (program) => program.type === 'recovery'
      );

      // Ensure recovery is included in exerciseModalities if there's an active recovery program
      const updatedExerciseModalities = [...exerciseModalities];
      if (
        activeRecoveryProgram &&
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
      // Then check active recovery program if no exercise program
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
      if (previewURL && previewURL !== photoURL) {
        // Convert data URL to file
        const response = await fetch(previewURL);
        const blob = await response.blob();
        const file = new File([blob], 'profile_picture.jpg', {
          type: 'image/jpeg',
        });

        // Upload the file
        profilePhotoURL = await uploadProfileImage(file);
      }

      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName,
        photoURL: profilePhotoURL,
      });

      // Update local state to show the new image
      setPhotoURL(profilePhotoURL);

      // Function to get English key for a body part
      const getEnglishBodyPartKey = (bodyPart: string): string => {
        // If already an English key, return it
        if (PAIN_BODY_PARTS[bodyPart]) {
          return bodyPart;
        }

        // Try to find the English key for a translated body part
        const englishKey = Object.keys(PAIN_BODY_PARTS).find((key) => {
          try {
            const translatedValue = t(`bodyParts.${key}`);
            return (
              translatedValue === bodyPart ||
              translatedValue.toLowerCase() === bodyPart.toLowerCase() ||
              key.toLowerCase() === bodyPart.toLowerCase()
            );
          } catch (e) {
            return false;
          }
        });

        // Map common Norwegian terms to English keys
        const norwegianToEnglish: Record<string, string> = {
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
          'Bekken- og hofteregion': 'pelvis_and_hip_region',
          'Venstre lår': 'left_thigh',
          'Høyre lår': 'right_thigh',
          'Venstre kne': 'left_knee',
          'Høyre kne': 'right_knee',
          'Venstre legg': 'left_lower_leg',
          'Høyre legg': 'right_lower_leg',
          'Venstre fot': 'left_foot',
          'Høyre fot': 'right_foot',
        };

        if (norwegianToEnglish[bodyPart]) {
          return norwegianToEnglish[bodyPart];
        }

        return englishKey || bodyPart; // Return the found key or the original as fallback
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
      const normalizeFitnessLevel = (levelValue: string): string => {
        // Map translated fitness levels to English keys
        const fitnessLevels = getFitnessLevels(t);
        for (const level of fitnessLevels) {
          if (level.name === levelValue) {
            // Find the English key for this fitness level
            const englishKey = Object.keys(level).find((key) => {
              try {
                // Try to find the original English key
                return level.name === fitnessLevel;
              } catch (e) {
                return false;
              }
            });
            if (englishKey) return englishKey;
          }
        }

        // Fallback mapping for common translations
        const fitnessMap: Record<string, string> = {
          [t('profile.beginner.name')]: 'Beginner',
          [t('profile.intermediate.name')]: 'Intermediate',
          [t('profile.advanced.name')]: 'Advanced',
          [t('profile.elite.name')]: 'Elite',
        };

        return fitnessMap[levelValue] || levelValue;
      };

      // Function to normalize exercise frequency to English values
      const normalizeExerciseFrequency = (freqValue: string): string => {
        // Try to find the English key in planned frequency options
        for (const option of PLANNED_EXERCISE_FREQUENCY_OPTIONS) {
          try {
            const translatedOption = t(
              `exerciseFrequency.${option.toLowerCase().replace(/\s+/g, '')}`
            );
            if (translatedOption === freqValue) return option;
          } catch (e) {
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
          } catch (e) {
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
          } catch (e) {
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
        Object.keys(TARGET_BODY_PARTS).forEach((key) => {
          try {
            const translated = t(`targetBodyParts.${key.toLowerCase()}`);
            targetBodyPartMap.set(translated, key);
          } catch (e) {
            // Skip if translation fails
          }
        });

        // For common body parts that might be in both lists
        Object.keys(PAIN_BODY_PARTS).forEach((key) => {
          try {
            const translated = t(`bodyParts.${key}`);
            if (!targetBodyPartMap.has(translated)) {
              targetBodyPartMap.set(translated, key);
            }
          } catch (e) {
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
          const targetMatch = Object.keys(TARGET_BODY_PARTS).find(
            (key) => key.toLowerCase() === area.toLowerCase()
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
        fitnessLevel: normalizeFitnessLevel(fitnessLevel),
        sleepPattern,
        exerciseFrequency: normalizeExerciseFrequency(exerciseFrequency),
        // Store exercise modalities in lowercase for consistency
        exerciseModalities: updatedExerciseModalities
          .map((m) => m.toLowerCase())
          .join(','),
        timeAvailability,
        dietaryPreferences: normalizeDietaryPreferences(dietaryPreferences),
        // For painfulAreas, convert all to English keys for consistent storage
        painfulAreas: updatedPainfulAreas.map((area) =>
          getEnglishBodyPartKey(area)
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

      // Reset view and collapse sections
      resetViewAndCollapseSections();

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
    // Get all active programs (one exercise and one recovery)
    const activePrograms = userPrograms
      ? userPrograms.filter((program) => program.active)
      : [];
    const activeExerciseProgram = activePrograms.find(
      (program) => program.type === 'exercise'
    );
    const activeRecoveryProgram = activePrograms.find(
      (program) => program.type === 'recovery'
    );

    // Collect questionnaire data from both active programs
    const questionnaires = [];

    // Add exercise program questionnaire if available
    if (activeExerciseProgram?.questionnaire) {
      questionnaires.push(activeExerciseProgram.questionnaire);
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
  const markAsDirty = () => {
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

    // For profile photo, just enter edit mode without scrolling or expanding sections
    if (field === 'profilePhoto') {
      // Just enter edit mode, no scrolling needed
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

    markAsDirty();
  };

  // Function to reset view and collapse all sections except General
  const resetViewAndCollapseSections = () => {
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

    // Reset view and collapse sections
    resetViewAndCollapseSections();

    // Reset any unsaved changes by reloading user profile data
    loadUserProfile();
    setDirty(false);
  };

  // Add function to get painful areas from recovery programs
  const getPainfulAreasFromRecoveryPrograms = () => {
    if (!userPrograms) return [];

    // Filter for recovery programs
    const recoveryPrograms = userPrograms.filter(
      (program) => program.type === 'recovery'
    );

    // Collect all painful areas from recovery programs
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

  // Utility component to format displayed values
  const ProfileValueDisplay = ({
    value,
    translationPrefix,
    fallback = 'profile.notSet',
  }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <>{t(fallback)}</>;
    }

    // Manual Norwegian translations for body parts
    const norwegianBodyParts: Record<string, string> = {
      upper_back: 'Øvre rygg',
      upperBack: 'Øvre rygg',
      lower_back: 'Korsrygg',
      lowerBack: 'Korsrygg',
      middle_back: 'Midtre rygg',
      middleBack: 'Midtre rygg',
      neck: 'Nakke',
      chest: 'Bryst',
      abdomen: 'Abdomen',
      left_shoulder: 'Venstre skulder',
      leftShoulder: 'Venstre skulder',
      right_shoulder: 'Høyre skulder',
      rightShoulder: 'Høyre skulder',
      left_upper_arm: 'Venstre overarm',
      leftUpperArm: 'Venstre overarm',
      right_upper_arm: 'Høyre overarm',
      rightUpperArm: 'Høyre overarm',
      left_elbow: 'Venstre albue',
      leftElbow: 'Venstre albue',
      right_elbow: 'Høyre albue',
      rightElbow: 'Høyre albue',
      left_forearm: 'Venstre underarm',
      leftForearm: 'Venstre underarm',
      right_forearm: 'Høyre underarm',
      rightForearm: 'Høyre underarm',
      left_hand: 'Venstre hånd',
      leftHand: 'Venstre hånd',
      right_hand: 'Høyre hånd',
      rightHand: 'Høyre hånd',
      pelvis_and_hip_region: 'Bekken- og hofteregion',
      pelvisAndHipRegion: 'Bekken- og hofteregion',
      left_thigh: 'Venstre lår',
      leftThigh: 'Venstre lår',
      right_thigh: 'Høyre lår',
      rightThigh: 'Høyre lår',
      left_knee: 'Venstre kne',
      leftKnee: 'Venstre kne',
      right_knee: 'Høyre kne',
      rightKnee: 'Høyre kne',
      left_lower_leg: 'Venstre legg',
      leftLowerLeg: 'Venstre legg',
      right_lower_leg: 'Høyre legg',
      rightLowerLeg: 'Høyre legg',
      left_foot: 'Venstre fot',
      leftFoot: 'Venstre fot',
      right_foot: 'Høyre fot',
      rightFoot: 'Høyre fot',
    };

    // Map English stored values to translation keys for common dietary preferences
    const dietaryTranslationMap: Record<string, string> = {
      noSpecificDiet: 'profile.diet.noSpecificDiet',
      vegetarian: 'profile.diet.vegetarian',
      vegan: 'profile.diet.vegan',
      pescatarian: 'profile.diet.pescatarian',
      paleo: 'profile.diet.paleo',
      keto: 'profile.diet.keto',
      carnivore: 'profile.diet.carnivore',
      lowCarb: 'profile.diet.lowCarb',
      lowFat: 'profile.diet.lowFat',
      glutenFree: 'profile.diet.glutenFree',
      dairyFree: 'profile.diet.dairyFree',
      mediterranean: 'profile.diet.mediterranean',
      intermittentFasting: 'profile.diet.intermittentFasting',
    };

    // Map for body parts with underscores
    const bodyPartMap: Record<string, string> = {
      upper_back: 'bodyParts.upperBack',
      lower_back: 'bodyParts.lowerBack',
      middle_back: 'bodyParts.middleBack',
      left_shoulder: 'bodyParts.leftShoulder',
      right_shoulder: 'bodyParts.rightShoulder',
      left_upper_arm: 'bodyParts.leftUpperArm',
      right_upper_arm: 'bodyParts.rightUpperArm',
      left_elbow: 'bodyParts.leftElbow',
      right_elbow: 'bodyParts.rightElbow',
      left_forearm: 'bodyParts.leftForearm',
      right_forearm: 'bodyParts.rightForearm',
      left_hand: 'bodyParts.leftHand',
      right_hand: 'bodyParts.rightHand',
      left_thigh: 'bodyParts.leftThigh',
      right_thigh: 'bodyParts.rightThigh',
      left_knee: 'bodyParts.leftKnee',
      right_knee: 'bodyParts.rightKnee',
      left_lower_leg: 'bodyParts.leftLowerLeg',
      right_lower_leg: 'bodyParts.rightLowerLeg',
      left_foot: 'bodyParts.leftFoot',
      right_foot: 'bodyParts.rightFoot',
      pelvis_and_hip_region: 'bodyParts.pelvisAndHipRegion',
    };

    // Skip translation attempt for Norwegian terms
    const isNorwegianTerm = (term) => {
      // List of Norwegian words/terms that shouldn't be translated
      const norwegianTerms = [
        'Øvre rygg',
        'Korsrygg',
        'Nakke',
        'Bryst',
        'Abdomen',
        'Midtre rygg',
        'Venstre skulder',
        'Høyre skulder',
        'Venstre overarm',
        'Høyre overarm',
        'Venstre albue',
        'Høyre albue',
        'Venstre underarm',
        'Høyre underarm',
        'Venstre hånd',
        'Høyre hånd',
        'Bekken- og hofteregion',
        'Venstre lår',
        'Høyre lår',
        'Venstre kne',
        'Høyre kne',
        'Venstre legg',
        'Høyre legg',
        'Venstre fot',
        'Høyre fot',
        'Upper Back',
        'Lower Back',
        // Diet related Norwegian terms
        'kjøtteter',
        'lavkarbo',
        'Ingen spesifikk diett',
        'Vegetarianer',
        'Veganer',
        'Pescetarianer',
        'Paleo',
        'Keto',
        'Lavkarbo',
        'Lavfett',
        'Glutenfri',
        'Melkefri',
        'Middelhavskost',
        'Intermitterende fasting',
      ];
      return (
        norwegianTerms.includes(term) ||
        norwegianTerms.some(
          (norwegian) => term.toLowerCase() === norwegian.toLowerCase()
        )
      );
    };

    // Translation helper that tries multiple approaches
    const translateTerm = (term) => {
      // Skip translation for Norwegian terms
      if (isNorwegianTerm(term)) {
        return term;
      }

      // Check current locale
      const isNorwegian =
        typeof window !== 'undefined' &&
        window.localStorage &&
        window.localStorage.getItem('i18nextLng') === 'nb';

      // Special handling for body parts in Norwegian locale
      if (translationPrefix === 'bodyParts' && isNorwegian) {
        // First try the direct Norwegian mapping
        const normalizedTerm = term.replace(/-/g, '_');
        if (norwegianBodyParts[normalizedTerm]) {
          return norwegianBodyParts[normalizedTerm];
        }

        // For camelCase, try converting to underscore format first
        const underscored = term.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (norwegianBodyParts[underscored]) {
          return norwegianBodyParts[underscored];
        }
      }

      // Special handling for body parts with underscores
      if (translationPrefix === 'bodyParts' && term.includes('_')) {
        // Check if we have a direct mapping
        if (bodyPartMap[term]) {
          try {
            const translated = t(bodyPartMap[term]);
            if (translated !== bodyPartMap[term]) {
              return translated;
            }
          } catch (e) {
            // If translation fails and we're in Norwegian, try direct mapping
            if (isNorwegian && norwegianBodyParts[term]) {
              return norwegianBodyParts[term];
            }
            // Continue to other methods if this fails
          }
        }

        // Try converting underscores to camelCase
        const camelCased = term.replace(/_([a-z])/g, (match, letter) =>
          letter.toUpperCase()
        );
        try {
          const translatedCamel = t(`${translationPrefix}.${camelCased}`);
          if (translatedCamel !== `${translationPrefix}.${camelCased}`) {
            return translatedCamel;
          }
        } catch (e) {
          // If translation fails and we're in Norwegian, try direct mapping of camelCase
          if (isNorwegian && norwegianBodyParts[camelCased]) {
            return norwegianBodyParts[camelCased];
          }
          // Continue to other methods if this fails
        }

        // If we're in Norwegian, try to find any matching entry
        if (isNorwegian) {
          // Look for close matches by removing underscores
          const simplified = term.replace(/_/g, '').toLowerCase();
          for (const [key, value] of Object.entries(norwegianBodyParts)) {
            if (key.replace(/_/g, '').toLowerCase() === simplified) {
              return value;
            }
          }
        }

        // Format the underscored term to be more readable
        return term
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      // For dietary preferences, try direct mapping
      if (translationPrefix === 'profile.diet') {
        // Try to find a match in our dietary mapping
        const dietKey = Object.keys(dietaryTranslationMap).find(
          (key) => key.toLowerCase() === term.toLowerCase()
        );

        if (dietKey) {
          try {
            const translated = t(dietaryTranslationMap[dietKey]);
            if (translated !== dietaryTranslationMap[dietKey]) {
              return translated;
            }
          } catch (e) {
            // Continue to other methods if this fails
          }
        }
      }

      // Try with original format
      try {
        const translatedDirect = t(`${translationPrefix}.${term}`);
        if (translatedDirect !== `${translationPrefix}.${term}`) {
          return translatedDirect;
        }
      } catch (e) {
        // Continue to other methods if this fails
      }

      // Try with lowercase and no spaces
      try {
        const formattedKey = `${translationPrefix}.${term.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')}`;
        const translated = t(formattedKey);
        if (translated !== formattedKey) {
          return translated;
        }
      } catch (e) {
        // Continue to other methods if this fails
      }

      // Return formatted original if all translation attempts fail
      return term
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    // Handle array values
    if (Array.isArray(value)) {
      return (
        <>
          {value.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && ', '}
              {translateTerm(item)}
            </Fragment>
          ))}
        </>
      );
    }

    // Handle single string value
    return <>{translateTerm(value)}</>;
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
      <div className="bg-gray-900 flex flex-col min-h-screen">
        {' '}
        {/* Removed fixed inset-0, added min-h-screen */}
        <div className="py-3 px-4 items-center justify-between hidden md:flex">
          {/* Empty spacer to balance the title */}
          <div className="w-10"></div>
          <div className="flex flex-col items-center">
            <h1 className="text-app-title text-center">{t('profile.title')}</h1>
          </div>
          {/* Empty spacer to balance the title */}
          <div className="w-10"></div>
        </div>
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
        <div className="flex-1">
          {' '}
          {/* Removed h-screen overflow-y-auto, added flex-1 */}
          <div
            ref={topRef}
            className="max-w-md mx-auto px-4 pt-6 pb-8" // Adjusted padding
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
              <div className="flex flex-col items-center mb-6 relative">
                {/* Edit button - only visible when not in edit mode */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 transition-colors"
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

                {/* Profile Image Section START */}
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
                            alt="Profile Preview"
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
                          alt="Profile"
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

              <div className="w-full text-left">
                <div className="">
                  {/* General Section START */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                      onClick={() => setGeneralExpanded(!generalExpanded)}
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
                        <h3 className="text-white font-semibold flex items-center">
                          {t('profile.sections.general')}
                          {displayName && phone && dateOfBirth && (
                            <svg
                              className="ml-2 h-4 w-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </h3>
                      </div>
                      <div className="text-gray-400 hover:text-white">
                        {generalExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
                      </div>
                    </div>
                  </div>

                  {/* General section content */}
                  {generalExpanded && (
                    <div className="space-y-4" style={sectionContentStyle}>
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
                            {phone || t('profile.notSet')}
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
                                markAsDirty();
                                // No auto-save, just mark as dirty and wait for Save button
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
                  {/* General Section END */}

                  {/* Health Basics Section START */}
                  <div className="border-t border-gray-700">
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                      onClick={() =>
                        setHealthBasicsExpanded(!healthBasicsExpanded)
                      }
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
                        <h3 className="text-white font-semibold flex items-center">
                          {t('profile.sections.healthBasics')}
                          {userHeight && weight && gender && (
                            <svg
                              className="ml-2 h-4 w-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </h3>
                      </div>
                      <div className="text-gray-400 hover:text-white">
                        {healthBasicsExpanded ? (
                          <ExpandedIcon />
                        ) : (
                          <CollapsedIcon />
                        )}
                      </div>
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
                              ? t(`profile.gender.${gender.replace(/-/g, '')}`)
                              : t('profile.notSet')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Health Basics Section END */}

                  {/* Fitness Profile Section START */}
                  <div className="border-t border-gray-700">
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                      onClick={() =>
                        setFitnessProfileExpanded(!fitnessProfileExpanded)
                      }
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
                        <h3 className="text-white font-semibold flex items-center">
                          {t('profile.sections.fitnessProfile')}
                          {fitnessLevel &&
                            sleepPattern &&
                            exerciseFrequency &&
                            exerciseModalities.length > 0 &&
                            targetAreas.length > 0 && (
                              <svg
                                className="ml-2 h-4 w-4 text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                        </h3>
                      </div>
                      <div className="text-gray-400 hover:text-white">
                        {fitnessProfileExpanded ? (
                          <ExpandedIcon />
                        ) : (
                          <CollapsedIcon />
                        )}
                      </div>
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
                                  key={level.name}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="fitnessLevel"
                                    value={level.name}
                                    checked={fitnessLevel === level.name}
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
                            {fitnessLevel || t('profile.notSet')}
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
                              {EXERCISE_MODALITIES.map((modality) => (
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
                                        markAsDirty();
                                      }}
                                      className="peer sr-only"
                                    />
                                    <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                      {diet}
                                    </div>
                                  </label>
                                );
                              })}
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
                                        markAsDirty();
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
                                        markAsDirty();
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

                            {/* Selected diets list with remove option */}
                            {dietaryPreferences.length > 0 && (
                              <div>
                                <p className="text-gray-400 text-sm mb-2">
                                  {t('profile.selectedDiets')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dietaryPreferences.map((diet, index) => {
                                    // Enhanced function to translate diet names properly
                                    const translateDietName = (
                                      dietName: string
                                    ): string => {
                                      if (!dietName) return '';

                                      // Handle capitalization and spacing variants
                                      const lowerCased = dietName.toLowerCase();
                                      const normalized = lowerCased.replace(
                                        /\s+/g,
                                        ''
                                      );

                                      // Special cases with spaces
                                      const spacedValues: Record<
                                        string,
                                        string
                                      > = {
                                        'low carb': t('profile.diet.lowCarb'),
                                        'low fat': t('profile.diet.lowFat'),
                                        'gluten free': t(
                                          'profile.diet.glutenFree'
                                        ),
                                        'dairy free': t(
                                          'profile.diet.dairyFree'
                                        ),
                                        'no specific diet': t(
                                          'profile.diet.noSpecificDiet'
                                        ),
                                        'intermittent fasting': t(
                                          'profile.diet.intermittentFasting'
                                        ),
                                      };

                                      // Check for direct matches with spaces
                                      if (spacedValues[lowerCased]) {
                                        return spacedValues[lowerCased];
                                      }

                                      // Direct mapping for common diet names
                                      const dietMappings: Record<
                                        string,
                                        string
                                      > = {
                                        // English values
                                        nospecificdiett: t(
                                          'profile.diet.noSpecificDiet'
                                        ),
                                        'intermittent fasting': t(
                                          'profile.diet.intermittentFasting'
                                        ),

                                        // Norwegian variants (just in case)
                                        kjøtteter: t('profile.diet.carnivore'),
                                        lavkarbo: t('profile.diet.lowCarb'),
                                        lavfett: t('profile.diet.lowFat'),
                                        glutenfri: t('profile.diet.glutenFree'),
                                        melkefri: t('profile.diet.dairyFree'),
                                        middelhavskost: t(
                                          'profile.diet.mediterranean'
                                        ),
                                        'intermitterende fasting': t(
                                          'profile.diet.intermittentFasting'
                                        ),
                                        'ingen spesifikk diett': t(
                                          'profile.diet.noSpecificDiet'
                                        ),
                                      };

                                      // First check the direct mapping with the lowercase original
                                      if (dietMappings[lowerCased]) {
                                        return dietMappings[lowerCased];
                                      }

                                      // Then check with the normalized version (no spaces)
                                      if (dietMappings[normalized]) {
                                        return dietMappings[normalized];
                                      }

                                      // If all else fails, just format the original value nicely
                                      return dietName
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, (str) =>
                                          str.toUpperCase()
                                        )
                                        .trim();
                                    };

                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center bg-indigo-500/20 border border-indigo-500 rounded-lg px-3 py-1"
                                      >
                                        <span className="text-white">
                                          {translateDietName(diet)}
                                        </span>
                                        <button
                                          onClick={() => {
                                            setDietaryPreferences(
                                              dietaryPreferences.filter(
                                                (_, i) => i !== index
                                              )
                                            );
                                            markAsDirty();
                                          }}
                                          className="ml-2 text-gray-300 hover:text-white"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

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
                  {/* Goals and Preferences Section END */}
                  {/* Medical Background Section START */}
                  <div className="border-t border-gray-700">
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700/30 py-4 rounded-lg transition-colors"
                      onClick={() =>
                        setMedicalBackgroundExpanded(!medicalBackgroundExpanded)
                      }
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
                        <h3 className="text-white font-semibold flex items-center">
                          {t('profile.sections.medical')}
                          {medicalConditions.length > 0 &&
                            medications.length > 0 &&
                            injuries.length > 0 &&
                            familyHistory.length > 0 && (
                              <svg
                                className="ml-2 h-4 w-4 text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                        </h3>
                      </div>
                      <div className="text-gray-400 hover:text-white">
                        {medicalBackgroundExpanded ? (
                          <ExpandedIcon />
                        ) : (
                          <CollapsedIcon />
                        )}
                      </div>
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
                            <div className="mb-4">
                              <button
                                type="button"
                                onClick={() => setPainfulAreas([])}
                                className={`w-full p-4 rounded-xl ${
                                  painfulAreas.length === 0
                                    ? 'bg-green-500/10 ring-green-500 text-white'
                                    : 'bg-gray-800 ring-gray-700 text-gray-400 hover:bg-gray-700'
                                } ring-1 transition-all duration-200 text-left`}
                              >
                                {t('profile.fields.noPainAreas')}
                              </button>
                            </div>

                            {painfulAreas.length > 0 && (
                              <p className="text-gray-400 font-medium text-base mb-4">
                                {t('questionnaire.selectAll')}
                              </p>
                            )}

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
                                    } catch (e) {
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
                                    } catch (e) {
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
                                    <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                      <div className="font-medium">{part}</div>
                                    </div>
                                  </label>
                                );
                              })}
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
                  {/* Medical Background Section END */}
                </div>
                {/* Profile Info Section END */}
              </div>
            </div>

            {/* Only show these sections when not in edit mode */}
            {!isEditing && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  {t('profile.account')}
                </h3>
                <div className="space-y-4">
                  {/* Subscription Card */}
                  <div className="rounded-xl ring-1 ring-gray-700/50 bg-gray-900/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-medium">Subscription</div>
                        <div className="text-sm text-gray-300 mt-1">
                          {(() => {
                            const status = user?.profile?.subscriptionStatus;
                            const isActive =
                              user?.profile?.isSubscriber === true ||
                              status === 'active' ||
                              status === 'trialing';
                            const until = user?.profile?.currentPeriodEnd
                              ? new Date(user.profile.currentPeriodEnd).toLocaleDateString()
                              : null;
                            if (isActive) {
                              return until
                                ? `Active · Renews on ${until}`
                                : 'Active';
                            }
                            if (status) return `Status: ${status}`;
                            return 'No active subscription';
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
                              if (!res.ok) throw new Error(data?.error || 'Portal error');
                              window.location.href = data.url;
                            } catch (e) {
                              console.error('Portal error', e);
                            }
                          }}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => {
                            // Send to subscribe page if no active subscription
                            if (
                              !(user?.profile?.isSubscriber ||
                                user?.profile?.subscriptionStatus === 'active' ||
                                user?.profile?.subscriptionStatus === 'trialing')
                            ) {
                              router.push('/subscribe');
                            } else {
                              router.push('/program/feedback');
                            }
                          }}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm"
                        >
                          {user?.profile?.isSubscriber ||
                          user?.profile?.subscriptionStatus === 'active' ||
                          user?.profile?.subscriptionStatus === 'trialing'
                            ? 'Start Feedback'
                            : 'Subscribe'}
                        </button>
                      </div>
                    </div>
                  </div>
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
        </div>
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
      </div>
    </>
  );
}
