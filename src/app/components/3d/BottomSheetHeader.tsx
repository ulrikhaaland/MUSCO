import { useEffect, useRef } from 'react';
import { useApp, ProgramIntention } from '@/app/context/AppContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/app/i18n';
import { translateBodyPartGroupName, translateAnatomyPart } from '@/app/utils/bodyPartTranslation';

interface BottomSheetHeaderProps {
  isLoading: boolean;
  getGroupDisplayName: () => string;
  getPartDisplayName: () => string;
  onNewChat: () => void;
  onHeightChange?: (height: number) => void;
  isMinimized: boolean;
  onOpenHistory?: () => void;
}

export function BottomSheetHeader({
  isLoading,
  getGroupDisplayName,
  getPartDisplayName,
  onNewChat,
  onHeightChange,
  isMinimized,
  onOpenHistory,
}: BottomSheetHeaderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const {
    intention,
    selectedGroups,
    selectedPart,
  } = useApp();

  useEffect(() => {
    if (headerRef.current && onHeightChange) {
      const observer = new ResizeObserver(() => {
        const height = headerRef.current?.getBoundingClientRect().height;
        if (height) {
          onHeightChange(height + 28);
        }
      });

      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  const getTitle = () => {
    if (intention === ProgramIntention.None) {
      return {
        main: getGroupDisplayName(),
        sub: getPartDisplayName(),
      };
    }

    // For Recovery mode
    if (intention === ProgramIntention.Recovery) {
      // If we have a selected group (checking through selectedGroups)
      if (selectedGroups.length > 0) {
        return {
          main: translateBodyPartGroupName(selectedGroups[0], t),
          sub: selectedPart
            ? translateAnatomyPart(selectedPart, t)
            : t('bottomSheet.selectSpecificArea', { 
                group: translateBodyPartGroupName(selectedGroups[0], t).toLowerCase() 
              }),
        };
      }
      return {
        main: t('bottomSheet.selectRecoveryArea'),
        sub: t('bottomSheet.chooseBodyPart'),
      };
    }

    // Exercise mode retired

    return {
      main: getGroupDisplayName(),
      sub: getPartDisplayName(),
    };
  };

  const { main, sub } = getTitle();

  return (
    <div
      ref={headerRef}
      className="w-full flex justify-between items-center py-2 px-3 border-b border-gray-700"
    >
      <div className="flex flex-col items-start text-left flex-1 mr-4 max-h-12 overflow-hidden">
        <h3 className="text-md font-bold text-white text-left break-words w-full line-clamp-1">
          {main}
        </h3>
        <h2 className="text-sm text-white text-left break-words w-full line-clamp-1">
          {sub}
        </h2>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        {!isMinimized && (
          <>
            {/* History button - only show if user is logged in */}
            {user && onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-white hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                aria-label={t('bottomSheet.chatHistory')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {/* New Chat button */}
            <button
              onClick={onNewChat}
              className="text-white hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label={t('chatHistory.newChat')}
              title={t('chatHistory.newChat')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
