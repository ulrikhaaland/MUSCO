import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
// Ensure you have service account credentials configured
// See: https://firebase.google.com/docs/admin/setup
admin.initializeApp();

// Import and re-export your functions from their new handler files
export {sendLoginEmail, validateAuthCode} from './handlers/auth';
// export {sendWeeklyProgramReminder} from './handlers/notifications';
