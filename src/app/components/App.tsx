import 'regenerator-runtime/runtime';

import ViewsProvider from '@/app/components/context/ViewsContext';
import Mirror from '@/app/components/Mirror';
import { fetchViews } from '@/app/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

export default async function App() {
  noStore();
  const views = await fetchViews();

  return (
    <ViewsProvider initialViews={views}>
      <Mirror />
    </ViewsProvider>
  );
}
