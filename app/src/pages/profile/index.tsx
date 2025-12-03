// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';
import { lazy, Suspense, useEffect } from 'react';

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { analyticsActions } from '@/analytics';

// Lazy load dashboard component for better code splitting
const Dashboard = lazy(() => import('./dashboard'));

// Loading fallback for dashboard
function DashboardFallback() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <Spinner variant='wave' />
    </div>
  );
}

function PageProfile() {
  const selected = useSelectedAccount();
  const { mode } = useChains();

  // Track connected mode when entering dashboard from welcome page
  useEffect(() => {
    analyticsActions.connectedMode(mode);
  }, [mode]); // Only run once on mount

  return selected ? (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard address={selected} />
    </Suspense>
  ) : null;
}

export default PageProfile;
