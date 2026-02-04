import { useState, useEffect, useRef } from 'react';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { WeekOverview } from './WeekOverview';
import { ProgramType } from '../../../../shared/types';
import { Exercise, ExerciseProgram, ProgramDay, getDayType } from '@/app/types/program';
import {
  isViewingGeneratingWeek as computeIsViewingGeneratingWeek,
  hasDayData,
  getEffectiveGenerationState,
} from './ExerciseProgramPage.loadingUtils';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useSelectedDay } from '@/app/context/SelectedDayContext';
import { useTranslation } from '@/app/i18n';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from './ToastProvider';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
// CSS import removed - not using transforms for cleaner swap UX

import {
  getStartOfWeek,
  getEndOfWeek,
  getWeekNumber,
  getDayOfWeekMondayFirst,
  addDays,
  getDayShortName,
  getDayFullName,
  getMonthAbbreviation,
} from '@/app/utils/dateutils';

/**
 * Get the translation key and icon for a day type
 */
function getDayTypeInfo(day: ProgramDay): { labelKey: string; icon: 'rest' | 'strength' | 'cardio' | 'recovery' } {
  const dayType = getDayType(day);
  switch (dayType) {
    case 'rest':
      return { labelKey: 'exerciseProgram.day.rest', icon: 'rest' };
    case 'cardio':
      return { labelKey: 'program.cardio', icon: 'cardio' };
    case 'recovery':
      return { labelKey: 'program.recovery', icon: 'recovery' };
    case 'strength':
    default:
      return { labelKey: 'program.strength', icon: 'strength' };
  }
}
import {
  isViewingCustomRecoveryProgram,
  getRecoveryProgramFromSession,
  saveRecoveryProgramToAccount,
  clearRecoveryProgramFromSession,
} from '../../services/recoveryProgramService';
import { SUBSCRIPTIONS_ENABLED, DISABLE_FOLLOWUP_RESTRICTIONS } from '@/app/lib/featureFlags';
import { canGenerateProgram, getNextAllowedGenerationDate } from '@/app/services/programGenerationLimits';

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
  onOverviewVisibilityChange?: (visible: boolean) => void;
  isCustomProgram?: boolean;
  // Incremental generation props
  generatingDay?: number | null;
  generatedDays?: number[];
  generatingWeekId?: string | null;
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

// Sortable day tab wrapper for drag-and-drop reordering
interface SortableDayTabProps {
  id: string;
  day: ProgramDay;
  dayShortName: string;
  dayFullName: string;
  isSelected: boolean;
  isDayGenerated: boolean;
  isDayGenerating: boolean;
  isDragEnabled: boolean;
  isDropTarget?: boolean;
  onClick: () => void;
  t: (key: string) => string;
}

