'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, deleteUser } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function PrivacyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  
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
    if (!user) return;
    
    // Verify email matches
    if (!verificationEmail || verificationEmail.toLowerCase() !== user.email?.toLowerCase()) {
      setError("The email address you entered doesn't match your account email.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not found or not authenticated');
      }
      
      // Delete user account
      await deleteUser(currentUser);
      
      // Navigate to home page after successful deletion
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting your account');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch all user data from your database
      // This is a simplified example that just exports the basic profile info
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.metadata?.creationTime,
        lastSignIn: user.metadata?.lastSignInTime,
      };
      
      setExportData(JSON.stringify(userData, null, 2));
      setShowDataExport(true);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while exporting your data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
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

      <div className="h-screen overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Privacy information section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
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
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // In a real app, you would generate a downloadable file
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData || '');
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", "musco-user-data.json");
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex-1"
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={() => {
                      setShowDataExport(false);
                      setExportData(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete account section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Account</h2>
            <p className="text-gray-300 mb-4">
              You have the right to be forgotten. Deleting your account will permanently remove all your personal data from our systems.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-yellow-300 text-sm">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <p className="text-gray-300 text-sm">
                  Please enter your email address ({user.email ? user.email.substring(0, 3) + '...' + user.email.substring(user.email.indexOf('@')) : ''}) to confirm:
                </p>
                <input
                  type="email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || !verificationEmail}
                    className={`px-4 py-2 bg-red-600 text-white rounded-lg flex-1 ${
                      isLoading || !verificationEmail ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500'
                    }`}
                  >
                    {isLoading ? 'Deleting...' : 'Delete My Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setVerificationEmail('');
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
          
          {/* Contact for data requests */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
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
    </div>
  );
} 