// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@mimir-wallet/ui';
import { lazy, Suspense } from 'react';

// Lazy load the Restore component
const Restore = lazy(() => import('./Restore'));

interface LazyRestoreProps {
  onClose: () => void;
}

function LoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner variant="ellipsis" />
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
