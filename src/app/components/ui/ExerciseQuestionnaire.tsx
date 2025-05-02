'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { TopBar } from './TopBar';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { 
  TARGET_BODY_PARTS, 
  UPPER_BODY_PARTS, 
  LOWER_BODY_PARTS, 
  ExerciseEnvironment,
  EXERCISE_ENVIRONMENTS,
  WORKOUT_DURATIONS,
  AGE_RANGES,
  EXERCISE_FREQUENCY_OPTIONS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
  EXERCISE_MODALITIES,
  PAIN_BODY_PARTS,
  CARDIO_TYPES,
  CARDIO_ENVIRONMENTS
} from '@/app/types/program';

import { useTranslation } from '@/app/i18n';
import {
  getTranslatedTargetBodyParts,
  getTranslatedExerciseEnvironments,
  getTranslatedWorkoutDurations,
  getTranslatedAgeRanges,
  getTranslatedExerciseFrequencyOptions,
  getTranslatedPlannedExerciseFrequencyOptions,
  getTranslatedExerciseModalities,
  getTranslatedPainBodyParts,
  translatePainBodyPart,
  getTranslatedBodyRegions,
  translateBodyPart,
  getTranslatedCardioTypes,
  getTranslatedCardioEnvironments
} from '@/app/utils/programTranslation';

import { CustomEquipmentSelection } from './CustomEquipmentSelection';

interface ExerciseQuestionnaireProps {
  onClose: () => void;
  onSubmit: (answers: ExerciseQuestionnaireAnswers) => void;
  generallyPainfulAreas: string[];
  programType: ProgramType;
  targetAreas: BodyPartGroup[];
  fullBody: boolean;
}

// Map composite pain areas to their individual parts
const compositeAreaMapping: { [key: string]: string[] } = {
  'Upper & Middle Back': ['Upper Back', 'Middle Back'],
  'Lower Back, Pelvis & Hip Region': ['Lower Back', 'Pelvis & Hip Region'],
};

// Function to expand composite areas into individual parts
const expandPainAreas = (areas: string[], t: (key: string, options?: any) => string, translatedPainBodyParts: string[]): string[] => {
  const expandedAreas = new Set<string>();

  areas.forEach((area) => {
    if (!area) return;
    // Convert to lowercase for comparison
    const lowerArea = area.toLowerCase();
    const lowerCompositeMapping: { [key: string]: string[] } = {};

    // Create lowercase mapping for comparison
    Object.entries(compositeAreaMapping).forEach(([key, value]) => {
      lowerCompositeMapping[key.toLowerCase()] = value;
    });

    if (lowerArea in lowerCompositeMapping) {
      lowerCompositeMapping[lowerArea].forEach((part) =>
        expandedAreas.add(part)
      );
    } else {
      // Find the matching pain body part with correct capitalization
      const matchingPart = translatedPainBodyParts.find(
        (part) => part.toLowerCase() === lowerArea
      ) || PAIN_BODY_PARTS.find(
        (part) => part.toLowerCase() === lowerArea
      );
      expandedAreas.add(matchingPart || area);
    }
  });

  return Array.from(expandedAreas);
};

// Define recovery program duration options
const RECOVERY_WORKOUT_DURATIONS = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
] as const;

