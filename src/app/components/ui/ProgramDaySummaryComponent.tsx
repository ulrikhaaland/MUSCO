import { ProgramDay } from '@/app/types/program';
import Chip from './Chip';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface ProgramDaySummaryComponentProps {
  day: ProgramDay;
  dayName: string;
  date?: string;
  onClick?: () => void;
  programTitle?: string;
  isCalendarView?: boolean;
  isHighlighted?: boolean;
  shimmer?: boolean;
  autoNavigateIfEmpty?: boolean;
  autoNavigateOnShimmer?: boolean;
}

export function ProgramDaySummaryComponent({
  day,
  dayName,
  date,
  onClick,
  programTitle,
  isCalendarView = false,
  isHighlighted = false,
  shimmer = false,
  autoNavigateIfEmpty = false,
  autoNavigateOnShimmer = false,
}: ProgramDaySummaryComponentProps) {
  const { t } = useTranslation();
  // Calculate exercise statistics
  const totalExercises = day.exercises?.length || 0;
  const warmupExercises = day.exercises?.filter((ex) => ex.warmup)?.length || 0;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Debounced click handler
  const debouncedClickHandler = useCallback(() => {
    if (!onClick) return;
    
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onClick();
      }, 250);
    };
  }, [onClick]);

  // Handle touch events for mobile feedback
  const handleTouchStart = () => {
    if (!onClick) return;
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 75);
  };

  // Cancel snap during touch
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsTouching(false);
    }
  };

  // Interactive card styles
  const cardStyles = `
    bg-gray-800/50 rounded-xl overflow-hidden 
    transition-all duration-120 ease-out
    ${isHighlighted ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]' : ''}
    ${onClick ? 'outline outline-1 outline-indigo-500/20' : ''}
    ${onClick && !prefersReducedMotion ? 'hover:-translate-y-[3px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:outline-indigo-500/60' : ''}
    ${onClick && prefersReducedMotion ? 'hover:outline-indigo-500/60' : ''}
    ${isTouching && !prefersReducedMotion ? 'scale-[0.98]' : ''}
    ${isTouching && prefersReducedMotion ? 'outline-indigo-500/60' : ''}
    min-h-[44px] px-6 py-4
  `;

  // If configured, navigate automatically when content is empty or when shimmer is real
  const hasNavigatedRef = useRef(false);
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    const noExercises = !day.exercises || day.exercises.length === 0;
    const shouldNavigate = (autoNavigateIfEmpty && noExercises) || (autoNavigateOnShimmer && shimmer);
    if (shouldNavigate && onClick) {
      hasNavigatedRef.current = true;
      onClick();
    }
  }, [autoNavigateIfEmpty, autoNavigateOnShimmer, shimmer, day.exercises, onClick]);

  return (
    <div>
      {onClick ? (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            debouncedClickHandler()?.();
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsTouching(false)}
          className={cardStyles}
          aria-label={t('program.dayAccessibility', {
            dayName: dayName,
            description: day.description
          })}
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h3 className="text-app-title text-white">
                  {shimmer ? <span className="shimmer bg-gray-700 h-5 w-24 inline-block rounded" /> : dayName}
                </h3>
                {shimmer ? (
                  <span className="shimmer inline-block h-5 w-20 bg-gray-700 rounded-full" />
                ) : day.isRestDay ? (
                  <Chip variant="highlight" size="sm">
                    {t('calendar.rest')}
                  </Chip>
                ) : (
                  <Chip variant="default" size="sm">
                    {t('program.activity')}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-6">
                {shimmer ? (
                  <div className="shimmer w-24 h-4 bg-gray-700 rounded" />
                ) : (
                  day.duration !== undefined && day.duration > 0 && (
                  <div className="flex items-center text-gray-400">
                    <svg
                      className="w-4 h-4 mr-1.5"
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
                    {day.duration === 0
                      ? t('program.noDuration')
                      : `${day.duration} ${t('program.minutes')}`}
                  </div>
                ))}
                <span className={`text-2xl text-indigo-400/60 hover:text-indigo-400/90 transition-opacity w-5 h-5 flex items-center cursor-pointer`}>›</span>
              </div>
            </div>
          </div>

          {isCalendarView && programTitle && (
            <div className="mb-2 text-sm font-medium text-indigo-300">
              {programTitle}
            </div>
          )}

          <div className="h-1 mb-1"></div>
          <p className="text-white text-sm mb-4">
            {shimmer ? (
              <span className="shimmer inline-block bg-gray-700 h-4 w-3/4 rounded" />
            ) : (
              day.description
            )}
          </p>

          {/* Exercise breakdown */}
          <div className="space-y-2">
            {/* Exercise count and type breakdown */}
            <div className="flex flex-wrap gap-3">
              {shimmer ? (
                <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
              ) : totalExercises > 0 && (
                <div className="flex items-center text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 mr-1.5 text-indigo-400/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {day.isRestDay
                    ? `${totalExercises} ${totalExercises === 1 ? t('program.optionalRecoveryActivity') : t('program.optionalRecoveryActivities')}`
                    : `${totalExercises} ${totalExercises === 1 ? t('program.exercise') : t('program.exercises')}`}
                </div>
              )}
              {shimmer ? (
                <div className="shimmer w-24 h-4 bg-gray-700 rounded" />
              ) : warmupExercises > 0 && (
                <div className="flex items-center text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 mr-1.5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                  {warmupExercises} {t('program.warmup')}
                </div>
              )}
            </div>

            {/* List all exercises */}
            {shimmer ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-400">
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      <span className="shimmer inline-block bg-gray-700 w-3 h-3 rounded-sm" />
                    </span>
                    <span className="shimmer inline-block bg-gray-700 h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : day.exercises?.length > 0 && (
              <div className="mt-3 space-y-1">
                {day.exercises?.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-400"
                  >
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      {exercise.warmup ? (
                        <span className="text-amber-600">
                          {' '}
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
                              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-indigo-400/80">•</span>
                      )}
                    </span>
                    <span className="truncate">{exercise.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </a>
      ) : (
        <div className={cardStyles}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h3 className="text-app-title text-white">
                  {shimmer ? <span className="shimmer bg-gray-700 h-5 w-24 inline-block rounded" /> : dayName}
                </h3>
                {shimmer ? (
                  <span className="shimmer inline-block h-5 w-20 bg-gray-700 rounded-full" />
                ) : day.isRestDay ? (
                  <Chip variant="highlight" size="sm">
                    {t('program.rest')}
                  </Chip>
                ) : (
                  <Chip variant="default" size="sm">
                    {t('program.activity')}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-6">
                {shimmer ? (
                  <div className="shimmer w-24 h-4 bg-gray-700 rounded" />
                ) : (
                  day.duration !== undefined && day.duration > 0 && (
                  <div className="flex items-center text-gray-400">
                    <svg
                      className="w-4 h-4 mr-1.5"
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
                    {day.duration === 0
                      ? t('program.noDuration')
                      : `${day.duration} ${t('program.minutes')}`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isCalendarView && programTitle && (
            <div className="mb-2 text-sm font-medium text-indigo-300">
              {programTitle}
            </div>
          )}

          <div className="h-1 mb-1"></div>
          <p className="text-white text-sm mb-4">
            {shimmer ? (
              <span className="shimmer inline-block bg-gray-700 h-4 w-3/4 rounded" />
            ) : (
              day.description
            )}
          </p>

          {/* Exercise breakdown */}
          <div className="space-y-2">
            {/* Exercise count and type breakdown */}
            <div className="flex flex-wrap gap-3">
              {shimmer ? (
                <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
              ) : totalExercises > 0 && (
                <div className="flex items-center text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 mr-1.5 text-indigo-400/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {day.isRestDay
                    ? `${totalExercises} ${totalExercises === 1 ? t('program.optionalRecoveryActivity') : t('program.optionalRecoveryActivities')}`
                    : `${totalExercises} ${totalExercises === 1 ? t('program.exercise') : t('program.exercises')}`}
                </div>
              )}
              {shimmer ? (
                <div className="shimmer w-24 h-4 bg-gray-700 rounded" />
              ) : warmupExercises > 0 && (
                <div className="flex items-center text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 mr-1.5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                  {warmupExercises} {t('program.warmup')}
                </div>
              )}
            </div>

            {/* List all exercises */}
            {shimmer ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-400">
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      <span className="shimmer inline-block bg-gray-700 w-3 h-3 rounded-sm" />
                    </span>
                    <span className="shimmer inline-block bg-gray-700 h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : day.exercises?.length > 0 && (
              <div className="mt-3 space-y-1">
                {day.exercises?.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-400"
                  >
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      {exercise.warmup ? (
                        <span className="text-amber-600">
                          {' '}
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
                              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-indigo-400/80">•</span>
                      )}
                    </span>
                    <span className="truncate">{exercise.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after {
          position: absolute; inset: 0; transform: translateX(-100%);
          background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.16) 60%, rgba(255,255,255,0) 100%);
          animation: shimmer 1.5s infinite;
          content: '';
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}
