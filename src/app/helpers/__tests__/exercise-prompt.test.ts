/**
 * Tests for exercise-prompt.ts
 * 
 * These tests verify:
 * 
 * 1. shouldIncludeIntervals function correctly determines if interval training should be included based on:
 *    - User's exercise experience level
 *    - User's age
 * 
 * 2. prepareExercisesPrompt function:
 *    - Correctly applies cardio filters based on user preferences
 *    - Combines cardio type and environment filtering appropriately
 *    - Properly filters exercises based on available equipment
 */
import { describe, expect, test } from '@jest/globals';
import { shouldIncludeIntervals, prepareExercisesPrompt } from '../exercise-prompt';
import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';

// Common user info to reuse in tests
const createUserInfo = (overrides: Partial<ExerciseQuestionnaireAnswers> = {}): ExerciseQuestionnaireAnswers => {
  return {
    age: '30-40',
    lastYearsExerciseFrequency: '2-3 times per week',
    numberOfActivityDays: '3 days per week',
    generallyPainfulAreas: [],
    exerciseModalities: 'Strength',
    exerciseEnvironments: 'Large Gym',
    workoutDuration: '30-45 minutes',
    targetAreas: ['Chest', 'Upper Back', 'Shoulders'],
    equipment: ['Dumbbell', 'Barbell', 'Bench'],
    ...overrides
  };
};

describe('shouldIncludeIntervals', () => {
  // Create test cases for different user profiles
  test('should return false for beginners with no exercise experience', () => {
    const userInfo = createUserInfo({
      age: '30-40',
      lastYearsExerciseFrequency: 'No exercise in the past year',
      exerciseModalities: 'Cardio',
      cardioType: 'Running',
      cardioEnvironment: 'Outside',
    });

    expect(shouldIncludeIntervals(userInfo)).toBe(false);
  });

  test('should return false for beginners with minimal exercise experience', () => {
    const userInfo = createUserInfo({
      age: '40-50',
      lastYearsExerciseFrequency: 'Less than once a month',
      exerciseModalities: 'Cardio',
      cardioType: 'Cycling',
      cardioEnvironment: 'Inside',
    });

    expect(shouldIncludeIntervals(userInfo)).toBe(false);
  });

  test('should return false for older adults with limited exercise experience', () => {
    const userInfo = createUserInfo({
      age: '60-70',
      lastYearsExerciseFrequency: '1-2 times per month',
      exerciseModalities: 'Cardio',
      cardioType: 'Rowing',
      cardioEnvironment: 'Inside',
    });

    expect(shouldIncludeIntervals(userInfo)).toBe(false);
  });

  test('should return true for experienced exercisers', () => {
    const userInfo = createUserInfo({
      age: '30-40',
      lastYearsExerciseFrequency: '3-4 times per week',
      exerciseModalities: 'Cardio',
      cardioType: 'Running',
      cardioEnvironment: 'Outside',
    });

    expect(shouldIncludeIntervals(userInfo)).toBe(true);
  });

  test('should return true for older adults with regular exercise experience', () => {
    const userInfo = createUserInfo({
      age: '60-70',
      lastYearsExerciseFrequency: '3-4 times per week',
      exerciseModalities: 'Both',
      cardioType: 'Running',
      cardioEnvironment: 'Both',
      modalitySplit: 'even',
      cardioDays: 2,
      strengthDays: 2,
    });

    expect(shouldIncludeIntervals(userInfo)).toBe(true);
  });
});

describe('prepareExercisesPrompt integration tests', () => {
  // Helper function to extract cardio section
  const extractCardioSection = (prompt: string) => {
    const cardioSectionMatch = prompt.match(/"bodyPart": "Cardio",\s*"exercises": \[([\s\S]*?)\]/);
    return cardioSectionMatch ? cardioSectionMatch[1] : '';
  };

  // Test running cardio type filter
  test('Running cardio type filter should only include running exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running',
      cardioEnvironment: 'Outside',
      equipment: ['treadmill'],
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify cardio section exists
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    
    // Check running specific exercises in cardio section
    expect(cardioSection).toMatch(/Running.*Outdoor/i);
    expect(cardioSection).not.toMatch(/Indoor|Treadmill/i);
    expect(cardioSection).not.toMatch(/Cycling|Bike/i);
    expect(cardioSection).not.toMatch(/Rowing/i);
  });
  
  // Test cycling cardio type filter
  test('Cycling cardio type filter should only include cycling exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Cycling',
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Large Gym',
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify cardio section exists with cycling content
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    expect(cardioSection).toMatch(/Cycling|Bike/i);
    expect(cardioSection).not.toMatch(/Running|Outdoor/i);
    expect(cardioSection).not.toMatch(/Rowing/i);
  });
  
  // Test rowing cardio type filter
  test('Rowing cardio type filter should only include rowing exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Rowing',
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Large Gym',
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify cardio section exists with rowing content
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    expect(cardioSection).toMatch(/Rowing/i);
    expect(cardioSection).not.toMatch(/Running|Outdoor/i);
    expect(cardioSection).not.toMatch(/Cycling|Bike/i);
  });
  
  // Test both environment
  test('Both environment should include both indoor and outdoor exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running',
      cardioEnvironment: 'Both',
      equipment: ['treadmill'],
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Check that both indoor and outdoor running are included
    expect(cardioSection).toMatch(/Indoor|Treadmill/i);
    expect(cardioSection).toMatch(/Outdoor|Outside/i);
  });
});

