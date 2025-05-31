'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth';
import { auth, db, functions } from '../firebase/config';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useClientUrl } from '../hooks/useClientUrl';
import { useRouter } from 'next/navigation';
import {
  getPendingQuestionnaire,
  deletePendingQuestionnaire,
  submitQuestionnaire,
} from '../services/questionnaire';
import { ExtendedUser, UserProfile } from '../types/user';
import { toast } from '../components/ui/ToastProvider';
import { httpsCallable } from 'firebase/functions';
import { useTranslation } from '../i18n';
import { useLoader } from './LoaderContext';
import { logAnalyticsEvent } from '../utils/analytics';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: Error | null;
  errorMessage: string | null;
  sendSignInLink: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  createUserDoc: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
  deleteUserDoc: (uid: string) => Promise<void>;
  deleteUserAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
  // This must be true.
  handleCodeInApp: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { href, isReady } = useClientUrl();
  const router = useRouter();
  const { locale, t } = useTranslation();
  const { setIsLoading: showGlobalLoader, hideLoader } = useLoader();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handledEmailLink = useRef(false);

  // Set up auth state listener after handling email link
  useEffect(() => {
    if (!isReady || handledEmailLink.current) return;

    console.log('Setting up auth state listener...');
    showGlobalLoader(true, t('auth.checkingLoginStatus'));

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log(
          'Auth state changed:',
          firebaseUser ? 'User logged in' : 'No user'
        );
        if (firebaseUser) {
          logAnalyticsEvent('login');
          try {
            // Fetch user profile data
            const profileData = await fetchUserProfile(firebaseUser.uid);
            // Create extended user with profile data
            const extendedUser = {
              ...firebaseUser,
              profile: profileData || undefined,
            } as ExtendedUser;

            setUser(extendedUser);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(firebaseUser as ExtendedUser); // Set user even if profile fetch fails
          }
          setLoading(false); // Auth loading complete for logged-in user
          // Global loader hiding for logged-in user based on path (existing logic)
          if (window.location.pathname !== '/' && window.location.pathname !== '/program') {
            showGlobalLoader(false);
          }
        } else { // No user is signed in
          setUser(null);
          setLoading(false); // Auth context loading is done
          showGlobalLoader(false); // Auth process is complete, hide global loader

          // If not logged in, and not already on the home page, redirect to home.
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            router.push('/');
          }
        }
      },
      (error) => { // onAuthStateChanged error
        console.error('Auth state change error:', error);
        handleAuthError(error, t('authContext.authenticationStateError'), false);
        setLoading(false);
        showGlobalLoader(false);
      }
    );

    // Safety timeout: ensure loading state is eventually set to false
    // even if auth operations take too long or fail silently
    const safetyTimer = setTimeout(() => {
      console.log('Auth loading safety timeout triggered');
      setLoading(false);
      showGlobalLoader(false);
    }, 10000); // 10 seconds max loading time

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
      showGlobalLoader(false);
    };
  }, [isReady]);

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserDoc = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, `users/${user.uid}`);
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      return handleAuthError(error, t('authContext.failedToCreateUserDocument'), false);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error(t('authContext.noUserLoggedIn'));

    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Get current data
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.exists()
        ? (userDoc.data() as UserProfile)
        : {};

      // Merge with new data
      const updatedData = {
        ...currentData,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(userDocRef, updatedData);

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: updatedData,
        };
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return handleAuthError(error, t('authContext.failedToUpdateUserProfile'), false);
    }
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      return await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Error getting user profile:', error);
      handleAuthError(error, t('authContext.failedToGetUserProfile'), false);
      return null;
    }
  };

  const deleteUserDoc = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef);
      console.log('User document deleted successfully');
    } catch (error) {
      console.error('Error deleting user document:', error);
      return handleAuthError(error, t('authContext.failedToDeleteUserDocument'), false);
    }
  };

  const deleteUserAccount = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      toast.error(t('authContext.noUserLoggedIn'));
      return false;
    }

    try {
      const uid = auth.currentUser.uid;

      // First delete the user document from Firestore
      try {
        await deleteUserDoc(uid);
      } catch (firestoreError) {
        console.error('Error deleting user document:', firestoreError);
        // Continue with account deletion even if document deletion fails
      }

      // Then delete the authentication account
      await deleteUser(auth.currentUser);

      toast.success(t('authContext.accountSuccessfullyDeleted'));
      logAnalyticsEvent('delete_account');
      return true;
    } catch (error: any) {
      console.error('Error deleting user account:', error);

      // Handle specific Firebase error codes
      if (error.code === 'auth/requires-recent-login') {
        toast.error(
          t('authContext.requiresRecentLogin')
        );
        return false;
      }

      handleAuthError(error, t('authContext.failedToDeleteAccount'), false);
      return false;
    }
  };

  // Helper function to handle auth errors
  const handleAuthError = (
    error: any,
    fallbackMessage: string,
    shouldRedirect = false
  ) => {
    // Log the error for debugging
    console.error('Authentication error:', error);
    logAnalyticsEvent('auth_error', { code: error?.code || 'unknown' });

    // Set the error state
    setError(error instanceof Error ? error : new Error(fallbackMessage));

    // Determine the error message to display
    let displayMessage = fallbackMessage;

    // Check if we're in PWA mode
    const isPwa =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://'));

    // Handle specific Firebase error codes
    if (error instanceof Error && 'code' in error) {
      switch (error.code as string) {
        case 'auth/invalid-action-code':
          displayMessage = isPwa
            ? t('authContext.linkExpiredOrUsedPWA')
            : t('authContext.linkExpiredOrUsedWeb');
          // For PWA users with invalid link, redirect to code input page
          if (isPwa) {
            setTimeout(() => {
              router.push('/login?showcode=true');
            }, 1500); // Delay to allow toast to show
          }
          break;
        case 'auth/user-disabled':
          displayMessage =
            t('authContext.accountDisabled');
          break;
        case 'auth/user-not-found':
          displayMessage =
            t('authContext.userNotFound');
          break;
        case 'auth/too-many-requests':
          displayMessage = t('authContext.tooManyRequests');
          break;
        // Add other specific error codes as needed
      }
    }

    // Reset authentication state if needed for certain errors
    if (
      error instanceof Error &&
      'code' in error &&
      ['auth/invalid-action-code', 'auth/user-disabled'].includes(
        error.code as string
      )
    ) {
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('hasPendingQuestionnaire');
    }

    // Show toast notification
    toast.error(displayMessage);

    // Redirect to the root page if needed
    if (shouldRedirect) {
      // Use Next.js router for client-side transition (keeps toast visible)
      setLoading(false);
      // router.push('/');
    }

    // For non-redirect cases, still need to return a rejected promise
    if (!shouldRedirect) {
      return Promise.reject(error);
    }
  };

  const sendSignInLink = async (email: string) => {
    // Now just send the one-time code e-mail via Cloud Function
    try {
      await sendCustomSignInLink(email);
      logAnalyticsEvent('send_login_link');
    } catch (error) {
      console.error('Error sending login code:', error);
      return handleAuthError(error, t('authContext.failedToSendLoginCode'), false);
    }
  };

  const sendCustomSignInLink = async (email: string) => {
    // Store email locally for sign-in completion
    window.localStorage.setItem('emailForSignIn', email);
    try {
      // Ensure functions is initialized before calling httpsCallable
      if (!functions) {
        console.error('Firebase Functions instance is not available.');
        toast.error(t('authContext.configurationError'));
        return;
      }
      const origin = window.location.origin; // Get current origin
      const sendLoginEmail = httpsCallable(functions, 'sendLoginEmail');

      // Check if running in standalone mode (PWA)
      const isPwa =
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone ||
          document.referrer.includes('android-app://'));

      // Pass email, origin, language, AND isPwa flag
      await sendLoginEmail({ email, origin, language: locale, isPwa });
    } catch (error) {
      console.error('Error calling sendLoginEmail function:', error);
      // Use toast directly for user feedback
      toast.error(t('authContext.failedToSendSignInLink'));
      // Rethrow if you want calling code to be aware of the failure
      // throw error;
      // Or adapt handleAuthError if needed
      // return handleAuthError(error, 'Failed to send sign-in link', false);
    }
  };

  const logOut = async () => {
    try {
      // Mark the body as logging out to prevent issues
      document.body.classList.add('logging-out');

      showGlobalLoader(true, t('authContext.signingYouOut'));
      await signOut(auth);
      logAnalyticsEvent('logout');
      setUser(null); // Optimistically set user to null

      // Clear authentication related localStorage items
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('codeRequestTimestamp');

      // Hide loader before navigation
      hideLoader();

      // Add a small delay before navigation to ensure loader state is updated
      setTimeout(() => {
        // Use the router for a cleaner transition
        router.push('/login');
      }, 100);

      // Safety timeout to ensure loader is hidden even if navigation fails
      setTimeout(() => {
        hideLoader();
        document.body.classList.remove('logging-out');
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      hideLoader();
      document.body.classList.remove('logging-out');
      return handleAuthError(error, t('authContext.failedToSignOut'), false);
    }
  };

  // Show loading state while waiting for initialization
  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        errorMessage,
        sendSignInLink,
        logOut,
        createUserDoc,
        updateUserProfile,
        getUserProfile,
        deleteUserDoc,
        deleteUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