// Function to get the appropriate workout durations based on program type
const getWorkoutDurations = (programType: ProgramType) => {
  return programType === ProgramType.Recovery
    ? RECOVERY_WORKOUT_DURATIONS
    : WORKOUT_DURATIONS;
};

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
  }, []);

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
  targetAreas,
  fullBody,
}: ExerciseQuestionnaireProps) {
  const { t } = useTranslation();
  
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
  
  const translatedWorkoutDurations = programType === ProgramType.Recovery
    ? TRANSLATED_RECOVERY_WORKOUT_DURATIONS
    : getTranslatedWorkoutDurations(t);
  
  // Normalize and expand the incoming pain areas while preserving proper capitalization
  const normalizedPainAreas = expandPainAreas(generallyPainfulAreas || [], t, translatedPainBodyParts);

  const [targetAreasReopened, setTargetAreasReopened] = useState(false);
  const [cardioTypeReopened, setCardioTypeReopened] = useState(false);
  const [cardioEnvironmentReopened, setCardioEnvironmentReopened] = useState(false);
  const [editingField, setEditingField] = useState<
    keyof ExerciseQuestionnaireAnswers | null
  >(null);

  const [selectedTargetAreas, setSelectedTargetAreas] = useState<
    (typeof TARGET_BODY_PARTS)[number][]
  >(() => {
    // If fullBody is true, return all target areas
    if (fullBody) {
      return [...TARGET_BODY_PARTS];
    }

    // Otherwise initialize with preselected areas from targetAreas prop
    const preselectedAreas = targetAreas
      .map((group) => {
        const groupId = group.id.toLowerCase();
        // Map to exact string literals from TARGET_BODY_PARTS
        if (groupId.includes('shoulder')) return 'Shoulders' as const;
        if (groupId.includes('upper_arm')) return 'Upper Arms' as const;
        if (groupId.includes('forearm')) return 'Forearms' as const;
        if (groupId.includes('chest')) return 'Chest' as const;
        if (groupId.includes('torso')) return 'Abdomen' as const;
        if (groupId.includes('back')) return 'Upper Back' as const;
        if (groupId.includes('pelvis')) return 'Lower Back' as const;
        if (groupId.includes('glutes')) return 'Glutes' as const;
        if (groupId.includes('thigh')) return 'Upper Legs' as const;
        if (groupId.includes('lower_leg')) return 'Lower Legs' as const;
        if (groupId.includes('neck')) return 'Neck' as const;
        return null;
      })
      .filter(
        (area): area is (typeof TARGET_BODY_PARTS)[number] => area !== null
      );
    return [...new Set(preselectedAreas)]; // Remove duplicates
  });

  const [answers, setAnswers] = useState<ExerciseQuestionnaireAnswers>(() => ({
    age: '',
    lastYearsExerciseFrequency: '',
    numberOfActivityDays: '',
    generallyPainfulAreas: normalizedPainAreas.filter(area => area && area.trim() !== ''),
    exerciseModalities: '',
    exerciseEnvironments: '',
    workoutDuration: '',
    targetAreas: selectedTargetAreas,
    cardioType: '',
    cardioEnvironment: '',
  }));

  // Update answers when selectedTargetAreas changes
  useEffect(() => {
    setAnswers((prev) => ({
      ...prev,
      targetAreas: selectedTargetAreas,
    }));
  }, [selectedTargetAreas]);

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
  const targetAreasRef = useRef<HTMLDivElement>(null);
  const cardioTypeRef = useRef<HTMLDivElement>(null);
  const cardioEnvironmentRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

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
        const isFullBody = normalizedValue.length === TARGET_BODY_PARTS.length;
        const isUpperBody =
          UPPER_BODY_PARTS.every((part) => normalizedValue.includes(part)) &&
          normalizedValue.length === UPPER_BODY_PARTS.length;
        const isLowerBody =
          LOWER_BODY_PARTS.every((part) => normalizedValue.includes(part)) &&
          normalizedValue.length === LOWER_BODY_PARTS.length;

        if (isFullBody || isUpperBody || isLowerBody) {
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
    // Only continue if equipment is selected
    if (selectedCustomEquipment.length > 0) {
      // Close the editing field
      setEditingField(null);
      
      // Scroll to next question
      if (exerciseEnvironmentRef.current) {
        scrollToNextUnansweredQuestion(exerciseEnvironmentRef, true);
      }
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
    // Ensure value is non-negative
    const newValue = Math.max(0, value);
    
    // Update the specific field
    setAnswers(prev => ({
      ...prev,
      [field]: newValue as any, // Use type assertion to work around the string vs number issue
      // Set modalitySplit to 'custom' to indicate user has directly chosen days
      modalitySplit: 'custom'
    }));
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
    if (programType === ProgramType.Recovery && field === 'exerciseModalities') {
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
          programType === ProgramType.Exercise &&
          !!answers.numberOfActivityDays &&
          (!!answers.generallyPainfulAreas ||
            answers.generallyPainfulAreas.length === 0)
        );
      case 'modalitySplit':
        return (
          programType === ProgramType.Exercise &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'cardioType':
        return (
          programType === ProgramType.Exercise &&
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
          programType === ProgramType.Exercise &&
          !!answers.exerciseModalities &&
          (answers.exerciseModalities === 'Strength' ||
           answers.exerciseModalities === t('program.modality.strength') ||
           answers.exerciseModalities === 'Both' ||
           answers.exerciseModalities === t('program.modality.both'))
        );
      case 'exerciseEnvironments':
        if (programType === ProgramType.Recovery) {
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
  const workoutDurations = getWorkoutDurations(programType);

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
  const renderSelectedAnswers = (answers: string | string[], onEdit: () => void) => {
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
            {answerArray.map((answer) => (
              <div
                key={answer}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500 text-white text-sm"
              >
                {translateAnswer(answer)}
              </div>
            ))}
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
                {programType === ProgramType.Exercise
                  ? t('questionnaire.exerciseTitle')
                  : t('questionnaire.recoveryTitle')}
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                {programType === ProgramType.Exercise
                  ? t('questionnaire.exerciseDescription')
                  : t('questionnaire.recoveryDescription')}
              </p>
            </div>
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  {programType === ProgramType.Exercise
                    ? t('questionnaire.exerciseDays')
                    : t('questionnaire.recoveryDays')}
                </h3>
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

                {editingField !== 'generallyPainfulAreas' ||
                answers.generallyPainfulAreas.length === 0 ? (
                  renderSelectedAnswers(
                    answers.generallyPainfulAreas.length === 0
                      ? [t('questionnaire.noPain')]
                      : answers.generallyPainfulAreas.filter(area => area && area.trim() !== ''),
                    () => handleEdit('generallyPainfulAreas')
                  )
                ) : (
                  <>
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleNoPainAreas}
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
                        onClick={() => handleSaveModalitySplit()}
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
                    answers.targetAreas.length === TARGET_BODY_PARTS.length
                      ? ['Full Body']
                      : UPPER_BODY_PARTS.every((part) =>
                          answers.targetAreas.includes(part)
                        ) &&
                        answers.targetAreas.length === UPPER_BODY_PARTS.length
                      ? ['Upper Body']
                      : LOWER_BODY_PARTS.every((part) =>
                          answers.targetAreas.includes(part)
                        ) &&
                        answers.targetAreas.length === LOWER_BODY_PARTS.length
                      ? ['Lower Body']
                      : answers.targetAreas,
                    () => handleEdit('targetAreas')
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Body Regions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {translatedBodyRegions.map((region, index) => {
                        // Map to consistent English values for comparison
                        const regionValue = index === 0 
                          ? 'Full Body' 
                          : index === 1 
                            ? 'Upper Body' 
                            : 'Lower Body';
                        
                        return (
                          <label
                            key={region}
                            className="relative flex items-center"
                          >
                            <input
                              type="radio"
                              name="bodyRegion"
                              value={regionValue}
                              checked={
                                regionValue === 'Full Body'
                                  ? answers.targetAreas.length ===
                                    TARGET_BODY_PARTS.length
                                  : regionValue === 'Upper Body'
                                  ? UPPER_BODY_PARTS.every((part) =>
                                      answers.targetAreas.includes(part)
                                    ) &&
                                    answers.targetAreas.length ===
                                      UPPER_BODY_PARTS.length
                                  : regionValue === 'Lower Body'
                                  ? LOWER_BODY_PARTS.every((part) =>
                                      answers.targetAreas.includes(part)
                                    ) &&
                                    answers.targetAreas.length ===
                                      LOWER_BODY_PARTS.length
                                  : false
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  let newTargetAreas: string[] = [];
                                  if (regionValue === 'Full Body') {
                                    newTargetAreas = [...TARGET_BODY_PARTS];
                                  } else if (regionValue === 'Upper Body') {
                                    newTargetAreas = [...UPPER_BODY_PARTS];
                                  } else if (regionValue === 'Lower Body') {
                                    newTargetAreas = [...LOWER_BODY_PARTS];
                                  }
                                  
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
                        {TARGET_BODY_PARTS.map((part) => {
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
                  {programType === ProgramType.Exercise
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
                  {programType === ProgramType.Exercise
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
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
              >
                {t('questionnaire.createProgram')}
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </form>
    </div>
  );
}