// Add new test group for equipment selection
describe('Equipment selection tests', () => {
  // Helper function to extract cardio section
  const extractCardioSection = (prompt: string) => {
    const cardioSectionMatch = prompt.match(/"bodyPart": "Cardio",\s*"exercises": \[([\s\S]*?)\]/);
    return cardioSectionMatch ? cardioSectionMatch[1] : '';
  };
  
  // Test custom equipment selection for strength training
  test('Custom strength equipment selection should only include exercises with available equipment', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Dumbbell', 'Bench'], // Only dumbbells and bench, no barbells
      targetAreas: ['Chest', 'Upper Back', 'Shoulders'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Check the equipment types mentioned in the output
    expect(result.exercisesPrompt).toMatch(/Dumbbell/i); // Should include dumbbell exercises
    expect(result.exercisesPrompt).toMatch(/Bench/i); // Should include bench exercises
    
    // Verify barbell is not included since we didn't select it
    const strengthSection = result.exercisesPrompt.match(/("bodyPart": "Chest"|"bodyPart": "Upper Back"|"bodyPart": "Shoulders")[\s\S]*?exercises": \[([\s\S]*?)\]/)?.[0] || '';
    
    // There shouldn't be any barbell-only exercises
    expect(strengthSection).not.toMatch(/"name": "[^"]*Barbell[^"]*"/i);
  });
  
  // Test custom cardio equipment selection for cardio
  test('Custom cardio equipment selection should include exercises for selected equipment', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running', // Must specify a cardio type
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      equipment: ['Treadmill', 'Exercise Bike'], // Only treadmill and bike
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Check the cardio section includes running/treadmill but not bike (since type is running)
    expect(cardioSection).toMatch(/Treadmill|Running/i); // Should include treadmill exercises
    expect(cardioSection).not.toMatch(/Bike|Cycling/i); // Should NOT include bike exercises
    
    // Check that our selected equipment is included in equipment list for in-depth validation
    const treadmillFound = cardioSection.match(/Treadmill|Running - Indoor/i);
    expect(treadmillFound).toBeTruthy();
  });
  
  // Test custom cardio equipment with specific type
  test('Custom cardio equipment with specific type should only include that type', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running', // Specify running
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      equipment: ['Treadmill', 'Exercise Bike', 'Rowing Machine'], // Multiple options but should only use treadmill
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Should ONLY include running exercises despite having bike and rowing equipment
    expect(cardioSection).toMatch(/Treadmill|Running/i); // Should include treadmill exercises
    expect(cardioSection).not.toMatch(/Bike|Cycling/i); // Should NOT include bike exercises
    expect(cardioSection).not.toMatch(/Rowing/i); // Should NOT include rowing exercises
    
    // Verify that outdoor running exercises are not included when indoor is specified
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
    expect(cardioSection).toMatch(/Indoor|Treadmill/i);
  });
  
  // Test that Large Gym includes all standard equipment but still respects cardio type
  test('Large Gym should include all standard equipment but respect cardio type', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Cycling', // Must specify a cardio type
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Large Gym',
      equipment: [], // No explicitly selected equipment
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Should include only cycling, despite having all equipment available
    expect(cardioSection).toMatch(/Bike|Cycling/i); // Should include bike exercises
    expect(cardioSection).not.toMatch(/Treadmill|Running/i); // Should NOT include treadmill exercises
    expect(cardioSection).not.toMatch(/Rowing/i); // Should NOT include rowing exercises
    
    // Verify that outdoor cycling exercises are not included when indoor is specified
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
  });
  
  // Test jump rope equipment
  test('Jump rope equipment selection should include jump rope exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running', // Must specify cardio type
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      equipment: ['Jump Rope'],
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Check for jump rope exercises in warmups
    expect(result.exercisesPrompt).toMatch(/Jump Rope/i);
  });
  
  // Test for combined modalities (Both)
  test('Combined modalities (Both) should include strength and specified cardio type', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Both',
      cardioType: 'Running', // Must specify cardio type when using Both
      cardioEnvironment: 'Inside',
      modalitySplit: 'more_cardio',
      cardioDays: 3,
      strengthDays: 2,
      exerciseEnvironments: 'Large Gym',
      equipment: ['Dumbbell', 'Bench', 'Treadmill'],
      targetAreas: ['Chest', 'Upper Back'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Check if cardio section exists first
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    
    // Should include running but not cycling or rowing
    expect(cardioSection).toMatch(/Running/i);
    expect(cardioSection).not.toMatch(/Cycling|Bike/i); // Should NOT include cycling
    expect(cardioSection).not.toMatch(/Rowing/i); // Should NOT include rowing
    
    // Verify that outdoor running exercises are not included when indoor is specified
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
    expect(cardioSection).toMatch(/Indoor|Treadmill/i);
    
    // Should also include strength exercises for selected target areas
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Chest"/i);
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Upper Back"/i);
  });
});

