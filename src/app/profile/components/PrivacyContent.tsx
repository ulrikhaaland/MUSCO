'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailLink } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, functions } from '@/app/firebase/config';
import { UserProfile } from '@/app/types/user';
import { toast } from '@/app/components/ui/ToastProvider';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { VerificationCodeInput } from '@/app/components/ui/VerificationCodeInput';

interface PrivacyContentProps {
  isDesktop?: boolean;
}

export default function PrivacyContent({ isDesktop = false }: PrivacyContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, deleteUserAccount, sendAccountDeletionEmail } = useAuth();
  const [verificationEmail, setVerificationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [showDataExport, setShowDataExport] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<'initial' | 'code-input' | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
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
        const success = await deleteUserAccount();
        
        if (success) {
          sessionStorage.setItem('accountDeleted', 'true');
          setTimeout(() => {
            router.push('/');
            sessionStorage.removeItem('accountDeleted');
          }, 1500);
          return;
        }
      } catch (deleteErr: any) {
        if (deleteErr.code === 'auth/requires-recent-login') {
          try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            if (!origin) throw new Error('Unable to determine application URL');
            
            const redirectUrl = `${origin}/privacy?deleteAccount=true`;
            await sendAccountDeletionEmail(user.email, redirectUrl);
            
            localStorage.setItem('emailForSignIn', user.email);
            localStorage.setItem('isDeleteAccountFlow', 'true');
            
            setDeleteAccountStep('code-input');
            setIsLoading(false);
            return;
          } catch (emailErr: any) {
            if (emailErr.code === 'auth/invalid-continue-uri') {
              throw new Error('Email configuration error. Please contact support.');
            } else if (emailErr.code === 'auth/unauthorized-continue-uri') {
              throw new Error('Unauthorized redirect URL. Please contact support.');
            } else {
              throw new Error(`Failed to send re-authentication email: ${emailErr.message}`);
            }
          }
        } else {
          throw deleteErr;
        }
      }
      
      throw new Error('Account deletion failed for unknown reason');
    } catch (err: any) {
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
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.metadata?.creationTime,
        lastSignIn: user.metadata?.lastSignInTime,
        profile: user.profile || {} as Partial<UserProfile>
      };
      
      if (!user.profile) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
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
      const validateAuthCode = httpsCallable(functions, 'validateAuthCode');
      const result = await validateAuthCode({ email: user.email, code: codeToValidate });
      const data = result.data as { link: string };

      if (!data || !data.link) {
        throw new Error('Invalid response from server');
      }

      const auth = getAuth();
      await signInWithEmailLink(auth, user.email, data.link);

      localStorage.removeItem('emailForSignIn');
      localStorage.removeItem('isDeleteAccountFlow');

      const success = await deleteUserAccount();

      if (success) {
        sessionStorage.setItem('accountDeleted', 'true');
        setTimeout(() => {
          router.push('/');
          sessionStorage.removeItem('accountDeleted');
        }, 1500);
      } else {
        setCodeError('Account deletion failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
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

  if (!user) return null;

  return (
    <>
      <div className="space-y-6">
        {/* Privacy information section - hide on desktop since privacy policy is in the sidebar */}
        {!isDesktop && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
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
        )}
        
        {/* Data export section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
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
                    const dataBlob = new Blob([exportData || ''], { type: 'application/json' });
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
        
        {/* Delete account section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">{t('privacy.deleteAccount')}</h2>
          <p className="text-gray-300 mb-4">
            {t('privacy.deleteAccount.description')}
          </p>
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
        
        {/* Contact section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">{t('privacy.additionalRequests')}</h2>
          <p className="text-gray-300 mb-4">
            {t('privacy.additionalRequests.description')}
          </p>
          <a
            href="mailto:privacy@musco-app.com"
            className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-center"
          >
            {t('privacy.additionalRequests.contact')}
          </a>
        </div>
      </div>

      {/* Delete account modals */}
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
            <p className="text-gray-300 mb-4">{t('privacy.deleteAccount.confirmationDescription')}</p>
            <p className="text-gray-300 mb-6">{t('privacy.deleteAccount.confirmationPrompt')}</p>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }}>
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
            
            <h3 className="text-xl font-bold text-white mb-4 text-center">{t('privacy.deleteAccount.verificationTitle')}</h3>
            <p className="text-gray-300 mb-6 text-center">
              {t('privacy.deleteAccount.verificationDescription')}
            </p>
            
            {codeError && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{codeError}</p>
              </div>
            )}
            
            <VerificationCodeInput
              value={authCode}
              onChange={(value) => { setAuthCode(value); setCodeError(null); }}
              onSubmit={handleCodeValidation}
              error={codeError}
              isLoading={isLoading}
              placeholder={t('login.enterCode')}
              submitButtonText={t('privacy.deleteAccount.deleteButton')}
              submitButtonLoadingText={t('privacy.deleteAccount.deletingButton')}
              submitButtonVariant="danger"
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                type="button"
                onClick={closeDeleteAccountDialog}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl flex-1 hover:bg-gray-600 transition-colors duration-200"
              >
                {t('privacy.deleteAccount.cancel')}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  if (!user?.email) return;
                  try {
                    setIsLoading(true);
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const redirectUrl = `${origin}/privacy?deleteAccount=true`;
                    await sendAccountDeletionEmail(user.email, redirectUrl);
                    localStorage.setItem('emailForSignIn', user.email);
                    localStorage.setItem('isDeleteAccountFlow', 'true');
                    toast.success(t('privacy.deleteAccount.resendSuccess'));
                  } catch {
                    toast.error(t('privacy.deleteAccount.resendFailed'));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-indigo-400 hover:text-indigo-300 text-sm underline"
              >
                {t('privacy.deleteAccount.resendEmail')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-white text-lg">{t('privacy.loading')}</p>
          </div>
        </div>
      )}
    </>
  );
}

