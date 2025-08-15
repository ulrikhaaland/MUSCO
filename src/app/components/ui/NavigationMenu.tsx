'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useTranslation } from '@/app/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import DevMobileNavBar from './DevMobileNavBar';
import Logo from './Logo';
import { logAnalyticsEvent } from '@/app/utils/analytics';

// Create a separate component that uses the search params
function NavigationMenuContent({ mobileTitle, mobileFloatingButton }: { mobileTitle?: string; mobileFloatingButton?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logOut } = useAuth();
  const { program, activeProgram, userPrograms } = useUser();
  const { t } = useTranslation();
  // local menu state (not currently rendered as a dropdown)
  const [, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [showDevNavBar, setShowDevNavBar] = useState(false);

  // Add state for tracking drag
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  // Required min distance for drawer to close (in px)
  const closeThreshold = 120; // px - adjust as needed

  // Handle touch start event
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setDragging(true);
  };

  // Handle touch move event
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !dragging) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // Only allow dragging to the right (positive diff)
    if (diff > 0) {
      setDragPosition(diff);
    }
  };

  // Handle touch end event
  const onTouchEnd = () => {
    if (!dragging) return;

    // If dragged past threshold, close drawer
    if (dragPosition > closeThreshold) {
      setDrawerOpen(false);
    }

    // Reset drag state
    setDragging(false);
    setDragPosition(0);
  };

  // Calculate transform style based on drag position
  const getDrawerStyle = () => {
    if (!drawerOpen) {
      return { transform: 'translateX(100%)' };
    }

    if (dragging && dragPosition > 0) {
      return { transform: `translateX(${dragPosition}px)` };
    }

    return { transform: 'translateX(0)' };
  };

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setDrawerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, searchParams]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;

      // Add a class to prevent scrolling on the body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';

      return () => {
        // Restore scrolling when component unmounts or drawer closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [drawerOpen]);

  // Navigation items
  const hasAnyProgram = Boolean(program || activeProgram || (userPrograms && userPrograms.length > 0));

  const navItems = [
    {
      name: t('nav.explore'),
      path: '/app',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: t('nav.myProgram'),
      path: '/program',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      disabled: !hasAnyProgram,
    },
    {
      name: t('nav.programs'),
      path: '/programs',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2M7 7h10"
          />
        </svg>
      ),
      disabled: !user,
    },
    {
      name: t('nav.calendar'),
      path: '/program/calendar',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      disabled: !hasAnyProgram,
    },
    {
      name: t('nav.profile'),
      path: '/profile',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      disabled: !user,
    },
  ];

  const isActive = (path: string) => {
    // Get the base path and any query parameters
    const currentBasePath = pathname;
    // const currentParams = searchParams?.toString() || '';
    // const pathWithoutQuery = path.split('?')[0];

    // Check for exact matches first (most specific routes)
    if (
      path === '/admin/translations' &&
      currentBasePath === '/admin/translations'
    ) {
      return true;
    }

    if (
      path === '/program/calendar' &&
      currentBasePath === '/program/calendar'
    ) {
      return true;
    }

    if (
      path === '/program' &&
      (currentBasePath === '/program' ||
        currentBasePath.startsWith('/program/day/'))
    ) {
      return true;
    }

    if (path === '/programs' && currentBasePath === '/programs') {
      return true;
    }

    if (path === '/profile' && currentBasePath === '/profile') {
      return true;
    }

    // Explore (now /app) is active on /app
    if (path === '/app') {
      return currentBasePath === '/app';
    }

    // If none of the specific cases match, no match
    return false;
  };

  const handleNavigation = (path: string, disabled: boolean = false) => {
    if (!disabled) {
      // lightweight analytics
      const target = path === '/app' ? 'app' : path.replace(/^\//, '');
      try { logAnalyticsEvent('nav_click', { target }); } catch {}
      router.push(path);
      setDrawerOpen(false);
      setShowUserMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Ensure loader is hidden before logout

      await logOut();
      setShowUserMenu(false);
      setDrawerOpen(false);
      setShowDevNavBar(false);
    } catch (error) {
      console.error('Error during handleLogout:', error);
    }
  };

  const toggleDevNavBar = () => {
    setShowDevNavBar((prev) => !prev);
  };

  return (
    <>
      {/* Desktop header (landing style) */}
      <header className="hidden md:block sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              try { logAnalyticsEvent('nav_click', { target: 'app' }); } catch {}
              // If signed out, go to marketing root; otherwise, go to /app
              router.push(user ? '/app' : '/');
            }}
            aria-label="Home"
          >
            <Logo />
          </button>
          <nav className="flex items-center gap-3 text-gray-300">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path, item.disabled)}
                className={`px-3 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={item.disabled}
              >
                {item.name}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => {
                  const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
                  try { window.sessionStorage.setItem('previousPath', currentPath); } catch {}
                  try { logAnalyticsEvent('nav_click', { target: 'signin' }); } catch {}
                  if (pathname.includes('/program/')) {
                    try { window.sessionStorage.setItem('loginContext', 'saveProgram'); } catch {}
                    router.push('/login?context=save');
                  } else {
                    router.push('/login');
                  }
                }}
                className="px-3 py-2 rounded-md text-sm text-white/90 hover:text-white border border-white/20"
              >
                {t('auth.signIn')}
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm bg-gray-800 text-white hover:bg-gray-700"
              >
                {t('auth.signOut')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile header: either floating button or inline bar */}
      {mobileFloatingButton ? (
        <div className="md:hidden">
          {!drawerOpen && (
            user ? (
              <button
                onClick={() => setDrawerOpen(true)}
                className="fixed top-4 right-4 z-[70] p-2 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : (
              pathname !== '/login' && (
                <button
                  onClick={() => {
                    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
                    window.sessionStorage.setItem('previousPath', currentPath);
                    if (pathname.includes('/program/')) {
                      window.sessionStorage.setItem('loginContext', 'saveProgram');
                      logAnalyticsEvent('nav_click', { target: 'signin' });
                      router.push('/login?context=save');
                    } else {
                      logAnalyticsEvent('nav_click', { target: 'signin' });
                      router.push('/login');
                    }
                  }}
                  className="fixed top-4 right-4 z-[70] px-3 py-2 rounded-lg bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
                >
                  {t('auth.signIn')}
                </button>
              )
            )
          )}
        </div>
      ) : (
        <div className="md:hidden z-40 bg-gray-900/95 backdrop-blur">
          <div className="px-4 py-3 flex items-center justify-between gap-2 flex-nowrap">
            <div className="w-9" aria-hidden />
            <div className="flex-1 min-w-0 text-white text-lg font-semibold text-center whitespace-normal break-words leading-tight">
              {mobileTitle}
            </div>
            {user ? (
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors flex-shrink-0 whitespace-nowrap"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : (
              pathname !== '/login' && (
                <button
                  onClick={() => {
                    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
                    window.sessionStorage.setItem('previousPath', currentPath);
                    if (pathname.includes('/program/')) {
                      window.sessionStorage.setItem('loginContext', 'saveProgram');
                      logAnalyticsEvent('nav_click', { target: 'signin' });
                      router.push('/login?context=save');
                    } else {
                      logAnalyticsEvent('nav_click', { target: 'signin' });
                      router.push('/login');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  {t('auth.signIn')}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity" />
      )}

      {/* Draggable drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-[60] w-64 bg-gray-900 shadow-lg flex flex-col max-h-screen overflow-hidden ${!dragging ? 'transition-transform duration-300 ease-in-out' : ''}`}
        style={getDrawerStyle()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Logo Container */}
        <div className="flex justify-center items-center py-2 border-b border-gray-800 flex-shrink-0">
          <Logo />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Navigation items */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path, item.disabled)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-indigo-900/70 font-medium'
                      : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                  }`}
                  disabled={item.disabled}
                >
                  <span className="mr-4">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer section with language and login - fixed at bottom */}
        <div className="border-t border-gray-800 pb-4 flex-shrink-0">
          {/* Language Switcher */}
          <div className="mt-8 px-8">
            <p className="text-sm text-gray-400 mb-4">{t('common.language')}</p>
            <LanguageSwitcher showFullNames />
          </div>

          {/* Divider */}
          <hr className="border-gray-800 my-4" />

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (user) {
                handleLogout();
              } else {
                const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
                window.sessionStorage.setItem('previousPath', currentPath);
                
                if (pathname.includes('/program/')) {
                  window.sessionStorage.setItem('loginContext', 'saveProgram');
                  router.push('/login?context=save');
                } else {
                  router.push('/login');
                }
              }
            }}
            className="flex items-center justify-between w-full px-8 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {user ? t('auth.signOut') : t('auth.signIn')}
            </div>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dev Mode Toggle */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 px-8">
              <button
                onClick={toggleDevNavBar}
                className="flex items-center w-full px-4 py-2 text-sm text-yellow-400 hover:bg-gray-800 hover:text-yellow-300 rounded-lg transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Toggle Dev Nav Bar ({showDevNavBar ? 'On' : 'Off'})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conditionally render the Dev Mobile Nav Bar */}
      {showDevNavBar && <DevMobileNavBar />}
    </>
  );
}

// Loading fallback for the Suspense boundary
function MenuLoadingFallback() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-gray-800 bg-gray-900 flex items-center justify-center">
      {/* No need to render anything since we're using the global loader */}
    </div>
  );
}

export function NavigationMenu({ mobileTitle, mobileFloatingButton }: { mobileTitle?: string; mobileFloatingButton?: boolean }) {
  return (
    <Suspense fallback={<MenuLoadingFallback />}>
      <NavigationMenuContent mobileTitle={mobileTitle} mobileFloatingButton={mobileFloatingButton} />
    </Suspense>
  );
}
