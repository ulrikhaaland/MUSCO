'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { TopBar } from './TopBar';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../../shared/types';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { 
  TARGET_BODY_PARTS,
  SELECTABLE_BODY_PARTS,
  LOWER_BODY_PARTS, 
  EXERCISE_ENVIRONMENTS,
  WORKOUT_DURATIONS,
  RECOVERY_WORKOUT_DURATIONS,
  AGE_RANGES,
  EXERCISE_FREQUENCY_OPTIONS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
  EXERCISE_MODALITIES,
  PAIN_BODY_PARTS,
  CARDIO_TYPES,
  CARDIO_ENVIRONMENTS,
  detectBodyRegion,
  getBodyPartsForRegion,
  BodyRegionType
} from '@/app/types/program';

import { useTranslation } from '@/app/i18n';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { getAvailableProgramTypes, getNextAllowedGenerationDate } from '@/app/services/programGenerationLimits';
import { 
  getTranslatedTargetBodyParts,
  getTranslatedExerciseEnvironments,
  getTranslatedWorkoutDurations,
  getTranslatedAgeRanges,
  getTranslatedExerciseFrequencyOptions,
  getTranslatedPlannedExerciseFrequencyOptions,
  getTranslatedExerciseModalities,
  getTranslatedPainBodyParts,
  getTranslatedBodyRegions,
  translateBodyPart,
  getTranslatedCardioTypes,
  getTranslatedCardioEnvironments
} from '@/app/utils/programTranslation';

import { CustomEquipmentSelection } from './CustomEquipmentSelection';

interface ExerciseQuestionnaireProps {
  onClose?: () => void;
  onSubmit: (answers: ExerciseQuestionnaireAnswers) => void;
  generallyPainfulAreas: string[];
  programType: ProgramType;
  onProgramTypeChange?: (type: ProgramType) => void;
  targetAreas: BodyPartGroup[];
  fullBody: boolean;
  /** Diagnosis text from the chat assessment (displayed below subtitle) */
  diagnosisText?: string | null;
  /** When true, submit button is disabled to prevent double-clicks */
  isSubmitting?: boolean;
}

// Function to normalize pain areas - matches against PAIN_BODY_PARTS for proper capitalization
// No longer splits composite areas - they should match 3D model groups exactly
const normalizePainAreas = (areas: string[], translatedPainBodyParts: string[]): string[] => {
  const normalizedAreas = new Set<string>();

  areas.forEach((area) => {
    if (!area) return;
    const lowerArea = area.toLowerCase();
    
    // Find the matching pain body part with correct capitalization
    const matchingPart = translatedPainBodyParts.find(
      (part) => part.toLowerCase() === lowerArea
    ) || PAIN_BODY_PARTS.find(
      (part) => part.toLowerCase() === lowerArea
    );
    normalizedAreas.add(matchingPart || area);
  });

  return Array.from(normalizedAreas);
};

// RECOVERY_WORKOUT_DURATIONS is now imported from @/app/types/program

// Helper function to convert activity days string to number
const getWeeklyActivityDays = (activityDays: string): number => {
  if (!activityDays) return 0;
  
  // Extract the number from the activity days string
  if (activityDays.includes('1 day')) return 1;
  if (activityDays.includes('2 days')) return 2;
  if (activityDays.includes('3 days')) return 3;
  if (activityDays.includes('4 days')) return 4;
  if (activityDays.includes('5 days')) return 5;
  if (activityDays.includes('6 days')) return 6;
  if (activityDays.includes('Every day')) return 7;
  
  // Default to 3 if format is unknown
  return 3;
};


// Target body parts now imported from program.ts

function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const wasIntersectedOnce = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasIntersectedOnce.current) {
          setIsVisible(true);
          wasIntersectedOnce.current = true;
        }
      },
      { threshold: 0.1, ...options }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [elementRef, isVisible];
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

