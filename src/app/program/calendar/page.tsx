'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramCalendar } from '@/app/components/ui/ExerciseProgramCalendar';
import { useUser } from '@/app/context/UserContext';
import { ProgramDay } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';

export default function CalendarPage() {
  const router = useRouter();
  const { program, activeProgram, userPrograms } = useUser();
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    if (activeProgram?.title && typeof document !== 'undefined') {
      document.title = `${activeProgram.title} - ${t('calendar.title')} | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = t('calendar.programCalendarTitle');
    }
  }, [activeProgram, t]);

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavigationMenu mobileTitle={t('nav.calendar')} />
      <ExerciseProgramCalendar
        program={program}
        dayName={getDayName}
        onDaySelect={handleDaySelect}
      />
    </div>
  );
}
