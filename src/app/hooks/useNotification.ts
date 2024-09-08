import { useContext } from 'react';
import { NotificationContext } from '@/app/components/context/NotificationContext';

export default function useNotification() {
  const object = useContext(NotificationContext);
  if (!object) { throw new Error("useGetComplexObject must be used within a Provider") }
  return object;
}