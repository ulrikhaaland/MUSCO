'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { TopBar } from '@/app/components/ui/TopBar';

export default function ProfilePage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const { program } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    // Set page title
    if (typeof document !== 'undefined') {
      document.title = 'Profile | MUSCO';
    }
  }, []);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleUpdateProfile = async () => {
    // This would normally update the user's profile in Firebase
    // For now, we'll just toggle the editing state
    setIsEditing(false);
  };

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

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <TopBar 
        onBack={() => router.push('/')}
      />

      <div className="h-screen overflow-y-auto pt-16">
        <div className="max-w-md mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{user.displayName || 'User'}</h2>
                )}
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full"
              >
                Edit Profile
              </button>
            )}
          </div>

          {program && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Your Program</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Program:</span>
                  <span className="text-white">{program.title || (program.type === 'exercise' ? 'Exercise Program' : 'Recovery Program')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(program.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => router.push('/program')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 w-full mt-3"
                >
                  View Program
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/change-password')}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between"
              >
                <span>Change Password</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => router.push('/privacy')}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full flex items-center justify-between"
              >
                <span>Privacy Settings</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 w-full"
          >
            Sign Out
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 