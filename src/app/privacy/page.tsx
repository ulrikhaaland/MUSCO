'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { UserProfile } from '../types/user';
import { toast } from '../components/ui/ToastProvider';
import { useTranslation } from '../i18n/TranslationContext';
import { VerificationCodeInput } from '../components/ui/VerificationCodeInput';

export default function PrivacyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading, deleteUserAccount, sendAccountDeletionEmail } = useAuth();
  const [verificationEmail, setVerificationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [showDataExport, setShowDataExport] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<'initial' | 'email-sent' | 'code-input' | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false); // Flag to prevent double navigation
  
  // Check if the user is returning from an email link for deletion
  const checkForDeletionLink = async () => {
    if (typeof window === 'undefined') return;
    
    const auth = getAuth();
    const currentUrl = window.location.href;
    
    console.log('Checking for deletion link. Current URL:', currentUrl);
    console.log('Is sign-in with email link?', isSignInWithEmailLink(auth, currentUrl));
    
    // If user is coming back from a deletion confirmation email
    if (currentUrl.includes('?deleteAccount=true') && isSignInWithEmailLink(auth, currentUrl)) {
      // Check if we're in a delete account flow
      const isDeleteFlow = localStorage.getItem('isDeleteAccountFlow');
      const storedEmail = localStorage.getItem('emailForSignIn');
      
      console.log('Delete flow detected. isDeleteFlow:', isDeleteFlow, 'storedEmail:', storedEmail);
      
      if (isDeleteFlow === 'true') {
        try {
          setIsLoading(true);
          
          console.log('Starting email link sign-in for account deletion...');
          
          // First complete the sign-in with the email link
          if (storedEmail) {
            try {
              await signInWithEmailLink(auth, storedEmail, currentUrl);
              console.log('Email link sign-in completed successfully');
            } catch (signInError: any) {
              console.error('Error signing in with email link:', signInError);
              setError(`Failed to authenticate: ${signInError.message}`);
              setIsLoading(false);
              return;
            }
          }
          
          // Wait a moment for the auth state to update
          setTimeout(async () => {
            try {
              // Clean up localStorage first
              localStorage.removeItem('emailForSignIn');
              localStorage.removeItem('isDeleteAccountFlow');
              
              console.log('Attempting account deletion after re-authentication...');
              
              // Now use the centralized account deletion function
              const success = await deleteUserAccount();
              
              if (success) {
                console.log('Account deletion successful, redirecting...');
                setIsAccountDeleting(true); // Set flag to prevent AuthContext double navigation
                
                // Set a flag in sessionStorage to prevent AuthContext from also redirecting
                sessionStorage.setItem('accountDeleted', 'true');
                
                // Use router navigation instead of window.location.href
                setTimeout(() => {
                  router.push('/');
                  // Clean up the flag after navigation
                  sessionStorage.removeItem('accountDeleted');
                }, 1500);
              } else {
                console.error('Account deletion returned false');
                setError('Account deletion failed. Please try again.');
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
          <p className="text-white text-lg">{t('privacy.loading')}</p>
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
        console.log('🔄 Calling deleteUserAccount from privacy page...');
        const success = await deleteUserAccount();
        
        console.log('✅ deleteUserAccount returned:', success);
        if (success) {
          // Redirect after successful deletion
          setIsAccountDeleting(true); // Set flag to prevent AuthContext double navigation
          
          // Set a flag in sessionStorage to prevent AuthContext from also redirecting
          sessionStorage.setItem('accountDeleted', 'true');
          
          setTimeout(() => {
            router.push('/');
            // Clean up the flag after navigation
            sessionStorage.removeItem('accountDeleted');
          }, 1500);
          return;
        }
      } catch (deleteErr: any) {
        console.log('🎯 Caught error from deleteUserAccount:', deleteErr);
        console.log('🎯 Error code:', deleteErr.code);
        console.log('🎯 Error message:', deleteErr.message);
        
        // If error is about requiring recent authentication, send a sign-in link
        if (deleteErr.code === 'auth/requires-recent-login') {
          console.log('✉️ Re-authentication required, sending email link...');
          
          try {
            // Use the app's existing email infrastructure for account deletion re-authentication
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            
            if (!origin) {
              throw new Error('Unable to determine application URL');
            }
            
            const redirectUrl = `${origin}/privacy?deleteAccount=true`;
            
            console.log('📧 Sending re-authentication email to:', user.email);
            console.log('🔗 Redirect URL:', redirectUrl);
            
            // Send account deletion email using the app's existing email infrastructure
            await sendAccountDeletionEmail(user.email, redirectUrl);
            
            console.log('✅ Re-authentication email sent successfully');
            
            // Store the email and flags for the deletion flow
            localStorage.setItem('emailForSignIn', user.email);
            localStorage.setItem('isDeleteAccountFlow', 'true');
            
            // Move to the code-input state to allow users to enter the code
            setDeleteAccountStep('code-input');
            setIsLoading(false);
            return;
            
          } catch (emailErr: any) {
            console.error('❌ Error sending re-authentication email:', emailErr);
            
            // Provide specific error messages for common issues
            if (emailErr.code === 'auth/invalid-continue-uri') {
              throw new Error('Email configuration error. Please contact support.');
            } else if (emailErr.code === 'auth/unauthorized-continue-uri') {
              throw new Error('Unauthorized redirect URL. Please contact support.');
            } else {
              throw new Error(`Failed to send re-authentication email: ${emailErr.message}`);
            }
          }
        } else {
          console.log('❌ Non-reauth error, throwing:', deleteErr);
          throw deleteErr;
        }
      }
      
      // This shouldn't be reached anymore since we modified deleteUserAccount to throw the error
      throw new Error('Account deletion failed for unknown reason');
      
    } catch (err: any) {
      console.error('Error initiating account deletion:', err);
      
      // Provide error message
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.message?.includes('Email configuration error') || err.message?.includes('Unauthorized redirect URL')) {
        setError(err.message);
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
    setAuthCode('');
    setCodeError(null);
  };

  const handleCodeValidation = async (codeToValidate: string) => {
    if (!user?.email || isLoading) return;

    setIsLoading(true);
    setCodeError(null);

    try {
      console.log('🔍 Validating account deletion code...');
      
      // Call the Cloud Function to validate the code
      const validateAuthCode = httpsCallable(functions, 'validateAuthCode');
      const result = await validateAuthCode({ email: user.email, code: codeToValidate });

      // Get the sign-in link from the result
      const data = result.data as { link: string };
      console.log('📥 Code validation result:', { hasLink: !!data?.link });

      if (!data || !data.link) {
        throw new Error('Invalid response from server');
      }

      // Use the link to sign in for re-authentication
      console.log('🔐 Re-authenticating with email link...');
      const auth = getAuth();
      await signInWithEmailLink(auth, user.email, data.link);
      console.log('✅ Re-authentication successful');

      // Clean up localStorage
      localStorage.removeItem('emailForSignIn');
      localStorage.removeItem('isDeleteAccountFlow');

      // Now proceed with account deletion
      console.log('🗑️ Proceeding with account deletion...');
      const success = await deleteUserAccount();

      if (success) {
        console.log('✅ Account deletion successful, redirecting...');
        setIsAccountDeleting(true); // Set flag to prevent AuthContext double navigation
        
        // Set a flag in sessionStorage to prevent AuthContext from also redirecting
        sessionStorage.setItem('accountDeleted', 'true');
        
        // Use router navigation instead of window.location.href
        setTimeout(() => {
          router.push('/');
          // Clean up the flag after navigation
          sessionStorage.removeItem('accountDeleted');
        }, 1500);
      } else {
        setCodeError('Account deletion failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Error validating code:', err);
      
      if (err.code === 'not-found') {
        setCodeError('Invalid or expired code. Please try again.');
      } else if (err.code === 'already-exists') {
        setCodeError('This code has already been used. Please request a new one.');
      } else if (err.code === 'deadline-exceeded') {
        setCodeError('This code has expired. Please request a new one.');
      } else if (err.code === 'invalid-argument') {
        setCodeError('Invalid code. Please check and try again.');
      } else {
        setCodeError('Failed to validate code. Please try again.');
      }
      setIsLoading(false);
    }
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
          <span className="ml-2">{t('privacy.backButton')}</span>
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">{t('privacy.title')}</h1>
        </div>
        
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
      </div>

      <div className="flex-1">
        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Privacy information section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{t('privacy.dataControl')}</h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.dataControl.description')}
            </p>
            <button
              onClick={() => router.push('/privacy-policy')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 w-full flex items-center justify-between"
            >
              <span>{t('privacy.policy.title')}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Data export section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{t('privacy.exportData')}</h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.exportData.description')}
            </p>
            
            {!showDataExport ? (
              <button
                onClick={handleExportData}
                disabled={isLoading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 w-full flex items-center justify-center"
              >
                {isLoading ? t('privacy.loading') : t('privacy.exportData.button')}
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
                    {t('privacy.dataExport.button.download')}
                  </button>
                  <button
                    onClick={() => setShowDataExport(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                  >
                    {t('privacy.dataExport.button.close')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete account section - only show the button here */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{t('privacy.deleteAccount')}</h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.deleteAccount.description')}
            </p>
            
            {/* Delete account button */}
            <button
              onClick={openDeleteAccountDialog}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full flex items-center justify-between"
            >
              <span>{t('privacy.deleteAccount.button')}</span>
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
            <h3 className="text-xl font-bold text-white mb-4">{t('privacy.deleteAccount.confirmationTitle')}</h3>
            <p className="text-gray-300 mb-4">
              {t('privacy.deleteAccount.confirmationDescription')}
            </p>
            <p className="text-gray-300 mb-6">
              {t('privacy.deleteAccount.confirmationPrompt')}
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
                  {isLoading ? t('privacy.loading') : t('privacy.deleteAccount.confirm')}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteAccountDialog}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg flex-1 hover:bg-gray-600"
                >
                  {t('privacy.deleteAccount.cancel')}
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
            
            <h3 className="text-xl font-bold text-white mb-4 text-center">{t('privacy.deleteAccount.emailSent')}</h3>
            <p className="text-gray-300 mb-4">
              {t('privacy.deleteAccount.emailSentDescription')}
            </p>
            <p className="text-gray-400 mb-6 text-sm">
              {t('privacy.deleteAccount.emailSentNote')}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteAccountStep('code-input')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex-1 hover:bg-indigo-500"
              >
                Enter Code Instead
              </button>
              <button
                onClick={closeDeleteAccountDialog}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg flex-1 hover:bg-gray-600"
              >
                {t('privacy.deleteAccount.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code input dialog */}
      {deleteAccountStep === 'code-input' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
          onClick={closeDeleteAccountDialog}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full m-4 shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <svg className="w-16 h-16 text-indigo-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4 text-center">Enter Verification Code</h3>
            <p className="text-gray-300 mb-6 text-center">
              Enter the 6-digit code from the email we sent to complete account deletion.
            </p>
            
            {codeError && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{codeError}</p>
              </div>
            )}
            
            <VerificationCodeInput
              value={authCode}
              onChange={(value) => {
                setAuthCode(value);
                setCodeError(null);
              }}
              onSubmit={handleCodeValidation}
              error={codeError}
              isLoading={isLoading}
              placeholder="Enter 6-digit code"
              submitButtonText="Delete Account"
              submitButtonLoadingText="Deleting Account..."
              submitButtonVariant="danger"
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setDeleteAccountStep('email-sent')}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl flex-1 hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // Resend the email by going back to email-sent state
                  setDeleteAccountStep('email-sent');
                }}
                className="text-indigo-400 hover:text-indigo-300 text-sm underline"
              >
                Didn&apos;t receive email? Click here to try again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overall loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-white text-lg">{t('privacy.loading')}</p>
          </div>
        </div>
      )}
    </div>
  );
} 