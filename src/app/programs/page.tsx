'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useUser } from '@/app/context/UserContext';
import { ProgramStatus, detectBodyRegion, ProgramDay, getDayType } from '@/app/types/program';
import { useAuth } from '@/app/context/AuthContext';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';
import { Chip } from '@/app/components/ui/Chip';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { nb, enUS } from 'date-fns/locale';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { ProgramType } from '@shared/types';

// Helper to get border color class based on program type
function getBorderColorClass(type: ProgramType | string): string {
  switch (type) {
    case ProgramType.Exercise:
    case 'exercise':
      return 'border-l-indigo-500';
    case ProgramType.Recovery:
    case 'recovery':
      return 'border-l-amber-500';
    case ProgramType.ExerciseAndRecovery:
    case 'exercise_and_recovery':
      return 'border-l-purple-500'; // Blend of indigo and amber
    default:
      return 'border-l-gray-500';
  }
}

// Day types to display (excluding rest)
type DisplayDayType = 'strength' | 'cardio' | 'recovery';

// Extract day types from program days (excluding rest days)
function extractDayTypes(days: ProgramDay[] | undefined): DisplayDayType[] {
  if (!days || days.length === 0) return [];
  
  const types = new Set<DisplayDayType>();
  
  for (const day of days) {
    const dayType = getDayType(day);
    // Only include strength, cardio, and recovery (not rest)
    if (dayType === 'strength' || dayType === 'cardio' || dayType === 'recovery') {
      types.add(dayType);
    }
  }
  
  // Return in a consistent order: strength, cardio, recovery
  const order: DisplayDayType[] = ['strength', 'cardio', 'recovery'];
  return order.filter(type => types.has(type));
}

// Day type icons
const dayTypeIcons: Record<DisplayDayType, React.ReactNode> = {
  strength: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v12H4zM16 6h4v12h-4zM8 11h8v2H8z" />
    </svg>
  ),
  cardio: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  recovery: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

// Map day type to Chip variant
const dayTypeToVariant: Record<DisplayDayType, 'strength' | 'cardio' | 'recovery'> = {
  strength: 'strength',
  cardio: 'cardio',
  recovery: 'recovery',
};

// Day type chips component - displays all day types found in the program using Chip
function DayTypeChips({ days, t }: { days: ProgramDay[] | undefined; t: (key: string) => string }) {
  const dayTypes = extractDayTypes(days);
  
  if (dayTypes.length === 0) return null;
  
  return (
    <>
      {dayTypes.map(type => (
        <Chip key={type} variant={dayTypeToVariant[type]} size="sm" icon={dayTypeIcons[type]} iconPosition="left">
          {t(`programs.dayType.${type}`)}
        </Chip>
      ))}
    </>
  );
}

// Duration chip component
function DurationChip({ duration }: { duration: string | undefined }) {
  if (!duration) return null;
  
  const clockIcon = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  return (
    <Chip variant="subtle" size="sm" icon={clockIcon} iconPosition="left">
      {duration}
    </Chip>
  );
}


