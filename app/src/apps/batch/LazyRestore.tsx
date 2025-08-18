// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { lazy, Suspense } from 'react';

import { Spinner } from '@mimir-wallet/ui';

// Lazy load the Restore component
const Restore = lazy(() => import('./Restore'));

interface LazyRestoreProps {
  onClose: () => void;
}

function LoadingFallback() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <Spinner variant='wave' />
    </div>
  );
}

function LazyRestore({ onClose }: LazyRestoreProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Restore onClose={onClose} />
    </Suspense>
  );
}

export default LazyRestore;
