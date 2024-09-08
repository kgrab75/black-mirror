'use client';

import { Module } from '@/app/lib/definitions';
import { ReactNode, createContext, useState } from 'react';

type ModulesContextType = {
  modules: Module[];
  setModules: (modules: Module[]) => void;
};

export const ModulesContext = createContext<ModulesContextType>({
  modules: [],
  setModules: () => {},
});

interface ModulesProviderProps {
  children: ReactNode;
  initialModules: Module[];
}

function ModulesProvider({ children, initialModules }: ModulesProviderProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);

  const value = {
    modules,
    setModules,
  };

  return (
    <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>
  );
}

export default ModulesProvider;
