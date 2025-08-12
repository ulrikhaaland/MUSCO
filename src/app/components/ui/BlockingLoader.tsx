'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import MuscleLoader from './MuscleLoader';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { ProgramStatus } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';

/**
 * Renders a fullscreen MuscleLoader only when it makes sense to block navigation:
 * - While authenticating (AuthContext.loading)
 * - While fetching the signed-in user's initial data (UserContext.isLoading)
 *
 * Includes a small debounce to avoid flashing on very short loads
 * and a minimum visible time once shown.
 */
export function BlockingLoader() {
  const pathname = usePathname();
  const { loading: authLoading, user } = useAuth();
  const { isLoading: userLoading, programStatus } = useUser();
  const { t } = useTranslation();

  // Determine if we should block based on contexts
  const shouldBlock = useMemo(() => {
    if (authLoading) return true;
    // Do not block while generating – show page shimmers instead
    if (user && userLoading && programStatus !== ProgramStatus.Generating) return true;
    // cover redirect gap from landing when user is signed in
    if (pathname === '/' && !!user && !authLoading) return true;
    return false;
  }, [authLoading, user, userLoading, programStatus, pathname]);

  // Min display to avoid flicker (no show debounce so initial auth shows immediately)
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    const minShowMs = 350;

    let timer: number | null = null;

    if (shouldBlock) {
      shownAtRef.current = Date.now();
      setVisible(true);
      return () => {};
    }

    // If hiding, ensure we met the minimum show time
    if (!shouldBlock && visible) {
      const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
      const remaining = Math.max(0, minShowMs - elapsed);
      timer = window.setTimeout(() => {
        setVisible(false);
        shownAtRef.current = null;
      }, remaining);
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }

    // Default cleanup
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [shouldBlock, visible]);

  if (!visible) return null;

  const redirectingFromLanding = pathname === '/' && !!user && !authLoading;
  const message = authLoading
    ? t('auth.checkingLoginStatus')
    : user && userLoading && programStatus !== ProgramStatus.Generating
    ? t('program.loadingData')
    : redirectingFromLanding
    ? t('common.loading')
    : t('common.loading');

  return <MuscleLoader fullScreen message={message} />;
}

export default BlockingLoader;


