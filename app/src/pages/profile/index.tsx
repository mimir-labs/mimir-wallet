// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import { useEffect } from 'react';

import Dashboard from './dashboard';

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { analyticsActions } from '@/analytics';

function PageProfile() {
  const selected = useSelectedAccount();
  const { mode } = useChains();

  // Track connected mode when entering dashboard from welcome page
  useEffect(() => {
    analyticsActions.connectedMode(mode);
  }, [mode]); // Only run once on mount

  return selected ? <Dashboard address={selected} /> : null;
}

export default PageProfile;
