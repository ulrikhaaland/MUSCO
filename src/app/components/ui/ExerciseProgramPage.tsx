import { useState, useEffect, useRef } from 'react';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { WeekOverview } from './WeekOverview';
import { ProgramType } from '../../../../shared/types';
import { Exercise, ExerciseProgram, ProgramDay } from '@/app/types/program';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useTranslation } from '@/app/i18n';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from './ToastProvider';

import {
  getStartOfWeek,
  getEndOfWeek,
  getWeekNumber,
  getDayOfWeekMondayFirst,
  addDays,
} from '@/app/utils/dateutils';
import {
  isViewingCustomRecoveryProgram,
  getRecoveryProgramFromSession,
  saveRecoveryProgramToAccount,
  clearRecoveryProgramFromSession,
} from '../../services/recoveryProgramService';
import { SUBSCRIPTIONS_ENABLED } from '@/app/lib/featureFlags';

interface ExerciseProgramPageProps {
  program: ExerciseProgram;
  title?: string;
  type?: ProgramType;
  timeFrame?: string;
  isLoading: boolean;
  shimmer?: boolean;
  onToggleView: () => void;
  dayName: (day: number) => string;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  onDaySelect: (day: ProgramDay, dayName: string) => void;
  isActive?: boolean;
  onOverviewVisibilityChange?: (visible: boolean) => void;
  isCustomProgram?: boolean;
  // Incremental generation props
  generatingDay?: number | null;
  generatedDays?: number[];
}

// Add styles to hide scrollbars while maintaining scroll functionality
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;            /* Chrome, Safari and Opera */
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideStyles;
  document.head.appendChild(style);
}

