'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ProgramDay, ExerciseProgram } from '@/app/types/program';

interface SelectedDayData {
  day: ProgramDay;
  dayName: string;
  program: ExerciseProgram;
  programTitle: string;
}

interface SelectedDayContextType {
  selectedDayData: SelectedDayData | null;
  setSelectedDayData: (data: SelectedDayData | null) => void;
}

const SelectedDayContext = createContext<SelectedDayContextType>({
  selectedDayData: null,
  setSelectedDayData: () => {},
});

export function SelectedDayProvider({ children }: { children: ReactNode }) {
  const [selectedDayData, setSelectedDayData] = useState<SelectedDayData | null>(null);

  return (
    <SelectedDayContext.Provider value={{ selectedDayData, setSelectedDayData }}>
      {children}
    </SelectedDayContext.Provider>
  );
}

export const useSelectedDay = () => useContext(SelectedDayContext);










