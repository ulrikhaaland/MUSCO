'use client';

import { createContext, useContext, useEffect, useState, useRef, Suspense } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { getPendingQuestionnaire, deletePendingQuestionnaire, submitQuestionnaire } from '../services/questionnaire';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  sendSignInLink: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  createUserDoc: () => Promise<void>;
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

function SearchParamsProvider({ children }: { children: (href: string) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const [href, setHref] = useState<string>('');

  useEffect(() => {
    setHref(window.location.href);
  }, []);

  // Don't render children until we have the href on the client side
  if (!href) return null;

  return <>{children(href)}</>;
}

function AuthProviderContent({ href, children }: { href: string; children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const handledEmailLink = useRef(false);

  // Handle email link sign-in first
  useEffect(() => {
    const handleEmailLink = async () => {
      console.log('Checking for email link sign-in...');
      if (typeof window === 'undefined') return;
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
                const hasPendingQuestionnaire = window.localStorage.getItem('hasPendingQuestionnaire');
                if (hasPendingQuestionnaire) {
                  console.log('Processing pending questionnaire...');
                  try {
                    // Get the pending questionnaire data
                    const data = await getPendingQuestionnaire(email);

                    if (data) {
                      setLoading(false);
                      // Submit the questionnaire
                      await submitQuestionnaire(result.user.uid, data.diagnosis, data.answers);
                      // Delete the pending questionnaire
                      await deletePendingQuestionnaire(email);
                      console.log('Questionnaire processed successfully');
                    }
                  } catch (error) {
                    console.error('Error processing pending questionnaire:', error);
                    setError(error instanceof Error ? error : new Error('Failed to process questionnaire'));
                  }
                }
              }

              // Clean up localStorage
              window.localStorage.removeItem('emailForSignIn');
              window.localStorage.removeItem('hasPendingQuestionnaire');

              // Clear the URL to remove the sign-in link
              window.history.replaceState(null, '', window.location.pathname);
            } catch (error) {
              console.error('Error signing in with email link:', error);
              setError(error instanceof Error ? error : new Error('Failed to sign in with email link'));
            }
          }
        }
      } catch (error) {
        console.error('Error in handleEmailLink:', error);
        setError(error instanceof Error ? error : new Error('Failed to handle email link'));
      } finally {
        setLoading(false);
      }
    };

    handleEmailLink();
  }, [href]);

  // Set up auth state listener after handling email link
  useEffect(() => {
    if (handledEmailLink.current) return;

    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, sendSignInLink, logOut, createUserDoc }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SearchParamsProvider>
        {(href) => <AuthProviderContent href={href}>{children}</AuthProviderContent>}
      </SearchParamsProvider>
    </Suspense>
  );
}

export const useAuth = () => useContext(AuthContext);