function ProgramViewShimmer() {
  return (
    <>
      {/* Title + Active badge shimmer */}
      <div className="py-3 px-4 flex items-center justify-between">
        <div className="w-10" />
        <div className="flex flex-col items-center">
          <div className="shimmer h-6 w-64 bg-gray-700 rounded" />
          <div className="mt-2 shimmer h-4 w-28 bg-gray-700 rounded-full" />
        </div>
        <div className="w-10" />
      </div>

      {/* Week Focus info card shimmer */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800/50 rounded-2xl ring-1 ring-gray-700/50 p-6 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500/50" />
              <div className="shimmer h-5 w-40 bg-gray-700 rounded" />
            </div>
            <div className="shimmer h-4 w-4 bg-gray-700 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="shimmer h-3 w-11/12 bg-gray-700 rounded" />
            <div className="shimmer h-3 w-3/4 bg-gray-700 rounded" />
          </div>
        </div>

        {/* Week tabs shimmer */}
        {/* Mobile: grid contained in viewport; Desktop: horizontal tabs */}
        <div className="mb-3 sticky top-0 z-10 bg-gray-900 pb-2">
          <div className="sm:hidden grid grid-cols-2 gap-2">
            {[0,1].map((i) => (
              <div key={i} className="rounded-lg bg-gray-800/50 p-3">
                <div className="shimmer h-4 w-24 bg-gray-700 rounded" />
                <div className="mt-1 shimmer h-3 w-28 bg-gray-700/70 rounded" />
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <div className="overflow-x-auto scrollbar-hide max-w-full">
              <div className="flex space-x-2 w-max">
                {[0,1].map((i) => (
                  <div
                    key={i}
                    className="px-6 py-3 rounded-lg bg-gray-800/50 text-gray-400 relative shrink-0"
                  >
                    <div className="shimmer h-4 w-24 md:w-28 bg-gray-700 rounded" />
                    <span className="block mt-1 shimmer h-3 w-28 md:w-32 bg-gray-700/70 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Day tabs shimmer */}
        {/* Mobile: wrapped grid contained in viewport; Desktop: horizontal scroller */}
        <div className="mb-4">
          <div className="sm:hidden grid grid-cols-4 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-gray-800/60 text-gray-400 flex flex-col items-center">
                <span className="shimmer h-3 w-10 bg-gray-700 rounded mb-1" />
                <span className="shimmer h-3 w-12 bg-gray-700/70 rounded" />
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <div className="overflow-x-auto scrollbar-hide max-w-full">
              <div className="flex space-x-2 w-max">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-6 py-3 rounded-lg bg-gray-800/60 text-gray-400 flex flex-col items-center shrink-0"
                  >
                    <span className="shimmer h-3 w-12 bg-gray-700 rounded mb-1" />
                    <span className="shimmer h-3 w-16 bg-gray-700/70 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary shimmer: reuse the real component's shimmer to maintain parity */}
        {(() => {
          const placeholderDay: ProgramDay = {
            day: 1,
            description: '',
            isRestDay: false,
            exercises: Array.from({ length: 6 }).map((_, idx) => ({
              name: `Exercise ${idx + 1}`,
              warmup: idx === 0,
              sets: [],
              reps: [],
              duration: 0,
            })) as any,
          } as any;
          return (
            <ProgramDaySummaryComponent
              day={placeholderDay}
              dayName={"Monday"}
              shimmer
              autoNavigateIfEmpty={false}
              autoNavigateOnShimmer={false}
            />
          );
        })()}
      </div>
    </>
  );
}

// NEW COMPONENT: SignUpToContinueCard
const SignUpToContinueCard = ({
  t,
  router,
}: {
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
}) => {
  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <svg
          className="w-12 h-12 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
        <h3 className="text-app-title text-white">
          {t('exerciseProgram.signUp.title')}
        </h3>
        <p className="text-gray-300">
          {t('exerciseProgram.signUp.description')}
        </p>
        <button
          onClick={() => {
            window.sessionStorage.setItem('previousPath', '/');
            window.sessionStorage.setItem('loginContext', 'saveProgram');
            router.push('/login?context=save');
          }}
          className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
        >
          {t('exerciseProgram.signUp.button')}
        </button>
      </div>
    </div>
  );
};

// Create a reusable loading component - no longer needed as we're using the global loader context
// This function is removed in favor of using the global loader context

export function ExerciseProgramPage({
  program,
  title,
  type,
  timeFrame,
  isLoading,
  shimmer = false,
  dayName,
  onDaySelect,
  isActive = false,
  isCustomProgram = false,
  generatingDay: propGeneratingDay,
  generatedDays: propGeneratedDays,
}: ExerciseProgramPageProps) {
  // Get current date info
  const currentDate = new Date();
  const currentDayOfWeek = getDayOfWeekMondayFirst(currentDate);

  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const hasInitializedDaySelection = useRef(false);
  const previousProgramId = useRef<string | null>(null);
  const userHasManuallySelectedDay = useRef(false);
  const { user } = useAuth();
  // Add state to track if current date is in a future week
  const [isInFutureWeek, setIsInFutureWeek] = useState(false);
  // Add state to store the date when user can generate a new program
  const [nextProgramDate, setNextProgramDate] = useState<Date | null>(null);
  const { activeProgram, generatingDay: contextGeneratingDay, generatedDays: contextGeneratedDays } = useUser();
  
  // Use props if provided, otherwise fall back to context
  const generatingDay = propGeneratingDay ?? contextGeneratingDay;
  const generatedDays = propGeneratedDays ?? contextGeneratedDays ?? [];
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if this is a custom recovery program being viewed (not saved to user account)
  const isViewingCustomProgram = isViewingCustomRecoveryProgram(pathname);

  // State for save button
  const [isSaving, setIsSaving] = useState(false);

  // State for week-specific overview card - auto-expand during generation
  const [showWeekOverview, setShowWeekOverview] = useState(false);
  const hasAutoExpandedOverview = useRef(false);
  
  // Auto-expand overview when generation starts
  useEffect(() => {
    if (generatingDay !== null && !hasAutoExpandedOverview.current) {
      setShowWeekOverview(true);
      hasAutoExpandedOverview.current = true;
    }
  }, [generatingDay]);

  // Set initial week and day when program loads (only on first load or when program changes)
  useEffect(() => {
    if (!program?.days || !Array.isArray(program.days)) return;
    
    // If user has manually selected a day, never reset it
    if (userHasManuallySelectedDay.current) return;
    
    // During incremental generation, auto-select Monday (day 1) if not yet initialized
    if (generatingDay !== null) {
      if (!hasInitializedDaySelection.current) {
        setExpandedDays([1]); // Monday
        hasInitializedDaySelection.current = true;
      }
      return;
    }
    
    // Use title as stable identifier (empty title = new/generating program)
    const programId = program.title || 'generating';
    
    // Reset if we're looking at a completely different program (title changed)
    // BUT don't reset when transitioning from 'generating' to actual title (that's just generation completing)
    const isTransitionFromGenerating = previousProgramId.current === 'generating' && programId !== 'generating';
    if (previousProgramId.current && previousProgramId.current !== programId && programId !== 'generating' && !isTransitionFromGenerating) {
      hasInitializedDaySelection.current = false;
      userHasManuallySelectedDay.current = false; // Reset manual selection flag for new program
    }
    previousProgramId.current = programId;
    
    // Skip if we've already initialized the day selection
    if (hasInitializedDaySelection.current) return;

    // Check if this is a multi-week program (either custom 4-week or user program with multiple weeks)
    const isMultiWeekProgram = isCustomProgram && program.days.length === 28;
    const hasMultipleWeeks =
      activeProgram?.programs && activeProgram.programs.length > 1;
    const is4WeekProgram = isMultiWeekProgram || hasMultipleWeeks;

    if (is4WeekProgram && hasMultipleWeeks && activeProgram?.programs) {
      // For user programs with multiple weeks, determine current week based on program dates
      let weekToSelect = 1;
      let dayToSelect = currentDayOfWeek; // Always default to current day of week

      // Find which week we're currently in based on dates
      const currentDate = new Date();
      let foundMatchingWeek = false;

      for (let i = 0; i < activeProgram.programs.length; i++) {
        const weekProgram = activeProgram.programs[i];
        if (weekProgram.createdAt) {
          const weekStart = new Date(weekProgram.createdAt);
          const weekEnd = getEndOfWeek(weekStart); // Use the proper getEndOfWeek function

          if (currentDate >= weekStart && currentDate <= weekEnd) {
            weekToSelect = i + 1;
            dayToSelect = currentDayOfWeek;
            foundMatchingWeek = true;
            break;
          }
        }
      }

      // If no matching week found, default to week 1 for custom programs, or handle saved programs differently
      if (!foundMatchingWeek) {
        if (isViewingCustomProgram) {
          // For custom recovery programs, always default to week 1
          weekToSelect = 1;
          dayToSelect = currentDayOfWeek;
        } else if (activeProgram.programs.length > 0) {
          // For saved user programs, use the existing logic
          const firstWeek = activeProgram.programs[0];
          const lastWeek =
            activeProgram.programs[activeProgram.programs.length - 1];

          if (
            firstWeek.createdAt &&
            currentDate < new Date(firstWeek.createdAt)
          ) {
            // We're before the program starts - use first week, current day
            weekToSelect = 1;
            dayToSelect = currentDayOfWeek;
          } else if (lastWeek.createdAt) {
            // We're after the program ends - use last week, current day
            weekToSelect = activeProgram.programs.length;
            dayToSelect = currentDayOfWeek;
          }
        }
      }

      setSelectedWeek(weekToSelect);
      setExpandedDays([dayToSelect]);
    } else if (is4WeekProgram) {
      // For custom recovery programs, start with week 1, day 1 (Monday)
      setSelectedWeek(1);
      setExpandedDays([1]);
    } else {
      setSelectedWeek(1);
      setExpandedDays([currentDayOfWeek]);
    }
    
    // Mark that we've initialized the day selection
    hasInitializedDaySelection.current = true;

    // Scroll day into view
    setTimeout(() => {
      const dayToScrollTo =
        is4WeekProgram && hasMultipleWeeks
          ? expandedDays.length > 0
            ? expandedDays[0]
            : currentDayOfWeek
          : is4WeekProgram
            ? 1
            : currentDayOfWeek;
      const dayButton = document.querySelector(`[data-day="${dayToScrollTo}"]`);
      if (dayButton) {
        dayButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, isCustomProgram, activeProgram, currentDayOfWeek, generatingDay]);

  const handleWeekChange = (weekNumber: number) => {
    setSelectedWeek(weekNumber);

    // Scroll the selected week button into view
    setTimeout(() => {
      const weekButton = document.querySelector(`[data-week="${weekNumber}"]`);
      if (weekButton) {
        weekButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, 100);
  };

  const handleDayClick = (dayNumber: number) => {
    // Mark that user has manually selected a day
    userHasManuallySelectedDay.current = true;
    
    const isExpanding = !expandedDays.includes(dayNumber);

    if (isExpanding) {
      setExpandedDays([dayNumber]); // Show only the clicked day

      // Scroll the selected day button into view using element.scrollIntoView
      setTimeout(() => {
        const dayButton = document.querySelector(`[data-day="${dayNumber}"]`);
        if (dayButton) {
          dayButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // Changed to 'nearest' to avoid unnecessary large scrolls
            inline: 'center',
          });
        }

        // Scroll towards the bottom after day potentially scrolled into view
        // Use window scroll
        setTimeout(() => {
          const targetY = document.body.scrollHeight * 0.8; // Scroll 80% down
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }, 150); // Delay slightly after element scroll
      }, 0);
    }
  };

  const handleDayDetailClick = (day: ProgramDay, dayName: string) => {
    onDaySelect(day, dayName);
  };

  // Save custom program to user account
  const handleSaveProgram = async () => {
    if (!user || !isViewingCustomProgram) return;

    setIsSaving(true);
    try {
      const sessionData = getRecoveryProgramFromSession();
      if (!sessionData?.userProgram) {
        toast.error('Program data not found');
        return;
      }

            await saveRecoveryProgramToAccount(user, sessionData.userProgram);
      
      // Clear the recovery program from session storage after successful save
      clearRecoveryProgramFromSession();
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('loginContext');
        window.sessionStorage.removeItem('previousPath');
      }
      
      toast.success('Program saved to your account!');
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get the day short name with translations
  function getDayShortName(
    dayOfWeek: number,
    t: (key: string) => string
  ): string {
    const days = [
      t('exerciseProgram.dayAbbr.mon'),
      t('exerciseProgram.dayAbbr.tue'),
      t('exerciseProgram.dayAbbr.wed'),
      t('exerciseProgram.dayAbbr.thu'),
      t('exerciseProgram.dayAbbr.fri'),
      t('exerciseProgram.dayAbbr.sat'),
      t('exerciseProgram.dayAbbr.sun'),
    ];
    return days[dayOfWeek - 1];
  }

  // Helper function to get the translated month abbreviation
  function getMonthAbbreviation(
    month: number,
    t: (key: string) => string
  ): string {
    const months = [
      t('month.jan'),
      t('month.feb'),
      t('month.mar'),
      t('month.apr'),
      t('month.may'),
      t('month.jun'),
      t('month.jul'),
      t('month.aug'),
      t('month.sep'),
      t('month.oct'),
      t('month.nov'),
      t('month.dec'),
    ];
    return months[month];
  }

  // Render next week card function inside the component
  const renderNextWeekCard = () => {
    const isUserSubscribed = () => {
      // All users treated as subscribed when subscriptions disabled
      if (!SUBSCRIPTIONS_ENABLED) return true;
      const profile = user?.profile;
      if (!profile) return false;
      if (profile.isSubscriber) return true;
      const status = profile.subscriptionStatus;
      const active = status === 'active' || status === 'trialing';
      if (!active) return false;
      if (profile.currentPeriodEnd) {
        return new Date(profile.currentPeriodEnd).getTime() > Date.now();
      }
      return true;
    };

    // Show the "Coming Soon" card with a button to start feedback
    return (
      <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <svg
            className="w-12 h-12 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-app-title text-white">
            {t('exerciseProgram.nextWeekCard.title')}
          </h3>
          <p className="text-gray-300">
            {t('exerciseProgram.nextWeekCard.description')}
          </p>
          <button
            onClick={() => {
              // Subscription gate first
              if (!isUserSubscribed()) {
                router.push('/subscribe');
                return;
              }
              // Check if user is eligible to create a follow-up program
              const isDebugMode = process.env.NODE_ENV === 'development';

              if (!isInFutureWeek && !isDebugMode) {
                // Show toast message instead of navigating to feedback page
                let message = t('programFeedback.button.waitUntilNextWeek');

                if (nextProgramDate) {
                  const formattedDate = nextProgramDate.toLocaleDateString(
                    locale,
                    {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }
                  );

                  message = t('programFeedback.button.waitUntilSpecificDate', {
                    date: formattedDate,
                  });
                }

                toast.custom(
                  (toastObj) => (
                    <div
                      className={`${
                        toastObj.visible ? 'animate-enter' : 'animate-leave'
                      } max-w-md w-full bg-amber-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">⚠️</div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">
                              {message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                  {
                    duration: 4000,
                  }
                );
                return;
              }

              // Navigate to feedback page
              router.push('/program/feedback');
            }}
            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
          >
            {t('exerciseProgram.nextWeekCard.button')}
          </button>
        </div>
      </div>
    );
  };

  // Determine if the current date is in a future week compared to the program
  useEffect(() => {
    if (
      !program?.days ||
      !Array.isArray(program.days) ||
      program.days.length === 0
    ) {
      return;
    }

    // Get current date
    const currentDate = new Date();

    // Since each program now represents one week, use the program's createdAt
    if (!program.createdAt) {
      // If no createdAt, can't determine week
      setIsInFutureWeek(false);
      return;
    }

    // Get the end date of this week
    const programCreatedAt = new Date(program.createdAt);
    const programWeekEnd = getEndOfWeek(programCreatedAt);

    // Current date is in a future week if it's after the end of this week
    const inFutureWeek = currentDate.getTime() > programWeekEnd.getTime();

    // Store the next program date (end of this week + 1 day)
    const dayAfterProgramEnd = addDays(programWeekEnd, 1);
    setNextProgramDate(dayAfterProgramEnd);

    setIsInFutureWeek(inFutureWeek);
  }, [program]);

  // Only return null when not shimmering; allow shimmer UI even before program is available
  if (!shimmer && ((isLoading) || program === null || !Array.isArray(program.days))) {
    return null;
  }

  // When shimmering, render only the dedicated shimmer view to avoid duplicate shimmers below
  if (shimmer) {
    return (
      <div className="bg-gray-900 flex flex-col min-h-screen text-white overflow-x-hidden">
        <style>{scrollbarHideStyles}</style>
        <style jsx global>{`
          .shimmer { position: relative; overflow: hidden; }
          .shimmer::after {
            position: absolute; inset: 0; transform: translateX(-100%);
            background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.16) 65%, rgba(255,255,255,0) 100%);
            animation: shimmerX 1.6s linear infinite;
            content: '';
          }
          @keyframes shimmerX { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%); } }
        `}</style>
        <ProgramViewShimmer />
      </div>
    );
  }

  // Handle multi-week programs vs regular programs
  const isMultiWeekProgram = isCustomProgram && program.days.length === 28;
  const hasMultipleWeeks =
    activeProgram?.programs && activeProgram.programs.length > 1;
  const is4WeekProgram = isMultiWeekProgram || hasMultipleWeeks;
  let selectedWeekData = null;

  if (is4WeekProgram) {
    if (hasMultipleWeeks && activeProgram?.programs) {
      // For user programs with multiple weeks, use the programs array
      const totalWeeks = activeProgram.programs.length;
      if (selectedWeek >= 1 && selectedWeek <= totalWeeks) {
        const weekProgram = activeProgram.programs[selectedWeek - 1];
        selectedWeekData = { days: weekProgram.days || [] };
      }
    } else if (isMultiWeekProgram) {
      // For 4-week custom programs, group days into weeks and show the selected week
      if (selectedWeek >= 1 && selectedWeek <= 4) {
        const startDayIndex = (selectedWeek - 1) * 7;
        const endDayIndex = startDayIndex + 7;
        const weekDays = program.days.slice(startDayIndex, endDayIndex);

        // Re-number days 1-7 for display
        const renumberedDays = weekDays.map((day, index) => ({
          ...day,
          day: index + 1,
        }));

        selectedWeekData = { days: renumberedDays };
      }
    }
  } else {
    // For regular programs, use existing logic
    selectedWeekData = selectedWeek === 1 ? { days: program.days } : null;
  }

  return (
    <div
      className={`bg-gray-900 flex flex-col min-h-screen text-white overflow-x-hidden ${
        isLoading ? 'items-center justify-center' : ''
      }`}
    >
      {isLoading ? (
        <div className="w-full flex items-center justify-center bg-gray-900 py-20">
          {/* We're using the global loader context now, no need for a spinner here */}
          <div className="text-center">
            <p className="text-gray-400">{t('exerciseProgram.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          <style>{scrollbarHideStyles}</style>
          <style jsx global>{`
            .shimmer { position: relative; overflow: hidden; }
            .shimmer::after {
              position: absolute; inset: 0; transform: translateX(-100%);
              background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.16) 65%, rgba(255,255,255,0) 100%);
              animation: shimmerX 1.6s linear infinite;
              content: '';
            }
            @keyframes shimmerX { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%); } }
          `}</style>

          {/* Custom header with title only (desktop only) */}
          {shimmer ? (
            <ProgramViewShimmer />
          ) : (
            <div className="hidden md:flex py-3 px-4 items-center justify-center mt-12">
              <div className="flex flex-col items-center">
                <h1 className="text-app-title text-center">
                  {title ||
                    (type === ProgramType.Recovery
                      ? t('program.recoveryProgramTitle')
                      : t('program.exerciseProgramTitle'))}
                </h1>
                {!isCustomProgram && (
                  isActive ? (
                    <div className="mt-1 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                      {t('exerciseProgram.badge.active')}
                    </div>
                  ) : (
                    <div className="mt-1 px-2 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                      {t('exerciseProgram.badge.inactive')}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Program Overview Modal - REMOVED - Now using inline week-specific overview card */}

          <div className="flex-1">
            <div className="max-w-4xl mx-auto px-4 pb-8">
              {/* Program overview button and save button */}
              {
                                  <div className="text-center mb-4 space-y-2 mt-2">
                    <div className="flex justify-center gap-2 mb-2">
                      {/* Save button for logged-in users viewing custom programs */}
                      {user && isViewingCustomProgram && (
                        <button
                          onClick={handleSaveProgram}
                          disabled={isSaving}
                          className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              {t('common.saving')}
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                />
                              </svg>
                              {t('common.save')}
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Sign up button for non-logged in users viewing custom programs */}
                      {!user && isViewingCustomProgram && (
                        <button
                          onClick={() => {
                            window.sessionStorage.setItem('previousPath', '/');
                            window.sessionStorage.setItem('loginContext', 'saveProgram');
                            router.push('/login?context=save');
                          }}
                          className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200 inline-flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          {t('exerciseProgram.signUp.saveProgram')}
                        </button>
                      )}
                    </div>
                  </div>
              }

              {/* Week/Day tabs */}
              {
                <>
                  {/* Week Tabs */}
                  <div className="mb-3 overflow-x-auto scrollbar-hide sticky top-0 z-10 bg-gray-900 pb-2">
                    <div className="flex space-x-2 min-w-max">
                      {shimmer ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="shimmer h-10 w-28 bg-gray-800/60 rounded-lg" />
                        ))
                      ) : is4WeekProgram ? (
                        // For multi-week programs, show all available weeks
                        (() => {
                          const totalWeeks =
                            hasMultipleWeeks && activeProgram?.programs
                              ? activeProgram.programs.length + (isCustomProgram ? 0 : 1) // Add placeholder only for user programs
                              : 4; // Default to 4 for custom programs
                          return Array.from(
                            { length: totalWeeks },
                            (_, i) => i + 1
                          );
                        })().map((weekNumber) => (
                          <button
                            key={`week-${weekNumber}`}
                            data-week={weekNumber}
                            onClick={() => handleWeekChange(weekNumber)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 relative ${
                              selectedWeek === weekNumber
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              {t('exerciseProgram.weekTab')}{' '}
                              {(() => {
                                // Calculate the actual ISO week number for this week
                                if (
                                  hasMultipleWeeks &&
                                  activeProgram?.programs
                                ) {
                                  // For user programs, use the specific week's createdAt
                                  const totalExistingWeeks = activeProgram.programs.length;
                                  const isPlaceholder = weekNumber > totalExistingWeeks;

                                  if (!isPlaceholder) {
                                    const weekProgram =
                                      activeProgram.programs[weekNumber - 1];
                                    return weekProgram?.createdAt
                                      ? getWeekNumber(
                                          new Date(weekProgram.createdAt)
                                        )
                                      : weekNumber;
                                  }

                                  // Placeholder week: calculate based on the week after the last program
                                  const lastCreatedAt = activeProgram.programs[totalExistingWeeks - 1]?.createdAt;
                                  const lastWeekStartRaw = lastCreatedAt ? new Date(lastCreatedAt) : new Date();
                                  let placeholderStart = getStartOfWeek(lastWeekStartRaw);
                                  const currentWeekStart = getStartOfWeek(currentDate);
                                  // Advance in 1-week steps until we reach or pass the current calendar week
                                  do {
                                    placeholderStart = addDays(placeholderStart, 7);
                                  } while (placeholderStart < currentWeekStart);
                                  // If there are multiple placeholder tabs (rare), advance further
                                  placeholderStart = addDays(placeholderStart, 7 * (weekNumber - totalExistingWeeks - 1));
                                  return getWeekNumber(placeholderStart);
                                } else if (program.createdAt) {
                                  // For custom programs, calculate based on program start + week offset
                                  const programStart = new Date(
                                    program.createdAt
                                  );
                                  const weekDate = new Date(programStart);
                                  weekDate.setDate(
                                    programStart.getDate() +
                                      (weekNumber - 1) * 7
                                  );
                                  return getWeekNumber(weekDate);
                                }
                                return weekNumber;
                              })()}
                              {(() => {
                                // Get the date for this specific week
                                let weekDate;
                                if (
                                  hasMultipleWeeks &&
                                  activeProgram?.programs
                                ) {
                                  // For user programs, use the specific week's createdAt
                                  const totalExistingWeeks = activeProgram.programs.length;
                                  const isPlaceholder = weekNumber > totalExistingWeeks;

                                  if (!isPlaceholder) {
                                    const weekProgram =
                                      activeProgram.programs[weekNumber - 1];
                                    weekDate = weekProgram?.createdAt
                                      ? new Date(weekProgram.createdAt)
                                      : undefined;
                                  } else {
                                    const lastCreatedAt2 = activeProgram.programs[totalExistingWeeks - 1]?.createdAt;
                                    const lastWeekStartRaw2 = lastCreatedAt2 ? new Date(lastCreatedAt2) : new Date();
                                    let placeholderStart2 = getStartOfWeek(lastWeekStartRaw2);
                                    const currentWeekStart2 = getStartOfWeek(currentDate);
                                    do {
                                      placeholderStart2 = addDays(placeholderStart2, 7);
                                    } while (placeholderStart2 < currentWeekStart2);
                                    placeholderStart2 = addDays(placeholderStart2, 7 * (weekNumber - totalExistingWeeks - 1));
                                    weekDate = placeholderStart2;
                                  }
                                } else if (program.createdAt) {
                                  // For custom programs, calculate based on program start + week offset
                                  const programStart = new Date(
                                    program.createdAt
                                  );
                                  weekDate = new Date(programStart);
                                  weekDate.setDate(
                                    programStart.getDate() +
                                      (weekNumber - 1) * 7
                                  );
                                }

                                return weekDate ? (
                                  <span className="text-xs opacity-70 block">
                                    {(() => {
                                      // Get start of week (Monday) and end of week (Sunday) for this week
                                      const weekDateObj = new Date(weekDate);
                                      const weekStart =
                                        getStartOfWeek(weekDateObj);
                                      const weekEnd = getEndOfWeek(weekDateObj);

                                      // Format the dates with translated month names
                                      const startMonth = getMonthAbbreviation(
                                        weekStart.getMonth(),
                                        t
                                      );
                                      const startDay = weekStart.getDate();
                                      const endDay = weekEnd.getDate();
                                      const endMonth = getMonthAbbreviation(
                                        weekEnd.getMonth(),
                                        t
                                      );

                                      // If start and end are in the same month, use "Month Day-Day" format
                                      if (startMonth === endMonth) {
                                        return `${startMonth} ${startDay}-${endDay}`;
                                      }

                                      // Otherwise, use "Month Day-Month Day" format
                                      return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                                    })()}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </button>
                        ))
                      ) : (
                        // For regular programs, show original week tabs
                        <>
                          {/* Current week tab */}
                          <button
                            key="week-1"
                            data-week={1}
                            onClick={() => handleWeekChange(1)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 relative ${
                              selectedWeek === 1
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              {t('exerciseProgram.weekTab')}{' '}
                              {program.createdAt
                                ? getWeekNumber(new Date(program.createdAt))
                                : getWeekNumber(currentDate)}
                              {program.createdAt && (
                                <span className="text-xs opacity-70 block">
                                  {(() => {
                                    // Calculate week start (Monday) and end (Sunday) dates
                                    const weekCreatedAt = new Date(
                                      program.createdAt
                                    );
                                    const weekStart =
                                      getStartOfWeek(weekCreatedAt);
                                    const weekEnd = getEndOfWeek(weekCreatedAt);

                                    // Format the dates with translated month names
                                    const startMonth = getMonthAbbreviation(
                                      weekStart.getMonth(),
                                      t
                                    );
                                    const startDay = weekStart.getDate();
                                    const endDay = weekEnd.getDate();
                                    const endMonth = getMonthAbbreviation(
                                      weekEnd.getMonth(),
                                      t
                                    );

                                    // If start and end are in the same month, use "Month Day-Day" format
                                    if (startMonth === endMonth) {
                                      return `${startMonth} ${startDay}-${endDay}`;
                                    }

                                    // Otherwise, use "Month Day-Month Day" format
                                    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                                  })()}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Next week button for non-custom programs */}
                          {!isCustomProgram && (
                            <button
                              data-week={2}
                              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 relative ${
                                selectedWeek === 2
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                              }`}
                              onClick={() => handleWeekChange(2)}
                            >
                              <div className="flex flex-col items-center justify-center text-center">
                                {t('exerciseProgram.weekTab')}{' '}
                                {(() => {
                                  // Determine which week should be generated next
                                  const nextWeekStart = (() => {
                                    const currentWeekStart = getStartOfWeek(currentDate);
                                    const isSameWeek = (date: Date) =>
                                      getStartOfWeek(date).getTime() === currentWeekStart.getTime();

                                    let hasProgramThisWeek = false;
                                    if (activeProgram?.programs?.length) {
                                      hasProgramThisWeek = activeProgram.programs.some((p) =>
                                        p.createdAt ? isSameWeek(new Date(p.createdAt)) : false
                                      );
                                    } else if (program.createdAt) {
                                      hasProgramThisWeek = isSameWeek(new Date(program.createdAt));
                                    }

                                    return hasProgramThisWeek ? addDays(currentWeekStart, 7) : currentWeekStart;
                                  })();

                                  return getWeekNumber(nextWeekStart);
                                })()}
                                <span className="text-xs opacity-70 block">
                                  {(() => {
                                    const nextWeekStart = (() => {
                                      const currentWeekStart = getStartOfWeek(currentDate);
                                      const isSameWeek = (date: Date) =>
                                        getStartOfWeek(date).getTime() === currentWeekStart.getTime();

                                      let hasProgramThisWeek = false;
                                      if (activeProgram?.programs?.length) {
                                        hasProgramThisWeek = activeProgram.programs.some((p) =>
                                          p.createdAt ? isSameWeek(new Date(p.createdAt)) : false
                                        );
                                      } else if (program.createdAt) {
                                        hasProgramThisWeek = isSameWeek(new Date(program.createdAt));
                                      }

                                      return hasProgramThisWeek ? addDays(currentWeekStart, 7) : currentWeekStart;
                                    })();
                                    const nextWeekEnd = getEndOfWeek(nextWeekStart);

                                    // Format the dates with translated month names
                                    const startMonth = getMonthAbbreviation(
                                      nextWeekStart.getMonth(),
                                      t
                                    );
                                    const startDay = nextWeekStart.getDate();
                                    const endDay = nextWeekEnd.getDate();
                                    const endMonth = getMonthAbbreviation(
                                      nextWeekEnd.getMonth(),
                                      t
                                    );

                                    if (startMonth === endMonth) {
                                      return `${startMonth} ${startDay}-${endDay}`;
                                    }

                                    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                                  })()}
                                </span>
                              </div>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              }

              {/* Week Focus Overview - Only show for real weeks, not generate weeks */}
              {(() => {
                // Determine if we're viewing a real week or a "generate next week" state
                const maxWeeks =
                  hasMultipleWeeks && activeProgram?.programs
                    ? activeProgram.programs.length
                    : is4WeekProgram
                      ? 4
                      : 1;

                const isRealWeek =
                  selectedWeek >= 1 && selectedWeek <= maxWeeks;

                // For custom programs, only show overview for week 1 unless user is logged in
                if (isCustomProgram && !user && selectedWeek > 1) {
                  return null;
                }

                // Only render overview if we're viewing a real week
                if (!isRealWeek) {
                  return null;
                }

                if (shimmer) {
                  return (
                    <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-6 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
                        <div className="shimmer h-5 w-40 bg-gray-700 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="shimmer h-4 w-3/4 bg-gray-700 rounded" />
                        <div className="shimmer h-4 w-2/3 bg-gray-700 rounded" />
                      </div>
                    </div>
                  );
                }

                return (
                  <WeekOverview
                    program={(() => {
                      // For multi-week programs, use the selected week's program data
                      if (
                        hasMultipleWeeks &&
                        activeProgram?.programs &&
                        activeProgram.programs[selectedWeek - 1]
                      ) {
                        return activeProgram.programs[selectedWeek - 1];
                      }
                      // For single week programs, use the main program
                      return program;
                    })()}
                    selectedWeek={selectedWeek}
                    hasMultipleWeeks={hasMultipleWeeks}
                    activeProgram={activeProgram}
                    timeFrame={timeFrame}
                    isExpanded={showWeekOverview}
                    onToggle={() => setShowWeekOverview(!showWeekOverview)}
                    isGenerating={generatingDay !== null}
                  />
                );
              })()}

              {/* Selected Week Content or SignUp Card or NextWeekCard */}
               {(() => {
                if (isCustomProgram && !user && selectedWeek > 1) {
                  return <SignUpToContinueCard t={t} router={router} />;
                }

                // For multi-week programs, show content for any valid week
                const maxWeeks =
                  hasMultipleWeeks && activeProgram?.programs
                    ? activeProgram.programs.length
                    : 4;
                if (
                  is4WeekProgram &&
                  selectedWeek >= 1 &&
                  selectedWeek <= maxWeeks &&
                  selectedWeekData
                ) {
                   if (shimmer) {
                     // Explicit summary shimmer card while generating
                     return (
                       <div className="bg-gray-800/50 rounded-2xl ring-1 ring-gray-700/50 p-4 mb-4">
                         <div className="flex items-center gap-3 mb-3">
                           <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
                           <div className="shimmer h-5 w-44 bg-gray-700 rounded" />
                         </div>
                         <div className="space-y-2 mb-4">
                           <div className="shimmer h-3 w-3/4 bg-gray-700 rounded" />
                           <div className="shimmer h-3 w-2/3 bg-gray-700 rounded" />
                         </div>
                         <div className="grid grid-cols-4 gap-3">
                           {Array.from({ length: 8 }).map((_, i) => (
                             <div key={i} className="shimmer h-10 w-full bg-gray-700/60 rounded-lg" />
                           ))}
                         </div>
                       </div>
                     );
                   }
                  // Show the selected week's content
                  return (
                    <>
                      {/* Generation Progress Indicator */}
                      {generatingDay !== null && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>
                            {generatingDay === 0 
                              ? t('exerciseProgram.generatingOverview')
                              : t('exerciseProgram.generatingDay', { current: String(generatingDay), total: '7' })}
                          </span>
                        </div>
                      )}
                      
                      {/* Day Tabs */}
                      <div className="overflow-x-auto scrollbar-hide mb-4">
                        <div className="flex space-x-2 min-w-max">
                          {shimmer ? (
                            Array.from({ length: 7 }).map((_, i) => (
                              <div key={i} className="shimmer h-10 w-20 bg-gray-800/60 rounded-lg" />
                            ))
                          ) : (
                          // Sort days by day.day to ensure chronological order
                          ([...selectedWeekData.days]
                            .sort((a, b) => a.day - b.day)
                            .map((day) => {
                              const isDayGenerated = generatedDays.includes(day.day);
                              const isDayGenerating = generatingDay === day.day;
                              const isSelected = expandedDays.includes(day.day);
                              
                              return (
                              <button
                                key={day.day}
                                data-day={day.day}
                                onClick={() => isDayGenerated && handleDayClick(day.day)}
                                disabled={!isDayGenerated}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex flex-col items-center relative ${
                                  isSelected && isDayGenerated
                                    ? 'bg-indigo-600 text-white'
                                    : isDayGenerating
                                      ? 'bg-violet-500/15 text-violet-300'
                                      : isDayGenerated
                                        ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        : 'bg-gray-800/30 text-gray-500 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                {/* Generating indicator - inside button */}
                                {isDayGenerating && (
                                  <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                                )}
                                <span className={`text-sm mb-1 ${isDayGenerating ? 'opacity-100' : 'opacity-80'}`}>
                                  {getDayShortName(day.day, t)}
                                </span>
                                {isDayGenerating ? (
                                  <span className="text-xs mt-1 text-violet-300">
                                    <svg className="w-3 h-3 animate-spin inline" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  </span>
                                ) : !isDayGenerated ? (
                                  <span className="text-xs mt-1 opacity-60">
                                    —
                                  </span>
                                ) : day.isRestDay ? (
                                  <span className="text-xs mt-1 opacity-80">
                                    {t('exerciseProgram.day.rest')}
                                  </span>
                                ) : (
                                  <span className="text-xs mt-1 opacity-80">
                                    {t('calendar.workout')}
                                  </span>
                                )}
                              </button>
                              );
                            }))
                          )}
                        </div>
                      </div>

                      {/* Day Content */}
                      {(shimmer ? [1] : expandedDays).map((dayNumber) => {
                        const day = selectedWeekData.days.find(
                          (d) => d.day === dayNumber
                        );
                        const isDayGenerated = generatedDays.includes(dayNumber);
                        const isDayGenerating = generatingDay === dayNumber;
                        // Shimmer if: full page shimmer, day not generated yet, OR day is currently generating
                        const shouldShimmerDay = shimmer || !isDayGenerated;
                        
                        const placeholder: ProgramDay = {
                          day: dayNumber,
                          description: isDayGenerating ? 'Generating...' : 'Loading...',
                          exercises: [],
                          isRestDay: false,
                        } as any;
                        const safeDay = shouldShimmerDay ? placeholder : day;
                        if (!safeDay) return null;

                        // Get the correct day index based on day.day, not array position
                        const dayIndex = (safeDay.day || 1) - 1; // Subtract 1 since day.day is 1-based

                        return (
                          <ProgramDaySummaryComponent
                            key={safeDay.day}
                            day={safeDay}
                            dayName={dayName(dayIndex + 1)}
                            isHighlighted={safeDay.day === 1}
                            shimmer={shouldShimmerDay}
                            autoNavigateIfEmpty={false}
                            autoNavigateOnShimmer={false}
                            onClick={() =>
                              !shouldShimmerDay && handleDayDetailClick(safeDay, dayName(dayIndex + 1))
                            }
                          />
                        );
                      })}
                    </>
                  );
                } else if (
                  selectedWeek === 1 &&
                  selectedWeekData &&
                  !is4WeekProgram
                ) {
                  // Show regular program content (single week)
                  if (shimmer) {
                    return (
                      <div className="bg-gray-800/50 rounded-2xl ring-1 ring-gray-700/50 p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
                          <div className="shimmer h-5 w-44 bg-gray-700 rounded" />
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="shimmer h-3 w-3/4 bg-gray-700 rounded" />
                          <div className="shimmer h-3 w-2/3 bg-gray-700 rounded" />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="shimmer h-10 w-full bg-gray-700/60 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      {/* Generation Progress Indicator */}
                      {generatingDay !== null && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>
                            {generatingDay === 0 
                              ? t('exerciseProgram.generatingOverview')
                              : t('exerciseProgram.generatingDay', { current: String(generatingDay), total: '7' })}
                          </span>
                        </div>
                      )}
                      
                      {/* Day Tabs */}
                      <div className="overflow-x-auto scrollbar-hide mb-4">
                        <div className="flex space-x-2 min-w-max">
                          {shimmer ? (
                            Array.from({ length: 7 }).map((_, i) => (
                              <div key={i} className="shimmer h-10 w-20 bg-gray-800/60 rounded-lg" />
                            ))
                          ) : (
                            // Sort days by day.day to ensure chronological order
                            ([...selectedWeekData.days]
                              .sort((a, b) => a.day - b.day)
                              .map((day) => {
                                const isDayGenerated = generatedDays.includes(day.day);
                                const isDayGenerating = generatingDay === day.day;
                                const isSelected = expandedDays.includes(day.day);
                                
                                return (
                                <button
                                  key={day.day}
                                  data-day={day.day}
                                  onClick={() => isDayGenerated && handleDayClick(day.day)}
                                  disabled={!isDayGenerated}
                                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex flex-col items-center relative ${
                                    isSelected && isDayGenerated
                                      ? 'bg-indigo-600 text-white'
                                      : isDayGenerating
                                        ? 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40'
                                        : isDayGenerated
                                          ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                          : 'bg-gray-800/30 text-gray-500 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  {/* Generating indicator - inside button */}
                                  {isDayGenerating && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                                  )}
                                  <span className={`text-sm mb-1 ${isDayGenerating ? 'opacity-100' : 'opacity-80'}`}>
                                    {getDayShortName(day.day, t)}
                                  </span>
                                  {isDayGenerating ? (
                                    <span className="text-xs mt-1 text-violet-300">
                                      <svg className="w-3 h-3 animate-spin inline" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                      </svg>
                                    </span>
                                  ) : !isDayGenerated ? (
                                    <span className="text-xs mt-1 opacity-60">
                                      —
                                    </span>
                                  ) : day.isRestDay ? (
                                    <span className="text-xs mt-1 opacity-80">
                                      {t('exerciseProgram.day.rest')}
                                    </span>
                                  ) : (
                                    <span className="text-xs mt-1 opacity-80">
                                      {t('calendar.workout')}
                                    </span>
                                  )}
                                </button>
                                );
                              }))
                          )}
                        </div>
                      </div>

                      {/* Day Content */}
                      {expandedDays.map((dayNumber) => {
                        const day = selectedWeekData.days.find(
                          (d) => d.day === dayNumber
                        );
                        const isDayGenerated = generatedDays.includes(dayNumber);
                        const isDayGenerating = generatingDay === dayNumber;
                        // Shimmer if day not generated yet (including while generating)
                        const shouldShimmerDay = !isDayGenerated;
                        
                        // Create placeholder if day not generated yet
                        const placeholder: ProgramDay = {
                          day: dayNumber,
                          description: isDayGenerating ? 'Generating...' : 'Loading...',
                          exercises: [],
                          isRestDay: false,
                        };
                        
                        const displayDay = shouldShimmerDay ? placeholder : day;
                        if (!displayDay) return null;

                        // Get the correct day index based on day.day, not array position
                        const dayIndex = displayDay.day - 1; // Subtract 1 since day.day is 1-based

                        return (
                          <ProgramDaySummaryComponent
                            key={displayDay.day}
                            day={displayDay}
                            dayName={dayName(dayIndex + 1)}
                            isHighlighted={displayDay.day === 1}
                            shimmer={shouldShimmerDay}
                            autoNavigateIfEmpty={false}
                            autoNavigateOnShimmer={false}
                            onClick={() =>
                              !shouldShimmerDay && handleDayDetailClick(displayDay, dayName(dayIndex + 1))
                            }
                          />
                        );
                      })}
                    </>
                  );
                } else if (
                  selectedWeek > maxWeeks ||
                  (selectedWeek > 1 && !is4WeekProgram)
                ) {
                  // This case is for selectedWeek beyond available weeks
                  return renderNextWeekCard();
                }

                // Fallback
                return null;
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
