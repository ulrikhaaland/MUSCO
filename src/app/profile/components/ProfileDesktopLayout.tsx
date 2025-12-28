'use client';

import { ReactNode } from 'react';
import ProfileSidebar, { MainView } from './ProfileSidebar';
import { SectionId } from '../hooks/useResponsiveProfile';

interface SectionCompletion {
  general: boolean;
  healthBasics: boolean;
  fitnessProfile: boolean;
  medicalBackground: boolean;
  customNotes: boolean;
}

interface ProfileDesktopLayoutProps {
  children: ReactNode;
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
  sectionCompletion: SectionCompletion;
}

/**
 * Desktop layout wrapper for the profile page.
 * Renders a sidebar on the left and content on the right when Info is expanded.
 */
export default function ProfileDesktopLayout({
  children,
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
  sectionCompletion,
}: ProfileDesktopLayoutProps) {
  // Show second column if Info is expanded, or Privacy/PrivacyPolicy view is active
  const showSecondColumn = isInfoExpanded || activeView === 'privacy' || activeView === 'privacyPolicy';
  
  return (
    <div className={`flex gap-8 w-full px-6 py-6 ${!showSecondColumn ? 'justify-center' : ''}`}>
      {/* Sidebar */}
      <div className={showSecondColumn ? 'w-1/2' : 'w-1/2 max-w-md'}>
        <ProfileSidebar
          photoURL={photoURL}
          email={email}
          activeSection={activeSection}
          activeView={activeView}
          onSectionClick={onSectionClick}
          onDataControlsClick={onDataControlsClick}
          onPrivacyPolicyClick={onPrivacyPolicyClick}
          onLogoutClick={onLogoutClick}
          onPhotoClick={onPhotoClick}
          isInfoExpanded={isInfoExpanded}
          onInfoToggle={onInfoToggle}
          sectionCompletion={sectionCompletion}
        />
      </div>

      {/* Main Content - shown when Info or Privacy/PrivacyPolicy is expanded */}
      {showSecondColumn && (
        <div className="w-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
