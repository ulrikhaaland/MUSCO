'use client';

import { ProgramDaySummaryComponent } from '../ProgramDaySummaryComponent';
import type { ProgramDay, ExerciseProgram } from '@/app/types/program';
import { getStartOfWeek } from '@/app/utils/dateutils';

interface ProgramDayWithSource {
  day: ProgramDay;
  program: ExerciseProgram;
  userProgram: { title?: string };
  dayOfWeek: number;
}

interface SelectedDayPanelProps {
  programDays: ProgramDayWithSource[];
  dayName: (dayOfWeek: number) => string;
  onDaySelect?: (day: ProgramDay, dayName: string, programId: string) => void;
  emptyMessage: string;
}

export function SelectedDayPanel({
  programDays,
  dayName,
  onDaySelect,
  emptyMessage,
}: SelectedDayPanelProps) {
  if (programDays.length === 0) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-xl ring-1 ring-gray-700/50 h-full flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {programDays.map((programDay, index) => {
        const isPastDay = (() => {
          if (!programDay.program.createdAt) return false;
          const ws = getStartOfWeek(new Date(programDay.program.createdAt));
          const dayDate = new Date(ws);
          dayDate.setDate(dayDate.getDate() + (programDay.day.day - 1));
          dayDate.setHours(23, 59, 59, 999);
          return new Date() > dayDate;
        })();

        return (
          <ProgramDaySummaryComponent
            key={index}
            day={programDay.day}
            dayName={dayName(programDay.dayOfWeek)}
            onClick={
              onDaySelect
                ? () =>
                    onDaySelect(
                      programDay.day,
                      dayName(programDay.dayOfWeek),
                      programDay.program.createdAt.toString()
                    )
                : undefined
            }
            programTitle={programDay.userProgram.title || 'Program'}
            isCalendarView={true}
            isPastDay={isPastDay}
          />
        );
      })}
    </div>
  );
}

