'use client';

import { ReactNode, createContext, useState } from 'react';

type NotificationContextType = {
  notification: string;
  showNotification: (message: string, displayTime?: number) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notification: '',
  showNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<string>('');

  const showNotification = (message: string, displayTime: number = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, displayTime);
  };

  const value = {
    notification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
