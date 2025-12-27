'use client';

import { useTranslation } from '@/app/i18n';
import { SectionId } from '../hooks/useResponsiveProfile';

export type MainView = 'info' | 'privacy' | 'privacyPolicy';

interface ProfileSidebarProps {
  photoURL: string | null;
  email: string | undefined;
  activeSection: SectionId;
  activeView: MainView;
  onSectionClick: (sectionId: SectionId) => void;
  onDataControlsClick: () => void;
  onPrivacyPolicyClick: () => void;
  onLogoutClick: () => void;
  onPhotoClick?: () => void;
  isInfoExpanded: boolean;
  onInfoToggle: () => void;
}

const infoSubsections: { id: SectionId; labelKey: string; icon: React.ReactNode }[] = [
  {
    id: 'general',
    labelKey: 'profile.sections.general',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'healthBasics',
    labelKey: 'profile.sections.healthBasics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'fitnessProfile',
    labelKey: 'profile.sections.fitnessProfile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
  activeView,
  onSectionClick,
  onDataControlsClick,
  onPrivacyPolicyClick,
  onLogoutClick,
  onPhotoClick,
  isInfoExpanded,
  onInfoToggle,
}: ProfileSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 h-fit sticky top-24">
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

      {/* Main Navigation */}
      <nav className="space-y-1">
        {/* Personal Information (Expandable) */}
        <div>
          <button
            onClick={onInfoToggle}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left ${
              isInfoExpanded
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{t('profile.sections.myInfo')}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isInfoExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Submenu */}
          {isInfoExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
              {infoSubsections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionClick(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm ${
                    activeSection === section.id
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-indigo-400' : 'text-gray-500'}>
                    {section.icon}
                  </span>
                  <span>{t(section.labelKey)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data Controls */}
        <button
          onClick={onDataControlsClick}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            activeView === 'privacy'
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('profile.dataControls')}</span>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Privacy Policy */}
        <button
          onClick={onPrivacyPolicyClick}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            activeView === 'privacyPolicy'
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('profile.privacyPolicy')}</span>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      {/* Sign Out Button */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={onLogoutClick}
          className="w-full px-4 py-3 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
        >
          {t('profile.signOut')}
        </button>
      </div>
    </div>
  );
}