// Add comprehensive equipment coverage tests
describe('Equipment type coverage tests', () => {
  // Helper function to extract cardio section
  const extractCardioSection = (prompt: string) => {
    const cardioSectionMatch = prompt.match(/"bodyPart": "Cardio",\s*"exercises": \[([\s\S]*?)\]/);
    return cardioSectionMatch ? cardioSectionMatch[1] : '';
  };
  
  // Helper function to extract strength section for specific body part
  const extractStrengthSection = (prompt: string, bodyPart: string) => {
    const sectionRegex = new RegExp(`"bodyPart": "${bodyPart}"[\\s\\S]*?exercises": \\[([\\s\\S]*?)\\]`);
    const sectionMatch = prompt.match(sectionRegex);
    return sectionMatch ? sectionMatch[1] : '';
  };
  
  // Test elliptical equipment
  test('Elliptical equipment should include elliptical exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running', // Need to specify cardio type
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      equipment: ['Elliptical'],
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Should include elliptical in warmups
    expect(result.exercisesPrompt).toMatch(/Elliptical/i);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify that outdoor exercises are not included when indoor is specified
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
  });
  
  // Test outdoor running specific equipment
  test('Outdoor running should include outdoor specific exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Running',
      cardioEnvironment: 'Outside',
      exerciseEnvironments: 'Custom',
      equipment: [], // No specific equipment needed for outdoor running
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Should include outdoor running
    expect(cardioSection).toMatch(/Outdoor/i);
    
    // Should NOT include indoor running in the cardio section
    expect(cardioSection).not.toMatch(/Indoor|Treadmill/i);
  });
  
  // Test equipment combinations
  test('Multiple cardio equipment types should filter based on cardio type', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Cardio',
      cardioType: 'Cycling',
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      equipment: ['Treadmill', 'Exercise Bike', 'Rowing Machine', 'Elliptical'], // All cardio equipment
      targetAreas: [],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Should include cycling exercises
    expect(cardioSection).toMatch(/Cycling|Bike/i);
    
    // Should NOT include other cardio types despite having the equipment
    expect(cardioSection).not.toMatch(/Running|Treadmill/i);
    expect(cardioSection).not.toMatch(/Rowing/i);
    
    // Verify that outdoor exercises are not included when indoor is specified
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
  });
  
  // Test no equipment specified (bodyweight only)
  test('No equipment specified should fall back to bodyweight exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: [], // No equipment specified
      targetAreas: ['Chest', 'Upper Back'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Check that we get bodyweight exercises
    expect(result.exercisesPrompt).toMatch(/Push.?Up/i); // Common bodyweight chest exercise
  });
  
  // Test barbell-specific equipment
  test('Barbell equipment should include barbell exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Barbell'], // Only barbell
      targetAreas: ['Chest', 'Upper Back', 'Shoulders'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Should include barbell exercises
    expect(result.exercisesPrompt).toMatch(/Barbell/i);
    
    // Shouldn't include dumbbell exercises (unless they're compound with barbell)
    const strengthSection = result.exercisesPrompt.match(/("bodyPart": "Chest"|"bodyPart": "Upper Back"|"bodyPart": "Shoulders")[\s\S]*?exercises": \[([\s\S]*?)\]/)?.[0] || '';
    expect(strengthSection).not.toMatch(/"name": "Dumbbell[^"]*"/i);
  });
  
  // Test dumbbell and bands equipment combination without barbell
  test('Dumbbell and bands equipment should not include barbell exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Dumbbell', 'Bands'], // Only dumbbells and bands
      targetAreas: ['Chest', 'Upper Back', 'Shoulders', 'Upper Arms'],
    });
    
    // Use the new includeEquipment parameter to include equipment information
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Should include dumbbell exercises 
    expect(result.exercisesPrompt).toMatch(/"equipment": \[.*?"Dumbbell".*?\]/);
    
    // Should include band exercises
    expect(result.exercisesPrompt).toMatch(/"equipment": \[.*?"Bands".*?\]/);
    
    // Verify no barbell-only exercises are included
    // We need to check that there aren't exercises where Barbell is the only equipment
    const exercisePrompt = result.exercisesPrompt;
    
    // Check specific exercise names to make sure no barbell-specific exercises appear
    expect(exercisePrompt).not.toMatch(/"name": "Barbell Bench Press"/);
    expect(exercisePrompt).not.toMatch(/"name": "Barbell Row"/);
    expect(exercisePrompt).not.toMatch(/"name": "Barbell Curl"/);
    expect(exercisePrompt).not.toMatch(/"name": "Barbell Squat"/);
    
    // Verify barbell-only exercises don't appear
    expect(exercisePrompt).not.toMatch(/"equipment": \["Barbell"\]/);
    
    // It's OK if there are multi-equipment exercises that include barbell as an option
    // (like Inverted Row that can use Barbell, TRX, Rings, etc.)
    // We'll verify these are valid cases by checking for the expected string format
    const multiEquipmentMatches = exercisePrompt.match(/"equipment": \[.*?"Barbell".*?\]/g) || [];
    
    // For any matches that include Barbell, make sure they include multiple equipment options
    multiEquipmentMatches.forEach((match: string) => {
      // The equipment array should have multiple items (not just Barbell)
      const equipmentString = match.split(':')[1].trim();
      const parsedEquipment = JSON.parse(equipmentString);
      
      // If Barbell is included, there should be other equipment options too
      if (parsedEquipment.includes("Barbell")) {
        expect(parsedEquipment.length).toBeGreaterThan(1);
        
        // And at least one of our selected equipment types should be in the array
        // or bodyweight should be an option
        const hasValidEquipment = parsedEquipment.some(eq => 
          eq === "Dumbbell" || 
          eq === "Bands" || 
          eq === "Bodyweight" || 
          eq === "TRX" || 
          eq === "Rings"
        );
        expect(hasValidEquipment).toBe(true);
      }
    });
  });
  
  // Test combined strength equipment (barbell + dumbbell)
  test('Combined strength equipment should include exercises for both equipment types', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Barbell', 'Dumbbell'], // Both barbell and dumbbell
      targetAreas: ['Chest'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract chest section for specific checks
    const chestSection = result.exercisesPrompt.match(/"bodyPart": "Chest"[\s\S]*?exercises": \[([\s\S]*?)\]/)?.[1] || '';
    
    // Should include both barbell and dumbbell exercises
    expect(chestSection).toMatch(/Barbell/i); 
    expect(chestSection).toMatch(/Dumbbell/i);
  });
  
  // Test cable exercises
  test('Cable equipment should include cable exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Large Gym', // Cables are generally available in large gyms
      equipment: [],
      targetAreas: ['Chest'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Should include cable exercises
    expect(result.exercisesPrompt).toMatch(/Cable/i);
  });
  
  // Test bands equipment 
  test('Bands equipment should include band exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Bands'], // Only bands
      targetAreas: ['Chest', 'Upper Back', 'Shoulders'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Should include band exercises in exercise names
    expect(result.exercisesPrompt).toMatch(/"name": "[^"]*Band[^"]*"/i);
    
    // Check specifically for band exercises in the Shoulders section
    const shouldersSection = extractStrengthSection(result.exercisesPrompt, "Shoulders");
    expect(shouldersSection).toMatch(/Band/i);
  });
  
  // Test TRX equipment - TRX exercises exist as part of multi-equipment exercises
  test('TRX equipment should include exercises that can use TRX', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['TRX'], // Only TRX/suspension trainer
      targetAreas: ['Lower Body', 'Upper Back', 'Core'],
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // TRX may be included in exercise names or in exercises that can use multiple equipment types
    // Include exercises like "Assisted Pistol Squat" that can use TRX along with other equipment
    expect(result.exercisesPrompt.match(/Pistol Squat|TRX|Suspension/i)).toBeTruthy();
  });
  
  // Test kettlebell equipment - kettlebell exercises exist in the database
  test('Kettlebell equipment should include kettlebell exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Kettle Bell'], // Only kettlebells
      targetAreas: ['Shoulders', 'Core'],
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Should include kettlebell exercises
    expect(result.exercisesPrompt).toMatch(/Kettle(bell)?/i);
  });
  
  
  // Test combination of multiple specialty equipment - include TRX and Bands only, since those are present in the database
  test('Combination of specialty equipment should include exercises for all selected equipment', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: ['Bands', 'TRX'], // Equipment confirmed to be in the database
      targetAreas: ['Lower Body', 'Upper Back', 'Shoulders'],
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Should include exercises for the selected equipment types
    expect(result.exercisesPrompt).toMatch(/Band/i);
    
    // Should find at least one exercise that can use TRX
    expect(result.exercisesPrompt.match(/Pistol Squat|TRX|Suspension/i)).toBeTruthy();
  });
});

