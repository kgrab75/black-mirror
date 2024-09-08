'use client';

import useNotification from '@/app/hooks/useNotification';
import { ModuleProps } from '@/app/lib/definitions';

export default function Notification(props: ModuleProps) {
  const { notification } = useNotification();

  return (
    <div className="notification-container">
      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}
