// English translations

const translations = {
  // Common elements
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.ok': 'OK',
  'common.error': 'An error occurred',
  'common.language': 'Language',
  'common.notSet': 'Not set',
  'common.done': 'Done',
  'common.add': 'Add',
  
  // Directions
  'direction.left': 'Left',
  'direction.right': 'Right',
  
  // Program - Target Body Parts
  'program.bodyPart.neck': 'Neck',
  'program.bodyPart.shoulders': 'Shoulders',
  'program.bodyPart.upper_arms': 'Upper Arms',
  'program.bodyPart.forearms': 'Forearms',
  'program.bodyPart.chest': 'Chest',
  'program.bodyPart.abdomen': 'Abdomen',
  'program.bodyPart.upper_back': 'Upper Back',
  'program.bodyPart.lower_back': 'Lower Back',
  'program.bodyPart.glutes': 'Glutes',
  'program.bodyPart.upper_legs': 'Upper Legs',
  'program.bodyPart.lower_legs': 'Lower Legs',
  
  // Program - Equipment Access
  'program.equipment.large_gym': 'Large Gym',
  'program.equipment.small_gym': 'Small Gym',
  'program.equipment.garage_gym': 'Garage Gym',
  'program.equipment.at_home': 'At Home',
  'program.equipment.bodyweight_only': 'Bodyweight Only',
  
  // Program - Equipment Descriptions
  'program.equipmentDesc.large_gym': 'Full-service fitness facility with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  'program.equipmentDesc.small_gym': 'Compact public gym with limited equipment',
  'program.equipmentDesc.garage_gym': 'Barbells, squat rack, dumbells and more',
  'program.equipmentDesc.at_home': 'Limited equipment such as dumbells, bands, pull-up bars etc.',
  'program.equipmentDesc.bodyweight_only': 'Work out anywhere without gym equipment',
  
  // Program - Workout Durations
  'program.duration.15_30_minutes': '15-30 minutes',
  'program.duration.30_45_minutes': '30-45 minutes',
  'program.duration.45_60_minutes': '45-60 minutes',
  'program.duration.60_90_minutes': '60-90 minutes',
  'program.duration.more_than_90_minutes': 'More than 90 minutes',
  'program.duration.15_minutes': '15 minutes',
  'program.duration.30_minutes': '30 minutes',
  'program.duration.45_minutes': '45 minutes',
  
  // Program - Age Ranges
  'program.ageRange.under_20': 'Under 20',
  'program.ageRange.20_30': '20-30',
  'program.ageRange.30_40': '30-40',
  'program.ageRange.40_50': '40-50',
  'program.ageRange.50_60': '50-60',
  'program.ageRange.60_70': '60-70',
  'program.ageRange.70_or_above': '70 or above',
  
  // Program - Exercise Frequency
  'program.frequency.0': '0',
  'program.frequency.1_2_times_per_week': '1-2 times per week',
  'program.frequency.2_3_times_per_week': '2-3 times per week',
  'program.frequency.4_5_times_per_week': '4-5 times per week',
  'program.frequency.every_day': 'Every day',
  
  // Program - Planned Exercise Frequency
  'program.plannedFrequency.1_day_per_week': '1 day per week',
  'program.plannedFrequency.2_days_per_week': '2 days per week',
  'program.plannedFrequency.3_days_per_week': '3 days per week',
  'program.plannedFrequency.4_days_per_week': '4 days per week',
  'program.plannedFrequency.5_days_per_week': '5 days per week',
  'program.plannedFrequency.6_days_per_week': '6 days per week',
  'program.plannedFrequency.every_day': 'Every day',
  
  // Program - Exercise Modalities
  'program.modality.cardio': 'Cardio',
  'program.modality.strength': 'Strength',
  'program.modality.both': 'Both',
  
  // Program - Pain Body Parts
  'program.painBodyPart.neck': 'Neck',
  'program.painBodyPart.left_shoulder': 'Left Shoulder',
  'program.painBodyPart.right_shoulder': 'Right Shoulder',
  'program.painBodyPart.left_upper_arm': 'Left Upper Arm',
  'program.painBodyPart.right_upper_arm': 'Right Upper Arm',
  'program.painBodyPart.left_elbow': 'Left Elbow',
  'program.painBodyPart.right_elbow': 'Right Elbow',
  'program.painBodyPart.left_forearm': 'Left Forearm',
  'program.painBodyPart.right_forearm': 'Right Forearm',
  'program.painBodyPart.left_hand': 'Left Hand',
  'program.painBodyPart.right_hand': 'Right Hand',
  'program.painBodyPart.chest': 'Chest',
  'program.painBodyPart.torso': 'Torso',
  'program.painBodyPart.upper_back': 'Upper Back',
  'program.painBodyPart.middle_back': 'Middle Back',
  'program.painBodyPart.lower_back': 'Lower Back',
  'program.painBodyPart.pelvis_and_hip_region': 'Pelvis & Hip Region',
  'program.painBodyPart.right_thigh': 'Right Thigh',
  'program.painBodyPart.left_thigh': 'Left Thigh',
  'program.painBodyPart.left_knee': 'Left Knee',
  'program.painBodyPart.right_knee': 'Right Knee',
  'program.painBodyPart.left_lower_leg': 'Left Lower Leg',
  'program.painBodyPart.right_lower_leg': 'Right Lower Leg',
  'program.painBodyPart.left_foot': 'Left Foot',
  'program.painBodyPart.right_foot': 'Right Foot',
  
  // Body part groups
  'bodyPart.group.neck': 'Neck',
  'bodyPart.group.left_shoulder': 'Left Shoulder',
  'bodyPart.group.right_shoulder': 'Right Shoulder',
  'bodyPart.group.left_upper_arm': 'Left Upper Arm',
  'bodyPart.group.right_upper_arm': 'Right Upper Arm',
  'bodyPart.group.left_elbow': 'Left Elbow',
  'bodyPart.group.right_elbow': 'Right Elbow',
  'bodyPart.group.left_forearm': 'Left Forearm',
  'bodyPart.group.right_forearm': 'Right Forearm',
  'bodyPart.group.left_hand': 'Left Hand',
  'bodyPart.group.right_hand': 'Right Hand',
  'bodyPart.group.chest': 'Chest',
  'bodyPart.group.torso': 'Torso',
  'bodyPart.group.back': 'Back',
  'bodyPart.group.pelvis': 'Lower Back, Pelvis & Hip Region',
  'bodyPart.group.glutes': 'Glutes',
  'bodyPart.group.right_thigh': 'Right Thigh',
  'bodyPart.group.left_thigh': 'Left Thigh',
  'bodyPart.group.left_knee': 'Left Knee',
  'bodyPart.group.right_knee': 'Right Knee',
  'bodyPart.group.left_lower_leg': 'Left Lower Leg',
  'bodyPart.group.right_lower_leg': 'Right Lower Leg',
  'bodyPart.group.left_foot': 'Left Foot',
  'bodyPart.group.right_foot': 'Right Foot',
  
  // Languages
  'language.en': 'English',
  'language.nb': 'Norwegian',
  
  // Home page
  'home.pageTitle': 'bodAI',
  'home.male': 'Male',
  'home.female': 'Female',
  
  // Auth
  'auth.skip': 'Skip',
  'auth.signInWithGoogle': 'Sign in with Google',
  'auth.signInWithEmail': 'Sign in with Email',
  'auth.createAccount': 'Create Account',
  'auth.signIn': 'Sign in',
  'auth.signOut': 'Sign out',
  'auth.checkEmail': 'Check your email',
  'auth.sentLoginLink': 'We sent a login link to',
  'auth.clickLinkToSignIn': 'Click the link in the email to sign in',
  'auth.useDifferentEmail': 'Use a different email',
  'auth.continueWithoutLogin': 'Continue without login',
  'auth.welcome': 'Welcome to bodAI',
  'auth.enterEmailToStart': 'Enter your email to get started',
  'auth.emailAddress': 'Email address',
  'auth.sending': 'Sending',
  'auth.sendLoginLink': 'Send login link',
  
  // Navigation
  'nav.home': 'Home',
  'nav.explore': 'Explore',
  'nav.createProgram': 'Create Program',
  'nav.createNewProgram': 'Create New Program',
  'nav.myProgram': 'My Program',
  'nav.programs': 'Programs',
  'nav.calendar': 'Calendar',
  'nav.profile': 'Profile',
  
  // Mobile Controls and 3D Viewer
  'mobile.controls.minimize': 'Minimize',
  'mobile.controls.expand': 'Expand',
  'mobile.controls.next': 'Next →',
  'mobile.controls.back': '← Back',
  'mobile.controls.gotIt': 'Got it',
  
  // BottomSheet Components
  'bottomSheet.resetChat': 'Reset chat',
  'bottomSheet.selectRecoveryArea': 'Select Recovery Area',
  'bottomSheet.chooseBodyPart': 'Choose the body part you want to focus on for recovery',
  'bottomSheet.selectPainfulExerciseAreas': 'Select Painful Exercise Areas',
  'bottomSheet.selectPainfulAreasOptional': 'Select the areas that are painful during exercise (optional)',
  'bottomSheet.selectSpecificArea': 'Select a specific area of the {{group}} (optional)',
  'bottomSheet.typeMessage': 'Type your message...',
  'bottomSheet.askSomethingElse': 'Ask for something else',
  
  // Tour steps
  'tour.bodyGroup': 'Here you can see the selected body group, and right below it, the selected body part.',
  'tour.resetButton': 'Use this button to reset the chat and start over.',
  'tour.suggestedQuestions': 'Click on suggested questions to learn more about the selected body part.',
  'tour.askQuestions': 'Type your questions here to learn more about anatomy, exercises, and treatment options.',
  'tour.expandButtons': 'Use these buttons to expand or minimize the chat area.',
  
  // Chat - Body Part Selection
  'chat.noBodyPartSelected': 'No body part selected',
  'chat.selectBodyPartToStart': 'Select a body part to get started',
  'chat.chatAboutOrSelectSpecific': 'Start a chat or select a specific part of the {{group}}',
  
  // Chat - Question Options
  'chat.question.painSource.title': 'Find the source of my pain',
  'chat.question.painSource.text': "I'm experiencing discomfort in the $part. Can you help me find out what's wrong?",
  'chat.question.movement.title': 'Test my movement',
  'chat.question.movement.text': "Can you walk me through some movements to check if there's an issue with the $part?",
  'chat.question.exercise.title': 'Exercise program',
  'chat.question.exercise.text': 'What is the best exercise program for my $part?',
  'chat.question.recovery.title': 'Recovery program',
  'chat.question.recovery.text': 'What is the best recovery program for my $part?',
  
  // Profile - Sections
  'profile.sections.general': 'General',
  'profile.sections.healthBasics': 'Health Basics',
  'profile.sections.fitnessProfile': 'Fitness Profile',
  'profile.sections.goalsPreferences': 'Goals & Preferences',
  
  // Profile - Fields
  'profile.fields.name': 'Name',
  'profile.fields.phone': 'Phone',
  'profile.fields.dateOfBirth': 'Date of Birth',
  'profile.fields.height': 'Height (cm)',
  'profile.fields.weight': 'Weight (kg)',
  'profile.fields.gender': 'Gender',
  'profile.fields.fitnessLevel': 'Fitness Level',
  'profile.fields.sleepPattern': 'Sleep Pattern',
  'profile.fields.exerciseFrequency': 'Exercise Frequency',
  'profile.fields.exerciseModalities': 'Exercise Modalities',
  'profile.fields.targetBodyAreas': 'Target Body Areas',
  'profile.fields.healthGoals': 'Health Goals',
  'profile.fields.exerciseEnvironment': 'Exercise Environment',
  'profile.fields.workoutDuration': 'Workout Duration',
  'profile.fields.dietaryPreferences': 'Dietary Preferences',
  'profile.fields.addCustomGoal': 'Add custom goal:',
  'profile.fields.enterCustomGoal': 'Enter custom goal',
  'profile.fields.selectSpecificAreas': 'Or select specific areas:',

  // Profile - Gender Options
  'profile.gender.male': 'Male',
  'profile.gender.female': 'Female',
  'profile.gender.nonBinary': 'Non-binary',
  'profile.gender.preferNotToSay': 'Prefer not to say',
  'profile.gender.selectGender': 'Select Gender',
  
  // Profile - Sleep Options
  'profile.sleep.lessThan6': 'Less than 6 hours',
  'profile.sleep.6to7': '6-7 hours',
  'profile.sleep.7to8': '7-8 hours',
  'profile.sleep.moreThan8': 'More than 8 hours',
  'profile.sleep.selectPattern': 'Select Sleep Pattern',
  
  // Profile - Body Regions
  'profile.bodyRegions.fullBody': 'Full Body',
  'profile.bodyRegions.upperBody': 'Upper Body',
  'profile.bodyRegions.lowerBody': 'Lower Body',
  
  // Profile - Fitness Levels
  'profile.beginner.name': 'Beginner',
  'profile.beginner.desc': 'New to fitness or returning after a long break',
  'profile.intermediate.name': 'Intermediate',
  'profile.intermediate.desc': 'Regular exercise for at least several months',
  'profile.advanced.name': 'Advanced',
  'profile.advanced.desc': 'Consistent training for over a year with good technique',
  'profile.elite.name': 'Elite',
  'profile.elite.desc': 'Competitive athlete or very advanced fitness level',
  
  // Profile - Exercise Modalities
  'profile.modality.strength': 'Strength',
  'profile.modality.strength.description': 'Weight training, resistance training, bodyweight exercises',
  'profile.modality.cardio': 'Cardio',
  'profile.modality.cardio.description': 'Running, cycling, swimming, HIIT, aerobic exercise',
  'profile.modality.recovery': 'Recovery',
  'profile.modality.recovery.description': 'Stretching, yoga, mobility work, active recovery',
  
  // Profile - Health Goals
  'profile.goals.weightLoss': 'Weight loss',
  'profile.goals.muscleGain': 'Muscle gain',
  'profile.goals.improvedFitness': 'Improved fitness',
  'profile.goals.strengthDevelopment': 'Strength development',
  'profile.goals.injuryRecovery': 'Injury recovery',
  'profile.goals.painReduction': 'Pain reduction',
  'profile.goals.betterMobility': 'Better mobility',
  'profile.goals.sportsPerformance': 'Sports performance',
  'profile.goals.generalWellness': 'General wellness',
  'profile.goals.stressReduction': 'Stress reduction',
  'profile.goals.betterSleep': 'Better sleep',
  'profile.goals.improvedPosture': 'Improved posture',
  
  // Profile - Dietary Preferences
  'profile.diet.noSpecificDiet': 'No specific diet',
  'profile.diet.vegetarian': 'Vegetarian',
  'profile.diet.vegan': 'Vegan',
  'profile.diet.pescatarian': 'Pescatarian',
  'profile.diet.paleo': 'Paleo',
  'profile.diet.keto': 'Keto',
  'profile.diet.carnivore': 'Carnivore',
  'profile.diet.lowCarb': 'Low carb',
  'profile.diet.lowFat': 'Low fat',
  'profile.diet.glutenFree': 'Gluten-free',
  'profile.diet.dairyFree': 'Dairy-free',
  'profile.diet.mediterranean': 'Mediterranean',
  'profile.diet.intermittentFasting': 'Intermittent fasting',
  
  // Profile - Actions
  'profile.actions.editProfile': 'Edit profile',
  'profile.actions.profileUpdated': 'Profile updated successfully',
  'profile.actions.errorUpdating': 'Error updating profile',
  'profile.actions.selectFrequency': 'Select Frequency',
  
  // Admin
  'admin.translationManagement': 'Translation Management',
  'admin.addNewTranslation': 'Add New Translation',
  'admin.translationKey': 'Translation Key',
  'admin.translationText': 'Translation Text',
  'admin.addTranslation': 'Add Translation',
  'admin.addedTranslations': 'Added Translations',
  'admin.allFieldsRequired': 'All fields are required',
  'admin.keyAndTextRequired': 'Key and text are required',
  'admin.translationAddedSuccess': 'Translation added successfully!',
  'admin.translationAddError': 'Error adding translation',
  'admin.dotNotationTip': 'Use dot notation for organization (e.g., \'category.feature.element\')',
  
  // Program
  'program.activity': 'Activity',
  'program.recovery': 'Recovery',
  'program.minutes': 'minutes',
  'program.targetBodyParts': 'Target Body Parts:',
  'program.moreBodyParts': '+{{count}} more',
  'program.optionalRecovery': 'Optional Recovery Activities',
  'program.recoveryMessage': 'These gentle exercises can be performed at home to aid recovery. Listen to your body and only do what feels comfortable.',
  'program.noExercises': 'No exercises available with the current filter.',
  'program.resetFilters': 'Reset filters',
  'program.watchVideo': 'Watch Video',
  'program.seeMore': 'See more',
  'program.seeLess': 'See less',
  'program.viewInstructions': 'View Instructions',
  'program.hideInstructions': 'Hide Instructions',
  'program.modification': 'Modification:',
  'program.precaution': 'Precaution:',
  'program.rest': '{{seconds}}s rest',
  bottomSheet: {
    minimize: 'Minimize',
    expand: 'Expand',
    resetChat: 'Reset chat',
    typeMessage: 'Type your message...',
    next: 'Next →',
    back: '← Back',
    gotIt: 'Got it',
    tourStep1: 'Here you can see the selected body group, and right below it, the selected body part.',
    tourStep2: 'Use this button to reset the chat and start over.',
    tourStep3: 'Click on suggested questions to learn more about the selected body part.',
    tourStep4: 'Type your questions here to learn more about anatomy, exercises, and treatment options.',
    tourStep5: 'Use these buttons to expand or minimize the chat area.',
  },
  
  // Exercise Selection
  'exerciseSelection.targetAreas': 'Target Areas',
  'exerciseSelection.painfulAreas': 'Painful Areas',
  'exerciseSelection.noPainfulAreas': 'No painful areas selected',
  
  // Exercise Footer
  'exerciseFooter.continueToPainful': 'Continue to Painful Areas',
  'exerciseFooter.createProgram': 'Create Exercise Program',
  
  // Intention Question
  'intentionQuestion.title': 'How can we help you today?',
  'intentionQuestion.subtitle': 'Choose what you\'re looking for:',
  'intentionQuestion.exerciseProgram': 'Exercise Program',
  'intentionQuestion.recoveryProgram': 'Recovery Program',
  
  // Program Titles
  'program.recoveryProgramTitle': 'Recovery Program',
  'program.exerciseProgramTitle': 'Exercise Program',
  'program.yourRecoveryProgramTitle': 'Your Recovery Program',
  'program.yourExerciseProgramTitle': 'Your Exercise Program',
  
  // Questionnaire
  'questionnaire.exerciseTitle': 'Exercise Program Questionnaire',
  'questionnaire.recoveryTitle': 'Recovery Program Questionnaire',
  'questionnaire.exerciseDescription': 'Help us personalize your exercise program by answering a few questions',
  'questionnaire.recoveryDescription': 'Help us create a recovery program tailored to your needs by answering a few questions',
  'questionnaire.age': 'How old are you?',
  'questionnaire.pastExercise': 'How often have you exercised in the past year?',
  'questionnaire.exerciseDays': 'How many days per week would you like to exercise?',
  'questionnaire.recoveryDays': 'How many days per week would you like to focus on recovery?',
  'questionnaire.painAreas': 'Do you have pain anywhere?',
  'questionnaire.trainingType': 'What type of training do you want to do?',
  'questionnaire.targetAreas': 'Which areas would you like to target in your workouts?',
  'questionnaire.exerciseLocation': 'Where do you prefer to exercise?',
  'questionnaire.recoveryLocation': 'Where do you prefer to do your recovery sessions?',
  'questionnaire.workoutDuration': 'How much time would you like to spend on each workout?',
  'questionnaire.recoveryDuration': 'How much time would you like to spend on each recovery session?',
  'questionnaire.noPain': 'No, I don\'t have any pain',
  'questionnaire.selectAll': 'Select all that apply',
  'questionnaire.selectSpecific': 'Or select specific areas:',
  'questionnaire.cancel': 'Cancel',
  'questionnaire.createProgram': 'Create Program',
  
  // Program page translations
  'program.loading': 'Loading program...',
  'program.loadingData': 'Loading program data...',
  'program.creating': 'Creating Your Program',
  'program.waitMessage': 'Please wait while we create your personalized program. This may take a minute...',
  'program.exerciseVideoTitle': 'Exercise Video',
  'program.pageTitle': 'Exercise Program | MUSCO',
  'program.defaultPageTitle': 'Program | MUSCO',
  
  // Days of the week
  'days.monday': 'Monday',
  'days.tuesday': 'Tuesday',
  'days.wednesday': 'Wednesday',
  'days.thursday': 'Thursday',
  'days.friday': 'Friday',
  'days.saturday': 'Saturday',
  'days.sunday': 'Sunday',
};

export default translations; 