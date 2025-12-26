'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramCalendar } from '@/app/components/ui/ExerciseProgramCalendar';
import { useUser } from '@/app/context/UserContext';
import { useSelectedDay } from '@/app/context/SelectedDayContext';
import { ProgramDay } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { getDayFullName } from '@/app/utils/dateutils';

export default function CalendarPage() {
  const router = useRouter();
  const { program, activeProgram, userPrograms } = useUser();
  const { setSelectedDayData } = useSelectedDay();
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    if (activeProgram?.title && typeof document !== 'undefined') {
      document.title = `${activeProgram.title} - ${t('calendar.title')} | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = t('calendar.programCalendarTitle');
    }
  }, [activeProgram, t]);

  const getDayName = (dayOfWeek: number): string => getDayFullName(dayOfWeek, t);

  const handleDaySelect = (
    day: ProgramDay,
    dayName: string,
    programId: string
  ) => {
    // Find the selected program by its createdAt value
    const userProgram = userPrograms.find((up) =>
      up.programs.some((p) => p.createdAt.toString() === programId)
    );
    const selectedProgram = userProgram?.programs.find(
      (p) => p.createdAt.toString() === programId
    );

    // Pre-cache the day data for instant navigation
    if (selectedProgram) {
      setSelectedDayData({
        day,
        dayName,
        program: selectedProgram,
        programTitle: userProgram?.title || 'Exercise Program',
      });
      router.push(
        `/program/day/${day.day}?programId=${encodeURIComponent(programId)}`
      );
    } else {
      // Fallback to default behavior if program not found
      router.push(`/program/day/${day.day}`);
    }
  };

  // Prefetch day routes
  useEffect(() => {
    if (!userPrograms) return;
    
    // Prefetch common day routes
    for (let day = 1; day <= 7; day++) {
      router.prefetch(`/program/day/${day}`);
    }
  }, [userPrograms, router]);

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col">
      <NavigationMenu mobileTitle={t('nav.calendar')} />
      <ExerciseProgramCalendar
        program={program}
        dayName={getDayName}
        onDaySelect={handleDaySelect}
      />
    </div>
  );
}
