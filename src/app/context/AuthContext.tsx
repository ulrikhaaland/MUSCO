'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { auth, db, functions } from '../firebase/config';
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useClientUrl } from '../hooks/useClientUrl';
import { useRouter } from 'next/navigation';
// removed unused questionnaire imports
import { ExtendedUser, UserProfile } from '../types/user';
import { ExerciseProgram } from '../types/program';
import { toast } from '../components/ui/ToastProvider';
import { httpsCallable } from 'firebase/functions';
import { useTranslation } from '../i18n';
import { logAnalyticsEvent } from '../utils/analytics';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: Error | null;
  errorMessage: string | null;
  sendSignInLink: (email: string, program?: ExerciseProgram) => Promise<void>;
  sendAccountDeletionEmail: (email: string, redirectUrl: string) => Promise<void>;
  logOut: () => Promise<void>;
  createUserDoc: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
  deleteUserDoc: (uid: string) => Promise<void>;
  deleteUserAccount: () => Promise<boolean>;
  deleteProgram: (programId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isReady } = useClientUrl();
  const router = useRouter();
  const { locale, t } = useTranslation();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage] = useState<string | null>(null);
  const handledEmailLink = useRef(false);
  const profileUnsubscribeRef = useRef<null | (() => void)>(null);

  // Set up auth state listener after handling email link
  useEffect(() => {
    if (!isReady || handledEmailLink.current) return;

    console.log('Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
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

            // Live subscription to user profile for real-time subscription status
            try {
              // Clean up any previous listener
              profileUnsubscribeRef.current?.();
              profileUnsubscribeRef.current = onSnapshot(
                doc(db, 'users', firebaseUser.uid),
                (snapshot) => {
                  const data = snapshot.exists() ? (snapshot.data() as any) : null;
                  setUser((prev) => (prev ? { ...prev, profile: data || prev.profile } as ExtendedUser : prev));
                }
              );
            } catch (e) {
              console.error('Failed to subscribe to user profile changes', e);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(firebaseUser as ExtendedUser); // Set user even if profile fetch fails
          }
          setLoading(false); // Auth loading complete for logged-in user
          // no-op: global loader removed
        } else {
          // No user is signed in
          setUser(null);
          // Clean up profile listener
          profileUnsubscribeRef.current?.();
          profileUnsubscribeRef.current = null;
          setLoading(false); // Auth context loading is done

          // If not logged in, and not already on the home page, redirect to home.
          // But skip if we're in the middle of an account deletion flow
          const isAccountDeleting = typeof window !== 'undefined' && sessionStorage.getItem('accountDeleted');
          
          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/' &&
            window.location.pathname !== '/exercises' &&
            !window.location.pathname.includes('/program/') &&
            !isAccountDeleting
          ) {
            router.push('/');
          }
        }
      } catch (error) {
        // onAuthStateChanged error
        console.error('Auth state change error:', error);
        handleAuthError(
          error,
          t('authContext.authenticationStateError'),
          false
        );
        setLoading(false);
      }
    });

    // Safety timeout: ensure loading state is eventually set to false
    // even if auth operations take too long or fail silently
    const safetyTimer = setTimeout(() => {
      console.log('Auth loading safety timeout triggered');
      setLoading(false);
      
    }, 10000); // 10 seconds max loading time

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
      profileUnsubscribeRef.current?.();
      profileUnsubscribeRef.current = null;
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

      // User document doesn't exist, create it automatically
      const newUserDoc = {
        email: auth.currentUser?.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newUserDoc);
      console.log('User document created automatically during login');
      
      return newUserDoc as UserProfile;
    } catch (error) {
      console.error('Error fetching/creating user profile:', error);
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
      return handleAuthError(
        error,
        t('authContext.failedToCreateUserDocument'),
        false
      );
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
      return handleAuthError(
        error,
        t('authContext.failedToUpdateUserProfile'),
        false
      );
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
      return handleAuthError(
        error,
        t('authContext.failedToDeleteUserDocument'),
        false
      );
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
      console.log('🔥 Attempting to delete user authentication account...');
      await deleteUser(auth.currentUser);

      toast.success(t('authContext.accountSuccessfullyDeleted'));
      logAnalyticsEvent('delete_account');
      return true;
    } catch (error: any) {

      // Handle specific Firebase error codes
      if (error.code === 'auth/requires-recent-login') {
        console.log('🚨 Requires recent login error detected, throwing to privacy page...');
        // Don't show toast here, let the privacy page handle the re-authentication flow
        throw error; // Throw the error so the privacy page can catch it
      }

      handleAuthError(error, t('authContext.failedToDeleteAccount'), false);
      return false;
    }
  };

  const deleteProgram = async (programId: string): Promise<boolean> => {
    if (!user) {
      toast.error(t('authContext.noUserLoggedIn'));
      return false;
    }

    try {
      // Delete the program document directly from Firestore
      const programDocRef = doc(db, 'users', user.uid, 'programs', programId);
      await deleteDoc(programDocRef);

      toast.success(t('authContext.programDeletedSuccessfully'));
      logAnalyticsEvent('delete_program', { programId });
      return true;
    } catch (error: any) {
      console.error('Error deleting program:', error);

      // Handle Firestore error codes
      let errorMessage = t('authContext.failedToDeleteProgram');
      
      if (error.code === 'permission-denied') {
        errorMessage = t('authContext.notAuthorizedToDeleteProgram');
      } else if (error.code === 'not-found') {
        errorMessage = t('authContext.programNotFound');
      }

      toast.error(errorMessage);
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
          displayMessage = t('authContext.accountDisabled');
          break;
        case 'auth/user-not-found':
          displayMessage = t('authContext.userNotFound');
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

  const sendSignInLink = async (email: string, program?: ExerciseProgram) => {
    // Check if running in standalone mode (PWA)
    const isPwa =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://'));

    const origin = window.location.origin; // This should be the clean URL without query params
    const sendLoginEmail = httpsCallable(functions, 'sendLoginEmail');
    
    const requestData: any = { 
      email, 
      origin, 
      language: locale,
      isPwa 
    };
    
    // Include program data if provided
    if (program) {
      // Check if we have a recovery program stored in sessionStorage with UserProgram structure
      const recoveryProgramData = window.sessionStorage.getItem('currentRecoveryProgram');
      if (recoveryProgramData) {
        try {
          const parsed = JSON.parse(recoveryProgramData);
          // If we have the new UserProgram structure, use that
          if (parsed.userProgram) {
            requestData.program = parsed.userProgram;
          } else {
            // Fallback to the simple program structure
            requestData.program = program;
          }
        } catch (error) {
          console.error('Error parsing recovery program data:', error);
          requestData.program = program;
        }
      } else {
        // Regular program (not recovery)
        requestData.program = program;
      }
    }

    // Optimistic fire-and-forget: do not await the network call
    sendLoginEmail(requestData)
      .then(() => {
        logAnalyticsEvent('send_login_link');
      })
      .catch((error) => {
        console.error('Error sending login code:', error);
        handleAuthError(
          error,
          t('authContext.failedToSendLoginCode'),
          false
        );
      });
  };

  const sendAccountDeletionEmail = async (email: string, redirectUrl: string) => {
    // Check if running in standalone mode (PWA)
    const isPwa =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://'));

    const origin = window.location.origin;
    const sendLoginEmail = httpsCallable(functions, 'sendLoginEmail');
    
    const requestData = { 
      email, 
      origin, 
      language: locale,
      isPwa,
      redirectUrl // Include the custom redirect URL for account deletion
    };

    // Optimistic fire-and-forget: do not await the network call
    sendLoginEmail(requestData)
      .then(() => {
        logAnalyticsEvent('send_account_deletion_link');
      })
      .catch((error) => {
        console.error('Error sending account deletion email:', error);
        handleAuthError(
          error,
          t('authContext.failedToSendLoginCode'),
          false
        );
      });
  };

  const logOut = async () => {
    try {
      // Mark the body as logging out to prevent issues
      document.body.classList.add('logging-out');
      await signOut(auth);
      logAnalyticsEvent('logout');
      setUser(null); // Optimistically set user to null

      // Clear authentication related localStorage items
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('codeRequestTimestamp');

      // Mark that this navigation comes from an explicit logout
      try {
        window.sessionStorage.setItem('justLoggedOut', 'true');
      } catch {}

      // Add a small delay before navigation to ensure loader state is updated
      setTimeout(() => {
        // Use the router for a cleaner transition
        router.push('/login');
      }, 100);

      // Safety timeout to ensure loader is hidden even if navigation fails
      setTimeout(() => {
        document.body.classList.remove('logging-out');
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      document.body.classList.remove('logging-out');
      return handleAuthError(error, t('authContext.failedToSignOut'), false);
    }
  };

  // Always provide context so global loaders can read loading state immediately

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        errorMessage,
        sendSignInLink,
        sendAccountDeletionEmail,
        logOut,
        createUserDoc,
        updateUserProfile,
        getUserProfile,
        deleteUserDoc,
        deleteUserAccount,
        deleteProgram,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
