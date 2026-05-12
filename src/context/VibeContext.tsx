import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VibeType } from '../types';

interface VibeContextType {
  currentVibe: VibeType;
  setVibe: (vibe: VibeType) => void;
}

const VibeContext = createContext<VibeContextType | undefined>(undefined);

export const VibeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVibe, setVibe] = useState<VibeType>('Default');

  return (
    <VibeContext.Provider value={{ currentVibe, setVibe }}>
      {children}
    </VibeContext.Provider>
  );
};

export const useVibe = () => {
  const context = useContext(VibeContext);
  if (!context) {
    throw new Error('useVibe must be used within a VibeProvider');
  }
  return context;
};
