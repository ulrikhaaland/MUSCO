// English translations

const translations = {
  // Common elements
  'common.loading': 'Loading',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
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
  'program.bodyPart.shoulder': 'Shoulder',
  'program.bodyPart.upper_arms': 'Upper arms',
  'program.bodyPart.forearms': 'Forearms',
  'program.bodyPart.elbow': 'Elbow',
  'program.bodyPart.chest': 'Chest',
  'program.bodyPart.abdomen': 'Abdomen',
  'program.bodyPart.core': 'Core',
  'program.bodyPart.upper_back': 'Upper back',
  'program.bodyPart.lower_back': 'Lower back',
  'program.bodyPart.glutes': 'Glutes',
  'program.bodyPart.hips': 'Hips',
  'program.bodyPart.upper_legs': 'Upper legs',
  'program.bodyPart.hamstring': 'Hamstring',
  'program.bodyPart.lower_legs': 'Lower legs',
  'program.bodyPart.calves': 'Calves',
  'program.bodyPart.knee': 'Knee',
  'program.bodyPart.ankle': 'Ankle',
  'program.bodyPart.foot': 'Foot',
  'program.bodyPart.traps': 'Traps',
  'program.bodyPart.upper_traps': 'Upper traps',
  'program.bodyPart.posture': 'Posture',

  // Program - Equipment Access
  'program.equipment.large_gym': 'Large gym',
  'program.equipment.custom_(pick_and_choose)': 'Custom (pick and choose)',
  'program.equipment.small_gym': 'Small gym',
  'program.equipment.garage_gym': 'Garage gym',
  'program.equipment.at_home': 'At home',
  'program.equipment.bodyweight_only': 'Bodyweight only',
  'program.equipment.custom': 'Custom',

  // Program - Equipment Descriptions
  'program.equipmentDesc.large_gym':
    'Complete commercial gym with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  'program.equipmentDesc.custom_(pick_and_choose)':
    'Customize your training environment by selecting specific equipment you have access to',
  'program.equipmentDesc.small_gym':
    'Compact fitness center with limited equipment',
  'program.equipmentDesc.garage_gym':
    'Barbells, squat rack, dumbbells, and more',
  'program.equipmentDesc.at_home':
    'Limited equipment such as dumbbells, resistance bands, pull-up bar, etc.',
  'program.equipmentDesc.bodyweight_only':
    'Train anywhere without fitness equipment',
  'program.equipmentDesc.custom':
    'Customize your training environment by selecting specific equipment you have access to',

  // Program - Workout Durations
  'program.duration.15_30_minutes': '15-30 minutes',
  'program.duration.30_45_minutes': '30-45 minutes',
  'program.duration.45_60_minutes': '45-60 minutes',
  'program.duration.60_90_minutes': '60-90 minutes',
  'program.duration.more_than_90_minutes': 'More than 90 minutes',
  'program.duration.15_minutes': '15 minutes',
  'program.duration.30_minutes': '30 minutes',
  'program.duration.45_minutes': '45 minutes',
  'profile.duration.30to45minutes': '30-45 minutes',
  'profile.duration.15-30 minutes': '15-30 minutes',
  'profile.duration.1530minutes': '15-30 minutes',

  // Body parts
  'bodyParts.Chest': 'Chest',
  'bodyParts.chest': 'Chest',

  // Additional Program Day Summary translations
  'program.workout': 'Workout',
  'program.activity': 'Exercise',
  'program.strength': 'Strength',
  'program.cardio': 'Cardio',
  'program.recovery': 'Recovery',
  'program.rest': '{{seconds}}s rest',
  'program.minutes': 'minutes',
  'program.noDuration': 'No duration',
  'program.warmup': 'warm-up',
  'program.exercise': 'exercise',
  'program.exercises': 'exercises',
  'program.optionalRecoveryActivity': 'optional recovery activity',
  'program.optionalRecoveryActivities': 'optional recovery activities',
  'program.dayAccessibility': 'Day {{day}} accessibility information',

  // Profile separators
  'profile.separateWithCommas.medicalConditions':
    'Separate conditions with commas',
  'profile.separateWithCommas.medications': 'Separate medications with commas',
  'profile.separateWithCommas.injuries': 'Separate injuries with commas',
  'profile.separateWithCommas.familyHistory':
    'Separate family history items with commas',
  'profile.selectFrequency': 'Select frequency',
  'profile.selectedDiets': 'Selected diets',

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
  'program.painBodyPart.abdomen': 'Abdomen',
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
  'bodyPart.group.abdomen': 'Abdomen',
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
  'home.pageTitle': 'BodAI',
  'home.male': 'Male',
  'home.female': 'Female',
  'home.loading': 'Loading',
  'home.initializing': 'Initializing muscles',

  // Auth
  'auth.skip': 'Skip',
  'auth.signInWithGoogle': 'Sign in with Google',
  'auth.signInWithEmail': 'Sign in with email',
  'auth.createAccount': 'Create account',
  'auth.welcome': 'Welcome back',
  'auth.enterEmailForCode': 'Enter your email to get a 6-digit code',
  'auth.rateLimit.title': 'Continue where you left off',
  'auth.rateLimit.subtitle': 'You hit today\'s free limit. Enter your email to log in or create an account to save and continue without losing your progress.',
  'auth.subscribeContext.title': 'Subscribe to unlock Premium',
  'auth.subscribeContext.subtitle': 'Enter your email to log in or create an account, then continue to checkout to unlock higher limits and weekly follow‑ups.',
  'auth.emailAddress': 'Email address',
  'auth.sendCode': 'Send code',
  'auth.continueWithoutLogin': 'Continue without login',
  'auth.saveProgram': 'Save Your Program',
  'auth.saveDescription':
    'Enter your email to save this program to your account',
  'auth.saveAndContinue': 'Save & Continue',
  'auth.continueWithoutSaving': 'Continue without saving',
  'auth.signIn': 'Sign In',
  'auth.signOut': 'Sign Out',
  'auth.signing': 'Signing in',
  'auth.sending': 'Sending',
  'auth.checkingLoginStatus': 'Checking login status',
  'auth.accountDisabled': 'Your account has been disabled',
  'auth.userNotFound': 'User not found',
  'auth.tooManyRequests': 'Too many requests. Please try again later.',
  'auth.failedToSendCode': 'Failed to send code',
  'auth.backToEmail': 'Back to email',
  'auth.checkEmail': 'Check your email',
  'auth.sentLoginLink': "We've sent a login link to",
  'auth.clickLinkToSignIn': 'Click the link in the email to sign in',
  'auth.useDifferentEmail': 'Use a different email',
  'auth.enterEmailToStart': 'Enter your email address to get started',
  'auth.sendLoginLink': 'Send login link',
  'auth.useAuthCode': 'Enter auth code instead',
  'auth.alreadyHaveCode': 'I already have an auth code',
  'auth.codeLogin': 'Code Authentication',
  'auth.codeSentTo': 'Code sent to',
  'auth.enterCodeFromEmail': 'Enter the 6-digit code from your email',
  'auth.signingIn': 'Signing you in...',
  'auth.log.timeout': 'User data loading safety timeout triggered',
  'auth.log.storedQuestionnaire': 'Stored pending questionnaire for email:',
  'auth.log.foundQuestionnaire': 'Found pending questionnaire in Firebase',
  'auth.log.noQuestionnaire': 'No pending questionnaire found for email:',
  'auth.log.submissionInProgress':
    'Submission already in progress, ignoring duplicate request',
  'auth.log.skipAutomaticSubmission':
    'Another submission is already in progress, skipping automatic submission',
  'auth.log.selectingProgram': 'Selecting program at index',

  // Login form
  'login.email': 'Email',
  'login.continue': 'Continue',
  'login.enterEmail': 'Enter your email',
  'login.invalidEmail': 'Please enter a valid email',
  'login.enterCode': 'Enter verification code',
  'login.code': 'Verification Code',
  'login.codeInstructions': 'Enter the 6-digit code sent to your email',
  'login.invalidCode': 'Please enter a valid 6-digit code',
  'login.verify': 'Verify Code',
  'login.verifying': 'Verifying',
  'login.success': 'Successfully signed in!',
  'login.codeFailed': 'Invalid or expired code. Please try again.',
  'login.back': 'Back',
  'login.resendCode': 'Resend code',
  'login.codeResent': 'New code sent',
  'login.codeResendFailed': 'Failed to resend code',
  'login.resendIn': 'You can resend a new code in {{s}}s',

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
  'mobile.controls.close': 'Close',
  'mobile.controls.tour.rotate': 'Rotate the model',
  'mobile.controls.tour.reset': 'Reset selections, zoom, and viewing position',
  'mobile.controls.tour.gender': 'Toggle between male / female anatomy',
  
  // Mobile Chat Overlay
  'mobile.chat.startOrSelect': 'Start a chat or select a specific part',
  'mobile.chat.askAnything': 'Ask anything about pain, recovery or training.',
  'mobile.chat.button': 'Chat',
  'mobile.chat.selectBodyPart': 'Select a body part',
  'mobile.chat.tapToStart': 'Tap on the model to get started',

  // Desktop Controls
  'desktopControls.rotateModel': 'Rotate Model',
  'desktopControls.rotating': 'Rotating...',
  'desktopControls.resetView': 'Reset View',
  'desktopControls.resetting': 'Resetting...',
  'desktopControls.explainerOn': 'Explainer On',
  'desktopControls.explainerOff': 'Explainer Off',
  'desktopControls.switchToFemale': 'Switch to Female',
  'desktopControls.switchToMale': 'Switch to Male',
  'desktopControls.loading': 'Loading...',

  // BottomSheet Components
  'bottomSheet.resetChat': 'Reset Chat',
  'bottomSheet.chatHistory': 'Chat history',
  'bottomSheet.digitalPhysiotherapist': 'Digital physiotherapist',

  // Chat History
  'chatHistory.title': 'Chat History',
  'chatHistory.close': 'Close',
  'chatHistory.newChat': 'New Chat',
  'chatHistory.noChats': 'No previous chats',
  'chatHistory.startConversation': 'Start a conversation to see it here',
  'chatHistory.messages': 'messages',
  'chatHistory.deleteChat': 'Delete chat',
  'chatHistory.loadError': 'Failed to load chat history',
  'chatHistory.deleteDialog.title': 'Delete Chat',
  'chatHistory.deleteDialog.description': 'Are you sure you want to delete this chat? This action cannot be undone.',
  'chatHistory.deleteDialog.confirm': 'Delete',
  'chatHistory.deleteDialog.cancel': 'Cancel',
  'bottomSheet.selectRecoveryArea': 'Select Recovery Area',
  'bottomSheet.chooseBodyPart':
    'Choose the body part you want to focus on for recovery',
  'bottomSheet.selectPainfulExerciseAreas': 'Select Painful Exercise Areas',
  'bottomSheet.selectPainfulAreasOptional':
    'Select the areas that are painful during exercise (optional)',
  'bottomSheet.selectSpecificArea':
    'Select a specific area of the {{group}} (optional)',
  'bottomSheet.typeMessage': 'Type your message',
  'bottomSheet.askSomethingElse': 'Ask something else',

  // Chat - Body Part Selection
  'chat.noBodyPartSelected': 'No body part selected',
  'chat.selectBodyPartToStart': 'Tap on a body part or start a chat to get started',
  'chat.chatAboutOrSelectSpecific':
    'Start a chat or select a specific part of the {{group}}',

  // Chat - Question Options
  'chat.question.painSource.title': 'Find Pain',
  'chat.question.painSource.text':
    "I'm experiencing discomfort in my $part. Can you help me figure out what might be wrong?",
  'chat.question.painSource.meta': 'Diagnose your $part issue(s)',
  'chat.question.movement.title': 'Test Movement',
  'chat.question.movement.text':
    "Can you guide me through some movements to check if there's an issue with my $part?",
  'chat.question.movement.meta': '2 simple motions',
  'chat.question.explore.title': 'Explore',
  'chat.question.explore.meta': 'Learn more about the $part',
  'chat.question.explore.text': 'Can you tell me more about the $part?',
  'chat.question.exercise.title': 'Build Program',
  'chat.question.exercise.text': 'Can you help me create an exercise program?',
  'chat.question.exercise.meta': '2 min setup',
  'chat.question.recovery.title': 'Plan Recovery',
  'chat.question.recovery.text':
    "What's the best recovery program for my $part?",
  'chat.question.recovery.meta': '2 min setup',

  // Chat - Global Template Questions (no body part selected)
  'chat.template.whatCanYouHelp.label': 'What can you help me with?',
  'chat.template.whatCanYouHelp.question': 'What can you help me with?',
  'chat.template.whatCanYouHelp.description': 'Learn about the assistant capabilities',
  'chat.template.havePain.label': 'I have pain',
  'chat.template.havePain.question': 'I have pain',
  'chat.template.havePain.description': 'Start a pain assessment',
  'chat.template.buildProgram.label': 'Build an exercise program',
  'chat.template.buildProgram.question': 'Build an exercise program',
  'chat.template.buildProgram.description': 'Create a customized training plan',
  'chat.askInChat': 'Ask in chat',

  // Profile - Sections
  'profile.sections.myInfo': 'Personal Information',
  'profile.sections.general': 'General',
  'profile.sections.healthBasics': 'Health Basics',
  'profile.sections.fitnessProfile': 'Fitness Profile',
  'profile.sections.goalsPreferences': 'Goals & Preferences',

  // Profile - Fields
  'profile.fields.email': 'Email',
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
  'profile.selectGender': 'Select gender',

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
  'profile.advanced.desc':
    'Consistent training for over a year with good technique',
  'profile.elite.name': 'Elite',
  'profile.elite.desc': 'Competitive athlete or very advanced training level',

  // Profile - Exercise Modalities
  'profile.modality.strength': 'Strength',
  'profile.modality.strength.description':
    'Weight training, resistance training, bodyweight exercises',
  'profile.modality.cardio': 'Cardio',
  'profile.modality.cardio.description':
    'Running, cycling, swimming, HIIT, aerobics',
  'profile.modality.recovery': 'Recovery',
  'profile.modality.recovery.description':
    'Stretching, yoga, mobility work, active recovery',

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
  'admin.dotNotationTip':
    "Use dot notation for organization (e.g., 'category.feature.element')",

  // Program
  'program.targetBodyParts': 'Target body parts:',
  'program.moreBodyParts': '+{{count}} more',
  'program.optionalRecovery': 'Optional recovery activities',
  'program.recoveryMessage':
    'These gentle exercises can be done at home to aid recovery. Listen to your body and only do what feels comfortable.',
  'program.noExercises': 'No exercises available with current filters.',
  'program.resetFilters': 'Reset filters',
  'program.watchVideo': 'Watch video',
  'program.seeMore': 'See more',
  'program.seeLess': 'See less',
  'program.viewInstructions': 'View instructions',
  'program.hideInstructions': 'Hide instructions',
  'program.description': 'Description',
  'program.instructions': 'Instructions',
  'program.tips': 'Tips',
  'program.modification': 'Modification',
  'program.precaution': 'Precaution',

  // Exercise Selection
  'exerciseSelection.targetAreas': 'Target Areas',
  'exerciseSelection.painfulAreas': 'Painful Areas',
  'exerciseSelection.noPainfulAreas': 'No painful areas selected',
  'exerciseSelection.selectCategoryExercise': 'Select {{category}} Exercise',
  'exerciseSelection.searchPlaceholder': 'Search {{category}} exercises...',
  'exerciseSelection.noExercisesMatchingQuery':
    'No {{category}} exercises found matching "{{query}}"',
  'exerciseSelection.noExercisesAvailable':
    'No {{category}} exercises available',

  // Exercise Footer
  'exerciseFooter.continueToPainful': 'Continue to painful areas',
  'exerciseFooter.createProgram': 'Create program',

  // Intention Question
  'intentionQuestion.title': 'How can we help you today?',
  'intentionQuestion.subtitle': "Select what you're looking for:",
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
  'questionnaire.exerciseDescription':
    'Help us customize your exercise program by answering a few questions',
  'questionnaire.recoveryDescription':
    'Help us create a recovery program tailored to your needs by answering a few questions',
  'questionnaire.assessmentSummary': 'Conclusion of assessment',
  'questionnaire.age': 'How old are you?',
  'questionnaire.pastExercise':
    'How often have you exercised in the past year?',
  'questionnaire.exerciseDays':
    'How many days per week do you want to exercise?',
  'questionnaire.recoveryDays':
    'How many days per week do you want to focus on recovery?',
  'questionnaire.painAreas': 'Do you have pain anywhere?',
  'questionnaire.trainingType': 'What type of equipment do you have access to?',
  'questionnaire.exerciseModalities':
    'What type of exercise do you want to do?',
  'questionnaire.modalitySplit': 'How do you want to split your exercise days?',
  'questionnaire.modalitySplit.description':
    'Select how many days per week you want to spend on each type of exercise (total: {{total}} days)',
  'questionnaire.modalitySplit.cardioDays': 'Cardio days per week',
  'questionnaire.modalitySplit.strengthDays': 'Strength days per week',
  'questionnaire.modalitySplit.totalDaysError':
    'Total days exceeds your selected frequency of {{total}} days per week',
  'questionnaire.cardio': 'cardio days',
  'questionnaire.strength': 'strength days',
  'questionnaire.targetAreas':
    'Which areas do you want to focus on in your training?',
  'questionnaire.strengthTargetAreas':
    'Which areas do you want to focus on in your strength training?',
  'questionnaire.cardioType': 'What type of cardio do you prefer?',
  'questionnaire.cardioEnvironment': 'Where do you prefer to do cardio?',
  'questionnaire.exerciseLocation': 'Where do you prefer to exercise?',
  'questionnaire.recoveryLocation':
    'Where do you prefer to do recovery exercises?',
  'questionnaire.workoutDuration':
    'How much time do you want to spend on each workout?',
  'questionnaire.recoveryDuration':
    'How much time do you want to spend on each recovery session?',
  'questionnaire.additionalInfo': 'Anything else we should know?',
  'questionnaire.additionalInfoHint':
    'Share any relevant details that might help us personalize your program — injuries, limitations, specific goals, or preferences.',
  'questionnaire.additionalInfoPlaceholder':
    'e.g., "I have a weak left ankle from an old sprain" or "I want to focus on improving my posture"...',
  'questionnaire.noPain': "No, I don't have any pain",
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
  // Equipment items
  'equipmentItem.dumbbell': 'Dumbbell',
  'equipmentItem.barbell': 'Barbell',
  'equipmentItem.cable': 'Cable',
  'equipmentItem.bands': 'Bands',
  'equipmentItem.bench': 'Bench',
  'equipmentItem.trx': 'TRX / Suspension Trainer',
  'equipmentItem.kettle_bell': 'Kettlebell',
  'equipmentItem.treadmill': 'Treadmill',
  'equipmentItem.exercise_bike': 'Exercise Bike',
  'equipmentItem.rowing_machine': 'Rowing Machine',
  'equipmentItem.elliptical': 'Elliptical',
  'equipmentItem.jump_rope': 'Jump Rope',
  'questionnaire.selectedCardioType': 'Selected cardio type',
  'questionnaire.autoSelectedCardioEquipment':
    "We've pre-selected {{equipment}} for your indoor {{type}} workouts. You can deselect it if you prefer other options.",
  'questionnaire.createProgram': 'Create Program',
  'questionnaire.includeWeekends': 'Include weekend days for exercise',
  'questionnaire.weekendsRequired': 'required for 6+ days',
  'questionnaire.programType.select': 'What kind of program do you want?',
  'questionnaire.programType.exercise': 'Exercise',
  'questionnaire.programType.exerciseAndRecovery': 'Exercise + Recovery',
  'questionnaire.programType.recovery': 'Recovery',
  'questionnaire.programType.info.exercise': 'Focused strength/cardio plan for fitness and performance.',
  'questionnaire.programType.info.exerciseAndRecovery': 'Balanced plan combining training with targeted recovery work.',
  'questionnaire.programType.info.recovery': 'Gentle routines to reduce pain, restore mobility, and ease back in.',
  'questionnaire.programType.generatedThisWeek': 'Already generated this week',

  // Weekly generation limit messages
  'questionnaire.weeklyLimit.allTypesLocked': 'Weekly limit reached',
  'questionnaire.weeklyLimit.allTypesMessage': "You've generated all program types this week. Come back next week to create new programs!",
  'questionnaire.weeklyLimit.nextAllowed': 'Next available: {{date}}',
  'questionnaire.goBack': 'Go Back',

  // Program page translations
  'program.loading': 'Loading program',
  'program.loadingData': 'Loading program data',
  'program.creating': 'Creating your program',
  'program.waitMessage':
    'Please wait while we create your personalized program. This may take a moment',
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

  // Calendar translations
  'calendar.title': 'Calendar',
  'calendar.programCalendarTitle': 'Program Calendar | MUSCO',
  'calendar.noProgramForThisDay': 'No program for this day',
  'calendar.workout': 'Workout',
  'calendar.strength': 'Strength',
  'calendar.cardio': 'Cardio',
  'calendar.recovery': 'Recovery',
  'calendar.rest': 'Rest',
  'calendar.today': 'Today',
  'calendar.weekdays.mon': 'Mon',
  'calendar.weekdays.tue': 'Tue',
  'calendar.weekdays.wed': 'Wed',
  'calendar.weekdays.thu': 'Thu',
  'calendar.weekdays.fri': 'Fri',
  'calendar.weekdays.sat': 'Sat',
  'calendar.weekdays.sun': 'Sun',

  // Programs page translations
  'programs.title': 'My Programs',
  'programs.noPrograms': 'No Programs Found',
  'programs.noPrograms.message':
    "You don't have any workout programs yet. Create your first program to get started!",
  'programs.createProgram': 'Create Program',
  'programs.filter.all': 'All',
  'programs.filter.exercise': 'Exercise',
  'programs.filter.recovery': 'Recovery',
  'programs.sort.newest': 'Newest',
  'programs.sort.oldest': 'Oldest',
  'programs.noFilteredPrograms':
    'No {type} programs found. Try a different filter or create a new program.',
  'programs.defaultTitle': 'Workout Program',
  'programs.customType': 'Custom',
  'programs.stats.weeks': 'Weeks',
  'programs.stats.exerciseDays': 'Exercise Days',
  'programs.stats.restDays': 'Rest Days',
  'programs.targetAreas': 'Target Areas',
  'programs.targetAreas.more': '+{count} more',
  'programs.created': 'Created:',
  'programs.deleteProgram': 'Delete program',
  'programs.deleteDialog.title': 'Delete Program',
  'programs.deleteDialog.description':
    'Are you sure you want to delete this program? This action cannot be undone.',
  'programs.deleteDialog.confirm': 'Delete',
  'programs.deleteDialog.cancel': 'Cancel',
  'programs.modality.cardio': 'Cardio',
  'programs.modality.strength': 'Strength',
  'programs.modality.both': 'Cardio & Strength',
  'programs.modality.recovery': 'Recovery',
  'programs.dayType.strength': 'Strength',
  'programs.dayType.cardio': 'Cardio',
  'programs.dayType.recovery': 'Recovery',
  'programs.dayType.rest': 'Rest',

  // PWA Installation
  'pwa.addToHomescreen': 'Add to Home Screen',
  'pwa.addToHomescreenMessage':
    'Install this app on your device for quick and easy access.',
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
  'pwa.ios.safari':
    "You're using Safari, so you can follow these steps to install.",
  'pwa.ios.other': 'Note: This works best in the Safari browser.',
  'pwa.ios.hint':
    'Look for the Share button in the browser toolbar ↑ and select "Add to Home Screen"',

  // Desktop Browser Instructions - Chrome
  'pwa.desktop.chrome.title': 'Install this app on your computer:',
  'pwa.desktop.chrome.steps.0': 'Click the install button below, or',
  'pwa.desktop.chrome.steps.1':
    'Click the installation icon in the address bar',
  'pwa.desktop.chrome.steps.2': 'Select "Install" from the dialog that appears',

  // Desktop Browser Instructions - Edge
  'pwa.desktop.edge.title': 'Install this app on your computer:',
  'pwa.desktop.edge.steps.0': 'Click the install button below, or',
  'pwa.desktop.edge.steps.1': 'Click the menu (⋯) at the top right',
  'pwa.desktop.edge.steps.2': 'Select "Apps" → "Install this site as an app"',
  'pwa.desktop.edge.steps.3': 'Follow the on-screen instructions',

  // Desktop Browser Instructions - Firefox
  'pwa.desktop.firefox.title':
    'Firefox has limited web app support. To install:',
  'pwa.desktop.firefox.steps.0': 'Click the menu (☰) at the top right',
  'pwa.desktop.firefox.steps.1': 'Select "Add to Home Screen" or "Install"',
  'pwa.desktop.firefox.steps.2':
    'If this option is not available, bookmark the site instead',

  // Desktop Browser Instructions - Safari
  'pwa.desktop.safari.title': 'Safari has limited web app support. To install:',
  'pwa.desktop.safari.steps.0': 'Click the "Share" button in the toolbar',
  'pwa.desktop.safari.steps.1': 'Select "Add to Dock" if available',
  'pwa.desktop.safari.steps.2':
    'If this option is not available, bookmark the site instead',

  // Desktop Browser Instructions - Other
  'pwa.desktop.other.title': 'Install this app on your computer:',
  'pwa.desktop.other.steps.0': 'Click the menu button in your browser',
  'pwa.desktop.other.steps.1':
    'Look for "Install" or "Add to Home Screen" option',
  'pwa.desktop.other.steps.2': 'Follow the on-screen instructions',
  'pwa.desktop.other.note': 'Note: This works best in Chrome or Edge.',

  // Default PWA Instructions
  'pwa.default.title': 'To install this application:',
  'pwa.default.message':
    "Follow your browser's installation instructions when prompted.",

  // Program - Cardio Types
  'program.cardioType.running': 'Running',
  'program.cardioType.cycling': 'Cycling',
  'program.cardioType.rowing': 'Rowing',
  'program.cardioType.incline_walking': 'Incline Walking',

  // Program - Cardio Environments
  'program.cardioEnvironment.inside': 'Inside',
  'program.cardioEnvironment.outside': 'Outside',
  'program.cardioEnvironment.both': 'Both',

  // Program Feedback Questionnaire
  'programFeedback.alert.cannotReplaceAdded':
    'You cannot replace an exercise you just added. Remove it instead if needed.',
  'programFeedback.alert.alreadyAddedReplacement':
    "Cannot use this exercise as a replacement because you've already added it as a new exercise. Please try another alternative or remove the added exercise first.",
  'programFeedback.alert.noAlternatives':
    'No available alternatives for this exercise: {{exerciseName}}',
  'programFeedback.comingSoon.title': 'Coming Soon',
  'programFeedback.comingSoon.message':
    "Your next week's program will be available on {{formattedDate}}",
  'programFeedback.previousExercises.title': 'Your Previous Exercises',
  'programFeedback.previousExercises.description':
    'Browse through exercises from your previous workout program. Use the buttons to mark exercises for replacement or removal.',
  'programFeedback.selector.title': 'Exercises from Your Previous Program',
  'programFeedback.selector.description':
    'Filter by body part to find specific exercises. Click the buttons to mark exercises for replacement or removal.',
  'programFeedback.button.back': 'Back',
  'programFeedback.button.building': 'Building Program',
  'programFeedback.button.buildNextWeek': "Build Next Week's Program",
  'programFeedback.button.waitUntilNextWeek':
    "You must complete this week's program before you can build the next week's program.",
  'programFeedback.button.waitUntilSpecificDate':
    "You can build the next week's program on {{date}}.",
  'programFeedback.pageTitle': 'Program Feedback',

  // Exercise Feedback Selector
  'exerciseFeedbackSelector.chip.new': 'New',
  'exerciseFeedbackSelector.chip.replacement': 'Replacement',
  'exerciseFeedbackSelector.button.title.revert': 'Revert to original exercise',
  'exerciseFeedbackSelector.button.title.replace': 'Replace exercise',
  'exerciseFeedbackSelector.button.title.remove': 'Remove exercise',
  'exerciseFeedbackSelector.noExercisesFound':
    'No exercises found with the current filters',
  'exerciseFeedbackSelector.category.exerciseCount': '({{count}} exercises)',
  'exerciseFeedbackSelector.button.addExercise': 'Add {{category}} Exercise',
  'exerciseFeedbackSelector.alert.addNotSupported':
    'Adding exercises for {{category}} is not supported yet.',

  // User Context
  'userContext.loading.programs': 'Loading your programs',
  'userContext.loading.program': 'Loading program',
  'userContext.loading.data': 'Loading your data',
  'userContext.loading.programPage': 'Loading your program',
  'userContext.error.processingActiveProgram':
    'Error processing active program:',
  'userContext.error.processingProgram': 'Error processing program:',
  'userContext.error.processingProgramBackground':
    'Error processing program in background:',
  'userContext.error.loadingProgramsBackground':
    'Error loading programs in background:',
  'userContext.error.fetchingUserData': 'Error fetching user data:',
  'userContext.error.storingQuestionnaire':
    'Error storing pending questionnaire:',
  'userContext.error.processingQuestionnaire':
    'Error processing pending questionnaire:',
  'userContext.error.submittingQuestionnaire':
    'Error submitting questionnaire:',
  'userContext.log.timeout': 'User data loading safety timeout triggered',
  'userContext.log.storedQuestionnaire':
    'Stored pending questionnaire for email:',
  'userContext.log.foundQuestionnaire':
    'Found pending questionnaire in Firebase',
  'userContext.log.noQuestionnaire':
    'No pending questionnaire found for email:',
  'userContext.log.submissionInProgress':
    'Submission already in progress, ignoring duplicate request',
  'userContext.log.skipAutomaticSubmission':
    'Another submission is already in progress, skipping automatic submission',
  'userContext.log.checkingQuestionnaire':
    'Checking for pending questionnaire for email:',
  'userContext.debug.selectedProgram': '=== DEBUG: Selected userProgram ===',
  'userContext.debug.numberPrograms': 'Number of programs in collection:',
  'userContext.debug.combinedProgram':
    '=== DEBUG: combinedProgram in selectProgram ===',
  'userContext.debug.totalWeeks': 'Total weeks in combined program:',
  'userContext.debug.combinedWeek': 'Combined Week',
  'userContext.error.userLoggedIn':
    'User must be logged in to toggle program status',
  'userContext.error.invalidProgramIndex': 'Invalid program index',
  'userContext.log.selectingProgram': 'Selecting program at index',

  // Exercise Program Page
  'exerciseProgram.button.viewOverview': 'View Program Overview',
  'exerciseProgram.button.getStarted': 'Get Started',
  'exerciseProgram.loading': 'Loading program',
  'exerciseProgram.loadingDay': 'Loading workout...',
  'exerciseProgram.weekTab': 'Week',
  'exerciseProgram.nextWeek': 'Next Week',
  'exerciseProgram.day.rest': 'Rest',
  'exerciseProgram.day.activity': 'Exercise',
  'exerciseProgram.buildingDay': 'Building day {{current}} of {{total}}...',
  'exerciseProgram.buildingOverview': 'Building program overview...',
  'exerciseProgram.overview.title.exercise':
    'Personalized for your fitness goals',
  'exerciseProgram.overview.title.recovery':
    'Personalized for your recovery journey',
  'exerciseProgram.overview.objective': 'Objective',
  'exerciseProgram.overview.keyMoves': 'Key Moves',
  'exerciseProgram.overview.programDuration': 'Program Duration:',
  'exerciseProgram.overview.whatNotToDo': 'What Not To Do',
  'exerciseProgram.overview.expectedOutcome': 'Expected Outcome',
  'exerciseProgram.overview.nextSteps': 'Next Steps',
  // Week Focus header and fallback
  'exerciseProgram.weekFocus': 'Program Overview',
  'exerciseProgram.weekFocus.summaryFallback': 'Focus details available',
  'exerciseProgram.nextWeekCard.title': 'Ready for Your Next Program?',
  'exerciseProgram.nextWeekCard.description':
    "Share your feedback on this week's exercises to get your personalized program for next week, or copy last week's program to continue with the same exercises",
  'exerciseProgram.nextWeekCard.button': 'Start Feedback Process',
  'exerciseProgram.nextWeekCard.copyButton': 'Copy Previous Week',
  'exerciseProgram.nextWeekCard.copying': 'Copying...',
  'exerciseProgram.nextWeekCard.copySuccess': 'Previous week copied successfully!',
  'exerciseProgram.nextWeekCard.copyFailed': 'Failed to copy previous week',
  'exerciseProgram.nextWeekCard.weeklyLimitTitle': 'Weekly Limit Reached',
  'exerciseProgram.nextWeekCard.weeklyLimitDescription':
    "You've already generated a program for this program type this week. Come back next week!",
  'exerciseProgram.nextWeekCard.weeklyLimitNextDate': 'Next available: {{date}}',
  'exerciseProgram.feedback.error': 'User must be logged in to submit feedback',
  'exerciseProgram.feedback.success': 'New program generated with ID:',
  'exerciseProgram.feedback.error.generating': 'Error generating new program:',

  // Pre-Follow-up Chat
  'feedback.buildProgram': 'Build Program',
  'feedback.continueChat': 'Continue Chat',
  'feedback.buildEarlyTitle': 'Build Program Now?',
  'feedback.buildEarlyMessage':
    'You haven\'t finished answering the questions. Building now means your program may be less personalized. Continue chatting for better results.',
  'feedback.buildAnyway': 'Build Anyway',
  'feedback.typeMessage': 'Type your message...',
  'feedback.sendSelected': 'Send ({{count}} selected)',
  'feedback.iCompleted': 'I completed',
  'feedback.daysSelected': '{{count}} days selected',
  'feedback.startOver': 'Start over',
  'feedback.answerInChat': 'Answer in chat',
  'feedback.typeYourAnswer': 'Click to answer in chat',
  'chat.error': 'Something went wrong. Please try again.',

  // Sign Up Prompts for Custom Programs
  'exerciseProgram.signUp.unlockWeek': 'Sign up to unlock',
  'exerciseProgram.signUp.title': 'Unlock Full Program',
  'exerciseProgram.signUp.description':
    'Sign up or log in to access the complete program and track your progress.',
  'exerciseProgram.signUp.button': 'Sign Up / Log In',
  'exerciseProgram.signUp.saveProgram': 'Save program',

  // Title editing
  'exerciseProgram.editTitle': 'Edit title',
  'exerciseProgram.titleRequired': 'Title is required',
  'exerciseProgram.titleUpdated': 'Title updated',
  'exerciseProgram.titleUpdateFailed': 'Failed to update title',

  // Day reordering
  'exerciseProgram.daysReordered': 'Days reordered successfully',
  'exerciseProgram.reorderFailed': 'Failed to reorder days',
  'exerciseProgram.dragToReorder': 'Drag to reorder',

  // Month abbreviations
  'month.jan': 'Jan',
  'month.feb': 'Feb',
  'month.mar': 'Mar',
  'month.apr': 'Apr',
  'month.may': 'May',
  'month.jun': 'Jun',
  'month.jul': 'Jul',
  'month.aug': 'Aug',
  'month.sep': 'Sep',
  'month.oct': 'Oct',
  'month.nov': 'Nov',
  'month.dec': 'Dec',

  // Exercise Feedback Selector additional translations
  'exerciseFeedbackSelector.log.selected':
    'Selected exercise: {{exercise}} for category: {{selectedCategory}}',
  'exerciseFeedbackSelector.log.mapping':
    'Mapping legacy category {{category}} to {{effectiveCategory}} for exercise selection',
  'exerciseFeedbackSelector.log.mappingCalves':
    'Mapping legacy category Calves to Lower Legs for exercise selection',
  'exerciseFeedbackSelector.log.unsupported':
    'Category "{{category}}" is not supported for exercise selection',

  // Body part names for exercise categories
  'bodyPart.category.Abs': 'Abs',
  'bodyPart.category.Biceps': 'Biceps',
  'bodyPart.category.Calves': 'Calves',
  'bodyPart.category.Cardio': 'Cardio',
  'bodyPart.category.Chest': 'Chest',
  'bodyPart.category.Core': 'Core',
  'bodyPart.category.Forearms': 'Forearms',
  'bodyPart.category.Glutes': 'Glutes',
  'bodyPart.category.Hamstrings': 'Hamstrings',
  'bodyPart.category.Lats': 'Lats',
  'bodyPart.category.Lower Back': 'Lower Back',
  'bodyPart.category.Lower Legs': 'Lower Legs',
  'bodyPart.category.Obliques': 'Obliques',
  'bodyPart.category.Quads': 'Quads',
  'bodyPart.category.Shoulders': 'Shoulders',
  'bodyPart.category.Traps': 'Traps',
  'bodyPart.category.Triceps': 'Triceps',
  'bodyPart.category.Upper Arms': 'Upper Arms',
  'bodyPart.category.Upper Back': 'Upper Back',
  'bodyPart.category.Upper Legs': 'Upper Legs',
  'bodyPart.category.Warmup': 'Warmup',
  'bodyPart.category.Adductors': 'Adductors',
  'bodyPart.category.Abductors': 'Abductors',
  'bodyPart.category.Hip Flexors': 'Hip Flexors',
  'bodyPart.category.Serratus': 'Serratus',

  // Exercise feedback selector UI translations
  'exerciseFeedbackSelector.title': 'Exercises from Your Previous Program',
  'exerciseFeedbackSelector.description':
    'Filter by body part to find specific exercises. Click the buttons to mark exercises for replacement or removal.',
  'exerciseFeedbackSelector.targetBodyParts': 'Target Body Parts:',
  'exerciseFeedbackSelector.exercises': 'exercises',
  'exerciseFeedbackSelector.expandAll': 'Expand All',
  'exerciseFeedbackSelector.collapseAll': 'Collapse All',

  // Profile page
  'profile.title': 'Profile',
  'profile.sections.medical': 'Medical Background',
  'profile.sections.customNotes': 'Custom Notes',
  'profile.customNotes.title': 'Custom Notes',
  'profile.customNotes.description': 'Add any additional information you\'d like the AI to know about you. This could include preferences, context, or anything else that helps personalize your experience.',
  'profile.customNotes.placeholder': 'Example: I prefer morning workouts, I have a standing desk at work, I\'m training for a marathon in 6 months...',
  'profile.customNotes.addNote': 'Add a note',
  'profile.customNotes.clickToEdit': 'Click to edit',
  'profile.customNotes.emptyState': 'No notes yet. Add your first note to help personalize your AI experience.',
  'profile.account': 'Account',
  'profile.privacyControls': 'Privacy & Data Controls',
  'profile.privacyPolicy': 'Privacy Policy',
  'profile.dataControls': 'Data Controls',
  'profile.signOut': 'Sign Out',
  'profile.saveChanges': 'Save Changes',
  'profile.saving': 'Saving...',
  'profile.cancel': 'Cancel',
  'profile.profileUpdated': 'Profile updated successfully',
  'profile.updateError': 'Error updating profile',
  'profile.logoutError': 'Failed to log out. Please try again.',
  'profile.noneSet': 'None',
  'profile.notSet': 'Not set',
  'profile.dataUsageInfo.title': 'Why We Collect Your Data',
  'profile.dataUsageInfo.subtitle': 'Your profile information helps our AI provide personalized fitness advice during chats. The more details you share, the better recommendations you\'ll receive.',
  'profile.addPhoto': 'Add Photo',
  'profile.changePhoto': 'Click to change photo',
  'profile.noPhoto': 'Add Photo',
  'profile.profilePreview': 'Profile Preview',
  'profile.profilePhoto': 'Profile Photo',
  'profile.cropPhoto': 'Crop Photo',
  'profile.cropPhotoDescription': 'Drag to reposition, scroll to zoom',
  'profile.convertingImage': 'Converting image...',
  'profile.heicConversionError': 'Failed to convert image. Please try a different format.',
  'profile.phoneError.tooShort': 'Phone number is too short',
  // Profile - Subscription widget
  'profile.subscription.title': 'Subscription',
  'profile.subscription.active': 'Active',
  'profile.subscription.activeWithRenewal': 'Active · Renews on {{date}}',
  'profile.subscription.statusPrefix': 'Status:',
  'profile.subscription.none': 'No active subscription',
  'profile.subscription.manage': 'Manage',
  'profile.fields.medicalConditions': 'Medical Conditions',
  'profile.fields.medications': 'Medications',
  'profile.fields.injuries': 'Injuries',
  'profile.fields.painfulAreas': 'Painful Areas',
  'profile.fields.familyHistory': 'Family Medical History',
  'profile.fields.noPainAreas': 'No pain areas',
  'profile.fields.addCustomDiet': 'Add custom diet:',
  'profile.fields.enterCustomDiet': 'Enter custom diet',
  'profile.fields.selectedDiets': 'Selected diets:',

  // Privacy Page
  'privacy.title': 'Privacy & Data Settings',
  'privacy.loading': 'Loading...',
  'privacy.dataControl': 'Data Control',
  'privacy.dataControl.description':
    'Manage your personal data and privacy settings.',
  'privacy.exportData': 'Export Your Data',
  'privacy.exportData.description':
    'Download a copy of all your personal data stored in our system.',
  'privacy.exportData.button': 'Export My Data',
  'privacy.deleteAccount': 'Delete Account',
  'privacy.deleteAccount.description':
    'Permanently delete your account and all associated data. This action cannot be undone.',
  'privacy.deleteAccount.button': 'Delete My Account',
  'privacy.deleteAccount.confirmationTitle': 'Delete Your Account',
  'privacy.deleteAccount.confirmationDescription':
    'This action permanently deletes your account and all your data. This cannot be undone.',
  'privacy.deleteAccount.confirmationPrompt':
    'Please enter your email address to confirm deletion:',
  'privacy.deleteAccount.emailPlaceholder': 'Enter your email address',
  'privacy.deleteAccount.mismatchError':
    "The email address you entered doesn't match your account email.",
  'privacy.deleteAccount.confirm': 'Yes, Delete My Account',
  'privacy.deleteAccount.cancel': 'Cancel',
  'privacy.deleteAccount.emailSent': 'Verification Email Sent',
  'privacy.deleteAccount.emailSentDescription':
    "We've sent a verification link to your email address. Please check your inbox and click the link to complete the account deletion process.",
  'privacy.deleteAccount.emailSentNote':
    'For your security, the link expires after 30 minutes.',
  'privacy.backButton': 'Back',
  'privacy.error.generic': 'An error occurred',
  'privacy.error.tooManyRequests': 'Too many attempts. Please try again later.',
  'privacy.error.invalidUrl':
    'Error with redirect URL. Please try again later or contact support.',
  'privacy.success.accountDeleted': 'Account successfully deleted.',
  'privacy.dataExport.title': 'Your Data Export',
  'privacy.dataExport.description':
    'Here is all the data associated with your account:',
  'privacy.dataExport.button.close': 'Close',
  'privacy.dataExport.button.download': 'Download as JSON',
  'privacy.goBack': 'Go back',
  'privacy.policy.title': 'Privacy Policy',
  'privacy.policy.lastUpdated': 'Last updated:',
  'privacy.deleteAccount.verificationTitle': 'Enter Verification Code',
  'privacy.deleteAccount.verificationDescription': 'Enter the 6-digit code from the email we sent to complete account deletion.',
  'privacy.deleteAccount.deleteButton': 'Delete Account',
  'privacy.deleteAccount.deletingButton': 'Deleting Account...',
  'privacy.deleteAccount.resendEmail': "Didn't receive email? Click here to try again",
  'privacy.deleteAccount.resendSuccess': 'Verification email resent',
  'privacy.deleteAccount.resendFailed': 'Failed to resend email',
  'privacy.additionalRequests': 'Additional Requests',
  'privacy.additionalRequests.description': 'For any other data-related requests or questions about your privacy, please contact our data protection team.',
  'privacy.additionalRequests.contact': 'Contact Privacy Team',

  // Partners
  'partners.headline': 'Our partners',

  // Questionnaire Auth
  'qa.stepIndicator': 'Step 3 of 3',
  'qa.heading': 'Almost there!',
  'qa.subheading':
    'Enter your email so we can save your answers and send you the 6-digit login code',
  'qa.benefit.noPassword': 'No password required',
  'qa.benefit.free': 'Free of charge',
  'qa.benefit.crossDevice': 'Access your program on any device',

  // AuthContext translations
  'authContext.authenticationStateError': 'Authentication state error',
  'authContext.failedToCreateUserDocument': 'Failed to create user document',
  'authContext.noUserLoggedIn': 'No user is logged in',
  'authContext.failedToUpdateUserProfile': 'Failed to update user profile',
  'authContext.failedToGetUserProfile': 'Failed to get user profile',
  'authContext.failedToDeleteUserDocument': 'Failed to delete user document',
  'authContext.accountSuccessfullyDeleted':
    'Your account has been successfully deleted',
  'authContext.requiresRecentLogin':
    'For security reasons, please log in again before deleting your account',
  'authContext.failedToDeleteAccount': 'Failed to delete account',
  'authContext.linkExpiredOrUsedPWA':
    'This sign-in link has expired or already been used. Please use the 6-digit code that was sent to your email instead.',
  'authContext.linkExpiredOrUsedWeb':
    'The sign-in link has expired or already been used. Please request a new sign-in link.',
  'authContext.accountDisabled':
    'Your account has been disabled. Please contact support.',
  'authContext.userNotFound':
    'User not found. Please check your email or sign up.',
  'authContext.tooManyRequests':
    'Too many failed attempts. Please try again later.',
  'authContext.failedToSendLoginCode': 'Failed to send login code',
  'authContext.firebaseFunctionsNotAvailable':
    'Firebase Functions instance is not available.',
  'authContext.configurationError':
    'Configuration error. Please try again later.',
  'authContext.failedToSendSignInLink':
    'Failed to send sign-in link. Please try again.',
  'authContext.signingYouOut': 'Signing you out...',
  'authContext.failedToSignOut': 'Failed to sign out',
  'authContext.signedOut': 'Signed out',
  'authContext.programDeletedSuccessfully': 'Program deleted successfully',
  'authContext.failedToDeleteProgram': 'Failed to delete program',
  'authContext.mustBeLoggedInToDeleteProgram':
    'You must be logged in to delete programs',
  'authContext.programNotFound': 'Program not found',
  'authContext.notAuthorizedToDeleteProgram':
    'You are not authorized to delete this program',

  // Landing hero
  'landing.hero.title': 'Relieve Pain, Rebuild Strength',
  'landing.hero.subtitle': 'Custom training or rehab plan in under 2 minutes.',
  'landing.hero.ctaPain': 'I have pain',
  'landing.hero.ctaWorkout': 'Just need a workout',
  'landing.hero.reviews': 'reviews',
  'landing.hero.reviewsAria': 'Read customer reviews',
  'landing.hero.alt.select': 'Step 1: Select area on the 3D model with quick-start chips visible',
  'landing.hero.alt.chat': 'Step 2: Answer a short assessment question with three quick-replies',
  'landing.hero.alt.plan': 'Step 3: Program day snapshot showing week and three exercises',
  'landing.hero.ariaStack': 'Three-step product screenshots: select area, answer questions, see your plan',
  'landing.hero.caption': 'Select → Answer → Plan',

  // Landing page
  'landing.nav.how': 'How it works',
  'landing.nav.programs': 'Programs',
  'landing.nav.why': 'Why',
  'landing.nav.pricing': 'Pricing',
  'landing.nav.faq': 'FAQ',
  'landing.nav.demo': 'Demo',
  'landing.how.title': 'How it works',
  'landing.how.step1': 'Select body area & chat briefly',
  'landing.how.step2': '7 questions + safety red flags',
  'landing.how.step3': 'Get your plan',
  'landing.how.cta': 'Start assessment',
  // Labels for how-it-works overlay badges
  'landing.how.label.findArea': 'Find your painful area',
  'landing.how.label.discuss': 'Discuss your issue',
  'landing.how.label.execute': 'Execute your plan',

  'landing.programs.title': 'Get help with common injuries',
  'landing.programs.lower_back': 'Lower back pain',
  'landing.programs.runners_knee': "Runner's knee",
  'landing.programs.shoulder_pain': 'Shoulder pain',
  'landing.programs.tech_neck': 'Tech neck',
  'landing.programs.ankle_sprain': 'Ankle sprain',
  'landing.programs.plantar_fasciitis': 'Plantar fasciitis',
  'landing.programs.tennis_elbow': 'Tennis elbow',
  'landing.programs.hamstring_strain': 'Hamstring strain',
  'landing.programs.upper_back_core': 'Upper back & core',
  'landing.programs.core_stability': 'Core stability',
  'landing.programs.shin_splints': 'Shin splints',
  'landing.programs.meta.4weeks': '4 weeks',
  'landing.programs.meta.3xweek': '3×/week',
  'landing.programs.meta.20to30min': '20–30 min',
  'landing.programs.sampleWeek': 'See a sample week',

  'landing.why.title': 'Why it works',
  'landing.why.digitalTwin': 'Digital twin anatomy with precise targeting',
  'landing.why.dualAssistants': 'Dual assistants: anatomy + coach',
  'landing.why.personalization': 'Personalized by history, time and equipment',
  'landing.why.safety': 'Safety checks and red-flag screening',
  'landing.why.speed': 'Under 2 minutes to your first plan',
  'landing.why.disclaimer': 'This is not medical advice. Consult a clinician for diagnosis.',
  'landing.why.seekCare.title': 'When to seek care',
  'landing.why.seekCare.fever': 'Fever or feeling unwell',
  'landing.why.seekCare.trauma': 'Recent trauma or accident',
  'landing.why.seekCare.nightPain': 'Night pain that does not improve',
  'landing.why.seekCare.numbnessWeakness': 'Numbness or weakness',

  'landing.demo.title': 'Try a quick demo',
  'landing.demo.chat': 'Canned example conversation (no account needed):',
  'landing.demo.quick1': 'It hurts to bend',
  'landing.demo.quick2': 'I have limited time',
  'landing.demo.quick3': 'Prefer home workouts',
  'landing.demo.cta': 'Get my plan',

  'landing.pricing.title': 'Pricing',
  'landing.pricing.toggle': 'Toggle annual billing',
  'landing.pricing.monthly': 'Monthly',
  'landing.pricing.annual': 'Annual',
  'landing.pricing.monthlyPrice': '$9 / month',
  'landing.pricing.annualPrice': '$79 / year',
  'landing.pricing.note': 'No commitment. Cancel anytime.',
  'landing.pricing.try': 'Try free',
  'landing.pricing.seePlans': 'See plans',
  'landing.pricing.tier.free': 'Free',
  'landing.pricing.tier.premium': 'Premium',
  'landing.pricing.free.b1': 'First week unlocked',
  'landing.pricing.free.b2': 'Basic usage limits',
  'landing.pricing.free.b3': 'Create a plan without signing in',
  'landing.pricing.free.b4': 'Exercise videos and calendar',
  'landing.pricing.premium.b1': 'Weekly follow-ups from your feedback',
  'landing.pricing.premium.b2': 'Higher model/chat limits',
  'landing.pricing.premium.b3': 'Full exercise library & tracking',

  'landing.faq.title': 'FAQ',
  'landing.faq.q1': 'Do I need an account to start?',
  'landing.faq.a1': 'No. You can create a plan first and sign in later only to save it.',
  'landing.faq.q2': 'Is this safe if I have pain?',
  'landing.faq.a2': 'We screen for red flags and advise caution. For medical concerns, see a clinician. See the Safety page for guidance.',
  'landing.faq.q3': 'What do I get for free?',
  'landing.faq.a3': 'Explore assistant with a daily message cap, first week program unlocked, exercise videos and calendar. Follow-up generation is gated.',
  'landing.faq.q4': 'What do I get with Premium?',
  'landing.faq.a4': 'Weekly follow-up programs from your feedback, higher chat limits, full library and tracking. Cancel anytime from your account.',
  'landing.faq.q5': 'Does this diagnose my condition?',
  'landing.faq.a5': 'No. This is not a diagnosis. It provides education and self‑management guidance with safety screening. Seek care if you have red flags.',
  'landing.faq.q6': 'How long does it take to build a plan?',
  'landing.faq.a6': 'Usually under 2 minutes. A short assessment (~7 questions) creates your first plan.',
  'landing.faq.q7': 'Do I need to log in?',
  'landing.faq.a7': 'No to try it. Log in only if you want to save your program and sync across devices.',
  'landing.faq.q8': 'Can I cancel my subscription?',
  'landing.faq.a8': 'Yes. Manage billing in the Stripe portal from your account. You can cancel anytime.',
  'landing.faq.q9': 'What languages are supported?',
  'landing.faq.a9': 'English and Norwegian.',
  'landing.faq.q10': 'What data do you store?',
  'landing.faq.a10': 'Basic profile and program data needed to run the app. No unnecessary personal data. See the Privacy Policy for details.',
  'landing.faq.q11': 'Who is behind BodAI?',
  'landing.faq.a11': 'BodAI AS (Org no. 913705696), based in Oslo, Norway. Not a medical device.',
  'landing.faq.q12': 'How do weekly follow‑ups work?',
  'landing.faq.a12': 'After each week, share quick feedback and we generate the next week. This feature is available for subscribers.',

  // Consolidated FAQ titles and bodies
  'landing.faq.freePremium.title': 'What do I get for Free vs Premium?',
  'landing.faq.freePremium.desc': 'Start free to try the experience. Upgrade anytime to unlock weekly follow‑ups and higher limits.',
  'landing.faq.safety.title': 'Is this medical advice? When should I seek care?',
  'landing.faq.safety.desc': 'This is not medical advice. It provides education and self‑management with safety screening. If you have red‑flag symptoms, seek care.',
  'landing.faq.how.title': 'How it works',
  'landing.faq.how.p1': 'Answer a brief assessment (~7 questions). Your first plan is created in under 2 minutes.',
  'landing.faq.account.title': 'Do I need an account?',
  'landing.faq.account.p1': 'No to try it. Create an account only if you want to save your plan and sync across devices.',
  'landing.faq.billing.title': 'How do billing and cancellation work?',
  'landing.faq.billing.p1': 'Subscriptions are managed via Stripe. You can cancel anytime from your account portal.',
  'landing.faq.privacy.title': 'Privacy and data',
  'landing.faq.privacy.p1': 'We store only the data needed to run your program. See Privacy Policy for details. Languages supported: English and Norwegian.',

  'landing.footer.openApp': 'Open app',
  
  // Footer / Legal
  'footer.notMedicalDevice': 'Not a medical device',
  'footer.educationOnly': 'For education and self-management. Not a diagnosis or treatment.',
  'footer.medicalDisclaimer': 'Medical disclaimer & safety',
  'footer.privacyPolicy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.safety': 'Safety',
  'footer.company.label': 'Company details',
  'footer.company.org': 'Org no.',
  'footer.company.location': 'Location',
  
  // Subscribe page
  'subscribe.title': 'Unlock Weekly, Personalized Programs',
  'subscribe.subtitle': 'AI‑guided recovery and training, adapted to your feedback, available in English and Norwegian.',
  'subscribe.premium.heading': 'Everything in BodAI Premium',
  'subscribe.premium.benefit.weeklyFollowUp': 'Weekly follow‑up program tailored from your feedback',
  'subscribe.premium.benefit.library': 'Full exercise library with clear videos and modifications',
  'subscribe.premium.benefit.evidence': 'Evidence‑based recovery + strength programming',
  'subscribe.premium.benefit.calendar': 'Calendar & progress tracking across weeks',
  'subscribe.premium.benefit.multiLang': 'Multi‑language: English & Norwegian',
  'subscribe.premium.benefit.priority': 'Priority model access for faster responses',
  'subscribe.free.limits': 'Free plan limits: follow‑up program generation is locked, and chat/model interactions are limited. Upgrade to remove limits.',
  'subscribe.plan.monthly': 'Monthly',
  'subscribe.plan.annual': 'Annual',
  'subscribe.plan.founder': 'Founder Plan',
  'subscribe.plan.founderDesc': 'Internal subscription',
  'subscribe.price.monthly': 'NOK 99 / month',
  'subscribe.price.annual': 'NOK 899 / year',
  'subscribe.button.choose': 'Choose',
  'subscribe.button.redirecting': 'Redirecting…',
  'subscribe.footer.note': 'Secure checkout by Stripe. Cancel anytime from your account.',
  // Subscribe success
  'subscribe.success.title': 'Thanks for subscribing!',
  'subscribe.success.finalizing': 'Finalizing your subscription…',
  'subscribe.success.activating': 'Activating your subscription…',
  'subscribe.success.usuallySeconds': 'This usually takes a few seconds',
  'subscribe.success.active': 'Subscription active',
  'subscribe.success.openingFeedback': 'Opening feedback…',
  'subscribe.success.recordedLoading': 'Subscription recorded, loading your account…',

  // Weekly generation limit
  'weeklyLimit.title': 'Weekly Limit Reached',
  'weeklyLimit.message': 'You can only build one {{programType}} program per week.',
  'weeklyLimit.nextAllowed': 'You can build a new program on {{date}}.',
  'weeklyLimit.programType.exercise': 'exercise',
  'weeklyLimit.programType.recovery': 'recovery',
  'weeklyLimit.programType.exercise_and_recovery': 'exercise & recovery',
  'weeklyLimit.dismiss': 'Got it',

  // Privacy Policy Page
  'privacyPolicy.pageTitle': 'Privacy Policy',
  'privacyPolicy.back': 'Back',
  'privacyPolicy.header.title': 'Privacy Policy for BodAI',
  'privacyPolicy.header.subtitle': 'Your privacy matters to us',
  'privacyPolicy.header.lastUpdated': 'Last Updated: December 2025',
  'privacyPolicy.toc.title': 'Table of Contents',
  'privacyPolicy.footer.copyright': '© 2025 BodAI. All rights reserved.',
  'privacyPolicy.footer.effective': 'This policy is effective as of December 2025.',

  // Section 1 - Introduction
  'privacyPolicy.section1.title': '1. Introduction',
  'privacyPolicy.section1.p1': 'Welcome to BodAI ("we," "our," or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our health and fitness application and related services.',
  'privacyPolicy.section1.p2': 'BodAI is an AI-powered fitness application that provides personalized exercise programs and health guidance. Due to the nature of our service, we process health-related information which requires special protection under data protection laws.',
  'privacyPolicy.section1.p3': 'This policy complies with the General Data Protection Regulation (GDPR), the Norwegian Personal Data Act (Personopplysningsloven), and other applicable data protection laws.',

  // Section 2 - Data Controller
  'privacyPolicy.section2.title': '2. Data Controller',
  'privacyPolicy.section2.p1': 'BodAI is the data controller responsible for your personal data. We are based in Norway and comply with applicable Norwegian and European Union data protection laws.',
  'privacyPolicy.section2.contactLabel': 'Contact Information:',
  'privacyPolicy.section2.email': 'Email:',

  // Section 3 - Information We Collect
  'privacyPolicy.section3.title': '3. Information We Collect',
  'privacyPolicy.section3.intro': 'We collect the following categories of personal data:',
  'privacyPolicy.section3.account.title': '3.1 Account & Profile Data',
  'privacyPolicy.section3.account.item1': 'Email address (required for account creation)',
  'privacyPolicy.section3.account.item2': 'Display name',
  'privacyPolicy.section3.account.item3': 'Phone number (optional)',
  'privacyPolicy.section3.account.item4': 'Profile photo (optional, stored in cloud storage)',
  'privacyPolicy.section3.account.item5': 'Date of birth',
  'privacyPolicy.section3.account.item6': 'Gender',
  'privacyPolicy.section3.physical.title': '3.2 Physical Measurements',
  'privacyPolicy.section3.physical.item1': 'Height',
  'privacyPolicy.section3.physical.item2': 'Weight',
  'privacyPolicy.section3.exercise.title': '3.3 Exercise Preferences',
  'privacyPolicy.section3.exercise.item1': 'Fitness level and experience',
  'privacyPolicy.section3.exercise.item2': 'Exercise frequency and modalities',
  'privacyPolicy.section3.exercise.item3': 'Preferred workout duration and environment',
  'privacyPolicy.section3.exercise.item4': 'Target body areas',
  'privacyPolicy.section3.exercise.item5': 'Health and fitness goals',
  'privacyPolicy.section3.exercise.item6': 'Dietary preferences',
  'privacyPolicy.section3.ai.title': '3.4 AI Conversation Data',
  'privacyPolicy.section3.ai.item1': 'Chat messages and conversations with our AI assistant',
  'privacyPolicy.section3.ai.item2': 'Questions and responses about health topics',
  'privacyPolicy.section3.ai.item3': 'Selected body parts during consultations',
  'privacyPolicy.section3.generated.title': '3.5 Generated Content',
  'privacyPolicy.section3.generated.item1': 'Personalized exercise programs',
  'privacyPolicy.section3.generated.item2': 'Questionnaire responses',
  'privacyPolicy.section3.generated.item3': 'Program feedback and modifications',
  'privacyPolicy.section3.payment.title': '3.6 Payment Information',
  'privacyPolicy.section3.payment.item1': 'Subscription status and plan type',
  'privacyPolicy.section3.payment.item2': 'Stripe customer ID (payment processing identifier)',
  'privacyPolicy.section3.payment.item3': 'Subscription period dates',
  'privacyPolicy.section3.payment.note': 'Note: We do not store your credit card details. All payment processing is handled securely by Stripe.',
  'privacyPolicy.section3.technical.title': '3.7 Technical & Usage Data',
  'privacyPolicy.section3.technical.item1': 'Device information (type, operating system)',
  'privacyPolicy.section3.technical.item2': 'App usage statistics and interaction data',
  'privacyPolicy.section3.technical.item3': 'Language preferences',
  'privacyPolicy.section3.technical.item4': 'Authentication tokens',

  // Section 4 - Health Data
  'privacyPolicy.section4.title': '4. Health Data (Special Category)',
  'privacyPolicy.section4.warning': 'Important: Health data is considered "special category data" under GDPR Article 9 and requires your explicit consent to process.',
  'privacyPolicy.section4.intro': 'We collect the following health-related information to provide personalized fitness guidance:',
  'privacyPolicy.section4.medical.title': '4.1 Medical Information',
  'privacyPolicy.section4.medical.item1': 'Existing medical conditions',
  'privacyPolicy.section4.medical.item2': 'Current medications',
  'privacyPolicy.section4.medical.item3': 'Past and current injuries',
  'privacyPolicy.section4.medical.item4': 'Family health history',
  'privacyPolicy.section4.physical.title': '4.2 Physical Health Indicators',
  'privacyPolicy.section4.physical.item1': 'Areas of pain or discomfort',
  'privacyPolicy.section4.physical.item2': 'Sleep patterns',
  'privacyPolicy.section4.physical.item3': 'Fitness level assessments',
  'privacyPolicy.section4.why.title': '4.3 Why We Collect Health Data',
  'privacyPolicy.section4.why.intro': 'This health information is essential for us to:',
  'privacyPolicy.section4.why.item1': 'Generate safe, personalized exercise programs',
  'privacyPolicy.section4.why.item2': 'Avoid recommending exercises that could aggravate existing conditions',
  'privacyPolicy.section4.why.item3': 'Provide appropriate modifications for your situation',
  'privacyPolicy.section4.why.item4': 'Detect potential red flags requiring medical attention',
  'privacyPolicy.section4.consent.title': '4.4 Your Consent',
  'privacyPolicy.section4.consent.p1': 'By providing health information and using our service, you explicitly consent to our processing of this special category data for the purposes described. You may withdraw this consent at any time by deleting your account, though this will affect our ability to provide personalized services.',

  // Section 5 - Third-Party Services
  'privacyPolicy.section5.title': '5. Third-Party Services',
  'privacyPolicy.section5.intro': 'We use trusted third-party services to operate BodAI. Each processor is bound by data protection agreements and processes data only as instructed by us.',
  'privacyPolicy.section5.firebase.name': 'Firebase (Google Cloud)',
  'privacyPolicy.section5.firebase.purpose': 'Purpose: Core infrastructure',
  'privacyPolicy.section5.firebase.item1': 'Authentication (email sign-in)',
  'privacyPolicy.section5.firebase.item2': 'Database (Firestore) - stores user profiles, programs, chats',
  'privacyPolicy.section5.firebase.item3': 'Cloud Storage - profile photos',
  'privacyPolicy.section5.firebase.item4': 'Analytics - usage statistics',
  'privacyPolicy.section5.firebase.item5': 'Cloud Functions - backend processing',
  'privacyPolicy.section5.firebase.privacy': 'Privacy Policy:',
  'privacyPolicy.section5.openai.name': 'OpenAI',
  'privacyPolicy.section5.openai.purpose': 'Purpose: AI-powered features',
  'privacyPolicy.section5.openai.item1': 'Processing chat conversations about health and fitness',
  'privacyPolicy.section5.openai.item2': 'Generating personalized exercise programs',
  'privacyPolicy.section5.openai.item3': 'Providing educational health information',
  'privacyPolicy.section5.stripe.name': 'Stripe',
  'privacyPolicy.section5.stripe.purpose': 'Purpose: Payment processing',
  'privacyPolicy.section5.stripe.item1': 'Subscription payments and billing',
  'privacyPolicy.section5.stripe.item2': 'Customer portal for subscription management',
  'privacyPolicy.section5.stripe.item3': 'Payment method storage (we never see your card details)',
  'privacyPolicy.section5.resend.name': 'Resend',
  'privacyPolicy.section5.resend.purpose': 'Purpose: Email delivery',
  'privacyPolicy.section5.resend.item1': 'Sending authentication codes',
  'privacyPolicy.section5.resend.item2': 'Account-related notifications',
  'privacyPolicy.section5.youtube.name': 'YouTube API (Google)',
  'privacyPolicy.section5.youtube.purpose': 'Purpose: Exercise videos',
  'privacyPolicy.section5.youtube.item1': 'Searching for exercise demonstration videos',
  'privacyPolicy.section5.youtube.item2': 'Embedding video content within the app',

  // Section 6 - AI Processing
  'privacyPolicy.section6.title': '6. AI & Automated Processing',
  'privacyPolicy.section6.intro': "BodAI uses artificial intelligence to provide personalized health and fitness guidance. It's important you understand how this works:",
  'privacyPolicy.section6.how.title': '6.1 How AI Processes Your Data',
  'privacyPolicy.section6.how.item1.label': 'Chat Conversations:',
  'privacyPolicy.section6.how.item1.text': 'When you chat with our AI assistant, your messages (including any health information you share) are sent to OpenAI for processing.',
  'privacyPolicy.section6.how.item2.label': 'Program Generation:',
  'privacyPolicy.section6.how.item2.text': 'Your health profile, questionnaire responses, and preferences are sent to OpenAI to generate personalized exercise programs.',
  'privacyPolicy.section6.how.item3.label': 'Educational Content:',
  'privacyPolicy.section6.how.item3.text': 'AI generates explanations about anatomy, exercises, and health topics based on your queries.',
  'privacyPolicy.section6.automated.title': '6.2 Automated Decision-Making',
  'privacyPolicy.section6.automated.p1': 'Our AI assists in generating exercise recommendations, but these are suggestions for educational purposes only. We do not make fully automated decisions that have legal or similarly significant effects on you under GDPR Article 22.',
  'privacyPolicy.section6.oversight.title': '6.3 Human Oversight',
  'privacyPolicy.section6.oversight.p1': 'Our AI includes safety protocols to detect red flags for serious medical conditions and will recommend consulting healthcare professionals when appropriate. The AI is not a replacement for professional medical advice.',
  'privacyPolicy.section6.disclaimer': 'Important: AI-generated content is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for medical concerns.',

  // Section 7 - How We Use Data
  'privacyPolicy.section7.title': '7. How We Use Your Data',
  'privacyPolicy.section7.intro': 'We use your information for the following purposes:',
  'privacyPolicy.section7.service.title': '7.1 Service Delivery',
  'privacyPolicy.section7.service.item1': 'Creating and managing your account',
  'privacyPolicy.section7.service.item2': 'Generating personalized exercise programs',
  'privacyPolicy.section7.service.item3': 'Providing AI-powered health and fitness guidance',
  'privacyPolicy.section7.service.item4': 'Processing subscriptions and payments',
  'privacyPolicy.section7.personalization.title': '7.2 Personalization',
  'privacyPolicy.section7.personalization.item1': 'Tailoring exercise recommendations to your fitness level and goals',
  'privacyPolicy.section7.personalization.item2': 'Adapting programs based on your health conditions and limitations',
  'privacyPolicy.section7.personalization.item3': 'Remembering your preferences across sessions',
  'privacyPolicy.section7.communication.title': '7.3 Communication',
  'privacyPolicy.section7.communication.item1': 'Sending authentication codes for secure sign-in',
  'privacyPolicy.section7.communication.item2': 'Notifying you about important account changes',
  'privacyPolicy.section7.communication.item3': 'Responding to your inquiries and support requests',
  'privacyPolicy.section7.improvement.title': '7.4 Improvement & Analytics',
  'privacyPolicy.section7.improvement.item1': 'Understanding how users interact with our app',
  'privacyPolicy.section7.improvement.item2': 'Improving our services and user experience',
  'privacyPolicy.section7.improvement.item3': 'Identifying and fixing technical issues',
  'privacyPolicy.section7.legal.title': '7.5 Legal Compliance',
  'privacyPolicy.section7.legal.item1': 'Complying with applicable laws and regulations',
  'privacyPolicy.section7.legal.item2': 'Protecting against fraudulent or illegal activity',
  'privacyPolicy.section7.legal.item3': 'Enforcing our terms of service',

  // Section 8 - Legal Basis
  'privacyPolicy.section8.title': '8. Legal Basis for Processing',
  'privacyPolicy.section8.intro': 'We process your data based on the following legal grounds under GDPR:',
  'privacyPolicy.section8.consent.title': 'Consent (Article 6(1)(a) & Article 9(2)(a))',
  'privacyPolicy.section8.consent.text': 'For processing health data (special category data) and optional profile information. You can withdraw consent at any time.',
  'privacyPolicy.section8.contract.title': 'Contract Performance (Article 6(1)(b))',
  'privacyPolicy.section8.contract.text': 'For account management, service delivery, and subscription processing - necessary to fulfill our agreement with you.',
  'privacyPolicy.section8.legitimate.title': 'Legitimate Interests (Article 6(1)(f))',
  'privacyPolicy.section8.legitimate.text': 'For analytics, service improvement, and security measures - balanced against your rights and freedoms.',
  'privacyPolicy.section8.legal.title': 'Legal Obligation (Article 6(1)(c))',
  'privacyPolicy.section8.legal.text': 'For maintaining financial records and complying with applicable laws.',

  // Section 9 - Data Retention
  'privacyPolicy.section9.title': '9. Data Retention',
  'privacyPolicy.section9.intro': 'We retain your data for specific periods based on its purpose:',
  'privacyPolicy.section9.table.header.type': 'Data Type',
  'privacyPolicy.section9.table.header.period': 'Retention Period',
  'privacyPolicy.section9.table.account': 'Account & Profile Data',
  'privacyPolicy.section9.table.accountPeriod': 'Until you delete your account',
  'privacyPolicy.section9.table.health': 'Health Information',
  'privacyPolicy.section9.table.healthPeriod': 'Until you delete your account',
  'privacyPolicy.section9.table.programs': 'Exercise Programs',
  'privacyPolicy.section9.table.programsPeriod': 'Until you delete your account',
  'privacyPolicy.section9.table.chat': 'Chat History',
  'privacyPolicy.section9.table.chatPeriod': '12 months after last activity, or until account deletion',
  'privacyPolicy.section9.table.payment': 'Payment Records',
  'privacyPolicy.section9.table.paymentPeriod': '7 years (legal requirement)',
  'privacyPolicy.section9.table.analytics': 'Analytics Data',
  'privacyPolicy.section9.table.analyticsPeriod': '26 months',
  'privacyPolicy.section9.table.auth': 'Authentication Codes',
  'privacyPolicy.section9.table.authPeriod': '1 hour (automatically deleted)',
  'privacyPolicy.section9.deletion': 'When you delete your account, we will erase your personal data within 30 days, except where retention is required by law (e.g., financial records).',

  // Section 10 - Data Sharing
  'privacyPolicy.section10.title': '10. Data Sharing & Disclosure',
  'privacyPolicy.section10.intro': 'We may share your information in the following circumstances:',
  'privacyPolicy.section10.providers.title': '10.1 Service Providers',
  'privacyPolicy.section10.providers.text': 'With the third-party services listed in Section 5, who process data on our behalf under strict contractual obligations.',
  'privacyPolicy.section10.legal.title': '10.2 Legal Requirements',
  'privacyPolicy.section10.legal.text': 'When required by law, court order, or governmental authority, or to protect our legal rights.',
  'privacyPolicy.section10.business.title': '10.3 Business Transfers',
  'privacyPolicy.section10.business.text': 'In connection with a merger, acquisition, or sale of assets, where your data may be transferred to the new entity (you would be notified of such transfer).',
  'privacyPolicy.section10.consent.title': '10.4 With Your Consent',
  'privacyPolicy.section10.consent.text': 'For any other purpose with your explicit consent.',
  'privacyPolicy.section10.noSale': 'We do not sell your personal data. We never sell, rent, or trade your personal information to third parties for their marketing purposes.',

  // Section 11 - International Transfers
  'privacyPolicy.section11.title': '11. International Data Transfers',
  'privacyPolicy.section11.intro': 'BodAI is based in Norway, within the European Economic Area (EEA). However, some of our service providers operate outside the EEA:',
  'privacyPolicy.section11.us.title': 'United States',
  'privacyPolicy.section11.us.openai': 'OpenAI - AI processing',
  'privacyPolicy.section11.us.stripe': 'Stripe - Payment processing',
  'privacyPolicy.section11.us.google': 'Google/Firebase - Infrastructure (EU/US depending on configuration)',
  'privacyPolicy.section11.safeguards.title': 'Safeguards for International Transfers',
  'privacyPolicy.section11.safeguards.intro': 'When transferring data outside the EEA, we ensure appropriate safeguards are in place:',
  'privacyPolicy.section11.safeguards.item1': 'Standard Contractual Clauses (SCCs) approved by the European Commission',
  'privacyPolicy.section11.safeguards.item2': 'Data Processing Agreements with each provider',
  'privacyPolicy.section11.safeguards.item3': 'Assessment of the legal framework in the recipient country',
  'privacyPolicy.section11.request': 'You may request a copy of the safeguards we use for international transfers by contacting us at',

  // Section 12 - Your Rights
  'privacyPolicy.section12.title': '12. Your Data Protection Rights',
  'privacyPolicy.section12.intro': 'Under GDPR, you have the following rights regarding your personal data:',
  'privacyPolicy.section12.access.title': 'Right to Access',
  'privacyPolicy.section12.access.text': 'Request a copy of your personal data we hold.',
  'privacyPolicy.section12.rectification.title': 'Right to Rectification',
  'privacyPolicy.section12.rectification.text': 'Request correction of inaccurate or incomplete data.',
  'privacyPolicy.section12.erasure.title': 'Right to Erasure',
  'privacyPolicy.section12.erasure.text': 'Request deletion of your personal data ("right to be forgotten").',
  'privacyPolicy.section12.restriction.title': 'Right to Restriction',
  'privacyPolicy.section12.restriction.text': 'Request limitation of processing in certain circumstances.',
  'privacyPolicy.section12.portability.title': 'Right to Data Portability',
  'privacyPolicy.section12.portability.text': 'Receive your data in a structured, machine-readable format.',
  'privacyPolicy.section12.object.title': 'Right to Object',
  'privacyPolicy.section12.object.text': 'Object to processing based on legitimate interests.',
  'privacyPolicy.section12.withdraw.title': 'Right to Withdraw Consent',
  'privacyPolicy.section12.withdraw.text': "Withdraw consent at any time (this won't affect prior processing).",
  'privacyPolicy.section12.howTo': 'How to Exercise Your Rights:',
  'privacyPolicy.section12.howToText': 'You can export your data and delete your account directly from the Privacy section in your Profile settings. For other requests, contact us at',
  'privacyPolicy.section12.responseTime': 'We will respond within 30 days.',

  // Section 13 - Security
  'privacyPolicy.section13.title': '13. Data Security',
  'privacyPolicy.section13.intro': 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction:',
  'privacyPolicy.section13.encryption.label': 'Encryption:',
  'privacyPolicy.section13.encryption.text': 'Data is encrypted in transit (TLS/SSL) and at rest',
  'privacyPolicy.section13.auth.label': 'Authentication:',
  'privacyPolicy.section13.auth.text': 'Secure email-based authentication with time-limited codes',
  'privacyPolicy.section13.access.label': 'Access Control:',
  'privacyPolicy.section13.access.text': 'Strict access controls limiting who can access data',
  'privacyPolicy.section13.infra.label': 'Infrastructure:',
  'privacyPolicy.section13.infra.text': 'Cloud infrastructure with industry-standard security certifications',
  'privacyPolicy.section13.monitoring.label': 'Monitoring:',
  'privacyPolicy.section13.monitoring.text': 'Regular security monitoring and vulnerability assessments',
  'privacyPolicy.section13.note': 'While we strive to protect your data, no method of transmission or storage is 100% secure. If you become aware of any security issues, please contact us immediately at',

  // Section 14 - Cookies
  'privacyPolicy.section14.title': '14. Cookies & Local Storage',
  'privacyPolicy.section14.intro': 'We use browser storage technologies to improve your experience:',
  'privacyPolicy.section14.local.title': '14.1 Local Storage',
  'privacyPolicy.section14.local.item1.label': 'Authentication:',
  'privacyPolicy.section14.local.item1.text': 'Email for sign-in, authentication tokens',
  'privacyPolicy.section14.local.item2.label': 'Preferences:',
  'privacyPolicy.section14.local.item2.text': 'Language settings, UI preferences',
  'privacyPolicy.section14.local.item3.label': 'Session State:',
  'privacyPolicy.section14.local.item3.text': 'Chat state, viewer state for continuity',
  'privacyPolicy.section14.session.title': '14.2 Session Storage',
  'privacyPolicy.section14.session.item1': 'Temporary authentication flow data',
  'privacyPolicy.section14.session.item2': 'Temporary chat state during navigation',
  'privacyPolicy.section14.analytics.title': '14.3 Firebase Analytics',
  'privacyPolicy.section14.analytics.text': 'We use Firebase Analytics (in production only) which may set cookies to understand app usage. This data is anonymized and used for improving our service.',
  'privacyPolicy.section14.clear': 'You can clear local storage through your browser settings, though this may require you to sign in again and reset your preferences.',

  // Section 15 - Children
  'privacyPolicy.section15.title': "15. Children's Privacy",
  'privacyPolicy.section15.p1': 'Our services are not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16.',
  'privacyPolicy.section15.p2': 'If you are a parent or guardian and believe your child has provided us with personal data, please contact us at',
  'privacyPolicy.section15.p2end': 'We will promptly delete such information from our systems.',

  // Section 16 - Changes
  'privacyPolicy.section16.title': '16. Changes to This Policy',
  'privacyPolicy.section16.p1': 'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors.',
  'privacyPolicy.section16.p2': 'When we make material changes, we will:',
  'privacyPolicy.section16.item1': 'Update the "Last Updated" date at the top of this policy',
  'privacyPolicy.section16.item2': 'Notify you via email or in-app notification for significant changes',
  'privacyPolicy.section16.item3': 'Obtain new consent if required for processing activities',
  'privacyPolicy.section16.p3': 'We encourage you to review this policy periodically. Continued use of our service after changes constitutes acceptance of the updated policy.',

  // Section 17 - Contact
  'privacyPolicy.section17.title': '17. Contact Us',
  'privacyPolicy.section17.intro': 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
  'privacyPolicy.section17.team': 'BodAI Privacy Team',
  'privacyPolicy.section17.response': 'We aim to respond to all inquiries within 30 days. For urgent matters related to data security, please indicate this in your subject line.',

  // Section 18 - Complaints
  'privacyPolicy.section18.title': '18. Complaints',
  'privacyPolicy.section18.intro': 'If you believe that our processing of your personal data infringes data protection laws, you have the right to lodge a complaint with a supervisory authority.',
  'privacyPolicy.section18.authority': 'Norwegian Data Protection Authority',
  'privacyPolicy.section18.authorityName': 'Datatilsynet',
  'privacyPolicy.section18.website': 'Website:',
  'privacyPolicy.section18.encourage': 'We encourage you to contact us first at',
  'privacyPolicy.section18.encourageEnd': 'so we can try to resolve your concern directly.',
};

export default translations;
