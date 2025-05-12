'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramCalendar } from '@/app/components/ui/ExerciseProgramCalendar';
import { useUser } from '@/app/context/UserContext';
import { ProgramDay } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';

export default function CalendarPage() {
  const router = useRouter();
  const { program, userPrograms } = useUser();
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    if (program?.title && typeof document !== 'undefined') {
      document.title = `${program.title} - ${t('calendar.title')} | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = t('calendar.programCalendarTitle');
    }
  }, [program, t]);

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      t('days.monday'),
      t('days.tuesday'),
      t('days.wednesday'),
      t('days.thursday'),
      t('days.friday'),
      t('days.saturday'),
      t('days.sunday'),
    ];
    return days[dayOfWeek - 1];
  };

  const handleDaySelect = (
    day: ProgramDay,
    dayName: string,
    programId: string
  ) => {
    // Find the selected program by its createdAt value
    const selectedProgram = userPrograms
      .flatMap((up) => up.programs)
      .find((p) => p.createdAt.toString() === programId);

    if (selectedProgram) {
      // Navigate to the specific program day
      router.push(
        `/program/day/${day.day}?programId=${encodeURIComponent(programId)}`
      );
    } else {
      // Fallback to default behavior if program not found
      router.push(`/program/day/${day.day}`);
    }
  };

  return (
    <ExerciseProgramCalendar
      program={program}
      dayName={getDayName}
      onDaySelect={handleDaySelect}
    />
  );
}
