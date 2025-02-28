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

  // Handle toggling active status
  const handleToggleActive = (e: React.MouseEvent, programIndex: number) => {
    e.stopPropagation(); // Prevent card click
    toggleActiveProgram(programIndex);
  };

  // Navigate to home page to create a new program
  const handleCreateNewProgram = () => {
    router.push('/');
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
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
                {/* Active program indicator */}
                {program.active && (
                  <div className="absolute top-3 right-3 z-10 w-3 h-3 rounded-full bg-green-500">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  </div>
                )}
                
                {/* Toggle active status button - only shown on hover */}
                <button
                  onClick={(e) => handleToggleActive(e, originalIndex)}
                  className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded-md bg-gray-700 text-xs text-white hover:bg-gray-600"
                >
                  {program.active ? 'Deactivate' : 'Activate'}
                </button>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-medium text-white">{exerciseProgram.title || 'Workout Program'}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                        {program.type ? 
                          program.type.charAt(0).toUpperCase() + program.type.slice(1) : 
                          'Custom'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-medium">Weeks:</span> {exerciseProgram.program?.length || 0}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-medium">Target:</span> {
                        exerciseProgram.targetAreas && exerciseProgram.targetAreas.length > 0 
                          ? getBodyRegionFromParts(exerciseProgram.targetAreas)
                          : 'General'
                      }
                    </p>
                    {exerciseProgram.bodyParts && exerciseProgram.bodyParts.length > 0 && (
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">Focus:</span> {
                          getBodyRegionFromParts(exerciseProgram.bodyParts) === 'Custom'
                            ? exerciseProgram.bodyParts.length > 3 
                              ? `${exerciseProgram.bodyParts.slice(0, 3).join(', ')}...` 
                              : exerciseProgram.bodyParts.join(', ')
                            : getBodyRegionFromParts(exerciseProgram.bodyParts)
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-4 flex justify-between items-center">
                    <span>Created: {format(program.createdAt, 'MMM d, yyyy')}</span>
                    {program.updatedAt && (
                      <span>Updated: {format(program.updatedAt, 'MMM d, yyyy')}</span>
                    )}
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