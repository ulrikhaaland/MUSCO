'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useUser } from '@/app/context/UserContext';
import { ProgramStatus } from '@/app/types/program';
import { useAuth } from '@/app/context/AuthContext';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { nb, enUS } from 'date-fns/locale';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';

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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
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

  // Sort programs by date
  const filteredAndSortedPrograms = [...userPrograms]
    // Filter out locally deleted programs first
    .filter((program) => !deletedPrograms.has(program.docId))
    // Apply the type filter
    .filter((program) => {
      if (filterType === 'all') return true;
      return program.type === filterType;
    })
    // Then sort by createdAt (matches displayed date)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? bTime - aTime : aTime - bTime;
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
  if (isLoading && userPrograms.length === 0 && programStatus !== ProgramStatus.Generating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  // When generating, avoid the empty state and show the shimmer card instead
  if (userPrograms.length === 0 && programStatus !== ProgramStatus.Generating) {
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-white">
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

        {/* Floating Action Button (visible even with no programs) */}
        <button
          onClick={handleCreateNewProgram}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 z-50"
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
      <div className="mx-auto max-w-6xl w-full h-full flex flex-col">
        {/* Header containing title and buttons */}
        <div className="bg-gray-900 px-4 pb-4 pt-6">
          {/* Filter and Sorting buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  sortBy === 'newest'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {t('programs.sort.newest')}
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  sortBy === 'oldest'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {t('programs.sort.oldest')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <p className="text-gray-300 text-center">{emptyText}</p>
        </div>

        {/* Floating Action Button (also visible for filtered-empty state) */}
        <button
          onClick={handleCreateNewProgram}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 z-50"
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
    );
  }

  return (
    <div className="mx-auto max-w-6xl w-full h-full flex flex-col">
      {/* Header containing title and buttons */}
      <div className="bg-gray-900 px-4 pb-4 pt-6">
        {/* Filter and Sorting buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                sortBy === 'newest'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {t('programs.sort.newest')}
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                sortBy === 'oldest'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {t('programs.sort.oldest')}
            </button>
          </div>
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
              className="relative bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-colors duration-200 hover:bg-gray-700/50 cursor-pointer p-5 flex flex-col h-full"
            >
              {/* Title */}
              <div className="flex justify-between items-start mb-3">
                <div className="shimmer h-6 w-48 bg-gray-700 rounded" />
                <div className="w-10" />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700/50 my-3" />

              {/* Key Program Statistics (match layout of real card) */}
              <div className="flex justify-between items-center mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center w-1/3">
                    <div className="shimmer h-6 w-6 mx-auto bg-gray-700 rounded mb-2" />
                    <div className="shimmer h-3 w-16 mx-auto bg-gray-700 rounded" />
                  </div>
                ))}
              </div>

              {/* Target areas placeholder */}
              <div className="mb-3">
                <div className="shimmer h-3 w-20 bg-gray-700 rounded mb-1" />
                <div className="flex flex-wrap gap-1">
                  <div className="shimmer h-5 w-16 bg-gray-700 rounded-full" />
                  <div className="shimmer h-5 w-20 bg-gray-700 rounded-full" />
                  <div className="shimmer h-5 w-16 bg-gray-700 rounded-full" />
                  <div className="shimmer h-5 w-12 bg-gray-700 rounded-full" />
                </div>
              </div>

              {/* Footer (Created date and right actions) */}
              <div className="pt-3 mt-auto flex justify-between items-center">
                <div className="shimmer h-3 w-40 bg-gray-700 rounded" />
                <div className="flex items-center space-x-3">
                  <div className="shimmer h-4 w-4 bg-gray-700 rounded" />
                  <div className="shimmer w-10 h-5 bg-gray-700 rounded-full" />
                </div>
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

            // Get the first exercise program from the list
            const exerciseProgram = program.programs[0];

            return (
              <div
                key={originalIndex}
                onClick={() => handleProgramClick(originalIndex)}
                className="relative bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-colors duration-200 hover:bg-gray-700/50 cursor-pointer group flex flex-col"
              >
                <div className="p-5 flex flex-col h-full">
                  {/* Program title and type */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-medium text-white truncate pr-2">
                      {program.title || t('programs.defaultTitle')}
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50 my-3"></div>

                  {/* Key Program Statistics */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {program.programs.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t('programs.stats.weeks')}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {exerciseProgram.days?.reduce((total, day) => {
                          return total + (day.isRestDay ? 0 : 1); // Count workout days
                        }, 0) || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t('programs.stats.exerciseDays')}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {exerciseProgram.days?.reduce((total, day) => {
                          return total + (day.isRestDay ? 1 : 0); // Count rest days
                        }, 0) || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t('programs.stats.restDays')}
                      </p>
                    </div>
                  </div>

                  {/* Target areas or cardio summary */}
                  {exerciseProgram.targetAreas &&
                  exerciseProgram.targetAreas.length > 0 ? (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {t('programs.targetAreas')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {exerciseProgram.targetAreas
                          .slice(0, 3)
                          .map((area, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full"
                            >
                              {t(
                                `program.bodyPart.${area.toLowerCase().replace(/\s+/g, '_')}`
                              )}
                            </span>
                          ))}
                        {exerciseProgram.targetAreas.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                            {t('programs.targetAreas.more').replace(
                              '{count}',
                              (
                                exerciseProgram.targetAreas.length - 3
                              ).toString()
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Cardio</p>
                      <div className="flex flex-wrap gap-1">
                        {program.questionnaire?.cardioType && (
                          <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                            {t(
                              `program.cardioType.${program.questionnaire.cardioType.toLowerCase()}`
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Creation date and toggle switch */}
                  <div className="text-xs text-gray-400 pt-3 mt-auto flex justify-between items-center">
                    <span>
                      {t('programs.created')}{' '}
                      {program.createdAt
                        ? (() => {
                            const formattedDate = format(
                              new Date(program.createdAt),
                              'MMM d, yyyy',
                              { locale: dateLocale }
                            );
                            // Capitalize the first letter of the month
                            return (
                              formattedDate.charAt(0).toUpperCase() +
                              formattedDate.slice(1)
                            );
                          })()
                        : 'N/A'}
                    </span>

                    {/* Delete button and Toggle switch */}
                    <div className="flex items-center space-x-3">
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          e.preventDefault();
                          handleDeleteProgram(program.docId);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateNewProgram}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200 z-50"
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