function SortableDayTab({
  id,
  day,
  dayShortName,
  dayFullName,
  isSelected,
  isDayGenerated,
  isDayGenerating,
  isDragEnabled,
  isDropTarget = false,
  onClick,
  t,
}: SortableDayTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id, disabled: !isDragEnabled });

  const style: React.CSSProperties = {
    // Don't apply transforms - items stay in place, only swap on drop
    // The drop target indicator shows where it will land
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...(isDragEnabled && isDayGenerated ? { ...attributes, ...listeners } : {})}
      data-day={day.day}
      onClick={() => {
        // Only trigger click if not dragging
        if (!isDragging && isDayGenerated) {
          onClick();
        }
      }}
      disabled={!isDayGenerated}
      className={`py-2.5 px-2 min-w-[4.5rem] flex-1 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center relative group ${
        isDragging
          ? 'bg-gray-700/50 text-gray-500 ring-2 ring-dashed ring-indigo-400'
          : isDropTarget
            ? 'bg-indigo-500/30 text-white ring-2 ring-indigo-400 scale-105'
            : isSelected && isDayGenerated
              ? 'bg-indigo-600 text-white'
              : isDayGenerating
                ? 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40'
                : isDayGenerated
                  ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  : 'bg-gray-800/30 text-gray-500 opacity-50 cursor-not-allowed'
      } ${isDragEnabled && isDayGenerated ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Drag hint icon - shows on hover when draggable */}
      {isDragEnabled && isDayGenerated && !isDragging && !isDayGenerating && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </span>
      )}
      {/* Generating indicator - inside button */}
      {isDayGenerating && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
      )}
      <span className={`text-sm mb-0.5 ${isDayGenerating ? 'opacity-100' : 'opacity-80'}`}>
        <span className="sm:hidden">{dayShortName}</span>
        <span className="hidden sm:inline">{dayFullName}</span>
      </span>
      {isDayGenerating ? (
        <span className="text-xs text-violet-300">
          <svg className="w-3 h-3 animate-spin inline" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      ) : isDayGenerated ? (
        <span className="text-xs opacity-80">
          {t(getDayTypeInfo(day).labelKey)}
        </span>
      ) : (
        <span className="text-xs opacity-40">—</span>
      )}
    </button>
  );
}

// Drag overlay component showing the day type being moved
interface DragOverlayContentProps {
  day: ProgramDay;
  t: (key: string) => string;
}

function DragOverlayContent({ day, t }: DragOverlayContentProps) {
  const dayTypeInfo = getDayTypeInfo(day);
  
  // Icon paths for each day type
  const iconPaths: Record<string, string> = {
    rest: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    strength: "M13 10V3L4 14h7v7l9-11h-7z",
    cardio: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    recovery: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  };
  
  return (
    <div className="py-3 px-5 rounded-lg bg-indigo-600 text-white shadow-xl ring-2 ring-indigo-400 flex items-center justify-center gap-2">
      <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[dayTypeInfo.icon]} />
      </svg>
      <span className="text-sm font-medium">{t(dayTypeInfo.labelKey)}</span>
    </div>
  );
}

// Props for the DayTabsWithDnd component
interface DayTabsWithDndProps {
  days: ProgramDay[];
  generatedDays: number[];
  generatingDay: number | null;
  expandedDays: number[];
  activeDragId: string | null;
  overDragId: string | null;
  isDragEnabled: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDayClick: (dayNumber: number) => void;
  t: (key: string) => string;
}

// Extracted component for Day Tabs with Drag-and-Drop (used in both multi-week and single-week views)
function DayTabsWithDnd({
  days,
  generatedDays,
  generatingDay,
  expandedDays,
  activeDragId,
  overDragId,
  isDragEnabled,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDayClick,
  t,
}: DayTabsWithDndProps) {
  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sortedDays.map((d) => `day-${d.day}`)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {sortedDays.map((day) => {
            const isDayGenerated = generatedDays.includes(day.day);
            const isDayGenerating = generatingDay === day.day;
            const isSelected = expandedDays.includes(day.day);
            const isDropTarget = overDragId === `day-${day.day}` && activeDragId !== `day-${day.day}`;
            
            return (
              <SortableDayTab
                key={day.day}
                id={`day-${day.day}`}
                day={day}
                dayShortName={getDayShortName(day.day, t)}
                dayFullName={getDayFullName(day.day, t)}
                isSelected={isSelected}
                isDayGenerated={isDayGenerated}
                isDayGenerating={isDayGenerating}
                isDragEnabled={isDragEnabled}
                isDropTarget={isDropTarget}
                onClick={() => onDayClick(day.day)}
                t={t}
              />
            );
          })}
        </div>
      </SortableContext>
      
      {/* Drag overlay with swap indicator */}
      <DragOverlay>
        {activeDragId && (() => {
          const activeDayNum = parseInt(activeDragId.replace('day-', ''));
          const activeDay = days.find((d) => d.day === activeDayNum);
          const overDayNum = overDragId ? parseInt(overDragId.replace('day-', '')) : null;
          
          if (!activeDay) return null;
          
          return (
            <div className="flex flex-col items-center">
              <DragOverlayContent day={activeDay} t={t} />
              {overDayNum && overDayNum !== activeDayNum && (
                <div className="mt-2 px-3 py-1 bg-gray-900/90 rounded-full text-xs text-gray-300 whitespace-nowrap">
                  {getDayShortName(activeDayNum, t)} ↔ {getDayShortName(overDayNum, t)}
                </div>
              )}
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}

// Day tabs shimmer placeholder
function DayTabsShimmer() {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="shimmer h-16 min-w-[4.5rem] flex-1 bg-gray-800/60 rounded-lg" />
      ))}
    </div>
  );
}

// Generation progress indicator component
interface GenerationProgressProps {
  generatingDay: number;
  t: (key: string, options?: Record<string, string>) => string;
}

function GenerationProgress({ generatingDay, t }: GenerationProgressProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
      <svg className="w-4 h-4 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>
        {generatingDay === 0 
          ? t('exerciseProgram.buildingOverview')
          : t('exerciseProgram.buildingDay', { current: String(generatingDay), total: '7' })}
      </span>
    </div>
  );
}

// Summary card shimmer placeholder (used when shimmer=true for week content)
function SummaryCardShimmer() {
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
            dayType: 'strength',
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
  isCustomProgram = false,
  generatingDay: propGeneratingDay,
  generatedDays: propGeneratedDays,
  generatingWeekId: propGeneratingWeekId,
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
  // Add state for weekly generation limit
  const [isWeeklyLimitReached, setIsWeeklyLimitReached] = useState(false);
  const [weeklyLimitNextDate, setWeeklyLimitNextDate] = useState<Date | null>(null);
  const { activeProgram, generatingDay: contextGeneratingDay, generatedDays: contextGeneratedDays, generatingWeekId: contextGeneratingWeekId } = useUser();
  
  // Use props if provided, otherwise fall back to context
  const generatingDay = propGeneratingDay ?? contextGeneratingDay;
  const generatedDays = propGeneratedDays ?? contextGeneratedDays ?? [];
  const generatingWeekId = propGeneratingWeekId ?? contextGeneratingWeekId;
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedDayData } = useSelectedDay();

  // Determine if this is a custom recovery program being viewed (not saved to user account)
  const isViewingCustomProgram = isViewingCustomRecoveryProgram(pathname);

  // State for save button
  const [isSaving, setIsSaving] = useState(false);
  
  // State for copy previous week button
  const [isCopyingWeek, setIsCopyingWeek] = useState(false);

  // State for title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [optimisticTitle, setOptimisticTitle] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // State for week-specific overview card - auto-expand during generation
  const [showWeekOverview, setShowWeekOverview] = useState(false);
  const prevGeneratingDay = useRef<number | null | undefined>(undefined);
  const userClosedDuringGeneration = useRef(false);

  // State for drag-and-drop reordering
  const [_isReordering, setIsReordering] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);
  // Optimistic swap state: [fromDayNum, toDayNum] or null
  const [optimisticSwap, setOptimisticSwap] = useState<[number, number] | null>(null);

  // DnD sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check if drag is enabled (not generating and user owns the program)
  const isDragEnabled = generatingDay === null && user && activeProgram?.docId && !isViewingCustomProgram;
  
  // Auto-expand overview only when generation STARTS, collapse when done
  // Respect user's manual close during generation
  useEffect(() => {
    const wasGenerating = prevGeneratingDay.current !== null && prevGeneratingDay.current !== undefined;
    const isNowGenerating = generatingDay !== null;
    
    if (!wasGenerating && isNowGenerating) {
      // Generation just started - expand and reset the manual close flag
      userClosedDuringGeneration.current = false;
      setShowWeekOverview(true);
    } else if (wasGenerating && !isNowGenerating) {
      // Generation just finished - collapse
      setShowWeekOverview(false);
      userClosedDuringGeneration.current = false;
    }
    // Note: We don't re-expand when generatingDay changes (e.g., 1 -> 2 -> 3)
    // to respect user's manual close
    
    prevGeneratingDay.current = generatingDay;
  }, [generatingDay]);

  // Custom toggle that tracks manual closes during generation
  const handleOverviewToggle = () => {
    if (generatingDay !== null && showWeekOverview) {
      // User is closing during generation - remember this
      userClosedDuringGeneration.current = true;
    }
    setShowWeekOverview(!showWeekOverview);
  };

  // Set initial week and day when program loads (only on first load or when program changes)
  useEffect(() => {
    if (!program?.days || !Array.isArray(program.days)) return;
    
    // If user has manually selected a day, never reset it
    if (userHasManuallySelectedDay.current) return;
    
    // During incremental generation, auto-select the generating week and Monday (day 1)
    if (generatingDay !== null) {
      // For follow-up generation with multiple weeks, select the last (generating) week
      const hasMultipleWeeks = activeProgram?.programs && activeProgram.programs.length > 1;
      if (hasMultipleWeeks && activeProgram?.programs) {
        const generatingWeekNum = activeProgram.programs.length;
        setSelectedWeek(generatingWeekNum);
        setExpandedDays([1]); // Monday
        hasInitializedDaySelection.current = true;
      } else if (!hasInitializedDaySelection.current) {
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
    // Also consider programs with 1 week that have a placeholder for follow-up
    const hasWeeksWithPlaceholder = 
      activeProgram?.programs && activeProgram.programs.length >= 1 && !isCustomProgram;
    const is4WeekProgram = isMultiWeekProgram || hasMultipleWeeks;

    if ((is4WeekProgram && hasMultipleWeeks && activeProgram?.programs) || 
        (hasWeeksWithPlaceholder && activeProgram?.programs)) {
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
            // We're after the last week ends - show the placeholder/next week
            // This displays the "Start Feedback Process" card to prompt follow-up generation
            weekToSelect = activeProgram.programs.length + 1;
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

  const handleDayDetailClick = (day: ProgramDay, dayNameStr: string) => {
    // Pre-cache the day data so the target page can render instantly
    if (program) {
      setSelectedDayData({
        day,
        dayName: dayNameStr,
        program,
        programTitle: title || activeProgram?.title || 'Exercise Program',
      });
    }
    
    // Navigate immediately - no need for loading state since data is pre-cached
    onDaySelect(day, dayNameStr);
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

  // Copy previous week's program to create a new week
  const handleCopyPreviousWeek = async () => {
    if (!user || !activeProgram?.docId) {
      toast.error(t('common.loginRequired'));
      return;
    }

    setIsCopyingWeek(true);
    try {
      const response = await fetch('/api/programs/copy-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          programId: activeProgram.docId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle weekly limit reached error
        if (errorData.code === 'WEEKLY_LIMIT_REACHED') {
          const nextDate = errorData.nextAllowedDate 
            ? new Date(errorData.nextAllowedDate).toLocaleDateString(locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : null;
          
          toast.error(
            nextDate 
              ? t('exerciseProgram.nextWeekCard.weeklyLimitNextDate', { date: nextDate })
              : t('exerciseProgram.nextWeekCard.weeklyLimitTitle')
          );
          return;
        }
        
        throw new Error(errorData.error || 'Failed to copy week');
      }

      const result = await response.json();
      toast.success(t('exerciseProgram.nextWeekCard.copySuccess'));
      
      // Select the newly created week
      if (result.data?.weekNumber) {
        setSelectedWeek(result.data.weekNumber);
      }
    } catch (error) {
      console.error('Error copying previous week:', error);
      toast.error(t('exerciseProgram.nextWeekCard.copyFailed'));
    } finally {
      setIsCopyingWeek(false);
    }
  };

  // Start editing title
  const handleStartEditTitle = () => {
    const currentTitle = optimisticTitle || title || program?.title || '';
    setEditedTitle(currentTitle);
    setIsEditingTitle(true);
    // Focus input after state update
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  // Cancel editing title
  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // Save edited title
  const handleSaveTitle = async () => {
    if (!user || !activeProgram?.docId) {
      toast.error(t('common.loginRequired'));
      return;
    }

    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle) {
      toast.error(t('exerciseProgram.titleRequired'));
      return;
    }

    const originalTitle = title || program?.title;
    if (trimmedTitle === originalTitle) {
      // No change, just close edit mode
      setIsEditingTitle(false);
      return;
    }

    // Optimistic update - show the new title immediately
    setOptimisticTitle(trimmedTitle);
    setIsEditingTitle(false);
    setIsSavingTitle(true);
    
    try {
      const response = await fetch('/api/programs/update-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          programId: activeProgram.docId,
          title: trimmedTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update title');
      }

      toast.success(t('exerciseProgram.titleUpdated'));
      // Firebase onSnapshot will update the real title, then we clear optimistic state
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error(t('exerciseProgram.titleUpdateFailed'));
      // Revert optimistic update on error
      setOptimisticTitle(null);
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Handle Enter key to save, Escape to cancel
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // Handle drag over (for showing drop target indicator)
  const handleDragOver = (event: DragOverEvent) => {
    setOverDragId(event.over?.id as string | null);
  };

  // Handle drag end for day reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag state
    setActiveDragId(null);
    setOverDragId(null);
    
    if (!over || active.id === over.id) {
      return;
    }

    if (!user || !activeProgram?.docId) {
      return;
    }

    // Get the current week's data and weekId
    const currentWeekProgram = activeProgram.programs?.[selectedWeek - 1];
    const weekId = currentWeekProgram?.docId;
    
    if (!weekId || !currentWeekProgram?.days) {
      toast.error(t('exerciseProgram.reorderFailed'));
      return;
    }

    const days = currentWeekProgram.days;
    const fromDayNum = parseInt((active.id as string).replace('day-', ''));
    const toDayNum = parseInt((over.id as string).replace('day-', ''));

    if (!fromDayNum || !toDayNum) {
      return;
    }

    // Create a swap: exchange the two days' positions
    // newDayOrder[i] = which original day number should be at position i+1
    const sortedDays = [...days].sort((a, b) => a.day - b.day);
    const newDayOrder = sortedDays.map((d) => {
      if (d.day === fromDayNum) return toDayNum;  // Day A goes to Day B's slot
      if (d.day === toDayNum) return fromDayNum;  // Day B goes to Day A's slot
      return d.day;  // Other days stay in place
    });

    // Optimistic update - swap immediately in UI
    setOptimisticSwap([fromDayNum, toDayNum]);
    setIsReordering(true);

    try {
      const response = await fetch('/api/programs/reorder-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          programId: activeProgram.docId,
          weekId,
          newDayOrder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reorder days');
      }

      toast.success(t('exerciseProgram.daysReordered'));
      // Firebase onSnapshot will update the real data, then we clear optimistic state
    } catch (error) {
      console.error('Error reordering days:', error);
      toast.error(t('exerciseProgram.reorderFailed'));
      // Revert optimistic update on error
      setOptimisticSwap(null);
    } finally {
      setIsReordering(false);
    }
  };

  // Track the programs reference to detect when Firebase data updates
  const prevProgramsRef = useRef(activeProgram?.programs);
  
  // Clear optimistic swap when real data updates from Firebase (not on initial set)
  useEffect(() => {
    const programsChanged = prevProgramsRef.current !== activeProgram?.programs;
    
    if (optimisticSwap && programsChanged && activeProgram?.programs) {
      // Firebase data has updated, clear optimistic state
      setOptimisticSwap(null);
    }
    
    prevProgramsRef.current = activeProgram?.programs;
  }, [activeProgram?.programs, optimisticSwap]);

  // Track title to detect when Firebase data updates
  const prevTitleRef = useRef(title);
  
  // Clear optimistic title when real title updates from Firebase
  useEffect(() => {
    const titleChanged = prevTitleRef.current !== title;
    
    if (optimisticTitle && titleChanged && title) {
      // Firebase data has updated, clear optimistic state
      setOptimisticTitle(null);
    }
    
    prevTitleRef.current = title;
  }, [title, optimisticTitle]);

  // Helper to apply optimistic swap to days array
  const applyOptimisticSwap = (days: ProgramDay[]): ProgramDay[] => {
    if (!optimisticSwap) return days;
    const [fromDay, toDay] = optimisticSwap;
    
    return days.map((day) => {
      if (day.day === fromDay) {
        // This day should appear in toDay's slot
        return { ...day, day: toDay };
      }
      if (day.day === toDay) {
        // This day should appear in fromDay's slot
        return { ...day, day: fromDay };
      }
      return day;
    });
  };

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

    // Show "weekly limit reached" card if the user has already generated a follow-up this week
    if (isWeeklyLimitReached) {
      const formattedNextDate = weeklyLimitNextDate?.toLocaleDateString(
        locale,
        { weekday: 'long', month: 'long', day: 'numeric' }
      );

      return (
        <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-amber-500/30 p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-app-title text-white">
              {t('exerciseProgram.nextWeekCard.weeklyLimitTitle')}
            </h3>
            <p className="text-gray-300">
              {t('exerciseProgram.nextWeekCard.weeklyLimitDescription')}
            </p>
            {formattedNextDate && (
              <p className="text-gray-400 text-sm">
                {t('exerciseProgram.nextWeekCard.weeklyLimitNextDate', { date: formattedNextDate })}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Show the "Coming Soon" card with buttons to start feedback or copy previous week
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
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => {
                // Subscription gate first
                if (!isUserSubscribed()) {
                  router.push('/subscribe');
                  return;
                }
                // Check if user is eligible to create a follow-up program
                // Skip restriction if DISABLE_FOLLOWUP_RESTRICTIONS is true
                if (!isInFutureWeek && !DISABLE_FOLLOWUP_RESTRICTIONS) {
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
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
            >
              {t('exerciseProgram.nextWeekCard.button')}
            </button>
            <button
              onClick={() => {
                // Subscription gate first
                if (!isUserSubscribed()) {
                  router.push('/subscribe');
                  return;
                }
                // Check if user is eligible (same rules as feedback process)
                // Skip restriction if DISABLE_FOLLOWUP_RESTRICTIONS is true
                if (!isInFutureWeek && !DISABLE_FOLLOWUP_RESTRICTIONS) {
                  // Show toast message instead of copying
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

                // Proceed with copying
                handleCopyPreviousWeek();
              }}
              disabled={isCopyingWeek}
              className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCopyingWeek ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('exerciseProgram.nextWeekCard.copying')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('exerciseProgram.nextWeekCard.copyButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Prefetch day routes for faster navigation
  useEffect(() => {
    if (!program?.days || !Array.isArray(program.days) || program.days.length === 0) {
      return;
    }
    
    // Prefetch all day routes so navigation is instant
    program.days.forEach((day) => {
      const route = `/program/day/${day.day}`;
      router.prefetch(route);
    });
  }, [program, router]);

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

  // Check weekly generation limit for this program type
  useEffect(() => {
    const checkWeeklyLimit = async () => {
      if (!user?.uid || !activeProgram?.type) {
        setIsWeeklyLimitReached(false);
        return;
      }

      try {
        const canGenerate = await canGenerateProgram(user.uid, activeProgram.type);
        setIsWeeklyLimitReached(!canGenerate);

        if (!canGenerate) {
          const nextDate = await getNextAllowedGenerationDate(user.uid, activeProgram.type);
          setWeeklyLimitNextDate(nextDate);
        } else {
          setWeeklyLimitNextDate(null);
        }
      } catch (error) {
        console.error('Error checking weekly limit:', error);
        setIsWeeklyLimitReached(false);
      }
    };

    checkWeeklyLimit();
  }, [user?.uid, activeProgram?.type]);

  // Only return null when not shimmering; allow shimmer UI even before program is available
  if (!shimmer && ((isLoading) || program === null || !Array.isArray(program.days))) {
    return null;
  }

  // When shimmering, render only the dedicated shimmer view to avoid duplicate shimmers below
  if (shimmer) {
    return (
      <div className="bg-gray-900 flex flex-col flex-1 text-white overflow-x-hidden">
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

  // Apply optimistic swap if we have one pending
  if (selectedWeekData && optimisticSwap) {
    selectedWeekData = { 
      ...selectedWeekData, 
      days: applyOptimisticSwap(selectedWeekData.days) 
    };
  }

  // Get the weekId of the currently viewed week
  const selectedWeekProgram = hasMultipleWeeks && activeProgram?.programs 
    ? activeProgram.programs[selectedWeek - 1] 
    : null;
  const selectedWeekId = selectedWeekProgram?.weekId;

  // Determine if viewing the generating week using the tested utility function
  const isViewingGeneratingWeek = computeIsViewingGeneratingWeek({
    generatingWeekId,
    selectedWeekId,
    generatingDay,
    hasMultipleWeeks: hasMultipleWeeks && !!activeProgram?.programs,
    selectedWeek,
    totalWeeks: activeProgram?.programs?.length ?? 1,
    selectedWeekData,
  });

  // Compute effective generation state using the tested utility function
  const { effectiveGeneratedDays, effectiveGeneratingDay } = getEffectiveGenerationState({
    isViewingGeneratingWeek,
    generatedDays,
    generatingDay,
  });

  return (
    <div
      className={`bg-gray-900 flex flex-col flex-1 text-white overflow-x-hidden ${
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
            <div className="hidden md:flex py-3 px-4 items-center justify-center">
              <div className="flex flex-col items-center">
                {/* Show shimmer for title while generating and no title yet */}
                {generatingDay !== null && !title && !program?.title ? (
                  <div className="shimmer h-8 w-64 bg-gray-700 rounded" />
                ) : isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      className="text-app-title text-center bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
                      maxLength={100}
                      disabled={isSavingTitle}
                    />
                    <button
                      onClick={handleSaveTitle}
                      disabled={isSavingTitle}
                      className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                      title={t('common.save')}
                    >
                      {isSavingTitle ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      disabled={isSavingTitle}
                      className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50"
                      title={t('common.cancel')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    {user && activeProgram?.docId && !isViewingCustomProgram ? (
                      <button
                        onClick={handleStartEditTitle}
                        className="text-app-title text-center hover:text-gray-300 transition-colors cursor-pointer"
                        title={t('exerciseProgram.editTitle')}
                      >
                        {optimisticTitle || title || program?.title ||
                          (type === ProgramType.Recovery
                            ? t('program.recoveryProgramTitle')
                            : t('program.exerciseProgramTitle'))}
                      </button>
                    ) : (
                      <h1 className="text-app-title text-center">
                        {optimisticTitle || title || program?.title ||
                          (type === ProgramType.Recovery
                            ? t('program.recoveryProgramTitle')
                            : t('program.exerciseProgramTitle'))}
                      </h1>
                    )}
                    {/* Edit icon hint - only show for logged-in users with their own program */}
                    {user && activeProgram?.docId && !isViewingCustomProgram && (
                      <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Program Overview Modal - REMOVED - Now using inline week-specific overview card */}

          <div className="flex-1">
            <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8">
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

              {/* Generation Progress for Overview - shown between week tabs and overview card */}
              {effectiveGeneratingDay === 0 && (
                <GenerationProgress generatingDay={effectiveGeneratingDay} t={t} />
              )}

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
                    onToggle={handleOverviewToggle}
                    isGenerating={effectiveGeneratingDay !== null}
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
                     return <SummaryCardShimmer />;
                   }
                  // Show the selected week's content
                  // Create placeholder days if actual days are missing (new week with no data yet)
                  const daysForTabs = selectedWeekData.days.length > 0 
                    ? selectedWeekData.days 
                    : Array.from({ length: 7 }, (_, i) => ({
                        day: i + 1,
                        description: '',
                        exercises: [],
                        dayType: 'strength' as const,
                      }));
                  
                  return (
                    <>
                      {/* Generation Progress Indicator - for days (not overview) */}
                      {effectiveGeneratingDay !== null && effectiveGeneratingDay !== 0 && (
                        <GenerationProgress generatingDay={effectiveGeneratingDay} t={t} />
                      )}
                      
                      {/* Day Tabs with Drag-and-Drop */}
                      <div className="mb-4">
                        {shimmer ? (
                          <DayTabsShimmer />
                        ) : (
                          <DayTabsWithDnd
                            days={daysForTabs}
                            generatedDays={effectiveGeneratedDays}
                            generatingDay={effectiveGeneratingDay}
                            expandedDays={expandedDays}
                            activeDragId={activeDragId}
                            overDragId={overDragId}
                            isDragEnabled={!!isDragEnabled}
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onDayClick={handleDayClick}
                            t={t}
                          />
                        )}
                      </div>

                      {/* Day Content */}
                      {(shimmer ? [1] : expandedDays).map((dayNumber) => {
                        const day = selectedWeekData.days.find(
                          (d) => d.day === dayNumber
                        );
                        const isDayInGeneratedList = effectiveGeneratedDays.includes(dayNumber);
                        // Also verify the actual day data exists with content
                        // This handles race condition where generatedDays updates before Firebase data arrives
                        const isDayGenerated = isDayInGeneratedList && hasDayData(day);
                        const isDayGenerating = effectiveGeneratingDay === dayNumber;
                        const shouldShimmerDay = shimmer || !isDayGenerated;
                        
                        const placeholder: ProgramDay = {
                          day: dayNumber,
                          description: isDayGenerating ? 'Generating...' : 'Loading...',
                          exercises: [],
                          dayType: 'strength',
                        } as any;
                        const safeDay = shouldShimmerDay ? placeholder : day;
                        if (!safeDay) return null;

                        const dayIndex = (safeDay.day || 1) - 1;

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
                    return <SummaryCardShimmer />;
                  }
                  // Create placeholder days if actual days are missing (new program with no data yet)
                  const singleWeekDaysForTabs = selectedWeekData.days.length > 0 
                    ? selectedWeekData.days 
                    : Array.from({ length: 7 }, (_, i) => ({
                        day: i + 1,
                        description: '',
                        exercises: [],
                        dayType: 'strength' as const,
                      }));
                  
                  return (
                    <>
                      {/* Generation Progress Indicator - for days (not overview) */}
                      {effectiveGeneratingDay !== null && effectiveGeneratingDay !== 0 && (
                        <GenerationProgress generatingDay={effectiveGeneratingDay} t={t} />
                      )}
                      
                      {/* Day Tabs with Drag-and-Drop */}
                      <div className="mb-4">
                        {shimmer ? (
                          <DayTabsShimmer />
                        ) : (
                          <DayTabsWithDnd
                            days={singleWeekDaysForTabs}
                            generatedDays={effectiveGeneratedDays}
                            generatingDay={effectiveGeneratingDay}
                            expandedDays={expandedDays}
                            activeDragId={activeDragId}
                            overDragId={overDragId}
                            isDragEnabled={!!isDragEnabled}
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onDayClick={handleDayClick}
                            t={t}
                          />
                        )}
                      </div>

                      {/* Day Content */}
                      {expandedDays.map((dayNumber) => {
                        const day = selectedWeekData.days.find(
                          (d) => d.day === dayNumber
                        );
                        const isDayInGeneratedList = effectiveGeneratedDays.includes(dayNumber);
                        // Also verify the actual day data exists with content
                        // This handles race condition where generatedDays updates before Firebase data arrives
                        const isDayGenerated = isDayInGeneratedList && hasDayData(day);
                        const isDayGenerating = effectiveGeneratingDay === dayNumber;
                        const shouldShimmerDay = !isDayGenerated;
                        
                        const placeholder: ProgramDay = {
                          day: dayNumber,
                          description: isDayGenerating ? 'Generating...' : 'Loading...',
                          exercises: [],
                          dayType: 'strength',
                        };
                        
                        const displayDay = shouldShimmerDay ? placeholder : day;
                        if (!displayDay) return null;

                        const dayIndex = displayDay.day - 1;

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
