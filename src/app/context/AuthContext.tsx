'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
  const { locale } = useTranslation();
  const { setIsLoading: showGlobalLoader, hideLoader } = useLoader();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handledEmailLink = useRef(false);

  // Handle email link sign-in first
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const handleEmailLink = async () => {
      if (handledEmailLink.current) return;

      try {
        if (isSignInWithEmailLink(auth, href)) {
          console.log('Valid email link detected');
          handledEmailLink.current = true;
          setLoading(true);
          showGlobalLoader(true, 'Signing you in...');
          setError(null);

          let email = window.localStorage.getItem('emailForSignIn');
          if (!email) {
            email = window.prompt('Please provide your email for confirmation');
          }

          if (email) {
            console.log('Attempting to sign in with email link...');
            try {
              const result = await signInWithEmailLink(auth, email, href);

              if (result.user !== null) {
                console.log('Sign in successful, creating user document...');
                setUser(result.user);

                // Create user document if it doesn't exist
                const userRef = doc(db, `users/${result.user.uid}`);
                await setDoc(userRef, {
                  email: result.user.email,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });

                // Check if there's a pending questionnaire
                const hasPendingQuestionnaire = window.localStorage.getItem(
                  'hasPendingQuestionnaire'
                );
                if (hasPendingQuestionnaire) {
                  console.log('Processing pending questionnaire...');
                  try {
                    // Get the pending questionnaire data
                    const data = await getPendingQuestionnaire(email);

                    if (data) {
                      // Submit the questionnaire
                      await submitQuestionnaire(
                        result.user.uid,
                        data.diagnosis,
                        data.answers,
                        undefined,
                        () => {
                          setLoading(false);
                        }
                      );

                      // Delete the pending questionnaire
                      await deletePendingQuestionnaire(email);
                      console.log('Questionnaire processed successfully');
                    } else {
                      setLoading(false);
                    }
                  } catch (error) {
                    console.error(
                      'Error processing pending questionnaire:',
                      error
                    );
                    handleAuthError(
                      error,
                      'Failed to process questionnaire',
                      true
                    );
                    setLoading(false);
                  }
                } else {
                  setLoading(false);
                }
              } else {
                setLoading(false);
              }

              // Clean up localStorage
              window.localStorage.removeItem('emailForSignIn');
              window.localStorage.removeItem('hasPendingQuestionnaire');

              // Clear the URL to remove the sign-in link
              window.history.replaceState(null, '', window.location.pathname);
            } catch (error) {
              console.error('Error signing in with email link:', error);
              handleAuthError(error, 'Failed to sign in with email link', true);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        } else {
          // No email link, let auth state listener handle auth state
          handledEmailLink.current = false;
        }
      } catch (error) {
        console.error('Error in handleEmailLink:', error);
        handleAuthError(error, 'Failed to handle email link', true);
        setLoading(false);
        showGlobalLoader(false);
      }
    };

    handleEmailLink();
  }, [href, isReady]);

  // Set up auth state listener after handling email link
  useEffect(() => {
    if (!isReady || handledEmailLink.current) return;

    console.log('Setting up auth state listener...');
    showGlobalLoader(true, 'Checking login status...');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log(
          'Auth state changed:',
          firebaseUser ? 'User logged in' : 'No user'
        );
        if (firebaseUser) {
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
            setUser(firebaseUser as ExtendedUser);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
        showGlobalLoader(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        handleAuthError(error, 'Authentication state error', false);
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
      return handleAuthError(error, 'Failed to create user document', false);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user is logged in');

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
      return handleAuthError(error, 'Failed to update user profile', false);
    }
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      return await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Error getting user profile:', error);
      handleAuthError(error, 'Failed to get user profile', false);
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
      return handleAuthError(error, 'Failed to delete user document', false);
    }
  };

  const deleteUserAccount = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      toast.error('No user is logged in');
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

      toast.success('Your account has been successfully deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting user account:', error);

      // Handle specific Firebase error codes
      if (error.code === 'auth/requires-recent-login') {
        toast.error(
          'For security reasons, please log in again before deleting your account'
        );
        return false;
      }

      handleAuthError(error, 'Failed to delete account', false);
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

    // Set the error state
    setError(error instanceof Error ? error : new Error(fallbackMessage));

    // Determine the error message to display
    let displayMessage = fallbackMessage;

    // Handle specific Firebase error codes
    if (error instanceof Error && 'code' in error) {
      switch (error.code as string) {
        case 'auth/invalid-action-code':
          displayMessage =
            'The sign-in link has expired or already been used. Please request a new sign-in link.';
          break;
        case 'auth/user-disabled':
          displayMessage =
            'Your account has been disabled. Please contact support.';
          break;
        case 'auth/user-not-found':
          displayMessage =
            'User not found. Please check your email or sign up.';
          break;
        case 'auth/too-many-requests':
          displayMessage = 'Too many failed attempts. Please try again later.';
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
    try {
      await sendCustomSignInLink(email);
      // await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    } catch (error) {
      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      } catch (error) {
        console.error('Error sending sign-in link:', error);
        return handleAuthError(error, 'Failed to send sign-in link', false);
      }
    }
  };

  const sendCustomSignInLink = async (email: string) => {
    // Store email locally for sign-in completion
    window.localStorage.setItem('emailForSignIn', email);
    try {
      // Ensure functions is initialized before calling httpsCallable
      if (!functions) {
        console.error('Firebase Functions instance is not available.');
        toast.error('Configuration error. Please try again later.');
        return;
      }
      const origin = window.location.origin; // Get current origin
      const sendLoginEmail = httpsCallable(functions, 'sendLoginEmail');
      
      // Check if running in standalone mode (PWA)
      const isPwa = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
      
      // Pass email, origin, language, AND isPwa flag
      await sendLoginEmail({ email, origin, language: locale, isPwa });
    } catch (error) {
      console.error('Error calling sendLoginEmail function:', error);
      // Use toast directly for user feedback
      toast.error('Failed to send sign-in link. Please try again.');
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
      
      showGlobalLoader(true, 'Signing you out...');
      await signOut(auth);
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
      return handleAuthError(error, 'Failed to sign out', false);
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
