#!/usr/bin/env node

/**
 * Verification script to ensure all workout days in recovery programs
 * are using computed durations instead of hardcoded values.
 */

const fs = require('fs');
const path = require('path');

// Read the recovery.ts file
const recoveryPath = path.join(__dirname, '../public/data/programs/recovery.ts');
const recoveryContent = fs.readFileSync(recoveryPath, 'utf8');

// Check for hardcoded durations in workout days
const hardcodedDurationPattern = /duration:\s*[0-9]+,\s*\n\s*exercises:/g;
const matches = recoveryContent.match(hardcodedDurationPattern);

if (matches && matches.length > 0) {
  console.error('❌ Found hardcoded durations in workout days:');
  console.error(`Found ${matches.length} instances of hardcoded durations`);
  
  // Find the line numbers
  const lines = recoveryContent.split('\n');
  let lineNumber = 1;
  for (const line of lines) {
    if (line.includes('duration:') && line.match(/duration:\s*[0-9]+/)) {
      const nextLine = lines[lineNumber] || '';
      if (nextLine.includes('exercises:')) {
        console.error(`  Line ${lineNumber}: ${line.trim()}`);
      }
    }
    lineNumber++;
  }
  
  process.exit(1);
} else {
  console.log('✅ No hardcoded durations found in workout days');
}

// Check for createWorkoutDay usage
const createWorkoutDayPattern = /createWorkoutDay\(/g;
const createWorkoutDayMatches = recoveryContent.match(createWorkoutDayPattern);

if (createWorkoutDayMatches) {
  console.log(`✅ Found ${createWorkoutDayMatches.length} uses of createWorkoutDay()`);
} else {
  console.error('❌ No createWorkoutDay() calls found');
  process.exit(1);
}

// Check for rest day functions
const restDayFunctions = [
  'createLowBackRestDay',
  'createRunnersKneeRestDay', 
  'createShoulderRestDay',
  'createAnkleRestDay',
  'createTennisElbowRestDay',
  'createTechNeckRestDay',
  'createPlantarRestDay',
  'createCoreRestDay'
];

let totalRestDayCalls = 0;
for (const func of restDayFunctions) {
  const pattern = new RegExp(`${func}\\(`, 'g');
  const matches = recoveryContent.match(pattern);
  if (matches) {
    totalRestDayCalls += matches.length;
    console.log(`✅ Found ${matches.length} uses of ${func}()`);
  }
}

console.log(`✅ Total rest day function calls: ${totalRestDayCalls}`);

// Check for duration calculation functions
if (recoveryContent.includes('calculateExerciseDuration') && 
    recoveryContent.includes('calculateDayDuration')) {
  console.log('✅ Duration calculation functions are present');
} else {
  console.error('❌ Duration calculation functions are missing');
  process.exit(1);
}

console.log('\n🎉 All duration calculations are properly implemented!'); 