// Add test suite for exercise count validation
describe('Exercise count validation tests', () => {
  // Helper function to count exercises for a specific body part
  const countExercisesForBodyPart = (prompt: string, bodyPart: string): number => {
    const sectionRegex = new RegExp(`"bodyPart": "${bodyPart}"[\\s\\S]*?exercises": \\[([\\s\\S]*?)\\]`);
    const sectionMatch = prompt.match(sectionRegex);
    if (!sectionMatch) return 0;
    
    // Count the number of "id": entries in the section
    const idMatches = sectionMatch[1].match(/"id": /g);
    return idMatches ? idMatches.length : 0;
  };

  // Test to verify some exercises exist for major body parts
  test('Some body parts should have appropriate exercises', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Large Gym',
      equipment: ['Dumbbell', 'Barbell', 'Bench'], // Use common gym equipment
      targetAreas: ['Chest', 'Shoulders', 'Upper Back'],
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Verify Chest has some exercises
    const chestCount = countExercisesForBodyPart(result.exercisesPrompt, 'Chest');
    expect(chestCount).toBeGreaterThan(0);
    
    // Verify Shoulders has some exercises
    const shouldersCount = countExercisesForBodyPart(result.exercisesPrompt, 'Shoulders');
    expect(shouldersCount).toBeGreaterThan(0);
    
    // Verify Upper Back has some exercises
    const upperBackCount = countExercisesForBodyPart(result.exercisesPrompt, 'Upper Back');
    expect(upperBackCount).toBeGreaterThan(0);
  });
  
  // Test specifically for TRX exercises
  test('TRX equipment should filter for exercises that can use TRX', async () => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Large Gym',
      equipment: ['TRX'], // Only TRX/suspension trainer
      targetAreas: ['Lower Body', 'Upper Back'],
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Check for exercises that mention TRX or Suspension
    expect(result.exercisesPrompt).toMatch(/TRX|Suspension|Pistol|Assisted/i);
  });
  
  // Test specifically for equipment that we know exists in the database
  test.each([
    ['Dumbbell', 'Chest'],
    ['Barbell', 'Chest'],
    ['Bench', 'Chest'],
    ['Kettle Bell', 'Shoulders']
  ])('Equipment %s should filter for exercises that use it in %s', async (equipment, targetArea) => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Large Gym',
      equipment: [equipment], // Use specific equipment
      targetAreas: [targetArea], // Target specific area known to have exercises with this equipment
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Verify that the target area has exercises
    const areaCount = countExercisesForBodyPart(result.exercisesPrompt, targetArea);
    expect(areaCount).toBeGreaterThan(0);
    
    // For specific equipment that we know exists, check the response
    if (equipment === 'Dumbbell') {
      expect(result.exercisesPrompt).toMatch(/Dumbbell/i);
    } else if (equipment === 'Barbell') {
      expect(result.exercisesPrompt).toMatch(/Barbell/i);
    } else if (equipment === 'Bench') {
      expect(result.exercisesPrompt).toMatch(/Bench/i);
    } else if (equipment === 'Kettle Bell') {
      expect(result.exercisesPrompt).toMatch(/Kettle/i);
    }
  });
  
  // Test for equipment types that might not have specific exercises but should still return bodyweight exercises
  test.each([
    ['Bands', 'Upper Body'],
    ['Medicine Ball', 'Core']
  ])('Equipment %s should at least return bodyweight exercises for %s', async (equipment, targetArea) => {
    const userInfo = createUserInfo({
      exerciseModalities: 'Strength',
      exerciseEnvironments: 'Custom',
      equipment: [equipment], 
      targetAreas: [targetArea],
    });
    
    const result = await prepareExercisesPrompt(userInfo, undefined, true);
    
    // Verify that we have some exercises (might be bodyweight fallbacks)
    expect(result.exercisesPrompt).toMatch(/"exercises": \[/);
    
    // Since we always add bodyweight as a fallback, we should have warmup exercises
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Warmup"/);
  });
}); 

