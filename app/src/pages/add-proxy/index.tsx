// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@mimir-wallet/ui';
import { lazy, Suspense } from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Lazy load proxy addition components for better code splitting
const DesktopAddProxy = lazy(() => import('./desktop'));
const MobileAddProxy = lazy(() => import('./mobile'));

// Loading fallback for proxy addition
function AddProxyFallback() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <Spinner variant='ellipsis' />
    </div>
  );
}

function PageAddProxy({ pure }: { pure?: boolean }) {
  const upMd = useMediaQuery('md');

  return (
    <Suspense fallback={<AddProxyFallback />}>
      {upMd ? <DesktopAddProxy pure={pure} /> : <MobileAddProxy pure={pure} />}
    </Suspense>
  );
}

export default PageAddProxy;
