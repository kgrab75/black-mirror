'use client';

import { View } from '@/app/lib/definitions';
import { ReactNode, createContext, useState } from 'react';

type ViewsContextType = {
  views: View[];
  setViews: (views: View[]) => void;
};

export const ViewsContext = createContext<ViewsContextType>({
  views: [],
  setViews: () => {},
});

interface ViewsProviderProps {
  children: ReactNode;
  initialViews: View[];
}

function ViewsProvider({ children, initialViews }: ViewsProviderProps) {
  const [views, setViews] = useState<View[]>(initialViews);

  const value = {
    views,
    setViews,
  };

  return (
    <ViewsContext.Provider value={value}>{children}</ViewsContext.Provider>
  );
}

export default ViewsProvider;
