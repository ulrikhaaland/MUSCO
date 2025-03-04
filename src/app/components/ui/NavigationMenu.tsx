'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useState, useEffect, useRef, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgramStatus } from '@/app/types/program';

// Create a separate component that uses the search params
function NavigationMenuContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logOut } = useAuth();
  const { program } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
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
      name: 'Home',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      name: user && program ? 'Create New Program' : 'Create Program',
      path: '/?new=true',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      name: 'Programs',
      path: '/programs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      name: 'Calendar',
      path: '/program/calendar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    const pathQuery = path.split('?')[1] || '';
    
    // Special case for Create Program to highlight when on home page with new=true
    if (pathWithoutQuery === '/' && (name === 'Create Program' || name === 'Create New Program')) {
      return currentBasePath === '/' && currentParams.includes('new=true');
    }
    
    // Special case for Home to highlight when on program page if user has a program,
    // but NOT when we're on the home page with new=true query
    if (pathWithoutQuery === '/' && name === 'Home') {
      // Highlight Home tab when on program page if user has a program
      if (program && (pathname === '/program' || pathname.startsWith('/program/day/'))) {
        return true;
      }
      // Only highlight Home when on root path without new=true query
      return pathname === '/' && !currentParams.includes('new=true');
    }
    
    if (path === '/program/calendar') {
      return pathname === '/program/calendar';
    }
    
    if (path === '/programs') {
      return pathname === '/programs';
    }
    return pathname.startsWith(pathWithoutQuery);
  };

  const handleNavigation = (path: string, disabled: boolean = false) => {
    if (!disabled) {
      router.push(path);
      setDrawerOpen(false);
      setShowUserMenu(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    setShowUserMenu(false);
    setDrawerOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-800 bg-gray-900 pb-safe-area">
      {/* Hamburger button */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="fixed top-4 right-4 z-[70] p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-lg z-[70] transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User info section */}
          {user ? (
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-app-title text-white">MUSCO</h2>
            </div>
          )}

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
          {user && (
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function MenuLoadingFallback() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-gray-800 bg-gray-900 flex items-center justify-center pb-safe-area">
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