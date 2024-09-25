import 'regenerator-runtime/runtime';

import ViewsProvider from '@/app/components/context/ViewsContext';
import Mirror from '@/app/components/Mirror';
import { fetchViews } from '@/app/lib/data';

export default async function App() {
  const views = await fetchViews();

  return (
    <ViewsProvider initialViews={views}>
      <Mirror />
    </ViewsProvider>
  );
}