function RevealOnScroll({ children, className = '' }: RevealOnScrollProps) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ExerciseQuestionnaire({
  onClose,
  onSubmit,
  generallyPainfulAreas,
  programType,
  onProgramTypeChange,
  targetAreas,
  fullBody,
  diagnosisText,
  isSubmitting = false,
}: ExerciseQuestionnaireProps) {
  const { t, locale } = useTranslation();
  const { answers: storedAnswers, activeProgram } = useUser();
  const { user } = useAuth();
  
  // State for weekly generation limits
  const [lockedProgramTypes, setLockedProgramTypes] = useState<ProgramType[]>([]);
  const [nextAllowedDate, setNextAllowedDate] = useState<Date | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  
  // Fetch locked program types on mount
  useEffect(() => {
    const fetchLockedTypes = async () => {
      if (!user?.uid) {
        // Not logged in - no limits apply
        setLockedProgramTypes([]);
        setNextAllowedDate(null);
        setIsLoadingLimits(false);
        return;
      }
      
      try {
        const availableTypes = await getAvailableProgramTypes(user.uid);
        const allTypes = [ProgramType.Exercise, ProgramType.ExerciseAndRecovery, ProgramType.Recovery];
        const locked = allTypes.filter(type => !availableTypes.includes(type));
        setLockedProgramTypes(locked);
        
        // If any types are locked, get the next allowed date
        if (locked.length > 0) {
          const nextDate = await getNextAllowedGenerationDate(user.uid, locked[0]);
          setNextAllowedDate(nextDate);
        }
      } catch (error) {
        console.error('Error fetching program generation limits:', error);
        // On error, allow all types
        setLockedProgramTypes([]);
      } finally {
        setIsLoadingLimits(false);
      }
    };
    
    fetchLockedTypes();
  }, [user?.uid]);
  
  // Get translated options
  const translatedTargetBodyParts = getTranslatedTargetBodyParts(t);
  const translatedExerciseEnvironments = getTranslatedExerciseEnvironments(t);
  const translatedAgeRanges = getTranslatedAgeRanges(t);
  const translatedExerciseFrequencyOptions = getTranslatedExerciseFrequencyOptions(t);
  const translatedPlannedFrequencyOptions = getTranslatedPlannedExerciseFrequencyOptions(t);
  const translatedExerciseModalities = getTranslatedExerciseModalities(t);
  const translatedPainBodyParts = getTranslatedPainBodyParts(t);
  const translatedBodyRegions = getTranslatedBodyRegions(t);
  const translatedCardioTypes = getTranslatedCardioTypes(t);
  const translatedCardioEnvironments = getTranslatedCardioEnvironments(t);
  
  // Translate workout durations based on program type
  const TRANSLATED_RECOVERY_WORKOUT_DURATIONS = RECOVERY_WORKOUT_DURATIONS.map(
    duration => t(`program.duration.${duration.toLowerCase().replace(/\s+/g, '_')}`)
  );
  
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType>(programType);
  const [programTypeCollapsed, setProgramTypeCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setSelectedProgramType(programType);
  }, [programType]);

  // Auto-select first available type if current selection is locked
  useEffect(() => {
    if (lockedProgramTypes.length > 0 && lockedProgramTypes.includes(selectedProgramType)) {
      const allTypes = [ProgramType.Exercise, ProgramType.ExerciseAndRecovery, ProgramType.Recovery];
      const firstAvailable = allTypes.find(type => !lockedProgramTypes.includes(type));
      if (firstAvailable) {
        setSelectedProgramType(firstAvailable);
        if (onProgramTypeChange) onProgramTypeChange(firstAvailable);
      }
    }
  }, [lockedProgramTypes, selectedProgramType, onProgramTypeChange]);

  const handleProgramTypeChange = (type: ProgramType) => {
    setSelectedProgramType(type);
    if (onProgramTypeChange) onProgramTypeChange(type);
    // Collapse after choosing and scroll to next question
    setProgramTypeCollapsed(true);
    setTimeout(() => {
      if (ageRef.current) {
        scrollToNextUnansweredQuestion(ageRef, true);
      }
    }, 150);
  };

  const translatedWorkoutDurations = selectedProgramType === ProgramType.Recovery
    ? TRANSLATED_RECOVERY_WORKOUT_DURATIONS
    : getTranslatedWorkoutDurations(t);
  
  // Normalize the incoming pain areas while preserving proper capitalization
  const normalizedPainAreas = normalizePainAreas(generallyPainfulAreas || [], translatedPainBodyParts);

  const [targetAreasReopened, setTargetAreasReopened] = useState(false);
  const [cardioTypeReopened, setCardioTypeReopened] = useState(false);
  const [cardioEnvironmentReopened, setCardioEnvironmentReopened] = useState(false);
  const [editingField, setEditingField] = useState<
    keyof ExerciseQuestionnaireAnswers | null
  >(null);

  const computeInitialTargetAreas = (): (typeof SELECTABLE_BODY_PARTS)[number][] => {
    // No preselection - user must explicitly choose their target areas
    return [];
  };

  const prefillAge = (() => {
    const val = storedAnswers?.age || activeProgram?.questionnaire?.age || '';
    return AGE_RANGES.includes(val as any) ? val : '';
  })();
  const prefillFrequency = (() => {
    const val =
      storedAnswers?.lastYearsExerciseFrequency ||
      activeProgram?.questionnaire?.lastYearsExerciseFrequency ||
      '';
    return EXERCISE_FREQUENCY_OPTIONS.includes(val as any) ? val : '';
  })();

  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers>(() => ({
    age: prefillAge,
    lastYearsExerciseFrequency: prefillFrequency,
    numberOfActivityDays: '',
    generallyPainfulAreas: normalizedPainAreas.filter(area => area && area.trim() !== ''),
    exerciseModalities: '',
    exerciseEnvironments: '',
    workoutDuration: '',
    targetAreas: computeInitialTargetAreas(),
    cardioType: '',
    cardioEnvironment: '',
    includeWeekends: true,
    additionalInfo: '',
  }));

  // No-op: target areas are updated directly in answers state

  const handleEdit = (field: keyof ExerciseQuestionnaireAnswers) => {
    // Only set targetAreasReopened if:
    // 1. We're editing target areas
    // 2. We're not currently editing target areas
    // 3. We have already answered exercise environments (meaning it was collapsed)
    if (
      field === 'targetAreas' &&
      editingField !== 'targetAreas' &&
      !!answers.exerciseEnvironments
    ) {
      setTargetAreasReopened(true);
    }

    // Similarly for cardio type and environment
    if (
      field === 'cardioType' &&
      editingField !== 'cardioType' &&
      !!answers.cardioEnvironment
    ) {
      setCardioTypeReopened(true);
    }

    if (
      field === 'cardioEnvironment' &&
      editingField !== 'cardioEnvironment' &&
      !!answers.exerciseEnvironments
    ) {
      setCardioEnvironmentReopened(true);
    }

    if (field === 'generallyPainfulAreas') {
      if (answers.generallyPainfulAreas.length === 0) {
        setAnswers((prev) => ({ ...prev, generallyPainfulAreas: [] }));
      }
    }

    setEditingField(field);
  };

  const shouldCollapseField = (field: keyof ExerciseQuestionnaireAnswers) => {
    // Special handling for targetAreas
    if (field === 'targetAreas') {
      // If a body region (Full/Upper/Lower) is selected, collapse immediately
      const region = detectBodyRegion(answers.targetAreas || []);
      if (region !== 'custom') return true;
      return !targetAreasReopened && !!answers.exerciseEnvironments;
    }

    // Special handling for modality split
    if (field === 'modalitySplit') {
      // Only collapse if no longer editing AND there's a subsequent question answered
      // This prevents auto-collapse when selecting cardio type/environment
      return editingField !== 'modalitySplit' && 
        ((!!answers.cardioType && !!answers.cardioEnvironment) || 
         !!answers.targetAreas.length);
    }

    // Special handling for cardio type
    if (field === 'cardioType') {
      return !cardioTypeReopened && !!answers.cardioEnvironment;
    }

    // Special handling for cardio environment
    if (field === 'cardioEnvironment') {
      return !cardioEnvironmentReopened && !!answers.exerciseEnvironments;
    }

    // Always collapse workout duration after selection
    if (field === 'workoutDuration') {
      return true;
    }

    // For all other fields, keep the existing behavior
    const fields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'generallyPainfulAreas',
      'exerciseModalities',
      'exerciseEnvironments',
      'workoutDuration',
    ];

    const currentIndex = fields.indexOf(field);
    if (currentIndex === -1) return false;

    const nextField = fields[currentIndex + 1];
    if (!nextField) return false;

    return shouldShowQuestion(nextField);
  };

  // Create refs for each question section
  const ageRef = useRef<HTMLDivElement>(null);
  const lastYearRef = useRef<HTMLDivElement>(null);
  const plannedRef = useRef<HTMLDivElement>(null);
  const painAreasRef = useRef<HTMLDivElement>(null);
  const exerciseModalitiesRef = useRef<HTMLDivElement>(null);
  const modalitySplitRef = useRef<HTMLDivElement>(null);
  const exerciseEnvironmentRef = useRef<HTMLDivElement>(null);
  const workoutDurationRef = useRef<HTMLDivElement>(null);
  const additionalInfoRef = useRef<HTMLDivElement>(null);
  const targetAreasRef = useRef<HTMLDivElement>(null);
  const cardioTypeRef = useRef<HTMLDivElement>(null);
  const cardioEnvironmentRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Auto-collapse program type once age is answered
  useEffect(() => {
    if (answers.age) {
      setProgramTypeCollapsed(true);
    }
  }, [answers.age]);

  // Force includeWeekends to true when more than 5 days are selected
  useEffect(() => {
    const days = getWeeklyActivityDays(answers.numberOfActivityDays);
    if (days > 5 && !answers.includeWeekends) {
      setAnswers(prev => ({ ...prev, includeWeekends: true }));
    }
  }, [answers.numberOfActivityDays, answers.includeWeekends]);

  const scrollToNextUnansweredQuestion = async (
    currentRef: React.RefObject<HTMLDivElement>,
    forceScroll?: boolean
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const refs = [
      ageRef,
      lastYearRef,
      plannedRef,
      painAreasRef,
      exerciseModalitiesRef,
      modalitySplitRef,
      cardioTypeRef,
      cardioEnvironmentRef,
      targetAreasRef,
      exerciseEnvironmentRef,
      workoutDurationRef,
    ];

    const fields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'generallyPainfulAreas',
      'exerciseModalities',
      'modalitySplit',
      'cardioType',
      'cardioEnvironment',
      'targetAreas',
      'exerciseEnvironments',
      'workoutDuration',
    ];

    const currentIndex = refs.indexOf(currentRef);

    if (currentIndex < refs.length - 1 && formRef.current) {
      // If forceScroll is true, scroll to the next ref immediately
      if (forceScroll && refs[currentIndex + 1].current) {
        const nextElement = refs[currentIndex + 1].current;
        const formElement = formRef.current;
        const formRect = formElement.getBoundingClientRect();
        const elementRect = nextElement.getBoundingClientRect();
        const relativeTop =
          elementRect.top - formRect.top + formElement.scrollTop;

        formElement.scrollTo({
          top: relativeTop - 60,
          behavior: 'smooth',
        });
        return;
      }

      // Otherwise, find the next unanswered question
      for (let i = currentIndex + 1; i < refs.length; i++) {
        const field = fields[i];
        const isEmpty = Array.isArray(answers[field])
          ? (answers[field] as any[]).length === 0
          : !answers[field];

        if (isEmpty && refs[i].current && shouldShowQuestion(field)) {
          const nextElement = refs[i].current;
          const formElement = formRef.current;
          const formRect = formElement.getBoundingClientRect();
          const elementRect = nextElement.getBoundingClientRect();
          const relativeTop =
            elementRect.top - formRect.top + formElement.scrollTop;

          formElement.scrollTo({
            top: relativeTop - 60,
            behavior: 'smooth',
          });
          break;
        }
      }
    } else if (currentIndex === refs.length - 1 && formRef.current) {
      // If we're at the last question, scroll to the bottom
      formRef.current.scrollTo({
        top: formRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Add separate states for strength and cardio equipment
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
  const [selectedCustomEquipment, setSelectedCustomEquipment] = useState<string[]>([]);
  const [strengthEquipment, setStrengthEquipment] = useState<string[]>([]);
  const [cardioEquipment, setCardioEquipment] = useState<string[]>([]);
  
  // Auto-select cardio equipment when indoor cardio is chosen with custom environment
  useEffect(() => {
    const isIndoorAllowed =
      answers.cardioEnvironment === 'Inside' ||
      answers.cardioEnvironment === 'Both';
    const shouldPreSelectCardioEquipment =
      !!answers.cardioType &&
      isIndoorAllowed &&
      answers.exerciseEnvironments === 'Custom';

    if (!shouldPreSelectCardioEquipment) return;

    let equipmentToPreSelect: string[] = [];
    if (answers.cardioType === 'Running') {
      equipmentToPreSelect = ['Treadmill'];
    } else if (answers.cardioType === 'Cycling') {
      equipmentToPreSelect = ['Exercise Bike'];
    } else if (answers.cardioType === 'Rowing') {
      equipmentToPreSelect = ['Rowing Machine'];
    } else if (answers.cardioType === 'Incline Walking') {
      equipmentToPreSelect = ['Treadmill'];
    }

    if (equipmentToPreSelect.length === 0) return;

    // Avoid redundant updates: if we've already added all, bail out
    const alreadyHasAll = equipmentToPreSelect.every((eq) =>
      cardioEquipment.includes(eq)
    );
    if (alreadyHasAll) return;

    // Update cardio equipment state only if it changes
    setCardioEquipment((prev) => {
      const merged = [...new Set([...prev, ...equipmentToPreSelect])];
      return merged.length === prev.length ? prev : merged;
    });

    // Keep UI selection in sync for Cardio category
    if (selectedEquipmentCategory === 'Cardio') {
      setSelectedCustomEquipment((prev) => {
        const merged = [...new Set([...prev, ...equipmentToPreSelect])];
        return merged.length === prev.length ? prev : merged;
      });
    }

    // Switch to Cardio category if not already there
    if (selectedEquipmentCategory !== 'Cardio') {
      setSelectedEquipmentCategory('Cardio');
      setSelectedCustomEquipment(equipmentToPreSelect);
    }

    // Update the combined equipment in answers (derive from previous answers)
    setAnswers((prev) => ({
      ...prev,
      equipment: [...new Set([...(prev.equipment || []), ...equipmentToPreSelect])],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.cardioType, answers.cardioEnvironment, answers.exerciseEnvironments]);
  
  // Modify handleInputChange to handle custom equipment selection
  const handleInputChange = (
    field: keyof ExerciseQuestionnaireAnswers,
    value: string | number | string[],
    ref?: React.RefObject<HTMLDivElement>
  ) => {
    // Handle special case for exerciseEnvironments
    if (field === 'exerciseEnvironments' as keyof ExerciseQuestionnaireAnswers) {
      console.log(`Setting exerciseEnvironments to: ${value}`);
      
      // When Custom is selected, don't collapse the field automatically
      if (value === 'Custom') {
        setAnswers((prev) => ({
          ...prev,
          [field]: value as string,
          // Don't reset equipment array when changing to Custom
        }));
        
        // If we previously had a category selected, keep it
        if (!selectedEquipmentCategory) {
          console.log('Setting default category to Strength');
          setSelectedEquipmentCategory('Strength');
        }
        
        setEditingField('exerciseEnvironments'); // Keep the field open for equipment selection
        return;
      } else {
        // For non-Custom environments, reset the equipment array
        setAnswers((prev) => ({
          ...prev,
          [field]: value as string,
          equipment: []
        }));
        
        // Close the editing field for non-Custom selections
        setEditingField(null);
        
        // If ref provided, scroll to next question
        if (ref) {
          setTimeout(() => {
            scrollToNextUnansweredQuestion(ref, true);
          }, 150);
        }
        return;
      }
    }
    
    // Special case for target areas - Skip automatic handling since we now handle it directly in the UI
    if (field === 'targetAreas' && Array.isArray(value)) {
      // We now handle target areas in the UI directly
      return;
    }
    
    // Create a mutable version of the normalized value
    let normalizedValue =
      field === 'generallyPainfulAreas'
        ? Array.isArray(value)
          ? value
          : value
        : value;

    // For generallyPainfulAreas, filter out any empty values
    if (field === 'generallyPainfulAreas' && Array.isArray(normalizedValue)) {
      normalizedValue = normalizedValue.filter(area => area && area.trim() !== '');
    }

    // For single-choice fields, if the same value is selected again, just minimize the question
    const singleChoiceFields: (keyof ExerciseQuestionnaireAnswers)[] = [
      'age',
      'lastYearsExerciseFrequency',
      'numberOfActivityDays',
      'exerciseModalities',
      'workoutDuration',
    ];

    // Auto-collapse for "No, I don&apos;t have any pain" selection (when generallyPainfulAreas is set to empty array)
    if (
      field === 'generallyPainfulAreas' &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      setAnswers((prev) => ({
        ...prev,
        [field]: value,
      }));
      setEditingField(null);

      // Schedule scrolling after state update
      setTimeout(() => {
        if (ref) {
          scrollToNextUnansweredQuestion(ref, true);
        }
      }, 150);
      return;
    }

    if (
      singleChoiceFields.includes(field) &&
      answers[field] === normalizedValue
    ) {
      setEditingField(null);
      return;
    }

    // Update state
    setAnswers((prev) => ({
      ...prev,
      [field]: normalizedValue,
    }));

    // Only clear editing state for non-pain areas or when selecting "No, I don&apos;t have any pain"
    if (
      field !== 'generallyPainfulAreas' ||
      (Array.isArray(normalizedValue) && normalizedValue.length === 0)
    ) {
      // Don't clear editing state for custom environment
      if (!(field === 'exerciseEnvironments' && normalizedValue === 'Custom')) {
      setEditingField(null);
      }
    }

    // Schedule scrolling after state update
    setTimeout(() => {
      if (!ref) {
        return;
      }

      // Check if this is the last question being answered
      const isLastQuestion = field === 'workoutDuration';

      // If it's the last question and we're setting a value, scroll to bottom
      if (isLastQuestion && normalizedValue) {
        if (formRef.current) {
          formRef.current.scrollTo({
            top: formRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
        return;
      }

      // Special case for exercise modalities
      if (field === 'exerciseModalities') {
        if (normalizedValue === 'Both' || normalizedValue === t('program.modality.both')) {
          // When "Both" is selected, calculate initial cardio/strength days
          // based on the chosen frequency (even split)
          const totalDays = getWeeklyActivityDays(answers.numberOfActivityDays);
          const initialCardioDays = Math.floor(totalDays / 2);
          const initialStrengthDays = totalDays - initialCardioDays;
          
          setAnswers((prev) => ({
            ...prev,
            [field]: normalizedValue as string,
            modalitySplit: 'custom',
            cardioDays: initialCardioDays as any, // Use type assertion for now
            strengthDays: initialStrengthDays as any // Use type assertion for now
          }));
        } else {
          // For other modality choices, clear the modalitySplit value
          setAnswers((prev) => ({
            ...prev,
            [field]: normalizedValue as string,
            modalitySplit: undefined
          }));
        }
        
        // Close the editing field
        setEditingField(null);
        
        if (normalizedValue === 'Strength' || normalizedValue === t('program.modality.strength')) {
          // Scroll to target areas
          if (targetAreasRef.current) {
            const formElement = formRef.current;
            if (formElement) {
              const formRect = formElement.getBoundingClientRect();
              const elementRect =
                targetAreasRef.current.getBoundingClientRect();
              const relativeTop =
                elementRect.top - formRect.top + formElement.scrollTop;

              formElement.scrollTo({
                top: relativeTop - 60,
                behavior: 'smooth',
              });
            }
          }
        } else if (normalizedValue === 'Cardio' || normalizedValue === t('program.modality.cardio')) {
          // For Cardio, scroll to cardio type
          if (cardioTypeRef.current) {
            const formElement = formRef.current;
            if (formElement) {
              const formRect = formElement.getBoundingClientRect();
              const elementRect =
                cardioTypeRef.current.getBoundingClientRect();
              const relativeTop =
                elementRect.top - formRect.top + formElement.scrollTop;

              formElement.scrollTo({
                top: relativeTop - 60,
                behavior: 'smooth',
              });
            }
          }
        } else if (normalizedValue === 'Both' || normalizedValue === t('program.modality.both')) {
          // For Both, scroll to modality split
          if (modalitySplitRef.current) {
            const formElement = formRef.current;
            if (formElement) {
              const formRect = formElement.getBoundingClientRect();
              const elementRect =
                modalitySplitRef.current.getBoundingClientRect();
              const relativeTop =
                elementRect.top - formRect.top + formElement.scrollTop;

              formElement.scrollTo({
                top: relativeTop - 60,
                behavior: 'smooth',
              });
            }
          }
        } else {
          // For other choices, scroll to exercise environments
          scrollToNextUnansweredQuestion(ref, true);
        }
        return;
      }

      // Special case for cardio type
      if (field === 'cardioType' && cardioEnvironmentRef.current) {
        setTimeout(() => {
          const formElement = formRef.current;
          if (formElement) {
            const formRect = formElement.getBoundingClientRect();
            const elementRect =
              cardioEnvironmentRef.current.getBoundingClientRect();
            const relativeTop =
              elementRect.top - formRect.top + formElement.scrollTop;

            formElement.scrollTo({
              top: relativeTop - 60,
              behavior: 'smooth',
            });
          }
        }, 150);
        return;
      }

      // Special case for modalitySplit - calculate cardio and strength days
      if (field === 'modalitySplit') {
        const totalDays = getWeeklyActivityDays(answers.numberOfActivityDays);
        let cardioDays = 0;
        let strengthDays = 0;
        
        // Calculate the number of days for each modality based on the split preference
        if (normalizedValue === 'even') {
          // Even distribution - split evenly with any remainder going to strength
          cardioDays = Math.floor(totalDays / 2);
          strengthDays = totalDays - cardioDays;
        } else if (normalizedValue === 'moreStrength') {
          // More strength - 2/3 strength, 1/3 cardio (roughly)
          strengthDays = Math.ceil(totalDays * 2/3);
          cardioDays = totalDays - strengthDays;
        } else if (normalizedValue === 'moreCardio') {
          // More cardio - 2/3 cardio, 1/3 strength (roughly)
          cardioDays = Math.ceil(totalDays * 2/3);
          strengthDays = totalDays - cardioDays;
        }
        
        console.log(`Split days - Cardio: ${cardioDays}, Strength: ${strengthDays}, Total: ${totalDays}`);
        
        // Update all related fields
        setAnswers((prev) => ({
          ...prev,
          [field]: normalizedValue as string,
          cardioDays,
          strengthDays
        }));
        
        // Continue with normal flow
        if (ref) {
          scrollToNextUnansweredQuestion(ref, true);
        }
        return;
      }

      // Special case for target areas - only auto-scroll if selecting a body region
      if (field === 'targetAreas' && Array.isArray(normalizedValue)) {
        const region = detectBodyRegion(normalizedValue as string[]);
        if (region !== 'custom') {
          scrollToNextUnansweredQuestion(ref, true);
        }
        return;
      }

      // Auto-scroll for single-choice fields
      if (singleChoiceFields.includes(field)) {
        scrollToNextUnansweredQuestion(ref, true);
        return;
      }
    }, 150);
  };

  // Modify handleEquipmentCategoryChange to maintain separate selections
  const handleEquipmentCategoryChange = (category: string) => {
    console.log(`Changing equipment category to: ${category}`);
    
    // Save current category selections before switching
    if (selectedEquipmentCategory === 'Strength') {
      console.log('Saving strength equipment selections:', selectedCustomEquipment);
      setStrengthEquipment(selectedCustomEquipment);
    } else if (selectedEquipmentCategory === 'Cardio') {
      console.log('Saving cardio equipment selections:', selectedCustomEquipment);
      setCardioEquipment(selectedCustomEquipment);
    }
    
    // Switch to the new category
    setSelectedEquipmentCategory(category);
    
    // Load the saved selections for the new category
    const newSelections = category === 'Strength' ? strengthEquipment : cardioEquipment;
    console.log(`Loading saved ${category} selections:`, newSelections);
    setSelectedCustomEquipment(newSelections);
    
    // Update answers with combined equipment from both categories
    const combinedEquipment = [...new Set([...strengthEquipment, ...cardioEquipment])];
    setAnswers(prev => ({
      ...prev,
      equipment: combinedEquipment
    }));
  };

  // Modify handleCustomEquipmentChange to update the category-specific selections
  const handleCustomEquipmentChange = (equipment: string[]) => {
    console.log('Equipment changed in parent:', equipment);
    setSelectedCustomEquipment(equipment);
    
    // Update the category-specific equipment arrays
    if (selectedEquipmentCategory === 'Strength') {
      setStrengthEquipment(equipment);
    } else if (selectedEquipmentCategory === 'Cardio') {
      setCardioEquipment(equipment);
    }
    
    // Update the answers with the combined equipment from both categories
    const updatedStrengthEquipment = selectedEquipmentCategory === 'Strength' ? equipment : strengthEquipment;
    const updatedCardioEquipment = selectedEquipmentCategory === 'Cardio' ? equipment : cardioEquipment;
    const combinedEquipment = [...new Set([...updatedStrengthEquipment, ...updatedCardioEquipment])];
    
    // Update the answers.equipment array
    setAnswers(prev => {
      console.log('Previous answers:', prev);
      const newAnswers = {
        ...prev,
        equipment: combinedEquipment
      };
      console.log('New answers:', newAnswers);
      return newAnswers;
    });
  };

  // Add a function to handle continuing after equipment selection
  const handleEquipmentContinue = () => {
    // Always collapse/minimize when continuing from equipment selection
    setEditingField(null);
    if (exerciseEnvironmentRef.current) {
      scrollToNextUnansweredQuestion(exerciseEnvironmentRef, true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a copy of the answers for submission
    const submissionAnswers = {...answers};

    // Transform 'Both' to ['Strength', 'Cardio'] for exercise modalities
    if (submissionAnswers.exerciseModalities === 'Both') {
      submissionAnswers.exerciseModalities = 'Strength and Cardio';
    }

    // Transform 'Both' to 'Inside and Outside' for cardio environment
    if (submissionAnswers.cardioEnvironment === 'Both') {
      submissionAnswers.cardioEnvironment = 'Inside and Outside';
    }

    onSubmit(submissionAnswers);
  };

  const handleNoPainAreas = () => {
    setAnswers((prev) => ({ ...prev, generallyPainfulAreas: [] }));
    setEditingField(null);
    if (painAreasRef.current) {
      scrollToNextUnansweredQuestion(painAreasRef, true);
    }
  };

  // Add a state to track which cardio section is visible
  const [cardioSection, setCardioSection] = useState<'type' | 'environment'>('type');

  // Add a new handler for when cardio type is selected
  const handleCardioTypeSelect = (type: string) => {
    setAnswers(prev => ({
      ...prev,
      cardioType: type
    }));
    
    // After selecting type, show environment options
    setCardioSection('environment');
  };

  // Handle changing the number of days for cardio or strength
  const handleDayChange = (field: 'cardioDays' | 'strengthDays', value: number) => {
    // Clamp to non-negative
    const requested = Math.max(0, value);

    setAnswers(prev => {
      const currentCardio = prev.cardioDays || 0;
      const currentStrength = prev.strengthDays || 0;
      const otherField = field === 'cardioDays' ? 'strengthDays' : 'cardioDays';
      const otherValue = otherField === 'strengthDays' ? currentStrength : currentCardio;

      // Tentative new values for fields
      let nextCardio = field === 'cardioDays' ? requested : currentCardio;
      let nextStrength = field === 'strengthDays' ? requested : currentStrength;

      // Compute total and enforce hard cap of 7
      let total = nextCardio + nextStrength;
      if (total > 7) {
        // Cap the changed field so total becomes 7
        const maxForField = Math.max(0, 7 - otherValue);
        if (field === 'cardioDays') nextCardio = Math.min(requested, maxForField);
        else nextStrength = Math.min(requested, maxForField);
        total = nextCardio + nextStrength; // now ≤ 7
      }

      // Build weekly label directly from total (track increases and decreases)
      const weeklyLabel = (() => {
        switch (total) {
          case 1: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[0];
          case 2: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[1];
          case 3: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[2];
          case 4: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[3];
          case 5: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[4];
          case 6: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[5];
          case 7: return PLANNED_EXERCISE_FREQUENCY_OPTIONS[6];
          default: return prev.numberOfActivityDays; // keep if total 0
        }
      })();

      return {
        ...prev,
        cardioDays: nextCardio as any,
        strengthDays: nextStrength as any,
        numberOfActivityDays: weeklyLabel,
        modalitySplit: 'custom' as any,
      } as any;
    });
  };

  // Handle saving the modality split and progressing
  const handleSaveModalitySplit = () => {
    // Validate total doesn't exceed selected activity days
    const totalDays = (answers.cardioDays || 0) + (answers.strengthDays || 0);
    const maxDays = getWeeklyActivityDays(answers.numberOfActivityDays);
    
    if (totalDays === 0 || totalDays > maxDays) {
      // Don't proceed if invalid
      return;
    }
    
    // Close editing and scroll to next question
    setEditingField(null);
    
    // Determine where to scroll next based on selections
    if (answers.cardioDays && answers.cardioDays > 0 && cardioTypeRef.current) {
      // If cardio days > 0, scroll to cardio type
      const formElement = formRef.current;
      if (formElement) {
        const formRect = formElement.getBoundingClientRect();
        const elementRect = cardioTypeRef.current.getBoundingClientRect();
        const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;
        
        formElement.scrollTo({
          top: relativeTop - 60,
          behavior: 'smooth',
        });
      }
    } else if (answers.strengthDays && answers.strengthDays > 0 && targetAreasRef.current) {
      // If only strength days, scroll to target areas
      const formElement = formRef.current;
      if (formElement) {
        const formRect = formElement.getBoundingClientRect();
        const elementRect = targetAreasRef.current.getBoundingClientRect();
        const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;
        
        formElement.scrollTo({
          top: relativeTop - 60,
          behavior: 'smooth',
        });
      }
    }
  };

  const shouldShowQuestion = (field: keyof ExerciseQuestionnaireAnswers) => {
    // For recovery programs, don't show exercise modalities question
    if (selectedProgramType === ProgramType.Recovery && field === 'exerciseModalities') {
      return false;
    }

    switch (field) {
      case 'age':
        return true;
      case 'lastYearsExerciseFrequency':
        return !!answers.age;
      case 'numberOfActivityDays':
        return !!answers.lastYearsExerciseFrequency;
      case 'generallyPainfulAreas':
        return !!answers.numberOfActivityDays;
      case 'exerciseModalities':
        return (
          (selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery) &&
          !!answers.numberOfActivityDays &&
          (!!answers.generallyPainfulAreas ||
            answers.generallyPainfulAreas.length === 0)
        );
      case 'modalitySplit':
        return (
          (selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery) &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'cardioType':
        return (
          (selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery) &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Cardio' ||
           answers.exerciseModalities === t('program.modality.cardio') ||
           answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'targetAreas':
        // Check for Strength or Both in a translation-safe way by looking at the underlying value
        // or comparing with translated strings
        return (
          (selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery) &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Strength' ||
           answers.exerciseModalities === t('program.modality.strength') ||
           answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'exerciseEnvironments':
        if (selectedProgramType === ProgramType.Recovery) {
          // For recovery, show after having exercise frequency
          return !!answers.numberOfActivityDays;
        }
        
        // Skip exercise environments if only Cardio is selected
        if (answers.exerciseModalities === 'Cardio' || 
            answers.exerciseModalities === t('program.modality.cardio')) {
          return false; // Don't show exercise environments for cardio-only
        }
        
        // For 'Both', show after cardio environment and target areas
        if (answers.exerciseModalities === 'Both' || 
            answers.exerciseModalities === t('program.modality.both')) {
          return !!answers.cardioEnvironment && !!answers.targetAreas.length;
        }
        
        // For strength, show after target areas
        return !!answers.targetAreas.length;
      case 'workoutDuration':
        // For cardio-only, show after cardio environment is selected
        if (answers.exerciseModalities === 'Cardio' || 
            answers.exerciseModalities === t('program.modality.cardio')) {
          return !!answers.cardioEnvironment;
        }
        
        // For all other cases, show after exercise environments
        return !!answers.exerciseEnvironments;
      default:
        return false;
    }
  };

  // Get the appropriate workout durations based on program type
  // const workoutDurations = getWorkoutDurations(programType);

  // Add the translateAnswer function here inside the component
  // where all the translation variables are available
  const translateAnswer = (answer: string): string => {
    // Modalities
    if (answer === 'Cardio') return t('program.modality.cardio');
    if (answer === 'Strength') return t('program.modality.strength');
    if (answer === 'Both') return t('program.modality.both');
    
    // Modality Split
    if (answer === 'even') return t('questionnaire.modalitySplit.evenly');
    if (answer === 'moreStrength') return t('questionnaire.modalitySplit.moreStrength');
    if (answer === 'moreCardio') return t('questionnaire.modalitySplit.moreCardio');
    
    // No pain option
    if (answer === "No, I don't have any pain") return t('questionnaire.noPain');
    
    // Body regions - use the correct translation keys
    if (answer === 'Full Body') return t('profile.bodyRegions.full_body');
    if (answer === 'Upper Body') return t('profile.bodyRegions.upper_body');
    if (answer === 'Lower Body') return t('profile.bodyRegions.lower_body');
    
    // Exercise environments
    if (answer.includes('Large Gym')) return t('program.equipment.large_gym');
    if (answer.includes('Custom')) return t('program.equipment.custom_(pick_and_choose)');
    
    // For body parts
    const bodyPartIndex = TARGET_BODY_PARTS.findIndex(part => part === answer);
    if (bodyPartIndex >= 0) {
      return translatedTargetBodyParts[bodyPartIndex];
    }
    
    // For pain body parts
    const painBodyPartIndex = PAIN_BODY_PARTS.findIndex(part => part === answer);
    if (painBodyPartIndex >= 0) {
      return translatedPainBodyParts[painBodyPartIndex];
    }
    
    // For exercise frequency
    const frequencyIndex = EXERCISE_FREQUENCY_OPTIONS.findIndex(freq => freq === answer);
    if (frequencyIndex >= 0) {
      return translatedExerciseFrequencyOptions[frequencyIndex];
    }
    
    // For planned frequency
    const plannedFreqIndex = PLANNED_EXERCISE_FREQUENCY_OPTIONS.findIndex(freq => freq === answer);
    if (plannedFreqIndex >= 0) {
      return translatedPlannedFrequencyOptions[plannedFreqIndex];
    }
    
    // For age ranges
    const ageRangeIndex = AGE_RANGES.findIndex(range => range === answer);
    if (ageRangeIndex >= 0) {
      return translatedAgeRanges[ageRangeIndex];
    }
    
    // For workout durations
    const durationIndex = WORKOUT_DURATIONS.findIndex(duration => duration === answer);
    if (durationIndex >= 0) {
      return translatedWorkoutDurations[durationIndex];
    }
    
    // For cardio types and environments included in the display string
    const parts = answer.split(' - ');
    if (parts.length === 2) {
      const typeIndex = CARDIO_TYPES.findIndex(type => type === parts[0]);
      const envIndex = CARDIO_ENVIRONMENTS.findIndex(env => env === parts[1]);
      
      const translatedType = typeIndex >= 0 ? translatedCardioTypes[typeIndex] : parts[0];
      let translatedEnv = parts[1];
      
      if (parts[1] === 'Both') {
        translatedEnv = t('program.cardioEnvironment.both');
      } else if (envIndex >= 0) {
        translatedEnv = translatedCardioEnvironments[envIndex];
      } else if (parts[1] === 'Inside and Outside') {
        translatedEnv = t('program.cardioEnvironment.both');
      }
      
      return `${translatedType} - ${translatedEnv}`;
    }
    
    // Return the original if no translation found
    return answer;
  };

  // Create a custom renderSelectedAnswers function to use the translateAnswer
  const renderSelectedAnswers = (
    answers: string | string[],
    onEdit: () => void,
    options?: { variant?: 'default' | 'pain' }
  ) => {
    if (!answers || (Array.isArray(answers) && answers.length === 0)) return null;

    const answerArray = Array.isArray(answers)
      ? answers
      : answers === 'Both'
      ? ['Cardio', 'Strength']
      : [answers];

    return (
      <div onClick={onEdit} className="group cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-2">
            {answerArray.map((answer) => {
              const chipClass =
                options?.variant === 'pain'
                  ? 'px-3 py-1.5 rounded-lg bg-red-500/10 ring-1 ring-red-500 text-white text-sm'
                  : 'px-3 py-1.5 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500 text-white text-sm';
              return (
                <div key={answer} className={chipClass}>
                  {translateAnswer(answer)}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Update renderCardioSummary to use our new translateAnswer function
  const renderCardioSummary = () => {
    if (!answers.cardioType || !answers.cardioEnvironment) return null;
    
    // Get translated values
    const cardioTypeValue = answers.cardioType;
    const environmentValue = answers.cardioEnvironment === 'Both' 
      ? 'Inside and Outside'
      : answers.cardioEnvironment;
    
    return renderSelectedAnswers(
      [`${cardioTypeValue} - ${environmentValue}`], 
      () => {
        setCardioSection('type');
        handleEdit('cardioType');
      }
    );
  };

  // Add a custom renderer for modality split that shows day counts
  const renderModalitySplit = () => {
    if (!answers.modalitySplit) return null;
    
    let splitText = '';
    
    // For custom direct selection, show the breakdown
    if (answers.cardioDays !== undefined && answers.strengthDays !== undefined) {
      splitText = `${answers.cardioDays} ${t('questionnaire.cardio')}, ${answers.strengthDays} ${t('questionnaire.strength')}`;
    }
    
    return renderSelectedAnswers([splitText], () => handleEdit('modalitySplit'));
  };

  // Check if we're in development mode
  const [isDevMode, setIsDevMode] = useState(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  
  // Check if we're in development mode on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsDevMode(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);
  
  // Debug function to log exercises by category using the API
  const handleDebugExercises = async () => {
    console.log('Running exercise debug...');
    // loop object and print all keys and values
    for (const key in answers) {
      console.log(`${key}: ${answers[key]}`);
    }
    setIsLoadingExercises(true);
    
    try {
      // Call our API endpoint instead of directly using the server function
      const response = await fetch('/api/debug/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Total exercises loaded: ${data.exerciseCount}`);
        console.log('Exercise prompt generated:');
        console.log(data.exercisesPrompt);
        alert(`Loaded ${data.exerciseCount} exercises. Check console for details.`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error in exercise debug:', error);
      alert('Error loading exercises. Check console for details.');
    } finally {
      setIsLoadingExercises(false);
    }
  };

  return (
    <div className="min-h-screen from-gray-900 to-gray-800 h-[calc(100dvh)]">
      <TopBar onBack={onClose} className="fixed top-0 left-0 right-0 z-50" />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="h-screen overflow-y-auto pt-8 pb-32 sm:pb-8"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {(selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery)
                  ? t('questionnaire.exerciseTitle')
                  : t('questionnaire.recoveryTitle')}
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                {(selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery)
                  ? t('questionnaire.exerciseDescription')
                  : t('questionnaire.recoveryDescription')}
              </p>
              
              {/* Display diagnosis from chat assessment - hide placeholder texts */}
              {diagnosisText && 
               !diagnosisText.toLowerCase().includes('no diagnosis') && (
                <div className="mt-6 mx-auto max-w-2xl p-4 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30 text-left">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-indigo-300 mb-1">{t('questionnaire.assessmentSummary')}</p>
                      <p className="text-sm text-gray-300">{diagnosisText.charAt(0).toUpperCase() + diagnosisText.slice(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* Program Type Selection */}
          <RevealOnScroll>
            {/* Loading state while fetching limits */}
            {isLoadingLimits ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            ) : /* All types locked - show unavailable card */
            lockedProgramTypes.length === 3 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-amber-500/30">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('questionnaire.weeklyLimit.allTypesLocked')}
                  </h3>
                  
                  {/* Message */}
                  <p className="text-gray-300 mb-2">
                    {t('questionnaire.weeklyLimit.allTypesMessage')}
                  </p>
                  
                  {/* Next allowed date */}
                  {nextAllowedDate && (
                    <p className="text-gray-400 text-sm mb-6">
                      {t('questionnaire.weeklyLimit.nextAllowed').replace(
                        '{{date}}',
                        nextAllowedDate.toLocaleDateString(
                          locale === 'nb' ? 'nb-NO' : 'en-US',
                          { weekday: 'long', month: 'long', day: 'numeric' }
                        )
                      )}
                    </p>
                  )}
                  
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
                  >
                    {t('questionnaire.goBack')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50 ${
                  programTypeCollapsed ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (programTypeCollapsed) setProgramTypeCollapsed(false);
                }}
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t('questionnaire.programType.select')}
                </h3>
                {!programTypeCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Exercise type */}
                  {(() => {
                    const isLocked = lockedProgramTypes.includes(ProgramType.Exercise);
                    return (
                      <label className={`relative flex items-center ${isLocked ? 'cursor-not-allowed' : ''}`}>
                        <input
                          type="radio"
                          name="programType"
                          value="exercise"
                          checked={selectedProgramType === ProgramType.Exercise}
                          onChange={() => !isLocked && handleProgramTypeChange(ProgramType.Exercise)}
                          disabled={isLocked}
                          className="peer sr-only"
                        />
                        <div className={`w-full p-4 rounded-xl transition-all duration-200 ${
                          isLocked
                            ? 'bg-gray-900/30 ring-1 ring-gray-700/20 opacity-50'
                            : 'bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-300 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className={`font-medium ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                              {t('questionnaire.programType.exercise')}
                            </div>
                            {isLocked && (
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
                          <div className={`text-xs mt-1 leading-snug ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isLocked 
                              ? t('questionnaire.programType.generatedThisWeek')
                              : t('questionnaire.programType.info.exercise')}
                          </div>
                        </div>
                      </label>
                    );
                  })()}
                  
                  {/* Exercise and Recovery type */}
                  {(() => {
                    const isLocked = lockedProgramTypes.includes(ProgramType.ExerciseAndRecovery);
                    return (
                      <label className={`relative flex items-center ${isLocked ? 'cursor-not-allowed' : ''}`}>
                        <input
                          type="radio"
                          name="programType"
                          value="exercise_and_recovery"
                          checked={selectedProgramType === ProgramType.ExerciseAndRecovery}
                          onChange={() => !isLocked && handleProgramTypeChange(ProgramType.ExerciseAndRecovery)}
                          disabled={isLocked}
                          className="peer sr-only"
                        />
                        <div className={`w-full p-4 rounded-xl transition-all duration-200 ${
                          isLocked
                            ? 'bg-gray-900/30 ring-1 ring-gray-700/20 opacity-50'
                            : 'bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-300 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className={`font-medium ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                              {t('questionnaire.programType.exerciseAndRecovery')}
                            </div>
                            {isLocked && (
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
                          <div className={`text-xs mt-1 leading-snug ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isLocked 
                              ? t('questionnaire.programType.generatedThisWeek')
                              : t('questionnaire.programType.info.exerciseAndRecovery')}
                          </div>
                        </div>
                      </label>
                    );
                  })()}
                  
                  {/* Recovery type */}
                  {(() => {
                    const isLocked = lockedProgramTypes.includes(ProgramType.Recovery);
                    return (
                      <label className={`relative flex items-center ${isLocked ? 'cursor-not-allowed' : ''}`}>
                        <input
                          type="radio"
                          name="programType"
                          value="recovery"
                          checked={selectedProgramType === ProgramType.Recovery}
                          onChange={() => !isLocked && handleProgramTypeChange(ProgramType.Recovery)}
                          disabled={isLocked}
                          className="peer sr-only"
                        />
                        <div className={`w-full p-4 rounded-xl transition-all duration-200 ${
                          isLocked
                            ? 'bg-gray-900/30 ring-1 ring-gray-700/20 opacity-50'
                            : 'bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-300 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className={`font-medium ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                              {t('questionnaire.programType.recovery')}
                            </div>
                            {isLocked && (
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
                          <div className={`text-xs mt-1 leading-snug ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isLocked 
                              ? t('questionnaire.programType.generatedThisWeek')
                              : t('questionnaire.programType.info.recovery')}
                          </div>
                        </div>
                      </label>
                    );
                  })()}
                </div>
                )}
                {programTypeCollapsed && (
                  (() => {
                    const label =
                      selectedProgramType === ProgramType.Exercise
                        ? t('questionnaire.programType.exercise')
                        : selectedProgramType === ProgramType.ExerciseAndRecovery
                          ? t('questionnaire.programType.exerciseAndRecovery')
                          : t('questionnaire.programType.recovery');
                    return renderSelectedAnswers(label, () => setProgramTypeCollapsed(false));
                  })()
                )}
              </div>
            )}
          </RevealOnScroll>

          {/* Age */}
          <RevealOnScroll>
            <div
              ref={ageRef}
              onClick={() => handleEdit('age')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
            >
              <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                <svg
                  className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t('questionnaire.age')}
              </h3>
              {answers.age &&
              editingField !== 'age' &&
              shouldCollapseField('age') ? (
                renderSelectedAnswers(answers.age, () => handleEdit('age'))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {translatedAgeRanges.map((range, index) => (
                    <label
                      key={range}
                      className="relative flex items-center"
                    >
                      <input
                        type="radio"
                        name="age"
                        value={AGE_RANGES[index]}
                        checked={answers.age === AGE_RANGES[index]}
                        onChange={(e) =>
                          handleInputChange('age', e.target.value, ageRef)
                        }
                        className="peer sr-only"
                        required
                      />
                      <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                        {range}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* Past Exercise Frequency */}
          {shouldShowQuestion('lastYearsExerciseFrequency') && (
            <RevealOnScroll>
              <div
                ref={lastYearRef}
                onClick={() => handleEdit('lastYearsExerciseFrequency')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('questionnaire.pastExercise')}
                </h3>
                {answers.lastYearsExerciseFrequency &&
                editingField !== 'lastYearsExerciseFrequency' &&
                shouldCollapseField('lastYearsExerciseFrequency') ? (
                  renderSelectedAnswers(
                    answers.lastYearsExerciseFrequency,
                    () => handleEdit('lastYearsExerciseFrequency')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedExerciseFrequencyOptions.map((option, index) => (
                      <label
                        key={option}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="lastYearsExerciseFrequency"
                          value={EXERCISE_FREQUENCY_OPTIONS[index]}
                          checked={
                            answers.lastYearsExerciseFrequency === EXERCISE_FREQUENCY_OPTIONS[index]
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'lastYearsExerciseFrequency',
                              e.target.value,
                              lastYearRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          {option}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Planned Exercise Frequency */}
          {shouldShowQuestion('numberOfActivityDays') && (
            <RevealOnScroll>
              <div
                ref={plannedRef}
                onClick={() => handleEdit('numberOfActivityDays')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  {(selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery)
                    ? t('questionnaire.exerciseDays')
                    : t('questionnaire.recoveryDays')}
                </h3>
                
                {/* Include Weekends Checkbox */}
                <div className="mb-6">
                  <label 
                    className={`flex items-center group ${
                      getWeeklyActivityDays(answers.numberOfActivityDays) > 5 
                        ? 'cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={answers.includeWeekends ?? true}
                        disabled={getWeeklyActivityDays(answers.numberOfActivityDays) > 5}
                        onChange={(e) => {
                          e.stopPropagation();
                          setAnswers(prev => ({ ...prev, includeWeekends: e.target.checked }));
                        }}
                        className="sr-only peer"
                      />
                      <div className={`w-5 h-5 rounded ring-1 transition-all duration-200 flex items-center justify-center ${
                        getWeeklyActivityDays(answers.numberOfActivityDays) > 5
                          ? 'bg-indigo-500/30 ring-indigo-500/50'
                          : (answers.includeWeekends ?? true)
                            ? 'bg-indigo-500/20 ring-indigo-500'
                            : 'bg-gray-900/50 ring-gray-700/30 group-hover:ring-gray-600'
                      }`}>
                        {(answers.includeWeekends ?? true) && (
                          <svg className={`w-3 h-3 ${getWeeklyActivityDays(answers.numberOfActivityDays) > 5 ? 'text-indigo-400/70' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`ml-2 text-sm ${
                      getWeeklyActivityDays(answers.numberOfActivityDays) > 5
                        ? 'text-gray-500'
                        : 'text-gray-300'
                    }`}>
                      {t('questionnaire.includeWeekends')}
                    </span>
                    {getWeeklyActivityDays(answers.numberOfActivityDays) > 5 && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({t('questionnaire.weekendsRequired')})
                      </span>
                    )}
                  </label>
                </div>
                
                {answers.numberOfActivityDays &&
                editingField !== 'numberOfActivityDays' &&
                shouldCollapseField('numberOfActivityDays') ? (
                  renderSelectedAnswers(
                    answers.numberOfActivityDays,
                    () => handleEdit('numberOfActivityDays')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedPlannedFrequencyOptions.map((option, index) => (
                      <label
                        key={option}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="numberOfActivityDays"
                          value={PLANNED_EXERCISE_FREQUENCY_OPTIONS[index]}
                          checked={
                            answers.numberOfActivityDays === PLANNED_EXERCISE_FREQUENCY_OPTIONS[index]
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'numberOfActivityDays',
                              e.target.value,
                              plannedRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          {option}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Pain Areas */}
          {shouldShowQuestion('generallyPainfulAreas') && (
            <RevealOnScroll>
              <div
                ref={painAreasRef}
                onClick={() => handleEdit('generallyPainfulAreas')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {t('questionnaire.painAreas')}
                </h3>

                {editingField !== 'generallyPainfulAreas' ? (
                  renderSelectedAnswers(
                    answers.generallyPainfulAreas.length === 0
                      ? [t('questionnaire.noPain')]
                      : answers.generallyPainfulAreas.filter(area => area && area.trim() !== ''),
                    () => handleEdit('generallyPainfulAreas'),
                    { variant: answers.generallyPainfulAreas.length === 0 ? 'default' : 'pain' }
                  )
                ) : (
                  <>
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNoPainAreas();
                        }}
                        className={`w-full p-4 rounded-xl ${
                          answers.generallyPainfulAreas.length === 0
                            ? 'bg-red-500/10 ring-red-500 text-white'
                            : 'bg-gray-900/50 ring-gray-700/30 text-gray-400 hover:bg-gray-900/70'
                        } ring-1 transition-all duration-200 text-left`}
                      >
                        {t('questionnaire.noPain')}
                      </button>
                    </div>
                    <p className="text-gray-400 font-medium text-base mb-4">
                      {t('questionnaire.selectAll')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {translatedPainBodyParts.map((part) => (
                        <label
                          key={part}
                          className="relative flex items-center"
                        >
                          <input
                            type="checkbox"
                            value={part}
                            checked={answers.generallyPainfulAreas.includes(
                              part
                            )}
                            onChange={(e) => {
                              const newPainAreas = e.target.checked
                                ? [...answers.generallyPainfulAreas, part]
                                : answers.generallyPainfulAreas.filter(
                                    (p) => p !== part
                                  );
                              handleInputChange(
                                'generallyPainfulAreas',
                                newPainAreas,
                                painAreasRef
                              );
                            }}
                            className="peer sr-only"
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-red-500/10 peer-checked:ring-red-500 cursor-pointer transition-all duration-200">
                            {part}
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Continue button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField(null);
                          if (painAreasRef.current) {
                            scrollToNextUnansweredQuestion(painAreasRef, true);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                      >
                        {t('questionnaire.continue')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Training Type */}
          {shouldShowQuestion('exerciseModalities') && (
            <RevealOnScroll>
              <div
                ref={exerciseModalitiesRef}
                onClick={() => handleEdit('exerciseModalities')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                  {t('questionnaire.exerciseModalities')}
                </h3>
                {answers.exerciseModalities &&
                editingField !== 'exerciseModalities' &&
                shouldCollapseField('exerciseModalities') ? (
                  renderSelectedAnswers(answers.exerciseModalities, () =>
                    handleEdit('exerciseModalities')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {translatedExerciseModalities.map((option, index) => {
                      // Use the actual value from EXERCISE_MODALITIES array based on index to maintain order
                      const modalityValue = EXERCISE_MODALITIES[index];
                        
                      return (
                        <label
                          key={option}
                          className="relative flex items-center"
                        >
                          <input
                            type="radio"
                            name="exerciseModalities"
                            value={modalityValue}
                            checked={answers.exerciseModalities === modalityValue}
                            onChange={(e) =>
                              handleInputChange(
                                'exerciseModalities',
                                e.target.value,
                                exerciseModalitiesRef
                              )
                            }
                            className="peer sr-only"
                            required
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                            {option}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Modality Split - Only show when Both is selected */}
          {shouldShowQuestion('modalitySplit') && (
            <RevealOnScroll>
              <div
                ref={modalitySplitRef}
                onClick={() => handleEdit('modalitySplit')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t('questionnaire.modalitySplit')}
                </h3>
                {answers.modalitySplit &&
                answers.cardioDays !== undefined &&
                answers.strengthDays !== undefined &&
                editingField !== 'modalitySplit' &&
                shouldCollapseField('modalitySplit') ? (
                  renderModalitySplit()
                ) : (
                  <div className="space-y-6">
                    <p className="text-gray-400">
                      {t('questionnaire.modalitySplit.description', { 
                        total: String(getWeeklyActivityDays(answers.numberOfActivityDays))
                      })}
                    </p>
                    
                    {/* Day selection controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Cardio days */}
                      <div>
                        <label className="block text-white font-medium mb-2">
                          {t('questionnaire.modalitySplit.cardioDays')}
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleDayChange('cardioDays', Math.max(0, (answers.cardioDays || 0) - 1))}
                            className="p-2 rounded-l-lg bg-gray-900/70 text-white hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <div className="w-12 py-2 bg-gray-900/50 text-white text-center">
                            {answers.cardioDays || 0}
                          </div>
                          <button
                            type="button"
                            disabled={(answers.cardioDays || 0) + (answers.strengthDays || 0) >= 7}
                            onClick={() => handleDayChange('cardioDays', (answers.cardioDays || 0) + 1)}
                            className="p-2 rounded-r-lg bg-gray-900/70 text-white hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Strength days */}
                      <div>
                        <label className="block text-white font-medium mb-2">
                          {t('questionnaire.modalitySplit.strengthDays')}
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleDayChange('strengthDays', Math.max(0, (answers.strengthDays || 0) - 1))}
                            className="p-2 rounded-l-lg bg-gray-900/70 text-white hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <div className="w-12 py-2 bg-gray-900/50 text-white text-center">
                            {answers.strengthDays || 0}
                          </div>
                          <button
                            type="button"
                            disabled={(answers.cardioDays || 0) + (answers.strengthDays || 0) >= 7}
                            onClick={() => handleDayChange('strengthDays', (answers.strengthDays || 0) + 1)}
                            className="p-2 rounded-r-lg bg-gray-900/70 text-white hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total days error message */}
                    {((answers.cardioDays || 0) + (answers.strengthDays || 0)) > 
                      getWeeklyActivityDays(answers.numberOfActivityDays) && (
                      <div className="text-red-400 mt-2">
                        {t('questionnaire.modalitySplit.totalDaysError', { 
                          total: String(getWeeklyActivityDays(answers.numberOfActivityDays))
                        })}
                      </div>
                    )}
                    
                    {/* Continue button */}
                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          ((answers.cardioDays || 0) + (answers.strengthDays || 0)) === 0 ||
                          ((answers.cardioDays || 0) + (answers.strengthDays || 0)) > 
                            getWeeklyActivityDays(answers.numberOfActivityDays)
                        }
                        onClick={(e) => { e.stopPropagation(); handleSaveModalitySplit(); }}
                      >
                        {t('questionnaire.continue')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Combined Cardio Questions */}
          {shouldShowQuestion('cardioType') && (
            <RevealOnScroll>
              <div
                ref={cardioTypeRef}
                onClick={() => handleEdit('cardioType')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {cardioSection === 'type' 
                    ? t('questionnaire.cardioType') 
                    : t('questionnaire.cardioEnvironment')}
                </h3>
                
                {answers.cardioType && answers.cardioEnvironment &&
                 editingField !== 'cardioType' ? (
                  // Render selected answers summary when both are selected and not editing
                  renderCardioSummary()
                ) : (
                  <div className="space-y-4">
                    {cardioSection === 'type' ? (
                      /* Cardio Type Selection */
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {translatedCardioTypes.map((type, index) => (
                          <label
                            key={type}
                            className="relative flex items-center"
                          >
                            <input
                              type="radio"
                              name="cardioType"
                              value={CARDIO_TYPES[index]}
                              checked={answers.cardioType === CARDIO_TYPES[index]}
                              onChange={(e) => {
                                handleCardioTypeSelect(e.target.value);
                                // Don't auto-scroll here
                              }}
                              className="peer sr-only"
                              required
                            />
                            <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                              {type}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      /* Cardio Environment Selection */
                      <>
                        <div className="text-sm text-gray-400 mb-4">
                          {t('questionnaire.selectedCardioType')}: <span className="text-white">
                            {(() => {
                              const index = CARDIO_TYPES.findIndex(type => type === answers.cardioType);
                              return index >= 0 ? translatedCardioTypes[index] : answers.cardioType;
                            })()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {translatedCardioEnvironments.map((env, index) => (
                            <label
                              key={env}
                              className="relative flex items-center"
                            >
                              <input
                                type="radio"
                                name="cardioEnvironment"
                                value={CARDIO_ENVIRONMENTS[index]}
                                checked={answers.cardioEnvironment === CARDIO_ENVIRONMENTS[index]}
                                onChange={(e) => {
                                  handleInputChange(
                                    'cardioEnvironment',
                                    e.target.value
                                  );
                                  setEditingField(null);
                                  
                                  // Only auto-scroll AFTER selecting the cardio environment
                                  setTimeout(() => {
                                    if (answers.exerciseModalities === 'Both' || 
                                        answers.exerciseModalities === t('program.modality.both')) {
                                      if (targetAreasRef.current) {
                                        const formElement = formRef.current;
                                        if (formElement) {
                                          const formRect = formElement.getBoundingClientRect();
                                          const elementRect = targetAreasRef.current.getBoundingClientRect();
                                          const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;
                                          
                                          formElement.scrollTo({
                                            top: relativeTop - 60,
                                            behavior: 'smooth',
                                          });
                                        }
                                      }
                                    } else {
                                      if (workoutDurationRef.current) {
                                        const formElement = formRef.current;
                                        if (formElement) {
                                          const formRect = formElement.getBoundingClientRect();
                                          const elementRect = workoutDurationRef.current.getBoundingClientRect();
                                          const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;
                                          
                                          formElement.scrollTo({
                                            top: relativeTop - 60,
                                            behavior: 'smooth',
                                          });
                                        }
                                      }
                                    }
                                  }, 150);
                                }}
                                className="peer sr-only"
                                required
                              />
                              <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                                {env}
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Target Areas */}
          {shouldShowQuestion('targetAreas') && (
            <RevealOnScroll>
              <div
                ref={targetAreasRef}
                onClick={() => handleEdit('targetAreas')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('questionnaire.strengthTargetAreas')}
                </h3>
                {answers.targetAreas.length > 0 &&
                editingField !== 'targetAreas' &&
                shouldCollapseField('targetAreas') ? (
                  renderSelectedAnswers(
                    (() => {
                      const region = detectBodyRegion(answers.targetAreas);
                      if (region === 'fullBody') return ['Full Body'];
                      if (region === 'upperBody') return ['Upper Body'];
                      if (region === 'lowerBody') return ['Lower Body'];
                      return answers.targetAreas;
                    })(),
                    () => handleEdit('targetAreas')
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Body Regions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {translatedBodyRegions.map((region, index) => {
                        // Map to BodyRegionType for comparison
                        const regionType: BodyRegionType = index === 0 
                          ? 'fullBody' 
                          : index === 1 
                            ? 'upperBody' 
                            : 'lowerBody';
                        // Display value for the radio
                        const regionValue = index === 0 
                          ? 'Full Body' 
                          : index === 1 
                            ? 'Upper Body' 
                            : 'Lower Body';
                        
                        // Use centralized detection for checked state
                        const currentRegion = detectBodyRegion(answers.targetAreas);
                        
                        return (
                          <label
                            key={region}
                            className="relative flex items-center"
                          >
                            <input
                              type="radio"
                              name="bodyRegion"
                              value={regionValue}
                              checked={currentRegion === regionType}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Use centralized function to get body parts for region
                                  const newTargetAreas = [...getBodyPartsForRegion(regionType)];
                                  
                                  // Set the answers first
                                  setAnswers(prev => ({
                                    ...prev,
                                    targetAreas: newTargetAreas
                                  }));
                                  
                                  // Close the editing field
                                  setEditingField(null);
                                  
                                  // Scroll to the next question after selecting a region
                                  setTimeout(() => {
                                    if (exerciseEnvironmentRef.current) {
                                      const formElement = formRef.current;
                                      if (formElement) {
                                        const formRect = formElement.getBoundingClientRect();
                                        const elementRect = exerciseEnvironmentRef.current.getBoundingClientRect();
                                        const relativeTop = elementRect.top - formRect.top + formElement.scrollTop;
                                        
                                        formElement.scrollTo({
                                          top: relativeTop - 60,
                                          behavior: 'smooth',
                                        });
                                      }
                                    }
                                  }, 150);
                                }
                              }}
                              className="peer sr-only"
                            />
                            <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                              {region}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Individual Body Parts */}
                    <div>
                      <p className="text-gray-400 font-medium text-base mb-4">
                        {t('questionnaire.selectSpecific')}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {SELECTABLE_BODY_PARTS.map((part) => {
                          // Get translated body part name for display
                          const translatedPart = translateBodyPart(part, t);
                          
                          return (
                            <label
                              key={part}
                              className="relative flex items-center"
                            >
                              <input
                                type="checkbox"
                                value={part}
                                checked={answers.targetAreas.includes(part)}
                                onChange={(e) => {
                                  const newTargetAreas = e.target.checked
                                    ? [...answers.targetAreas, part]
                                    : answers.targetAreas.filter(
                                        (p) => p !== part
                                      );
                                  
                                  // For individual body parts, just update the state
                                  // without auto-collapsing or scrolling
                                  setAnswers(prev => ({
                                    ...prev,
                                    targetAreas: newTargetAreas
                                  }));
                                }}
                                className="peer sr-only"
                              />
                              <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                                {translatedPart}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Training Location */}
          {shouldShowQuestion('exerciseEnvironments') && (
            <RevealOnScroll>
              <div
                ref={exerciseEnvironmentRef}
                onClick={() => handleEdit('exerciseEnvironments')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {(selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery)
                    ? t('questionnaire.trainingType')
                    : t('questionnaire.recoveryLocation')}
                </h3>
                {answers.exerciseEnvironments &&
                editingField !== 'exerciseEnvironments' &&
                shouldCollapseField('exerciseEnvironments') ? (
                  renderSelectedAnswers(
                    answers.exerciseEnvironments === 'Custom' && selectedCustomEquipment.length > 0
                      ? `Custom (${selectedCustomEquipment.join(', ')})`
                      : answers.exerciseEnvironments,
                    () => handleEdit('exerciseEnvironments')
                  )
                ) : (
                  <div className="space-y-4">
                    {translatedExerciseEnvironments.map((environment, index) => (
                      <label
                        key={environment.name}
                        className="relative flex items-center"
                      >
                        <input
                          type="radio"
                          name="exerciseEnvironments"
                          value={EXERCISE_ENVIRONMENTS[index].name}
                          checked={
                            answers.exerciseEnvironments === EXERCISE_ENVIRONMENTS[index].name
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'exerciseEnvironments',
                              e.target.value,
                              exerciseEnvironmentRef
                            )
                          }
                          className="peer sr-only"
                          required
                        />
                        <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                          <div className="font-medium">{environment.name}</div>
                          <div className="text-sm mt-1 text-gray-500 peer-checked:text-gray-300">
                            {environment.description}
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    {/* Show custom equipment selection if Custom is selected */}
                    {answers.exerciseEnvironments === 'Custom' && editingField === 'exerciseEnvironments' && (
                      <div className="mt-6 pt-4 border-t border-gray-700/30">
                        {/* Show auto-selection message if cardio equipment was pre-selected */}
                        {answers.cardioType && (answers.cardioEnvironment === 'Inside' || answers.cardioEnvironment === 'Both') && selectedEquipmentCategory === 'Cardio' && (
                          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {(() => {
                                const equipMap: Record<string, string> = {
                                  Running: 'equipmentItem.treadmill',
                                  Cycling: 'equipmentItem.exercise_bike',
                                  Rowing: 'equipmentItem.rowing_machine',
                                };
                                const cardioTypeKey: Record<string, string> = {
                                  Running: 'program.cardioType.running',
                                  Cycling: 'program.cardioType.cycling',
                                  Rowing: 'program.cardioType.rowing',
                                };
                                const eqKey = equipMap[answers.cardioType as string] || '';
                                const typeKey = cardioTypeKey[answers.cardioType as string] || '';
                                const equipmentLabel = eqKey ? t(eqKey) : answers.cardioType;
                                const typeLabel = typeKey ? t(typeKey).toLowerCase() : answers.cardioType.toLowerCase();
                                return (
                                  <p className="text-blue-300 text-sm">
                                    {t('questionnaire.autoSelectedCardioEquipment', { equipment: equipmentLabel, type: typeLabel })}
                                  </p>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        
                        <CustomEquipmentSelection
                          selectedCategory={selectedEquipmentCategory}
                          selectedEquipment={selectedCustomEquipment}
                          onCategoryChange={handleEquipmentCategoryChange}
                          onEquipmentChange={handleCustomEquipmentChange}
                          onContinue={handleEquipmentContinue}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Workout Duration */}
          {shouldShowQuestion('workoutDuration') && (
            <RevealOnScroll>
              <div
                ref={workoutDurationRef}
                onClick={() => handleEdit('workoutDuration')}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-6">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {(selectedProgramType === ProgramType.Exercise || selectedProgramType === ProgramType.ExerciseAndRecovery)
                    ? t('questionnaire.workoutDuration')
                    : t('questionnaire.recoveryDuration')}
                </h3>
                {answers.workoutDuration &&
                editingField !== 'workoutDuration' &&
                shouldCollapseField('workoutDuration') ? (
                  renderSelectedAnswers(answers.workoutDuration, () =>
                    handleEdit('workoutDuration')
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {translatedWorkoutDurations.map((durationText, index) => {
                      // Get the original English value based on program type
                      const originalDuration = programType === ProgramType.Recovery
                        ? RECOVERY_WORKOUT_DURATIONS[index]
                        : WORKOUT_DURATIONS[index];
                      
                      return (
                        <label
                          key={durationText}
                          className="relative flex items-center"
                        >
                          <input
                            type="radio"
                            name="workoutDuration"
                            value={originalDuration}
                            checked={answers.workoutDuration === originalDuration}
                            onChange={(e) =>
                              handleInputChange(
                                'workoutDuration',
                                e.target.value,
                                workoutDurationRef
                              )
                            }
                            className="peer sr-only"
                            required
                          />
                          <div className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-gray-400 peer-checked:text-white peer-checked:bg-indigo-500/10 peer-checked:ring-indigo-500 cursor-pointer transition-all duration-200">
                            {durationText}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}

          {/* Additional Information */}
          {answers.workoutDuration && (
            <RevealOnScroll>
              <div
                ref={additionalInfoRef}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50"
              >
                <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  {t('questionnaire.additionalInfo')}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {t('questionnaire.additionalInfoHint')}
                </p>
                <textarea
                  value={answers.additionalInfo || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      additionalInfo: e.target.value,
                    }))
                  }
                  placeholder={t('questionnaire.additionalInfoPlaceholder')}
                  className="w-full p-4 rounded-xl bg-gray-900/50 ring-1 ring-gray-700/30 text-white placeholder-gray-500 focus:ring-indigo-500 focus:outline-none transition-all duration-200 resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <div className="mt-2 text-right text-gray-500 text-xs">
                  {(answers.additionalInfo || '').length}/1000
                </div>
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-colors duration-200"
              >
                {t('questionnaire.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : t('questionnaire.createProgram')}
              </button>
            </div>
          </RevealOnScroll>
          
          {/* Debug button - only visible in dev mode */}
          {isDevMode && (
            <RevealOnScroll>
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-amber-400 text-sm font-semibold">DEVELOPMENT MODE TOOLS</div>
                  <button
                    type="button"
                    onClick={handleDebugExercises}
                    disabled={isLoadingExercises}
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors duration-200 disabled:opacity-50 flex items-center"
                  >
                    {isLoadingExercises ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Exercises...
                      </>
                    ) : (
                      'Debug Exercise Prompt'
                    )}
                  </button>
                </div>
                <div className="mt-2 text-gray-400 text-xs">
                  (Logs all available exercises to the browser console based on current form data)
                </div>
              </div>
            </RevealOnScroll>
          )}
        </div>
      </form>
    </div>
  );
}