// Add test for specific user scenario that should return cycling exercises
describe('Specific user scenario tests', () => {
  // Helper function to extract cardio section
  const extractCardioSection = (prompt: string) => {
    const cardioSectionMatch = prompt.match(/"bodyPart": "Cardio",\s*"exercises": \[([\s\S]*?)\]/);
    return cardioSectionMatch ? cardioSectionMatch[1] : '';
  };

  test('User with cardio-only cycling preference should return cycling exercises', async () => {
    const userInfo = createUserInfo({
      age: '20-30',
      lastYearsExerciseFrequency: '2-3 times per week',
      numberOfActivityDays: '4 days per week',
      generallyPainfulAreas: ['Left shoulder'],
      exerciseModalities: 'Cardio',
      cardioEnvironment: 'Inside',
      cardioType: 'Cycling',
      exerciseEnvironments: '', // Empty string as provided
      workoutDuration: '45-60 minutes',
      targetAreas: [], // Empty array as provided
      modalitySplit: null,
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify cardio section exists
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    
    // Should include cycling/bike exercises
    expect(cardioSection).toMatch(/Cycling|Bike/i);
    
    // Should NOT include other cardio types
    expect(cardioSection).not.toMatch(/Running|Treadmill/i);
    expect(cardioSection).not.toMatch(/Rowing/i);
    
    // Should only include indoor exercises
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
    
    // Should have at least one exercise
    expect(result.exerciseCount).toBeGreaterThan(0);
    
    // Should include cycling exercises (the main issue being tested)
    expect(cardioSection).toMatch(/Zone 2 Cycling|4x4 Interval Cycling/i);
  });

  test('Both modalities with indoor running and custom equipment (no treadmill) should still include running exercises', async () => {
    const userInfo = createUserInfo({
      age: '25-35',
      lastYearsExerciseFrequency: '3-4 times per week',
      numberOfActivityDays: '5 days per week',
      generallyPainfulAreas: [],
      exerciseModalities: 'Both',
      cardioType: 'Running',
      cardioEnvironment: 'Inside',
      exerciseEnvironments: 'Custom',
      modalitySplit: 'even',
      cardioDays: 2,
      strengthDays: 3,
      targetAreas: ['Chest', 'Upper Back'], 
      equipment: ['Dumbbell', 'Bench'], // No treadmill selected
      workoutDuration: '45-60 minutes',
    });
    
    const result = await prepareExercisesPrompt(userInfo);
    
    // Extract cardio section for specific checks
    const cardioSection = extractCardioSection(result.exercisesPrompt);
    
    // Verify cardio section exists
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Cardio"/);
    
    // Should include indoor running exercises despite no treadmill equipment
    expect(cardioSection).toMatch(/Running.*Indoor|Indoor.*Running|Treadmill/i);
    
    // Should NOT include outdoor running
    expect(cardioSection).not.toMatch(/Outdoor|Outside/i);
    
    // Should NOT include other cardio types
    expect(cardioSection).not.toMatch(/Cycling|Bike/i);
    expect(cardioSection).not.toMatch(/Rowing/i);
    
    // Should also include strength exercises
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Chest"/);
    expect(result.exercisesPrompt).toMatch(/"bodyPart": "Upper Back"/);
    
    // Should have exercises despite not having treadmill equipment
    expect(result.exerciseCount).toBeGreaterThan(0);
    
    // Verify we have both cardio and strength exercises
    const chestExercises = result.exercisesPrompt.match(/"bodyPart": "Chest"[\s\S]*?exercises": \[([\s\S]*?)\]/)?.[1] || '';
    expect(chestExercises.trim()).not.toBe('');
  });
}); 