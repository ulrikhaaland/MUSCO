'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useClientUrl } from '../hooks/useClientUrl';
import {
  getPendingQuestionnaire,
  deletePendingQuestionnaire,
  submitQuestionnaire,
} from '../services/questionnaire';
import { ExtendedUser, UserProfile } from '../types/user';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: Error | null;
  sendSignInLink: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  createUserDoc: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
                        () => {
                          setLoading(false);
                        }
                      );

                      // Delete the pending questionnaire
                      await deletePendingQuestionnaire(email);
                      console.log('Questionnaire processed successfully');
                    }
                  } catch (error) {
                    console.error(
                      'Error processing pending questionnaire:',
                      error
                    );
                    setError(
                      error instanceof Error
                        ? error
                        : new Error('Failed to process questionnaire')
                    );
                  }
                } else {
                  setLoading(false);
                }
              }

              // Clean up localStorage
              window.localStorage.removeItem('emailForSignIn');
              window.localStorage.removeItem('hasPendingQuestionnaire');

              // Clear the URL to remove the sign-in link
              window.history.replaceState(null, '', window.location.pathname);
            } catch (error) {
              console.error('Error signing in with email link:', error);
              setError(
                error instanceof Error
                  ? error
                  : new Error('Failed to sign in with email link')
              );
            }
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in handleEmailLink:', error);
        setError(
          error instanceof Error
            ? error
            : new Error('Failed to handle email link')
        );
      } finally {
        if (user) {
          setLoading(false);
        }
      }
    };

    handleEmailLink();
  }, [href, isReady]);

  // Set up auth state listener after handling email link
  useEffect(() => {
    if (!isReady || handledEmailLink.current) return;

    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
        if (firebaseUser) {
          try {
            // Fetch user profile data
            const profileData = await fetchUserProfile(firebaseUser.uid);
            // Create extended user with profile data
            const extendedUser = {
              ...firebaseUser,
              profile: profileData || undefined
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
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
      throw error;
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user is logged in');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Get current data
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.exists() ? userDoc.data() as UserProfile : {};
      
      // Merge with new data
      const updatedData = {
        ...currentData,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      // Save to Firestore
      await setDoc(userDocRef, updatedData);
      
      // Update local user state
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: updatedData
        };
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      return await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const sendSignInLink = async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      
      // Force a full page reload to reset all Firebase listeners and application state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
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
        sendSignInLink,
        logOut,
        createUserDoc,
        updateUserProfile,
        getUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
