import { useContext } from 'react';
import { ViewsContext } from '@/app/components/context/ViewsContext';

export default function useViews() {
  const object = useContext(ViewsContext);
  if (!object) { throw new Error("useGetComplexObject must be used within a Provider") }
  return object;
}