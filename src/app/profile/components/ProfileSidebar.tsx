'use client';

import { useTranslation } from '@/app/i18n';
import { SectionId } from '../hooks/useResponsiveProfile';

interface ProfileSidebarProps {
  photoURL: string | null;
  email: string | undefined;
  activeSection: SectionId;
  onSectionClick: (sectionId: SectionId) => void;
  onPrivacyClick: () => void;
  onLogoutClick: () => void;
  onPhotoClick?: () => void;
  isEditing?: boolean;
}

const sectionConfig: { id: SectionId; labelKey: string; icon: React.ReactNode }[] = [
  {
    id: 'general',
    labelKey: 'profile.sections.general',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'healthBasics',
    labelKey: 'profile.sections.healthBasics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 00-.707.293l-4 4a1 1 0 01-1.414-1.414l4-4A3 3 0 0110 1a3 3 0 012.12.879l4 4a1 1 0 01-1.414 1.414l-4-4A1 1 0 0010 3zm0 9a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 01-.707-.293 1 1 0 010-1.414l4-4a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'fitnessProfile',
    labelKey: 'profile.sections.fitnessProfile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'medicalBackground',
    labelKey: 'profile.sections.medical',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function ProfileSidebar({
  photoURL,
  email,
  activeSection,
  onSectionClick,
  onPrivacyClick,
  onLogoutClick,
  onPhotoClick,
  isEditing,
}: ProfileSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-72 flex-shrink-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 h-fit sticky top-24">
      {/* Profile Photo & Email */}
      <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-700">
        <div 
          className="w-36 h-36 rounded-full overflow-hidden mb-3 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
          onClick={onPhotoClick}
          title={t('profile.changePhoto')}
        >
          {photoURL ? (
            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm truncate max-w-full">{email}</p>
      </div>

      {/* Section Navigation */}
      <nav className="space-y-1 mb-6">
        {sectionConfig.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              activeSection === section.id
                ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <span className={activeSection === section.id ? 'text-indigo-400' : 'text-gray-500'}>
              {section.icon}
            </span>
            <span className="font-medium">{t(section.labelKey)}</span>
          </button>
        ))}
      </nav>

      {/* Account Section */}
      {!isEditing && (
        <div className="pt-6 border-t border-gray-700 space-y-2">
          <button
            onClick={onPrivacyClick}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
          >
            <span>{t('profile.privacyControls')}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onLogoutClick}
            className="w-full px-4 py-3 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
          >
            {t('profile.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

