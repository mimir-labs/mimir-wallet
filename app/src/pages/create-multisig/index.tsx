// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@mimir-wallet/ui';
import { lazy, Suspense } from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Lazy load multisig creation components for better code splitting
const DesktopCreateMultisig = lazy(() => import('./desktop'));
const MobileCreateMultisig = lazy(() => import('./mobile'));

// Loading fallback for multisig creation
function CreateMultisigFallback() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <Spinner variant='ellipsis' />
    </div>
  );
}

function PageCreateMultisig() {
  const upMd = useMediaQuery('md');

  return (
    <Suspense fallback={<CreateMultisigFallback />}>
      {upMd ? <DesktopCreateMultisig /> : <MobileCreateMultisig />}
    </Suspense>
  );
}

export default PageCreateMultisig;
