'use client';

import useNotification from '@/app/hooks/useNotification';
import { ModuleProps } from '@/app/lib/definitions';

export default function Notification(props: ModuleProps) {
  const { notification } = useNotification();

  return (
    <>
      {notification && (
        <div className="notification-container bg-white z-100 bg-opacity-75 flex items-center justify-center h-full text-5xl text-black">
          {notification}
        </div>
      )}
    </>
  );
}
