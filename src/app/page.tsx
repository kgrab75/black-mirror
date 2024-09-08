import 'regenerator-runtime/runtime';

import App from '@/app/components/App';
import ServerLoader from '@/app/components/ServerLoader';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <Suspense fallback={<ServerLoader />}>
      <App />
    </Suspense>
  );
}
