// English translations

const translations = {
  // Common elements
  'common.loading': 'Loading',
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
  'program.bodyPart.upper_arms': 'Upper arms',
  'program.bodyPart.forearms': 'Forearms',
  'program.bodyPart.chest': 'Chest',
  'program.bodyPart.abdomen': 'Abdomen',
  'program.bodyPart.upper_back': 'Upper back',
  'program.bodyPart.lower_back': 'Lower back',
  'program.bodyPart.glutes': 'Glutes',
  'program.bodyPart.upper_legs': 'Upper legs',
  'program.bodyPart.lower_legs': 'Lower legs',
  
  // Program - Equipment Access
  'program.equipment.large_gym': 'Large gym',
  'program.equipment.custom_(pick_and_choose)': 'Custom (pick and choose)',
  'program.equipment.small_gym': 'Small gym',
  'program.equipment.garage_gym': 'Garage gym',
  'program.equipment.at_home': 'At home',
  'program.equipment.bodyweight_only': 'Bodyweight only',
  
  // Program - Equipment Descriptions
  'program.equipmentDesc.large_gym': 'Complete commercial gym with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  'program.equipmentDesc.custom_(pick_and_choose)': 'Customize your training environment by selecting specific equipment you have access to',
  'program.equipmentDesc.small_gym': 'Compact fitness center with limited equipment',
  'program.equipmentDesc.garage_gym': 'Barbells, squat rack, dumbbells, and more',
  'program.equipmentDesc.at_home': 'Limited equipment such as dumbbells, resistance bands, pull-up bar, etc.',
  'program.equipmentDesc.bodyweight_only': 'Train anywhere without fitness equipment',
  
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
  'program.painBodyPart.left_shoulder': 'Left shoulder',
  'program.painBodyPart.right_shoulder': 'Right shoulder',
  'program.painBodyPart.left_upper_arm': 'Left upper arm',
  'program.painBodyPart.right_upper_arm': 'Right upper arm',
  'program.painBodyPart.left_elbow': 'Left elbow',
  'program.painBodyPart.right_elbow': 'Right elbow',
  'program.painBodyPart.left_forearm': 'Left forearm',
  'program.painBodyPart.right_forearm': 'Right forearm',
  'program.painBodyPart.left_hand': 'Left hand',
  'program.painBodyPart.right_hand': 'Right hand',
  'program.painBodyPart.chest': 'Chest',
  'program.painBodyPart.torso': 'Torso',
  'program.painBodyPart.upper_back': 'Upper back',
  'program.painBodyPart.middle_back': 'Middle back',
  'program.painBodyPart.lower_back': 'Lower back',
  'program.painBodyPart.pelvis_and_hip_region': 'Pelvis and hip region',
  'program.painBodyPart.right_thigh': 'Right thigh',
  'program.painBodyPart.left_thigh': 'Left thigh',
  'program.painBodyPart.left_knee': 'Left knee',
  'program.painBodyPart.right_knee': 'Right knee',
  'program.painBodyPart.left_lower_leg': 'Left lower leg',
  'program.painBodyPart.right_lower_leg': 'Right lower leg',
  'program.painBodyPart.left_foot': 'Left foot',
  'program.painBodyPart.right_foot': 'Right foot',
  
  // Body part groups
  'bodyPart.group.neck': 'Neck',
  'bodyPart.group.left_shoulder': 'Left shoulder',
  'bodyPart.group.right_shoulder': 'Right shoulder',
  'bodyPart.group.left_upper_arm': 'Left upper arm',
  'bodyPart.group.right_upper_arm': 'Right upper arm',
  'bodyPart.group.left_elbow': 'Left elbow',
  'bodyPart.group.right_elbow': 'Right elbow',
  'bodyPart.group.left_forearm': 'Left forearm',
  'bodyPart.group.right_forearm': 'Right forearm',
  'bodyPart.group.left_hand': 'Left hand',
  'bodyPart.group.right_hand': 'Right hand',
  'bodyPart.group.chest': 'Chest',
  'bodyPart.group.torso': 'Torso',
  'bodyPart.group.back': 'Back',
  'bodyPart.group.pelvis': 'Lower back, pelvis and hip region',
  'bodyPart.group.glutes': 'Glutes',
  'bodyPart.group.right_thigh': 'Right thigh',
  'bodyPart.group.left_thigh': 'Left thigh',
  'bodyPart.group.left_knee': 'Left knee',
  'bodyPart.group.right_knee': 'Right knee',
  'bodyPart.group.left_lower_leg': 'Left lower leg',
  'bodyPart.group.right_lower_leg': 'Right lower leg',
  'bodyPart.group.left_foot': 'Left foot',
  'bodyPart.group.right_foot': 'Right foot',
  
  // Languages
  'language.en': 'English',
  'language.nb': 'Norwegian',
  
  // Home page
  'home.pageTitle': 'bodAI',
  'home.male': 'Male',
  'home.female': 'Female',
  'home.loading': 'Loading',
  'home.initializing': 'Initializing muscles',
  
  // Auth
  'auth.skip': 'Skip',
  'auth.signInWithGoogle': 'Sign in with Google',
  'auth.signInWithEmail': 'Sign in with email',
  'auth.createAccount': 'Create account',
  'auth.signIn': 'Sign In',
  'auth.signOut': 'Sign Out',
  'auth.checkEmail': 'Check your email',
  'auth.sentLoginLink': 'We\'ve sent a login link to',
  'auth.clickLinkToSignIn': 'Click the link in the email to sign in',
  'auth.useDifferentEmail': 'Use a different email',
  'auth.continueWithoutLogin': 'Continue without logging in',
  'auth.welcome': 'Welcome to bodAI',
  'auth.enterEmailToStart': 'Enter your email address to get started',
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
  'mobile.controls.gotIt': 'Got It',
  'mobile.controls.tour.rotate': 'Rotate the model',
  'mobile.controls.tour.reset': 'Reset selections, zoom, and viewing position',
  'mobile.controls.tour.gender': 'Toggle between male / female anatomy',
  
  // BottomSheet Components
  'bottomSheet.resetChat': 'Reset Chat',
  'bottomSheet.selectRecoveryArea': 'Select Recovery Area',
  'bottomSheet.chooseBodyPart': 'Choose the body part you want to focus on for recovery',
  'bottomSheet.selectPainfulExerciseAreas': 'Select Painful Exercise Areas',
  'bottomSheet.selectPainfulAreasOptional': 'Select the areas that are painful during exercise (optional)',
  'bottomSheet.selectSpecificArea': 'Select a specific area of the {{group}} (optional)',
  'bottomSheet.typeMessage': 'Type your message...',
  'bottomSheet.askSomethingElse': 'Ask something else',
  
  // BottomSheet tour steps
  'bottomSheet.tourHeader': 'Here you can see the selected body group, and right below it, the selected body part.',
  'bottomSheet.tourReset': 'Use this button to reset the chat and start over.',
  'bottomSheet.tourSuggestions': 'Click on suggested questions to learn more about the selected body part.',
  'bottomSheet.tourInput': 'Type your questions here to learn more about anatomy, exercises, and treatment options.',
  'bottomSheet.tourControls': 'Use these buttons to expand or minimize the chat area.',
  'bottomSheet.tourRotate': 'Use this button to rotate the 3D model.',
  'bottomSheet.tourResetModel': 'Use this button to reset the 3D model to the original position.',
  'bottomSheet.tourGender': 'Use this button to switch between male and female 3D models.',
  
  // Tour steps
  'tour.bodyGroup': 'Here you can see the selected body group, and right below it, the selected body part.',
  'tour.resetButton': 'Use this button to reset the chat and start over.',
  'tour.suggestedQuestions': 'Click on suggested questions to learn more about the selected body part.',
  'tour.askQuestions': 'Type your questions here to learn more about anatomy, exercises, and treatment options.',
  'tour.expandButtons': 'Use these buttons to expand or minimize the chat area.',
  
  // Chat - Body Part Selection
  'chat.noBodyPartSelected': 'No body part selected',
  'chat.selectBodyPartToStart': 'Tap on a body part to get started',
  'chat.chatAboutOrSelectSpecific': 'Start a chat or select a specific part of the {{group}}',
  
  // Chat - Question Options
  'chat.question.painSource.title': 'Find source of my pain',
  'chat.question.painSource.text': 'I\'m experiencing discomfort in my $part. Can you help me figure out what might be wrong?',
  'chat.question.movement.title': 'Test my movement',
  'chat.question.movement.text': 'Can you guide me through some movements to check if there\'s an issue with my $part?',
  'chat.question.exercise.title': 'Exercise program',
  'chat.question.exercise.text': 'Can you help me create an exercise program?',
  'chat.question.recovery.title': 'Recovery program',
  'chat.question.recovery.text': 'What\'s the best recovery program for my $part?',
  
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
  'profile.gender.selectGender': 'Select gender',
  
  // Profile - Sleep Options
  'profile.sleep.lessThan6': 'Less than 6 hours',
  'profile.sleep.6to7': '6-7 hours',
  'profile.sleep.7to8': '7-8 hours',
  'profile.sleep.moreThan8': 'More than 8 hours',
  'profile.sleep.selectPattern': 'Select sleep pattern',
  
  // Profile - Body Regions
  'profile.bodyRegions.full_body': 'Full body',
  'profile.bodyRegions.upper_body': 'Upper body',
  'profile.bodyRegions.lower_body': 'Lower body',
  
  // Profile - Fitness Levels
  'profile.beginner.name': 'Beginner',
  'profile.beginner.desc': 'New to exercise or returning after a long break',
  'profile.intermediate.name': 'Intermediate',
  'profile.intermediate.desc': 'Regular exercise for at least several months',
  'profile.advanced.name': 'Advanced',
  'profile.advanced.desc': 'Consistent training for over a year with good technique',
  'profile.elite.name': 'Elite',
  'profile.elite.desc': 'Competitive athlete or very advanced training level',
  
  // Profile - Exercise Modalities
  'profile.modality.strength': 'Strength',
  'profile.modality.strength.description': 'Weight training, resistance training, bodyweight exercises',
  'profile.modality.cardio': 'Cardio',
  'profile.modality.cardio.description': 'Running, cycling, swimming, HIIT, aerobics',
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
  'profile.diet.glutenFree': 'Gluten free',
  'profile.diet.dairyFree': 'Dairy free',
  'profile.diet.mediterranean': 'Mediterranean',
  'profile.diet.intermittentFasting': 'Intermittent fasting',
  
  // Profile - Actions
  'profile.actions.editProfile': 'Edit profile',
  'profile.actions.profileUpdated': 'Profile updated',
  'profile.actions.errorUpdating': 'Error updating profile',
  'profile.actions.selectFrequency': 'Select frequency',
  
  // Admin
  'admin.translationManagement': 'Translation Management',
  'admin.addNewTranslation': 'Add New Translation',
  'admin.translationKey': 'Translation Key',
  'admin.translationText': 'Translation Text',
  'admin.addTranslation': 'Add Translation',
  'admin.addedTranslations': 'Added Translations',
  'admin.allFieldsRequired': 'All fields are required',
  'admin.keyAndTextRequired': 'Key and text are required',
  'admin.translationAddedSuccess': 'Translation added!',
  'admin.translationAddError': 'Error adding translation',
  'admin.dotNotationTip': 'Use dot notation for organization (e.g., \'category.feature.element\')',
  
  // Program
  'program.activity': 'Activity',
  'program.recovery': 'Recovery',
  'program.minutes': 'minutes',
  'program.targetBodyParts': 'Target body parts:',
  'program.moreBodyParts': '+{{count}} more',
  'program.optionalRecovery': 'Optional recovery activities',
  'program.recoveryMessage': 'These gentle exercises can be done at home to aid recovery. Listen to your body and only do what feels comfortable.',
  'program.noExercises': 'No exercises available with current filters.',
  'program.resetFilters': 'Reset filters',
  'program.watchVideo': 'Watch video',
  'program.seeMore': 'See more',
  'program.seeLess': 'See less',
  'program.viewInstructions': 'View instructions',
  'program.hideInstructions': 'Hide instructions',
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
  'exerciseFooter.continueToPainful': 'Continue to painful areas',
  'exerciseFooter.createProgram': 'Create program',
  
  // Intention Question
  'intentionQuestion.title': 'How can we help you today?',
  'intentionQuestion.subtitle': 'Select what you\'re looking for:',
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
  'questionnaire.exerciseDescription': 'Help us customize your exercise program by answering a few questions',
  'questionnaire.recoveryDescription': 'Help us create a recovery program tailored to your needs by answering a few questions',
  'questionnaire.age': 'How old are you?',
  'questionnaire.pastExercise': 'How often have you exercised in the past year?',
  'questionnaire.exerciseDays': 'How many days per week do you want to exercise?',
  'questionnaire.recoveryDays': 'How many days per week do you want to focus on recovery?',
  'questionnaire.painAreas': 'Do you have pain anywhere?',
  'questionnaire.trainingType': 'What type of equipment do you have access to?',
  'questionnaire.exerciseModalities': 'What type of exercise do you want to do?',
  'questionnaire.modalitySplit': 'How do you want to split your exercise days?',
  'questionnaire.modalitySplit.description': 'Select how many days per week you want to spend on each type of exercise (total: {{total}} days)',
  'questionnaire.modalitySplit.cardioDays': 'Cardio days per week',
  'questionnaire.modalitySplit.strengthDays': 'Strength days per week',
  'questionnaire.modalitySplit.totalDaysError': 'Total days exceeds your selected frequency of {{total}} days per week',
  'questionnaire.cardio': 'cardio days',
  'questionnaire.strength': 'strength days',
  'questionnaire.targetAreas': 'Which areas do you want to focus on in your training?',
  'questionnaire.strengthTargetAreas': 'Which areas do you want to focus on in your strength training?',
  'questionnaire.cardioType': 'What type of cardio do you prefer?',
  'questionnaire.cardioEnvironment': 'Where do you prefer to do cardio?',
  'questionnaire.exerciseLocation': 'Where do you prefer to exercise?',
  'questionnaire.recoveryLocation': 'Where do you prefer to do recovery exercises?',
  'questionnaire.workoutDuration': 'How much time do you want to spend on each workout?',
  'questionnaire.recoveryDuration': 'How much time do you want to spend on each recovery session?',
  'questionnaire.noPain': 'No, I don\'t have any pain',
  'questionnaire.selectAll': 'Select all that apply',
  'questionnaire.selectSpecific': 'Or select specific areas:',
  'questionnaire.selectEquipmentCategory': 'Select Equipment Category',
  'questionnaire.strengthEquipment': 'Strength',
  'questionnaire.cardioEquipment': 'Cardio',
  'questionnaire.selectSpecificEquipment': 'Select Your Primary Equipment',
  'questionnaire.selectEquipment': 'Select all equipment you have access to',
  'questionnaire.continue': 'Continue',
  'questionnaire.skipEquipment': 'Skip equipment',
  'questionnaire.cancel': 'Cancel',
  'questionnaire.createProgram': 'Create program',
  'questionnaire.selectedCardioType': 'Selected cardio type',
  
  // Program page translations
  'program.loading': 'Loading program',
  'program.loadingData': 'Loading program data',
  'program.creating': 'Creating your program',
  'program.waitMessage': 'Please wait while we create your personalized program. This may take a moment',
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
  
  // PWA Installation
  'pwa.addToHomescreen': 'Add to Home Screen',
  'pwa.addToHomescreenMessage': 'Install this app on your device for quick and easy access.',
  'pwa.install': 'Install',
  'pwa.notNow': 'Not Now',
  'pwa.neverShow': 'Never Show Again',
  'pwa.copyUrl': 'Copy URL',
  'pwa.urlCopied': 'URL copied! Open Safari and paste in the address bar.',
  
  // PWA Installation Instructions - iOS Chrome
  'pwa.iosChrome.title': 'Install this app on your iOS device:',
  'pwa.iosChrome.steps.0': 'Tap the share icon',
  'pwa.iosChrome.steps.1': 'Scroll down and tap "Add to Home Screen"',
  'pwa.iosChrome.steps.2': 'Tap "Add" to confirm',
  'pwa.iosChrome.steps.3': 'Access your app from the home screen',
  
  // PWA Installation Instructions - iOS Safari
  'pwa.ios.title': 'How to install:',
  'pwa.ios.steps.0': 'Tap the share icon',
  'pwa.ios.steps.1': 'Scroll down and tap "Add to Home Screen"',
  'pwa.ios.steps.2': 'Tap "Add" to confirm',
  'pwa.ios.safari': 'You\'re using Safari, so you can follow these steps to install.',
  'pwa.ios.other': 'Note: This works best in the Safari browser.',
  'pwa.ios.hint': 'Look for the Share button in the browser toolbar ↑ and select "Add to Home Screen"',
  
  // Desktop Browser Instructions - Chrome
  'pwa.desktop.chrome.title': 'Install this app on your computer:',
  'pwa.desktop.chrome.steps.0': 'Click the install button below, or',
  'pwa.desktop.chrome.steps.1': 'Click the installation icon in the address bar',
  'pwa.desktop.chrome.steps.2': 'Select "Install" from the dialog that appears',
  
  // Desktop Browser Instructions - Edge
  'pwa.desktop.edge.title': 'Install this app on your computer:',
  'pwa.desktop.edge.steps.0': 'Click the install button below, or',
  'pwa.desktop.edge.steps.1': 'Click the menu (⋯) at the top right',
  'pwa.desktop.edge.steps.2': 'Select "Apps" → "Install this site as an app"',
  'pwa.desktop.edge.steps.3': 'Follow the on-screen instructions',
  
  // Desktop Browser Instructions - Firefox
  'pwa.desktop.firefox.title': 'Firefox has limited web app support. To install:',
  'pwa.desktop.firefox.steps.0': 'Click the menu (☰) at the top right',
  'pwa.desktop.firefox.steps.1': 'Select "Add to Home Screen" or "Install"',
  'pwa.desktop.firefox.steps.2': 'If this option is not available, bookmark the site instead',
  
  // Desktop Browser Instructions - Safari
  'pwa.desktop.safari.title': 'Safari has limited web app support. To install:',
  'pwa.desktop.safari.steps.0': 'Click the "Share" button in the toolbar',
  'pwa.desktop.safari.steps.1': 'Select "Add to Dock" if available',
  'pwa.desktop.safari.steps.2': 'If this option is not available, bookmark the site instead',
  
  // Desktop Browser Instructions - Other
  'pwa.desktop.other.title': 'Install this app on your computer:',
  'pwa.desktop.other.steps.0': 'Click the menu button in your browser',
  'pwa.desktop.other.steps.1': 'Look for "Install" or "Add to Home Screen" option',
  'pwa.desktop.other.steps.2': 'Follow the on-screen instructions',
  'pwa.desktop.other.note': 'Note: This works best in Chrome or Edge.',
  
  // Default PWA Instructions
  'pwa.default.title': 'To install this application:',
  'pwa.default.message': 'Follow your browser\'s installation instructions when prompted.',
  
  // Program - Cardio Types
  'program.cardioType.running': 'Running',
  'program.cardioType.cycling': 'Cycling',
  'program.cardioType.rowing': 'Rowing',
  
  // Program - Cardio Environments
  'program.cardioEnvironment.outside': 'Outdoors',
  'program.cardioEnvironment.inside': 'Indoors',
  'program.cardioEnvironment.both': 'Both'
};

export default translations; 