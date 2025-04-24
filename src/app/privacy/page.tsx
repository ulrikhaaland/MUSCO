'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types/user';
import { toast } from '../components/ui/ToastProvider';

export default function PrivacyPage() {
  const router = useRouter();
  const { user, loading: authLoading, deleteUserAccount } = useAuth();
  const [verificationEmail, setVerificationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [showDataExport, setShowDataExport] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<'initial' | 'email-sent' | null>(null);
  
  // Check if the user is returning from an email link for deletion
  const checkForDeletionLink = async () => {
    if (typeof window === 'undefined') return;
    
    const auth = getAuth();
    const currentUrl = window.location.href;
    
    // If user is coming back from a deletion confirmation email
    if (currentUrl.includes('?deleteAccount=true') && isSignInWithEmailLink(auth, currentUrl)) {
      // Check if we're in a delete account flow
      const isDeleteFlow = localStorage.getItem('isDeleteAccountFlow');
      
      if (isDeleteFlow === 'true') {
        try {
          setIsLoading(true);
          
          // Wait a moment for the AuthContext to complete the sign in
          // The auth context will handle the sign-in portion
          setTimeout(async () => {
            try {
              // Clean up localStorage first
              localStorage.removeItem('emailForSignIn');
              localStorage.removeItem('isDeleteAccountFlow');
              
              // Now use the centralized account deletion function
              const success = await deleteUserAccount();
              
              if (success) {
                // Add a slight delay before navigating away to allow toast to be seen
                setTimeout(() => {
                  // Navigate to home page after successful deletion
                  window.location.href = '/'; // Use direct navigation instead of router to force a full page reload
                }, 1500);
              } else {
                setIsLoading(false);
              }
            } catch (err: any) {
              console.error('Error in deletion flow:', err);
              setError(err instanceof Error ? err.message : 'An error occurred during account deletion');
              setIsLoading(false);
            }
          }, 2000); // Give AuthContext time to process the sign-in
        } catch (err: any) {
          console.error('Error in deletion flow:', err);
          setError(err instanceof Error ? err.message : 'An error occurred during account deletion');
          setIsLoading(false);
        }
      }
    }
  };
  
  // Use useEffect after the function is defined
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkForDeletionLink();
    }
  }, []);
  
  if (authLoading || !user) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify the email matches before attempting to delete
      if (verificationEmail.toLowerCase() !== user.email.toLowerCase()) {
        setError("The email address you entered doesn't match your account email.");
        setIsLoading(false);
        return;
      }
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not found or not authenticated');
      }
      
      try {
        // Try using the centralized deletion function
        const success = await deleteUserAccount();
        
        if (success) {
          // Redirect after successful deletion
          setTimeout(() => {
            window.location.href = '/'; // Use direct navigation instead of router
          }, 1500);
          return;
        }
      } catch (deleteErr: any) {
        // If error is about requiring recent authentication, send a sign-in link
        if (deleteErr.code === 'auth/requires-recent-login') {
          console.log('Re-authentication required, sending email link...');
        } else {
          throw deleteErr;
        }
      }
      
      // If we reach here, we need to send a sign-in link for re-authentication
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      if (!origin) {
        throw new Error('Unable to determine application URL');
      }
      
      // Configure the action code settings with a fully qualified domain
      const actionCodeSettings = {
        // URL you want to redirect back to after sign-in
        url: `${origin}/privacy?deleteAccount=true`,
        handleCodeInApp: true,
      };
      
      // Send sign-in link to the user's email
      await sendSignInLinkToEmail(auth, user.email, actionCodeSettings);
      
      // Move to the email-sent state
      setDeleteAccountStep('email-sent');
      
      // Store the email in localStorage - use the same key as AuthContext does
      // This allows the existing email link handler to find it
      localStorage.setItem('emailForSignIn', user.email);
      
      // Also store a flag to indicate this is for account deletion
      localStorage.setItem('isDeleteAccountFlow', 'true');
    } catch (err: any) {
      console.error('Error initiating account deletion:', err);
      
      // Provide error message
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/invalid-continue-uri') {
        setError('Error with redirect URL. Please try again later or contact support.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while preparing account deletion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Export all user data including the complete profile
      const userData = {
        // Basic user info
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.metadata?.creationTime,
        lastSignIn: user.metadata?.lastSignInTime,
        
        // Full profile data
        profile: user.profile || {} as Partial<UserProfile>
      };
      
      // If user doesn't have profile data yet, try to fetch from Firestore
      if (!user.profile) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Safely cast the Firestore data
            userData.profile = userDoc.data() as Partial<UserProfile>;
          }
        } catch (err) {
          console.error('Error fetching profile data from Firestore:', err);
        }
      }
      
      setExportData(JSON.stringify(userData, null, 2));
      setShowDataExport(true);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while exporting your data');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteAccountDialog = () => {
    setError(null);
    setVerificationEmail('');
    setDeleteAccountStep('initial');
    setIsLoading(false);
  };
  
  const closeDeleteAccountDialog = () => {
    setDeleteAccountStep(null);
    setVerificationEmail('');
  };

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen">
      <div className="py-3 px-4 flex items-center justify-between">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="ml-2">Back</span>
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">Privacy Center</h1>
        </div>
        
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
      </div>

      <div className="flex-1">
        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Privacy information section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Privacy Matters</h2>
            <p className="text-gray-300 mb-4">
              We take your privacy seriously. This page allows you to manage your data and understand how we protect your information.
            </p>
            <button
              onClick={() => router.push('/privacy-policy')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 w-full flex items-center justify-between"
            >
              <span>View Privacy Policy</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Data export section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Data</h2>
            <p className="text-gray-300 mb-4">
              Under GDPR, you have the right to access and export your personal data.
            </p>
            
            {!showDataExport ? (
              <button
                onClick={handleExportData}
                disabled={isLoading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 w-full flex items-center justify-center"
              >
                {isLoading ? 'Preparing Data...' : 'Export My Data'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-60">
                  <pre className="text-gray-300 text-sm">{exportData}</pre>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      // Create a download link for the data
                      const dataBlob = new Blob([exportData], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download JSON
                  </button>
                  <button
                    onClick={() => setShowDataExport(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete account section - only show the button here */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Delete Account</h2>
            <p className="text-gray-300 mb-4">
              You have the right to be forgotten. Deleting your account will permanently remove all your personal data from our systems.
            </p>
            
            {/* Delete account button */}
            <button
              onClick={openDeleteAccountDialog}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full flex items-center justify-between"
            >
              <span>Delete My Account</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Contact for data requests */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Additional Requests</h2>
            <p className="text-gray-300 mb-4">
              For any other data-related requests or questions about your privacy, please contact our data protection team.
            </p>
            <a
              href="mailto:privacy@musco-app.com"
              className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-center"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
      
      {/* Delete account modals - positioned fixed over everything */}
      {/* Initial confirmation step - only step needed if auth is fresh */}
      {deleteAccountStep === 'initial' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
          onClick={closeDeleteAccountDialog}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full m-4 shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Delete Your Account</h3>
            <p className="text-gray-300 mb-4">
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </p>
            <p className="text-gray-300 mb-6">
              To proceed, please enter your email address to confirm.
            </p>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}>
              <input
                type="email"
                value={verificationEmail}
                onChange={(e) => setVerificationEmail(e.target.value)}
                placeholder={user?.email || 'your@email.com'}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || verificationEmail !== user?.email}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg flex-1 ${
                    isLoading || verificationEmail !== user?.email ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Delete My Account'}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteAccountDialog}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg flex-1 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Email sent confirmation */}
      {deleteAccountStep === 'email-sent' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
          onClick={closeDeleteAccountDialog}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full m-4 shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4 text-center">Email Sent</h3>
            <p className="text-gray-300 mb-6 text-center">
              We&apos;ve sent a confirmation link to your email address ({user?.email}).
              Please check your inbox and click the link to complete the account deletion process.
            </p>
            
            <button
              onClick={closeDeleteAccountDialog}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 