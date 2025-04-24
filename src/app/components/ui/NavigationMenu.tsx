'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useApp } from '@/app/context/AppContext';
import { useState, useEffect, useRef, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgramStatus } from '@/app/types/program';
import { useTranslation } from '@/app/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import DevMobileNavBar from './DevMobileNavBar';
import Logo from './Logo';

// Create a separate component that uses the search params
function NavigationMenuContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logOut } = useAuth();
  const { program } = useUser();
  const { completeReset } = useApp();
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [showDevNavBar, setShowDevNavBar] = useState(false);

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

  // Navigation items
  const navItems = [
    {
      name: t('nav.home'),
      path: '/',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name:
        user && program ? t('nav.createNewProgram') : t('nav.createProgram'),
      path: '/?new=true',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      name: t('nav.programs'),
      path: '/programs',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      disabled: !program,
    },
    {
      name: t('nav.profile'),
      path: '/profile',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      disabled: !user,
    },
  ];

  const isActive = (path: string, name: string) => {
    // Get the base path and any query parameters
    const currentBasePath = pathname;
    const currentParams = searchParams?.toString() || '';
    const pathWithoutQuery = path.split('?')[0];

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

    if (path === '/programs' && currentBasePath === '/programs') {
      return true;
    }

    if (path === '/profile' && currentBasePath === '/profile') {
      return true;
    }

    // Special case for Create Program - only active when on home with new=true
    if (path === '/?new=true') {
      return currentBasePath === '/' && currentParams.includes('new=true');
    }

    // Home is active in these cases:
    // 1. On exact home route without new=true
    // 2. On /program route (when viewing program)
    if (path === '/') {
      // For program pages, Home tab should be active
      if (
        program &&
        (currentBasePath === '/program' ||
          currentBasePath.startsWith('/program/day/'))
      ) {
        return true;
      }
      // On home page without new=true parameter
      return currentBasePath === '/' && !currentParams.includes('new=true');
    }

    // If none of the specific cases match, no match
    return false;
  };

  const handleNavigation = (path: string, disabled: boolean = false) => {
    if (!disabled) {
      // Special case for Create Program button
      if (path.includes('/?new=true')) {
        // Reset app state when navigating to create program page
        completeReset();

        // Add a timestamp to force a navigation event even if already on the page
        const timestamp = Date.now();
        router.push(`/?new=true&ts=${timestamp}`);
      } else {
        router.push(path);
      }
      setDrawerOpen(false);
      setShowUserMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
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
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-800 bg-gray-900">
      {/* Hamburger button - only show when drawer is closed */}
      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed top-4 right-4 z-[70] p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-[60] w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo Container */}
        <div className="flex justify-center items-center py-2 border-b border-gray-800">
          <Logo />
        </div>

        <div className="flex flex-col h-full">
          {/* Navigation items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path, item.disabled)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path, item.name)
                    ? 'text-white bg-indigo-900/70 font-medium'
                    : item.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                }`}
                disabled={item.disabled}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User actions */}

          <div className="border-t border-gray-800 pb-16">
            {/* Language Switcher */}
            <div className="mt-4 px-8 ">
              <p className="text-sm text-gray-400 mb-2">
                {t('common.language')}
              </p>
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
                  router.push('/login');
                }
              }}
              className="flex items-center w-full px-8 py-2 mt-4 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {user ? t('auth.signOut') : t('auth.signIn')}
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
      </div>

      {/* Conditionally render the Dev Mobile Nav Bar */}
      {showDevNavBar && <DevMobileNavBar />}
    </div>
  );
}

// Loading fallback for the Suspense boundary
function MenuLoadingFallback() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-gray-800 bg-gray-900 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function NavigationMenu() {
  // Check programStatus here instead of in the NavigationMenuContent
  const { programStatus } = useUser();

  // Don't render the navigation menu when generating a program
  if (programStatus === ProgramStatus.Generating) {
    return null;
  }

  return (
    <Suspense fallback={<MenuLoadingFallback />}>
      <NavigationMenuContent />
    </Suspense>
  );
}
