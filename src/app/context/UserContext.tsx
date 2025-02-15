'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';
import { ExerciseProgram } from '@/app/types/program';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useAuth } from './AuthContext';
import { db } from '@/app/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Program {
  diagnosis: DiagnosisAssistantResponse;
  answers: ExerciseQuestionnaireAnswers;
  program?: ExerciseProgram;
  createdAt: Date;
}

interface UserContextType {
  programs: Program[];
  addProgram: (program: Program) => Promise<void>;
  getLatestProgram: () => Program | null;
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const { user } = useAuth();

  const addProgram = async (program: Program) => {
    setPrograms(prev => [program, ...prev]);
    
    // If user is authenticated, save to Firestore
    if (user) {
      try {
        const programData = {
          ...program,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'programs'), programData);
      } catch (error) {
        console.error('Error saving program to Firestore:', error);
      }
    }
  };

  const getLatestProgram = () => {
    return programs.length > 0 ? programs[0] : null;
  };

  return (
    <UserContext.Provider value={{ programs, addProgram, getLatestProgram, setPrograms }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 