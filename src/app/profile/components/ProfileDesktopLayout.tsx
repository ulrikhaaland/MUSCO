'use client';

import { ReactNode } from 'react';
import ProfileSidebar from './ProfileSidebar';
import { SectionId } from '../hooks/useResponsiveProfile';

interface ProfileDesktopLayoutProps {
  children: ReactNode;
  photoURL: string | null;
  email: string | undefined;
  activeSection: SectionId;
  onSectionClick: (sectionId: SectionId) => void;
  onPrivacyClick: () => void;
  onLogoutClick: () => void;
  onPhotoClick?: () => void;
  isEditing?: boolean;
}

/**
 * Desktop layout wrapper for the profile page.
 * Renders a sidebar on the left and content on the right.
 */
export default function ProfileDesktopLayout({
  children,
  photoURL,
  email,
  activeSection,
  onSectionClick,
  onPrivacyClick,
  onLogoutClick,
  onPhotoClick,
  isEditing,
}: ProfileDesktopLayoutProps) {
  return (
    <div className="flex gap-8 max-w-6xl mx-auto px-6 py-6">
      {/* Sidebar */}
      <ProfileSidebar
        photoURL={photoURL}
        email={email}
        activeSection={activeSection}
        onSectionClick={onSectionClick}
        onPrivacyClick={onPrivacyClick}
        onLogoutClick={onLogoutClick}
        onPhotoClick={onPhotoClick}
        isEditing={isEditing}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

