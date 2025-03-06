'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/firebase/config';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  TARGET_BODY_PARTS,
  UPPER_BODY_PARTS,
  LOWER_BODY_PARTS,
  EQUIPMENT_ACCESS,
  EQUIPMENT_DESCRIPTIONS,
  ExerciseEnvironment,
  EXERCISE_ENVIRONMENTS,
  WORKOUT_DURATIONS,
  PAIN_BODY_PARTS,
  PainBodyPart,
  EXERCISE_FREQUENCY_OPTIONS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
} from '@/app/types/program';
import { UserProfile } from '@/app/types/user';

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

// Add a constant for FITNESS_LEVELS with descriptions
const FITNESS_LEVELS = [
  {
    name: 'beginner',
    description: 'New to exercise or returning after long break',
  },
  {
    name: 'intermediate',
    description: 'Regular exercise for 6+ months',
  },
  {
    name: 'advanced',
    description: 'Consistent training for 2+ years',
  },
  {
    name: 'elite',
    description: 'High performance athlete',
  },
];

// Add a constant for EXERCISE_MODALITIES with descriptions
const EXERCISE_MODALITIES = [
  {
    name: 'strength',
    description: 'Weight training, resistance training, bodyweight exercises',
  },
  {
    name: 'cardio',
    description: 'Running, cycling, swimming, HIIT, aerobic exercise',
  },
  {
    name: 'recovery',
    description: 'Stretching, yoga, mobility work, active recovery',
  },
];

// Common health goals options
const HEALTH_GOALS_OPTIONS = [
  'Weight loss',
  'Muscle gain',
  'Improved fitness',
  'Strength development',
  'Injury recovery',
  'Pain reduction',
  'Better mobility',
  'Sports performance',
  'General wellness',
  'Stress reduction',
  'Better sleep',
  'Improved posture',
];

// Common dietary preference options
const DIETARY_PREFERENCES_OPTIONS = [
  'No specific diet',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Paleo',
  'Keto',
  'Carnivore',
  'Low carb',
  'Low fat',
  'Gluten-free',
  'Dairy-free',
  'Mediterranean',
  'Intermittent fasting',
];

