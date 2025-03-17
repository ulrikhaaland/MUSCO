'use client';

import { useState, Suspense } from 'react';
import { useUser } from '@/app/context/UserContext';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ProgramStatus, getBodyRegionFromParts } from '@/app/types/program';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

function ProgramsContent() {
  const { userPrograms, isLoading, selectProgram, toggleActiveProgram } = useUser();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'recovery'>('all');
  // Track which program is being toggled to avoid flickering
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});

  // Sort programs by date
  const filteredAndSortedPrograms = [...userPrograms]
    // Apply the type filter
    .filter(program => {
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
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime();
    });

  const handleProgramClick = (programIndex: number) => {
    // Select the program in context
    selectProgram(programIndex);
    // Navigate to the program page
    router.push('/program');
  };

  // Handle toggling active status with improved responsiveness
  const handleToggleActive = (e: React.MouseEvent, programIndex: number) => {
    // Stop propagation to prevent card click
    e.stopPropagation();
    // Prevent default browser behavior (like scrolling to the top)
    e.preventDefault();

    // Get the program details
    const program = userPrograms[programIndex];
    if (!program) return;

    // Track this program as being toggled (store the target state)
    const newToggleState = !program.active;
    
    // IMMEDIATELY update the pendingToggles state for instant UI feedback
    setPendingToggles(prev => ({
      ...prev,
      [program.docId]: newToggleState
    }));

    // If activating a program, find other programs of the same type to mark as pending inactive
    if (newToggleState) {
      const otherActivePrograms = userPrograms.filter(p => 
        p.docId !== program.docId && p.type === program.type && p.active
      );
      
      if (otherActivePrograms.length > 0) {
        // Create a new pending state for all programs of the same type
        const updatedPending = {...pendingToggles};
        otherActivePrograms.forEach(p => {
          updatedPending[p.docId] = false; // Mark as pending inactive
        });
        setPendingToggles(updatedPending);
      }
    }
    
    // Toggle the program active state in the background
    // We don't wait for this to complete to make the UI feel more responsive
    toggleActiveProgram(programIndex)
      .catch(error => {
        console.error('Error toggling program:', error);
        // If there was an error, revert the toggle state
        setPendingToggles(prev => {
          const updated = {...prev};
          delete updated[program.docId];
          
          // Also revert any other programs we might have toggled
          if (newToggleState) {
            userPrograms.forEach(p => {
              if (p.docId !== program.docId && p.type === program.type) {
                delete updated[p.docId];
              }
            });
          }
          
          return updated;
        });
      });
  };

  // Navigate to home page to create a new program
  const handleCreateNewProgram = () => {
    router.push('/?new=true');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (userPrograms.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-white">
        <h2 className="text-2xl font-semibold mb-4">No Programs Found</h2>
        <p className="text-gray-300 text-center max-w-md">
          You don&apos;t have any workout programs yet. Create your first program to get started!
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200"
        >
          Create Program
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
            <h1 className="text-app-title text-center text-white">My Programs</h1>
            <div className="w-10"></div>
          </div>
          
          {/* Filter and Sorting buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Type filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('exercise')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'exercise' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Exercise
              </button>
              <button
                onClick={() => setFilterType('recovery')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'recovery' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Recovery
              </button>
            </div>
            
            {/* Sort buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  sortBy === 'newest' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  sortBy === 'oldest' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <p className="text-gray-300 text-center">
            No {filterType !== 'all' ? filterType : ''} programs found. Try a different filter or create a new program.
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
          <h1 className="text-app-title text-center text-white">My Programs</h1>
          <div className="w-10"></div>
        </div>
        
        {/* Filter and Sorting buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Type filters */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('exercise')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'exercise' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Exercise
            </button>
            <button
              onClick={() => setFilterType('recovery')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterType === 'recovery' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Recovery
            </button>
          </div>
          
          {/* Sort buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                sortBy === 'newest' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                sortBy === 'oldest' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable program list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8 mb-24">
          {filteredAndSortedPrograms.map((program, index) => {
            // Find the original index in userPrograms
            const originalIndex = userPrograms.findIndex(p => 
              p.createdAt.getTime() === program.createdAt.getTime()
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
                      {exerciseProgram.title || 'Workout Program'}
                    </h2>
                    <span className="flex-shrink-0 text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                      {program.type ? 
                        program.type.charAt(0).toUpperCase() + program.type.slice(1) : 
                        'Custom'}
                    </span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-700/50 my-3"></div>
                  
                  {/* Key Program Statistics */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {exerciseProgram.program?.length || 0}
                      </p>
                      <p className="text-xs text-gray-400">Weeks</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {exerciseProgram.program?.reduce((total, week) => {
                          return total + week.days.reduce((dayTotal, day) => {
                            return dayTotal + (day.isRestDay ? 0 : 1); // Count workout days
                          }, 0);
                        }, 0) || 0}
                      </p>
                      <p className="text-xs text-gray-400">Exercise Days</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {exerciseProgram.program?.reduce((total, week) => {
                          return total + week.days.reduce((dayTotal, day) => {
                            return dayTotal + (day.isRestDay ? 1 : 0); // Count rest days
                          }, 0);
                        }, 0) || 0}
                      </p>
                      <p className="text-xs text-gray-400">Rest Days</p>
                    </div>
                  </div>
                  
                  {/* Target areas - only show if there are target areas */}
                  {exerciseProgram.targetAreas && exerciseProgram.targetAreas.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Target Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {exerciseProgram.targetAreas.slice(0, 3).map((area, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                            {area}
                          </span>
                        ))}
                        {exerciseProgram.targetAreas.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                            +{exerciseProgram.targetAreas.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Creation date and toggle switch */}
                  <div className="text-xs text-gray-400 pt-3 flex justify-between items-center">
                    <span>Created: {format(program.createdAt, 'MMM d, yyyy')}</span>
                    
                    {/* Toggle switch */}
                    <div className="flex items-center">
                      <span className="text-xs mr-2">
                        {pendingToggles[program.docId] !== undefined 
                          ? (pendingToggles[program.docId] ? 'Active' : 'Inactive') 
                          : (program.active ? 'Active' : 'Inactive')}
                      </span>
                      <button
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          e.preventDefault(); // Prevent any default behavior
                          handleToggleActive(e, originalIndex);
                        }}
                        className="relative inline-flex items-center cursor-pointer"
                        aria-pressed={pendingToggles[program.docId] !== undefined 
                          ? pendingToggles[program.docId] 
                          : program.active}
                        aria-label={program.active ? "Deactivate program" : "Activate program"}
                      >
                        <div className={`w-10 h-5 rounded-full relative ${
                          pendingToggles[program.docId] !== undefined 
                            ? (pendingToggles[program.docId] ? 'bg-green-600' : 'bg-gray-600 dark:bg-gray-700')
                            : (program.active ? 'bg-green-600' : 'bg-gray-600 dark:bg-gray-700')
                        }`}>
                          <span 
                            className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-all ${
                              pendingToggles[program.docId] !== undefined 
                                ? (pendingToggles[program.docId] ? 'translate-x-5 bg-white border-white' : '')
                                : (program.active ? 'translate-x-5 bg-white border-white' : '')
                            }`}
                          ></span>
                        </div>
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
        aria-label="Create new program"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gray-900 text-white flex flex-col">
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <ProgramsContent />
      </Suspense>
    </div>
  );
} 