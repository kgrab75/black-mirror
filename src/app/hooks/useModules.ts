import { useContext } from 'react';
import { ModulesContext } from '@/app/components/context/ModulesContext';

export default function useModules() {
  const object = useContext(ModulesContext);
  if (!object) { throw new Error("useGetComplexObject must be used within a Provider") }
  return object;
}