export default function ProfilePage() {
  const { user, loading: authLoading, logOut, updateUserProfile } = useAuth();
  const {
    activeProgram,
    userPrograms,
    answers: questionnaireAnswers,
  } = useUser();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Auto-dismiss messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-expand sections when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setGeneralExpanded(true);
      setHealthBasicsExpanded(true);
      setMedicalBackgroundExpanded(true);
      setFitnessProfileExpanded(true);
      setGoalsPreferencesExpanded(true);
    }
  }, [isEditing]);

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
          setExerciseModalities(profile.exerciseModalities.map(m => m.toLowerCase()));
        } else if (typeof profile.exerciseModalities === 'string') {
          // Split comma-separated string, trim each value, and normalize to lowercase
          setExerciseModalities(
            profile.exerciseModalities
              .split(',')
              .map(item => item.trim().toLowerCase())
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
              setExerciseModalities(userData.exerciseModalities.map(m => m.toLowerCase()));
            } else if (typeof userData.exerciseModalities === 'string') {
              // Split comma-separated string, trim each value, and normalize to lowercase
              setExerciseModalities(
                userData.exerciseModalities
                  .split(',')
                  .map(item => item.trim().toLowerCase())
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

  useEffect(() => {
    // Set page title
    if (typeof document !== 'undefined') {
      document.title = 'Profile | MUSCO';
    }
  }, []);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

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
        activeExerciseProgram.questionnaire.generallyPainfulAreas.forEach(area => {
          if (!updatedPainfulAreas.includes(area)) {
            updatedPainfulAreas.push(area);
          }
        });
      }
      
      // Add areas from active recovery program if available
      if (activeRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
        activeRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(area => {
          if (!updatedPainfulAreas.includes(area)) {
            updatedPainfulAreas.push(area);
          }
        });
      }
      
      // Prioritize exercise environments from active exercise program
      let updatedExerciseEnvironment = exerciseEnvironments;
      
      // Check active exercise program first
      if (activeExerciseProgram?.questionnaire?.exerciseEnvironments && !updatedExerciseEnvironment) {
        const exerciseEnvs = activeExerciseProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
          updatedExerciseEnvironment = exerciseEnvs[0];
        } else if (typeof exerciseEnvs === 'string') {
          updatedExerciseEnvironment = exerciseEnvs;
        }
      }
      // Then check active recovery program if no exercise program
      else if (activeRecoveryProgram?.questionnaire?.exerciseEnvironments && !updatedExerciseEnvironment) {
        const recoveryEnvs = activeRecoveryProgram.questionnaire.exerciseEnvironments;
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

      // Create profile data object with priority for exercise environments
      const profileData: Partial<UserProfile> = {
        displayName,
        photoURL: profilePhotoURL,
        phone,
        height: userHeight,
        weight,
        gender,
        dateOfBirth,
        medicalConditions: medicalConditions.join(','),
        medications: medications.join(','),
        injuries: injuries.join(','),
        familyHistory: familyHistory.join(','),
        fitnessLevel,
        sleepPattern,
        exerciseFrequency,
        // Store exercise modalities in lowercase for consistency
        exerciseModalities: updatedExerciseModalities.map(m => m.toLowerCase()).join(','),
        timeAvailability,
        dietaryPreferences,
        painfulAreas: updatedPainfulAreas,
        healthGoals,
        targetAreas,
      };
      
      // Add exercise environments with priority logic
      if (exerciseEnvironments) {
        // Use user's selected value if available
        profileData.exerciseEnvironments = exerciseEnvironments;
      } else if (activeExerciseProgram?.questionnaire?.exerciseEnvironments) {
        // Prioritize exercise program environments
        const exerciseEnvs = activeExerciseProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
          profileData.exerciseEnvironments = exerciseEnvs[0];
        } else if (typeof exerciseEnvs === 'string') {
          profileData.exerciseEnvironments = exerciseEnvs;
        }
      } else if (activeRecoveryProgram?.questionnaire?.exerciseEnvironments) {
        // Fall back to recovery program environments
        const recoveryEnvs = activeRecoveryProgram.questionnaire.exerciseEnvironments;
        if (Array.isArray(recoveryEnvs) && recoveryEnvs.length > 0) {
          profileData.exerciseEnvironments = recoveryEnvs[0];
        } else if (typeof recoveryEnvs === 'string') {
          profileData.exerciseEnvironments = recoveryEnvs;
        }
      }
      
      // Add workout duration
      if (workoutDuration) {
        profileData.workoutDuration = workoutDuration;
      }

      // Update user profile using the AuthContext method
      await updateUserProfile(profileData);

      setDirty(false);
      setIsLoading(false);
      setEditingField(null);
      setIsEditing(false);
      
      // Collapse all sections except General
      setGeneralExpanded(true); // Keep general section expanded
      setHealthBasicsExpanded(false);
      setMedicalBackgroundExpanded(false);
      setFitnessProfileExpanded(false);
      setGoalsPreferencesExpanded(false);

      // Scroll to the top using the ref
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      // Show success message
      setMessage({
        type: 'success',
        text: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false);
      setError(
        error instanceof Error ? error.message : 'Error updating profile'
      );
      setMessage({
        type: 'error',
        text: 'Error updating profile',
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
            (area) => uniquePainfulAreas.add(area)
          );
        }

        // Then check active recovery program
        if (activeRecoveryProgram?.questionnaire?.generallyPainfulAreas) {
          activeRecoveryProgram.questionnaire.generallyPainfulAreas.forEach(
            (area) => uniquePainfulAreas.add(area)
          );
        }

        // Next check recovery programs for painful areas
        const recoveryAreas = getPainfulAreasFromRecoveryPrograms();
        recoveryAreas.forEach((area) => uniquePainfulAreas.add(area));

        // Finally check other questionnaires
        for (const questionnaireData of questionnaires) {
          if (
            questionnaireData.generallyPainfulAreas &&
            questionnaireData.generallyPainfulAreas.length > 0
          ) {
            questionnaireData.generallyPainfulAreas.forEach((area) =>
              uniquePainfulAreas.add(area)
            );
          }
        }

        // If we found any painful areas, set them
        if (uniquePainfulAreas.size > 0) {
          setPainfulAreas(Array.from(uniquePainfulAreas));
        }
      }

      // Exercise modalities
      if (exerciseModalities.length === 0 && !user?.profile?.exerciseModalities) {
        for (const questionnaireData of questionnaires) {
          if (questionnaireData.exerciseModalities) {
            if (Array.isArray(questionnaireData.exerciseModalities)) {
              // Normalize array values to lowercase for consistent comparison
              setExerciseModalities(questionnaireData.exerciseModalities.map(m => m.toLowerCase()));
              break;
            } else if (typeof questionnaireData.exerciseModalities === 'string') {
              // Split comma-separated string, trim each value, and normalize to lowercase
              setExerciseModalities(
                questionnaireData.exerciseModalities
                  .split(',')
                  .map(item => item.trim().toLowerCase())
                  .filter(Boolean)
              );
              break;
            }
          }
        }
      }

      // Ensure recovery is included in exerciseModalities if there's an active recovery program
      if (activeRecoveryProgram && !exerciseModalities.includes('recovery')) {
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
          const exerciseEnvs = activeExerciseProgram.questionnaire.exerciseEnvironments;
          if (Array.isArray(exerciseEnvs) && exerciseEnvs.length > 0) {
            environmentValue = exerciseEnvs[0];
          } else if (typeof exerciseEnvs === 'string') {
            environmentValue = exerciseEnvs;
          }
        }
        // Then check active recovery program if no exercise program
        else if (activeRecoveryProgram?.questionnaire?.exerciseEnvironments) {
          const recoveryEnvs = activeRecoveryProgram.questionnaire.exerciseEnvironments;
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
              if (Array.isArray(questionnaireData.exerciseEnvironments) && 
                  questionnaireData.exerciseEnvironments.length > 0) {
                environmentValue = questionnaireData.exerciseEnvironments[0];
                break;
              } else if (typeof questionnaireData.exerciseEnvironments === 'string') {
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

    // Expand the appropriate section based on the field being edited
    if (['displayName', 'phone', 'dateOfBirth', 'profilePhoto'].includes(field)) {
      setGeneralExpanded(true);
      // Add delay to allow state to update before scrolling
      setTimeout(() => {
        document.querySelector('[data-section="general"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (['userHeight', 'weight', 'gender'].includes(field)) {
      setHealthBasicsExpanded(true);
      setTimeout(() => {
        document.querySelector('[data-section="healthBasics"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'medicalConditions',
        'medications',
        'injuries',
        'familyHistory',
      ].includes(field)
    ) {
      setMedicalBackgroundExpanded(true);
      setTimeout(() => {
        document.querySelector('[data-section="medicalBackground"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'fitnessLevel',
        'sleepPattern',
        'exerciseFrequency',
        'exerciseModalities',
        'exerciseEnvironments',
        'workoutDuration',
        'targetAreas',
      ].includes(field)
    ) {
      setFitnessProfileExpanded(true);
      setTimeout(() => {
        document.querySelector('[data-section="fitnessProfile"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (
      [
        'healthGoals',
        'timeAvailability',
        'dietaryPreferences',
        'painfulAreas',
      ].includes(field)
    ) {
      setGoalsPreferencesExpanded(true);
      setTimeout(() => {
        document.querySelector('[data-section="goalsPreferences"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    markAsDirty();
  };

  // Function to handle canceling edits
  const handleCancelEdit = () => {
    setEditingField(null);
    setIsEditing(false);
    
    // Collapse all sections except General
    setGeneralExpanded(true); // Keep general section expanded
    setHealthBasicsExpanded(false);
    setMedicalBackgroundExpanded(false);
    setFitnessProfileExpanded(false);
    setGoalsPreferencesExpanded(false);
    
    // Scroll to the top using the ref
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
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

  if (authLoading || !user) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <div ref={topRef} className="py-3 px-4 flex items-center justify-between">
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">Profile</h1>
        </div>
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
      </div>

      {/* Message display */}
      {message && (
        <div
          className={`mx-4 p-3 rounded-lg mb-2 ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-200'
              : 'bg-red-900/50 text-red-200'
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

      <div className="h-screen overflow-y-auto">
        <div
          className={`max-w-md mx-auto px-4 py-6 ${isEditing ? 'pb-24' : ''}`}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <div className="flex flex-col items-center mb-6">
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
                          <span>Add Photo</span>
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
                ) :
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
                        <span>No Photo</span>
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
                }
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
                    <h3 className="text-indigo-400 font-semibold">General</h3>
                    <div className="text-gray-400 hover:text-white">
                      {generalExpanded ? (
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
                      ) : (
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
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* General section content */}
                {generalExpanded && (
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Name
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
                          {displayName || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Phone
                      </label>
                      {isEditing ? (
                        <div className="phone-input-container">
                          <style jsx>{`
                            .phone-input-container :global(.PhoneInput) {
                              display: flex;
                              align-items: stretch;
                              border-radius: 0.5rem;
                              overflow: hidden;
                              background-color: #2d3748;
                              border: ${!phoneValid
                                ? '1px solid #EF4444'
                                : '1px solid #4a5568'};
                              height: 42px;
                            }

                            .phone-input-container :global(.PhoneInputCountry) {
                              display: flex;
                              align-items: center;
                              padding: 0 0.5rem 0 0.75rem;
                              background-color: #2d3748;
                              border-right: 1px solid #4a5568;
                              min-width: 80px;
                              position: relative;
                            }

                            .phone-input-container
                              :global(.PhoneInputCountryIcon) {
                              margin-right: 0.5rem;
                            }

                            .phone-input-container
                              :global(.PhoneInputCountrySelectArrow) {
                              border-style: solid;
                              border-width: 0.35em 0.35em 0 0.35em;
                              border-color: #a0aec0 transparent transparent
                                transparent;
                              margin-left: 0.5rem;
                              transform: rotate(
                                0deg
                              ); /* Ensure arrow points downward */
                            }

                            /* Add rotation for when the dropdown is open */
                            .phone-input-container
                              :global(
                                .PhoneInputCountrySelect[aria-expanded='true']
                                  + .PhoneInputCountrySelectArrow
                              ) {
                              transform: rotate(180deg);
                            }

                            .phone-input-container :global(.PhoneInputInput) {
                              flex: 1;
                              min-width: 0;
                              background-color: #2d3748;
                              color: white;
                              border: none;
                              padding: 0.5rem 0.75rem;
                              font-size: 1rem;
                              outline: none;
                            }

                            .phone-input-container
                              :global(.PhoneInputInput:focus) {
                              outline: none;
                            }

                            /* Make sure dropdown appears above other elements */
                            :global(body .PhoneInputCountrySelect-menuOpen) {
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

                            :global(.PhoneInputCountrySelect__option) {
                              padding: 0.5rem 1rem !important;
                              color: #e2e8f0 !important;
                            }

                            :global(.PhoneInputCountrySelect__option:hover),
                            :global(.PhoneInputCountrySelect__option--focused) {
                              background-color: #2d3748 !important;
                            }

                            :global(
                                .PhoneInputCountrySelect__option--selected
                              ) {
                              background-color: #4f46e5 !important;
                              color: white !important;
                            }
                          `}</style>
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
                          {phone || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="pb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Date of Birth
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
                            : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* General Section END */}

                {/* Health Basics Section START */}
                <div className="border-t border-gray-700 my-6 pt-2">
                  <div
                    className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                    onClick={() =>
                      setHealthBasicsExpanded(!healthBasicsExpanded)
                    }
                    data-section="healthBasics"
                  >
                    <h3 className="text-indigo-400 font-semibold">
                      Health Basics
                    </h3>
                    <div className="text-gray-400 hover:text-white">
                      {healthBasicsExpanded ? (
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
                      ) : (
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
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Health Basics content */}
                {healthBasicsExpanded && (
                  <div className="space-y-4">
                    {/* Height */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Height
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={userHeight}
                          onChange={(e) => setUserHeight(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                          min="50"
                          max="250"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('userHeight')}
                        >
                          {userHeight || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Weight
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                          min="20"
                          max="300"
                          step="0.1"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('weight')}
                        >
                          {weight || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="pb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                          onClick={() => handleEdit('gender')}
                        >
                          {gender || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Health Basics Section END */}

                {/* Medical Background Section START */}
                <div className="border-t border-gray-700 my-6 pt-2">
                  <div
                    className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                    onClick={() =>
                      setMedicalBackgroundExpanded(!medicalBackgroundExpanded)
                    }
                    data-section="medicalBackground"
                  >
                    <h3 className="text-indigo-400 font-semibold">
                      Medical Background
                    </h3>
                    <div className="text-gray-400 hover:text-white">
                      {medicalBackgroundExpanded ? (
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
                      ) : (
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
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Background content */}
                {medicalBackgroundExpanded && (
                  <div className="space-y-4">
                    {/* Medical Conditions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Medical Conditions
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
                          placeholder="Separate with commas (e.g., Diabetes, Hypertension)"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('medicalConditions')}
                        >
                          {medicalConditions.length > 0
                            ? medicalConditions.join(', ')
                            : 'None'}
                        </p>
                      )}
                    </div>

                    {/* Medications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Medications
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
                          placeholder="Separate with commas (e.g., Aspirin, Metformin)"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('medications')}
                        >
                          {medications.length > 0 ? medications.join(', ') : 'None'}
                        </p>
                      )}
                    </div>

                    {/* Previous Injuries */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Injuries
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
                          placeholder="Separate with commas (e.g., ACL tear 2018, Shoulder surgery 2020)"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('injuries')}
                        >
                          {injuries.length > 0 ? injuries.join(', ') : 'None'}
                        </p>
                      )}
                    </div>

                    {/* Painful Areas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Painful Areas
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
                              No pain areas
                            </button>
                          </div>

                          {painfulAreas.length > 0 && (
                            <p className="text-gray-400 font-medium text-base mb-4">
                              Select all that apply
                            </p>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PAIN_BODY_PARTS.map((part) => (
                              <label
                                key={part}
                                className="relative flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  value={part}
                                  checked={painfulAreas.includes(part)}
                                  onChange={(e) => {
                                    const newPainfulAreas = e.target.checked
                                      ? [...painfulAreas, part]
                                      : painfulAreas.filter((p) => p !== part);
                                    setPainfulAreas(newPainfulAreas);
                                  }}
                                  className="peer sr-only"
                                />
                                <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                  <div className="font-medium">{part}</div>
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
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('painfulAreas')}
                        >
                          {painfulAreas.length > 0
                            ? painfulAreas.join(', ')
                            : 'No pain areas'}
                        </p>
                      )}
                    </div>

                    {/* Family Medical History */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Family Medical History
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
                          placeholder="Separate with commas (e.g., Heart disease, Diabetes)"
                        />
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('familyHistory')}
                        >
                          {familyHistory.length > 0
                            ? familyHistory.join(', ')
                            : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Medical Background Section END */}

                {/* Fitness Profile Section START */}
                <div className="border-t border-gray-700 my-6 pt-2">
                  <div
                    className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                    onClick={() =>
                      setFitnessProfileExpanded(!fitnessProfileExpanded)
                    }
                    data-section="fitnessProfile"
                  >
                    <h3 className="text-indigo-400 font-semibold">
                      Fitness Profile
                    </h3>
                    <div className="text-gray-400 hover:text-white">
                      {fitnessProfileExpanded ? (
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
                      ) : (
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
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fitness Profile content */}
                {fitnessProfileExpanded && (
                  <div className="space-y-4">
                    {/* Fitness Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Fitness Level
                      </label>
                      {editingField === 'fitnessLevel' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            {FITNESS_LEVELS.map((level) => (
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
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                          onClick={() => handleEdit('fitnessLevel')}
                        >
                          {fitnessLevel || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Exercise Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Exercise Frequency
                      </label>
                      {isEditing ? (
                        <select
                          value={exerciseFrequency}
                          onChange={(e) => setExerciseFrequency(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        >
                          <option value="">Select Frequency</option>
                          {PLANNED_EXERCISE_FREQUENCY_OPTIONS.map(
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
                          {exerciseFrequency || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Exercise Modalities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Exercise Modalities
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
                                  checked={exerciseModalities.some(m => 
                                    m.toLowerCase() === modality.name.toLowerCase()
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
                                          (m) => m.toLowerCase() !== modality.name.toLowerCase()
                                        )
                                      );
                                    }
                                  }}
                                  className="peer sr-only"
                                />
                                <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                  <div className="font-medium capitalize">
                                    {modality.name}
                                  </div>
                                  <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                                    {modality.description}
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
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left capitalize"
                          onClick={() => handleEdit('exerciseModalities')}
                        >
                          {exerciseModalities.length > 0
                            ? exerciseModalities
                                .map(
                                  (m) => m.charAt(0).toUpperCase() + m.slice(1)
                                )
                                .join(', ')
                            : 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Target Areas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Target Body Areas
                      </label>
                      {editingField === 'targetAreas' ? (
                        <div className="space-y-4">
                          {/* Body Regions */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['Full Body', 'Upper Body', 'Lower Body'].map(
                              (region) => (
                                <label
                                  key={region}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="bodyRegion"
                                    value={region}
                                    checked={
                                      region === 'Full Body'
                                        ? targetAreas.length ===
                                            TARGET_BODY_PARTS.length &&
                                          TARGET_BODY_PARTS.every((part) =>
                                            targetAreas.includes(part)
                                          )
                                        : region === 'Upper Body'
                                        ? UPPER_BODY_PARTS.every((part) =>
                                            targetAreas.includes(part)
                                          ) &&
                                          targetAreas.length ===
                                            UPPER_BODY_PARTS.length
                                        : region === 'Lower Body'
                                        ? LOWER_BODY_PARTS.every((part) =>
                                            targetAreas.includes(part)
                                          ) &&
                                          targetAreas.length ===
                                            LOWER_BODY_PARTS.length
                                        : false
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        let newTargetAreas: string[] = [];
                                        if (region === 'Full Body') {
                                          newTargetAreas = [
                                            ...TARGET_BODY_PARTS,
                                          ];
                                        } else if (region === 'Upper Body') {
                                          newTargetAreas = [
                                            ...UPPER_BODY_PARTS,
                                          ];
                                        } else if (region === 'Lower Body') {
                                          newTargetAreas = [
                                            ...LOWER_BODY_PARTS,
                                          ];
                                        }
                                        setTargetAreas(newTargetAreas);
                                      }
                                    }}
                                    className="peer sr-only"
                                  />
                                  <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                    {region}
                                  </div>
                                </label>
                              )
                            )}
                          </div>

                          {/* Individual Body Parts */}
                          <div>
                            <p className="text-gray-400 text-sm mb-3">
                              Or select specific areas:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {TARGET_BODY_PARTS.map((part) => (
                                <label
                                  key={part}
                                  className="relative flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    value={part}
                                    checked={targetAreas.includes(part)}
                                    onChange={(e) => {
                                      const newTargetAreas = e.target.checked
                                        ? [...targetAreas, part]
                                        : targetAreas.filter((p) => p !== part);
                                      setTargetAreas(newTargetAreas);
                                    }}
                                    className="peer sr-only"
                                  />
                                  <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                    {part}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Done button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('targetAreas')}
                        >
                          {targetAreas.length === TARGET_BODY_PARTS.length
                            ? 'Full Body'
                            : UPPER_BODY_PARTS.every((part) =>
                                targetAreas.includes(part)
                              ) &&
                              targetAreas.length === UPPER_BODY_PARTS.length
                            ? 'Upper Body'
                            : LOWER_BODY_PARTS.every((part) =>
                                targetAreas.includes(part)
                              ) &&
                              targetAreas.length === LOWER_BODY_PARTS.length
                            ? 'Lower Body'
                            : targetAreas.length > 0
                            ? targetAreas.join(', ')
                            : 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Sleep Patterns */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Sleep Pattern
                      </label>
                      {isEditing ? (
                        <select
                          value={sleepPattern}
                          onChange={(e) => setSleepPattern(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        >
                          <option value="">Select Sleep Pattern</option>
                          <option value="less-than-6">Less than 6 hours</option>
                          <option value="6-7">6-7 hours</option>
                          <option value="7-8">7-8 hours</option>
                          <option value="more-than-8">More than 8 hours</option>
                        </select>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('sleepPattern')}
                        >
                          {sleepPattern
                            ? sleepPattern === 'less-than-6'
                              ? 'Less than 6 hours'
                              : sleepPattern === 'more-than-8'
                              ? 'More than 8 hours'
                              : `${sleepPattern} hours`
                            : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Fitness Profile Section END */}

                {/* Goals and Preferences Section START */}
                <div className="border-t border-gray-700 my-6 pt-2">
                  <div
                    className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                    onClick={() =>
                      setGoalsPreferencesExpanded(!goalsPreferencesExpanded)
                    }
                    data-section="goalsPreferences"
                  >
                    <h3 className="text-indigo-400 font-semibold">
                      Goals & Preferences
                    </h3>
                    <div className="text-gray-400 hover:text-white">
                      {goalsPreferencesExpanded ? (
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
                      ) : (
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
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Goals and Preferences content */}
                {goalsPreferencesExpanded && (
                  <div className="space-y-4">
                    {/* Health Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Health Goals
                      </label>
                      {editingField === 'healthGoals' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {HEALTH_GOALS_OPTIONS.map((goal) => (
                              <label
                                key={goal}
                                className="relative flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  value={goal}
                                  checked={healthGoals.includes(goal)}
                                  onChange={(e) => {
                                    const newHealthGoals = e.target.checked
                                      ? [...healthGoals, goal]
                                      : healthGoals.filter((g) => g !== goal);
                                    setHealthGoals(newHealthGoals);
                                  }}
                                  className="peer sr-only"
                                />
                                <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                  {goal}
                                </div>
                              </label>
                            ))}
                          </div>

                          {/* Custom goal input */}
                          <div>
                            <p className="text-gray-400 text-sm mb-2">
                              Add custom goal:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id="custom-goal"
                                placeholder="Enter custom goal"
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === 'Enter' &&
                                    e.currentTarget.value.trim()
                                  ) {
                                    const customGoal =
                                      e.currentTarget.value.trim();
                                    if (!healthGoals.includes(customGoal)) {
                                      setHealthGoals([
                                        ...healthGoals,
                                        customGoal,
                                      ]);
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const customGoalInput =
                                    document.getElementById(
                                      'custom-goal'
                                    ) as HTMLInputElement;
                                  if (
                                    customGoalInput &&
                                    customGoalInput.value.trim()
                                  ) {
                                    const customGoal =
                                      customGoalInput.value.trim();
                                    if (!healthGoals.includes(customGoal)) {
                                      setHealthGoals([
                                        ...healthGoals,
                                        customGoal,
                                      ]);
                                      customGoalInput.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Done button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('healthGoals')}
                        >
                          {healthGoals.length > 0
                            ? healthGoals.join(', ')
                            : 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Exercise Environment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Exercise Environment
                      </label>
                      {editingField === 'exerciseEnvironments' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            {EXERCISE_ENVIRONMENTS.map((environment) => (
                              <label
                                key={environment.name}
                                className="relative flex items-center"
                              >
                                <input
                                  type="radio"
                                  name="exerciseEnvironments"
                                  value={environment.name}
                                  checked={
                                    exerciseEnvironments === environment.name
                                  }
                                  onChange={(e) => {
                                    setExerciseEnvironments(e.target.value);
                                  }}
                                  className="peer sr-only"
                                />
                                <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 cursor-pointer transition-all duration-200">
                                  <div className="font-medium">
                                    {environment.name}
                                  </div>
                                  <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                                    {environment.description}
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
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('exerciseEnvironments')}
                        >
                          {exerciseEnvironments || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Workout Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Workout Duration
                      </label>
                      {editingField === 'workoutDuration' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {WORKOUT_DURATIONS.map((duration) => (
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
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('workoutDuration')}
                        >
                          {workoutDuration || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1 text-left">
                        Dietary Preferences
                      </label>
                      {editingField === 'dietaryPreferences' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {DIETARY_PREFERENCES_OPTIONS.map((diet) => (
                              <label
                                key={diet}
                                className="relative flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  name="dietaryPreference"
                                  value={diet}
                                  checked={dietaryPreferences.includes(diet)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Add to selection
                                      setDietaryPreferences([
                                        ...dietaryPreferences,
                                        diet,
                                      ]);
                                    } else {
                                      // Remove from selection
                                      setDietaryPreferences(
                                        dietaryPreferences.filter(
                                          (item) => item !== diet
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
                            ))}
                          </div>

                          {/* Custom diet input */}
                          <div>
                            <p className="text-gray-400 text-sm mb-2">
                              Add custom diet:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id="custom-diet"
                                placeholder="Enter custom diet"
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
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Selected diets list with remove option */}
                          {dietaryPreferences.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-2">
                                Selected diets:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {dietaryPreferences.map((diet, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center bg-indigo-500/20 border border-indigo-500 rounded-lg px-3 py-1"
                                  >
                                    <span className="text-white">{diet}</span>
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
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Done button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-white cursor-pointer hover:text-indigo-400 transition-colors text-left"
                          onClick={() => handleEdit('dietaryPreferences')}
                        >
                          {dietaryPreferences.length > 0
                            ? dietaryPreferences.join(', ')
                            : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Goals and Preferences Section END */}
              </div>
              {/* Profile Info Section END */}
            </div>
          </div>

          {/* Only show these sections when not in edit mode */}
          {!isEditing && activeProgram && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Your Program
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Program:</span>
                  <span className="text-white">
                    {activeProgram.type === 'exercise'
                      ? 'Exercise Program'
                      : 'Recovery Program'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {new Date(activeProgram.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/program')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 w-full mt-3"
                >
                  View Program
                </button>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/change-password')}
                  className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between"
                >
                  <span>Change Password</span>
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
                  onClick={() => router.push('/privacy')}
                  className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between"
                >
                  <span>Privacy & Data Controls</span>
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
              </div>
            </div>
          )}

          {!isEditing && (
            <button
              onClick={handleLogout}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full"
            >
              Sign Out
            </button>
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
                isLoading || !phoneValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex-1 font-medium shadow-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
