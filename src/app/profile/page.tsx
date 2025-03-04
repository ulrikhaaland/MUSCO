'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/firebase/config';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Custom hook to track window dimensions
const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

export default function ProfilePage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const { program, userPrograms, answers } = useUser();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Phone input state
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const [phoneContainerRect, setPhoneContainerRect] = useState<DOMRect | null>(null);
  
  // Profile data states
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<string | number>('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  
  // Validation states
  const [phoneValid, setPhoneValid] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fix position of phone dropdown when needed
  useEffect(() => {
    if (!isEditing) return;
    
    if (phoneContainerRef.current) {
      const rect = phoneContainerRef.current.getBoundingClientRect();
      setPhoneContainerRect(rect);
    }
  }, [isEditing, width, height]);
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      // Set basic profile info from auth
      if (user.displayName) {
        setDisplayName(user.displayName);
      }
      
      if (user.photoURL) {
        setPhotoURL(user.photoURL);
        setPreviewURL(user.photoURL);
      }
      
      try {
        // Get additional profile data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.age) setAge(userData.age);
          if (userData.phone) setPhone(userData.phone);
        } else {
          // Try to set age from questionnaire if available
          setAgeFromQuestionnaire();
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Function to handle phone input dropdown state
  const handlePhoneInputFocus = () => {
    if (phoneContainerRef.current) {
      const rect = phoneContainerRef.current.getBoundingClientRect();
      setPhoneContainerRect(rect);
      
      // Force re-render
      setIsCountryListOpen(true);
    }
  };
  
  const handlePhoneInputBlur = () => {
    // Delay setting to false to allow click events
    setTimeout(() => {
      setIsCountryListOpen(false);
    }, 200);
  };
  
  // Function to calculate age from questionnaire age range
  const setAgeFromQuestionnaire = () => {
    if (!answers || !answers.age) return;
    
    // Parse age range like "20-30" and get the middle value
    const ageRange = answers.age.split('-');
    if (ageRange.length === 2) {
      const minAge = parseInt(ageRange[0]);
      const maxAge = parseInt(ageRange[1]);
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        setAge(Math.floor((minAge + maxAge) / 2));
      }
    }
  };

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewURL(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const validatePhoneNumber = (phoneNumber: string) => {
    // Basic validation - should be at least 8 digits after country code
    // Norway's country code is 47, so a valid Norwegian number would be 
    // at least 10 characters (47 + 8 digits)
    if (!phoneNumber) {
      setPhoneValid(true); // Empty is valid (optional field)
      setPhoneError('');
      return true;
    }
    
    if (phoneNumber.length < 10) {
      setPhoneValid(false);
      setPhoneError('Phone number is too short');
      return false;
    }
    
    // Check that it only contains digits
    if (!/^\+?[0-9]+$/.test(phoneNumber)) {
      setPhoneValid(false);
      setPhoneError('Phone number should only contain digits');
      return false;
    }
    
    setPhoneValid(true);
    setPhoneError('');
    return true;
  };
  
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    validatePhoneNumber(value);
  };
  
  const uploadProfileImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!user) return reject('No user logged in');
      
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    // Validate phone number before saving
    if (!validatePhoneNumber(phone)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');
      
      // Upload profile picture if there's a new one
      let profilePhotoURL = photoURL;
      if (previewURL && previewURL !== photoURL) {
        // Convert data URL to file
        const response = await fetch(previewURL);
        const blob = await response.blob();
        const file = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
        
        // Upload the file
        profilePhotoURL = await uploadProfileImage(file);
      }
      
      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName,
        photoURL: profilePhotoURL
      });
      
      // Update additional fields in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName,
        photoURL: profilePhotoURL,
        age,
        phone,
        updatedAt: new Date()
      }, { merge: true });
      
      // Update local state
      setPhotoURL(profilePhotoURL);
      setIsEditing(false);
      setUploadProgress(0);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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

      <div className="py-3 px-4 flex items-center justify-between">
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">Profile</h1>
        </div>
        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
      </div>

      <div className="h-screen overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              {/* Profile Picture */}
              <div 
                className="w-24 h-24 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white text-3xl relative"
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {photoURL || previewURL ? (
                  <img src={previewURL || photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                
                {isEditing && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                    <div className="z-10 text-white text-sm">{Math.round(uploadProgress)}%</div>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              )}
              
              {/* Email - not editable */}
              <p className="text-gray-400">{user.email}</p>
              
              {/* Basic Profile Info */}
              <div className="w-full space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-white">{displayName || 'Not set'}</p>
                  )}
                </div>
                
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="1"
                      max="120"
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-white">{age || 'Not set'}</p>
                  )}
                </div>
                
                {/* Phone */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  {isEditing ? (
                    <div 
                      ref={phoneContainerRef}
                      className="phone-input-container"
                      style={{ 
                        position: 'relative', 
                        zIndex: 50 
                      }}
                    >
                      <PhoneInput
                        country={'no'}
                        value={phone}
                        onChange={handlePhoneChange}
                        countryCodeEditable={false}
                        containerClass="phone-container-absolute"
                        onFocus={handlePhoneInputFocus}
                        onBlur={handlePhoneInputBlur}
                        inputStyle={{
                          width: '100%',
                          backgroundColor: '#374151',
                          color: 'white',
                          border: phoneValid ? '1px solid #4B5563' : '1px solid #EF4444',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          height: '42px'
                        }}
                        buttonStyle={{
                          backgroundColor: '#374151',
                          border: phoneValid ? '1px solid #4B5563' : '1px solid #EF4444',
                          borderRight: 'none',
                          borderTopLeftRadius: '0.5rem',
                          borderBottomLeftRadius: '0.5rem'
                        }}
                        dropdownStyle={{
                          backgroundColor: '#1F2937',
                          color: 'white',
                          zIndex: 9999
                        }}
                        searchStyle={{
                          backgroundColor: '#374151',
                          color: 'white',
                          borderColor: '#4B5563'
                        }}
                        enableSearch={true}
                        disableSearchIcon={true}
                      />
                      {!phoneValid && (
                        <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-white">
                      {phone ? (
                        <span className="flex items-center">
                          <img 
                            src={`https://flagcdn.com/w20/no.png`} 
                            alt="Norway flag" 
                            className="mr-2 h-4"
                          />
                          {phone}
                        </span>
                      ) : 'Not set'}
                    </p>
                  )}
                  
                  {/* Floating dropdown for country list */}
                  {isCountryListOpen && isEditing && phoneContainerRect && (
                    <div 
                      className="fixed left-0 right-0 w-full h-screen pointer-events-none"
                      style={{ 
                        top: 0, 
                        zIndex: 9999
                      }}
                    >
                      <div 
                        className="absolute pointer-events-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden"
                        style={{
                          top: `${phoneContainerRect.bottom + window.scrollY + 5}px`,
                          left: `${phoneContainerRect.left + window.scrollX}px`,
                          width: `${phoneContainerRect.width}px`,
                          maxHeight: '300px',
                        }}
                      >
                        {/* This is just a placeholder - the library will handle rendering the actual dropdown */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading || !phoneValid}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex-1 ${(isLoading || !phoneValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewURL(photoURL); // Reset preview to current photo
                    setPhoneValid(true); // Reset validation state
                    setPhoneError('');
                  }}
                  disabled={isLoading}
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
                <span>Privacy & Data Controls</span>
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