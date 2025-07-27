'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { nb, enUS } from 'date-fns/locale';

function ProgramsContent() {
  const { userPrograms, isLoading, selectProgram, toggleActiveProgram, loadUserPrograms } =
    useUser();
  const { deleteProgram } = useAuth();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'recovery'>(
    'all'
  );
  // Track which program is being toggled to avoid flickering
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>(
    {}
  );
  // Track locally deleted programs for immediate UI updates
  const [deletedPrograms, setDeletedPrograms] = useState<Set<string>>(new Set());
  
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
    setDeletedPrograms(prev => new Set(prev).add(programToDelete));
    setDeleteDialogOpen(false);
    const programIdToDelete = programToDelete;
    setProgramToDelete(null);

    // Delete in background
    try {
      const success = await deleteProgram(programIdToDelete);
      if (!success) {
        // Revert on failure
        setDeletedPrograms(prev => {
          const newSet = new Set(prev);
          newSet.delete(programIdToDelete);
          return newSet;
        });
        console.error('Failed to delete program');
      }
    } catch (error) {
      // Revert on error
      setDeletedPrograms(prev => {
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
    // Then sort
    .sort((a, b) => {
      // If both have updatedAt, compare those
      if (a.updatedAt && b.updatedAt) {
        return sortBy === 'newest'
          ? b.updatedAt.getTime() - a.updatedAt.getTime()
          : a.updatedAt.getTime() - b.updatedAt.getTime();
      }

      // If only one has updatedAt, prioritize it
      if (a.updatedAt && !b.updatedAt) {
        return sortBy === 'newest' ? -1 : 1; // a comes first for newest, last for oldest
      }
      if (!a.updatedAt && b.updatedAt) {
        return sortBy === 'newest' ? 1 : -1; // b comes first for newest, last for oldest
      }

      // If neither has updatedAt, fall back to createdAt
      return sortBy === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const handleProgramClick = (programIndex: number) => {
    const program = userPrograms[programIndex];
    if (!program) return;
    
    console.log('📋 Program clicked:', program.title);
    
    // Navigate to program page with the program ID
    router.push(`/program?id=${encodeURIComponent(program.docId)}`);
  };

  // Handle toggling active status with improved responsiveness
  const handleToggleActive = (e: React.MouseEvent, programIndex: number) => {
    // Stop propagation to prevent card click
    e.stopPropagation();
    // Prevent default browser behavior
    e.preventDefault();

    // Get the program details
    const program = userPrograms[programIndex];
    if (!program) return;

    // Get the new toggle state
    const newToggleState = !program.active;

    // Set pending toggle state for immediate UI feedback
    const newPendingToggles: Record<string, boolean> = {};

    // If activating a program, mark all other programs of same type as inactive
    if (newToggleState) {
      userPrograms.forEach((p) => {
        if (p.type === program.type) {
          // Mark active the selected program, inactive all others of same type
          newPendingToggles[p.docId] = p.docId === program.docId;
        }
      });
    } else {
      // Just toggling current program to inactive
      newPendingToggles[program.docId] = false;
    }

    // Update pending toggles state for immediate UI feedback
    setPendingToggles(newPendingToggles);

    // Toggle the program active state in the background
    toggleActiveProgram(programIndex).catch((error) => {
      console.error('Error toggling program:', error);
      // Revert all pending toggles on error
      setPendingToggles({});
    });
  };

  // Navigate to home page to create a new program
  const handleCreateNewProgram = () => {
    router.push('/');
  };

  // Render a loading placeholder only if we have no programs yet AND are loading
  if (isLoading && userPrograms.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (userPrograms.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-white">
        <h2 className="text-2xl font-semibold mb-4">
          {t('programs.noPrograms')}
        </h2>
        <p className="text-gray-300 text-center max-w-md">
          {t('programs.noPrograms.message')}
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200"
        >
          {t('programs.createProgram')}
        </button>
      </div>
    );
  }

  // Show "no programs found" message when filtered list is empty
  if (filteredAndSortedPrograms.length === 0) {
    return (
      <div className="container mx-auto h-full flex flex-col">
        {/* Fixed header containing both title and buttons */}
        <div className="sticky top-0 bg-gray-900 z-10 px-4 pb-4 pt-4">
          {/* Title section */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-10"></div>
            <h1 className="text-app-title text-center text-white">
              {t('programs.title')}
            </h1>
            <div className="w-10"></div>
          </div>

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
          <p className="text-gray-300 text-center">
            {t('programs.noPrograms.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
      {/* Fixed header containing both title and buttons */}
      <div className="sticky top-0 bg-gray-900 z-10 px-4 pb-4 pt-4">
        {/* Title section */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10"></div>
          <h1 className="text-app-title text-center text-white">
            {t('programs.title')}
          </h1>
          <div className="w-10"></div>
        </div>

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

      {/* Scrollable program list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
          {filteredAndSortedPrograms.map((program, index) => {
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
                className="relative bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-colors duration-200 hover:bg-gray-700/50 cursor-pointer group"
              >
                <div className="p-5">
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
                        1
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

                  {/* Target areas - only show if there are target areas */}
                  {exerciseProgram.targetAreas &&
                    exerciseProgram.targetAreas.length > 0 && (
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
                    )}

                  {/* Creation date and toggle switch */}
                  <div className="text-xs text-gray-400 pt-3 flex justify-between items-center">
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

                      <div className="flex items-center">
                        <span className="text-xs mr-2">
                          {pendingToggles[program.docId] !== undefined
                            ? pendingToggles[program.docId]
                              ? t('programs.status.active')
                              : t('programs.status.inactive')
                            : program.active
                              ? t('programs.status.active')
                              : t('programs.status.inactive')}
                        </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          e.preventDefault(); // Prevent any default behavior
                          handleToggleActive(e, originalIndex);
                        }}
                        className="relative inline-flex items-center cursor-pointer"
                        aria-pressed={
                          pendingToggles[program.docId] !== undefined
                            ? pendingToggles[program.docId]
                            : program.active
                        }
                        aria-label={
                          program.active
                            ? 'Deactivate program'
                            : 'Activate program'
                        }
                      >
                        <div
                          className={`w-10 h-5 rounded-full relative ${
                            pendingToggles[program.docId] !== undefined
                              ? pendingToggles[program.docId]
                                ? 'bg-green-600'
                                : 'bg-gray-600 dark:bg-gray-700'
                              : program.active
                                ? 'bg-green-600'
                                : 'bg-gray-600 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-all ${
                              pendingToggles[program.docId] !== undefined
                                ? pendingToggles[program.docId]
                                  ? 'translate-x-5 bg-white border-white'
                                  : ''
                                : program.active
                                  ? 'translate-x-5 bg-white border-white'
                                  : ''
                            }`}
                          ></span>
                        </div>
                        </button>
                      </div>
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
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Suspense fallback={null}>
        <ProgramsContent />
      </Suspense>
    </div>
  );
}