function ProgramsContent() {
  const {
    userPrograms,
    isLoading,
    loadUserPrograms,
    programStatus,
  } = useUser();
  const { deleteProgram } = useAuth();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'recovery'>(
    'all'
  );
  // Track locally deleted programs for immediate UI updates
  const [deletedPrograms, setDeletedPrograms] = useState<Set<string>>(
    new Set()
  );

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  // Track if we've attempted to load programs to prevent infinite loops
  const hasAttemptedLoad = useRef(false);

  // Load programs if empty (only once)
  useEffect(() => {
    if (!isLoading && userPrograms.length === 0 && !hasAttemptedLoad.current) {
      hasAttemptedLoad.current = true;
      loadUserPrograms();
    }
    // Reset the flag if we successfully have programs
    if (userPrograms.length > 0) {
      hasAttemptedLoad.current = false;
    }
  }, [isLoading, userPrograms.length, loadUserPrograms]);

  // Handle delete program
  const handleDeleteProgram = (programId: string) => {
    setProgramToDelete(programId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;

    // Optimistic UI update - remove immediately
    setDeletedPrograms((prev) => new Set(prev).add(programToDelete));
    setDeleteDialogOpen(false);
    const programIdToDelete = programToDelete;
    setProgramToDelete(null);

    // Delete in background
    try {
      const success = await deleteProgram(programIdToDelete);
      if (!success) {
        // Revert on failure
        setDeletedPrograms((prev) => {
          const newSet = new Set(prev);
          newSet.delete(programIdToDelete);
          return newSet;
        });
        console.error('Failed to delete program');
      }
    } catch (error) {
      // Revert on error
      setDeletedPrograms((prev) => {
        const newSet = new Set(prev);
        newSet.delete(programIdToDelete);
        return newSet;
      });
      console.error('Error deleting program:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProgramToDelete(null);
  };

  // Select date locale based on user's language
  const dateLocale = locale === 'nb' ? nb : enUS;

  // Programs remaining after filtering out locally deleted ones
  const remainingPrograms = userPrograms.filter(
    (program) => !deletedPrograms.has(program.docId)
  );

  // Sort programs by updatedAt (newest first)
  const filteredAndSortedPrograms = [...remainingPrograms]
    // Apply the type filter (exercise_and_recovery shows under both exercise and recovery)
    .filter((program) => {
      if (filterType === 'all') return true;
      if (filterType === 'exercise') {
        return program.type === 'exercise' || program.type === 'exercise_and_recovery';
      }
      if (filterType === 'recovery') {
        return program.type === 'recovery' || program.type === 'exercise_and_recovery';
      }
      return program.type === filterType;
    })
    // Sort by updatedAt (newest first), fallback to createdAt
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    });

  const handleProgramClick = (programIndex: number) => {
    const program = userPrograms[programIndex];
    if (!program) return;

    console.log('📋 Program clicked:', program.title);

    // Navigate to program page with the program ID
    router.push(`/program?id=${encodeURIComponent(program.docId)}`);
  };

  // Handle toggling active status with improved responsiveness
  // Navigate to home page to create a new program
  const handleCreateNewProgram = () => {
    router.push('/app/questionnaire');
  };

  // Render a loading placeholder only if we have no programs yet AND are loading
  // Do NOT show this when a program is being generated; show shimmer card instead
  if (isLoading && remainingPrograms.length === 0 && programStatus !== ProgramStatus.Generating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  // When generating, avoid the empty state and show the shimmer card instead
  // Use remainingPrograms to account for optimistically deleted programs
  if (remainingPrograms.length === 0 && programStatus !== ProgramStatus.Generating) {
    const emptyText = (() => {
      if (filterType === 'exercise') {
        return t('programs.noFilteredPrograms').replace(
          '{type}',
          t('programs.filter.exercise').toLowerCase()
        );
      }
      if (filterType === 'recovery') {
        return t('programs.noFilteredPrograms').replace(
          '{type}',
          t('programs.filter.recovery').toLowerCase()
        );
      }
      return t('programs.noPrograms.message');
    })();
    return (
      <>
        <div className="mx-auto max-w-6xl w-full h-full flex flex-col items-center justify-center p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">
            {t('programs.noPrograms')}
          </h2>
          <p className="text-gray-300 text-center max-w-md">{emptyText}</p>
          <button
            onClick={handleCreateNewProgram}
            className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200"
          >
            {t('programs.createProgram')}
          </button>
        </div>

        {/* Floating Action Button (aligned with content bounds) */}
        <div className="fixed bottom-6 left-0 right-0 pointer-events-none z-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex justify-end">
              <button
                onClick={handleCreateNewProgram}
                className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 pointer-events-auto"
                aria-label={t('programs.createProgram')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show "no programs found" message when filtered list is empty
  // When generating, avoid this and show the shimmer card instead
  if (filteredAndSortedPrograms.length === 0 && programStatus !== ProgramStatus.Generating) {
    const emptyText = (() => {
      if (filterType === 'exercise') {
        return t('programs.noFilteredPrograms').replace(
          '{type}',
          t('programs.filter.exercise').toLowerCase()
        );
      }
      if (filterType === 'recovery') {
        return t('programs.noFilteredPrograms').replace(
          '{type}',
          t('programs.filter.recovery').toLowerCase()
        );
      }
      return t('programs.noPrograms.message');
    })();
    return (
      <>
        <div className="mx-auto max-w-6xl w-full h-full flex flex-col">
          {/* Header containing title and buttons */}
          <div className="bg-gray-900 px-4 pb-4 pt-6">
            {/* Filter buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {t('programs.filter.all')}
              </button>
              <button
                onClick={() => setFilterType('exercise')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'exercise'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {t('programs.filter.exercise')}
              </button>
              <button
                onClick={() => setFilterType('recovery')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'recovery'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {t('programs.filter.recovery')}
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <p className="text-gray-300 text-center">{emptyText}</p>
          </div>
        </div>

        {/* Floating Action Button (aligned with content bounds) */}
        <div className="fixed bottom-6 left-0 right-0 pointer-events-none z-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex justify-end">
              <button
                onClick={handleCreateNewProgram}
                className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 pointer-events-auto"
                aria-label={t('programs.createProgram')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl w-full h-full flex flex-col">
        {/* Header containing title and buttons */}
        <div className="bg-gray-900 px-4 pb-4 pt-6">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {t('programs.filter.all')}
            </button>
            <button
              onClick={() => setFilterType('exercise')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'exercise'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {t('programs.filter.exercise')}
            </button>
            <button
              onClick={() => setFilterType('recovery')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'recovery'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {t('programs.filter.recovery')}
            </button>
          </div>
        </div>

      {/* Program list */}
      <div className="flex-1 px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-24 md:pb-8">
          {programStatus === ProgramStatus.Generating && (
            <div
              onClick={() => router.push('/program')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') router.push('/program');
              }}
              className="relative bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-colors duration-200 hover:bg-gray-700/50 cursor-pointer border-l-4 border-l-indigo-500"
            >
              <div className="p-4">
                {/* Title row with delete placeholder */}
                <div className="flex justify-between items-center mb-3">
                  <div className="shimmer h-5 w-40 bg-gray-700 rounded" />
                  <div className="shimmer h-4 w-4 bg-gray-700 rounded" />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700/50 my-3" />

                {/* Modality and duration chips */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="shimmer h-6 w-20 bg-gray-700 rounded-full" />
                  <div className="shimmer h-6 w-24 bg-gray-700 rounded-full" />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700/50 my-3" />

                {/* Target areas text */}
                <div className="shimmer h-3 w-48 bg-gray-700 rounded mb-3" />

                {/* Created date */}
                <div className="shimmer h-3 w-32 bg-gray-700 rounded" />
              </div>

              <style jsx>{`
                .shimmer {
                  position: relative;
                  overflow: hidden;
                }
                .shimmer::after {
                  position: absolute;
                  inset: 0;
                  transform: translateX(-100%);
                  background-image: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 0,
                    rgba(255, 255, 255, 0.08) 20%,
                    rgba(255, 255, 255, 0.16) 60%,
                    rgba(255, 255, 255, 0) 100%
                  );
                  animation: shimmer 1.5s infinite;
                  content: '';
                }
                @keyframes shimmer {
                  100% {
                    transform: translateX(100%);
                  }
                }
              `}</style>
            </div>
          )}
          {filteredAndSortedPrograms.map((program) => {
            // Find the original index in userPrograms using docId for reliable identification
            const originalIndex = userPrograms.findIndex(
              (p) => p.docId === program.docId
            );

            // Get the most recent week's program (last in the array)
            const exerciseProgram = program.programs[program.programs.length - 1] || program.programs[0];
            
            // Get workout duration
            const duration = program.questionnaire?.workoutDuration;
            
            // Get the days from the program for day type analysis
            const programDays = exerciseProgram?.days;
            
            // Format target areas - detect body region or show individual parts
            const targetAreas = exerciseProgram?.targetAreas || [];
            const bodyRegion = detectBodyRegion(targetAreas);
            
            // Get display text based on body region
            const getTargetAreasDisplay = (): { text: string; isRegion: boolean } => {
              switch (bodyRegion) {
                case 'fullBody':
                  return { text: t('profile.bodyRegions.full_body'), isRegion: true };
                case 'upperBody':
                  return { text: t('profile.bodyRegions.upper_body'), isRegion: true };
                case 'lowerBody':
                  return { text: t('profile.bodyRegions.lower_body'), isRegion: true };
                default:
                  // Custom selection - show individual parts
                  const displayedAreas = targetAreas.slice(0, 3).map(area => 
                    t(`program.bodyPart.${area.toLowerCase().replace(/\s+/g, '_')}`)
                  );
                  const remainingCount = targetAreas.length - 3;
                  const text = displayedAreas.join(' • ') + 
                    (remainingCount > 0 ? ` +${remainingCount}` : '');
                  return { text, isRegion: false };
              }
            };
            
            const targetAreasDisplay = getTargetAreasDisplay();

            return (
              <div
                key={originalIndex}
                onClick={() => handleProgramClick(originalIndex)}
                className={`relative rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-all duration-200 hover:ring-gray-600/50 hover:translate-y-[-1px] cursor-pointer border-l-4 bg-gray-800/50 ${getBorderColorClass(program.type)}`}
              >
                <div className="p-4">
                  {/* Title row with delete button */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-medium text-white truncate pr-3 flex-1">
                      {program.title || t('programs.defaultTitle')}
                    </h2>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteProgram(program.docId);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors duration-200 p-1 flex-shrink-0"
                      aria-label={t('programs.deleteProgram')}
                      title={t('programs.deleteProgram')}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/30 my-3" />

                  {/* Day types and duration chips */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <DayTypeChips days={programDays} t={t} />
                    <DurationChip duration={duration} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/30 my-3" />

                  {/* Target areas as text */}
                  {targetAreas.length > 0 ? (
                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        <circle cx="12" cy="12" r="5" strokeWidth={2} />
                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                        <path strokeLinecap="round" strokeWidth={2} d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                      </svg>
                      {targetAreasDisplay.text}
                    </p>
                  ) : program.questionnaire?.cardioType ? (
                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {t(`program.cardioType.${program.questionnaire.cardioType.toLowerCase()}`)}
                    </p>
                  ) : null}

                  {/* Created date */}
                  <p className="text-xs text-gray-500">
                    {t('programs.created')}{' '}
                    {program.createdAt
                      ? (() => {
                          const formattedDate = format(
                            new Date(program.createdAt),
                            'MMM d, yyyy',
                            { locale: dateLocale }
                          );
                          return (
                            formattedDate.charAt(0).toUpperCase() +
                            formattedDate.slice(1)
                          );
                        })()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDeleteProgram}
        title={t('programs.deleteDialog.title')}
        description={t('programs.deleteDialog.description')}
        confirmText={t('programs.deleteDialog.confirm')}
        cancelText={t('programs.deleteDialog.cancel')}
        confirmButtonStyle="danger"
      />
    </div>

    {/* Floating Action Button (aligned with content bounds) */}
    <div className="fixed bottom-6 left-0 right-0 pointer-events-none z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex justify-end">
          <button
            onClick={handleCreateNewProgram}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 pointer-events-auto"
            aria-label={t('programs.createProgram')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </>
  );
}

export default function ProgramsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col">
      <NavigationMenu mobileTitle={t('nav.programs')} />
      <Suspense fallback={null}>
        <ProgramsContent />
      </Suspense>
    </div>
  );
}
