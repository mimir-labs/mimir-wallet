// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { analyticsActions } from '@/analytics';
import { useEffect } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';

import Dashboard from './dashboard';

function PageProfile() {
  const selected = useSelectedAccount();
  const { mode } = useNetworks();

  // Track connected mode when entering dashboard from welcome page
  useEffect(() => {
    analyticsActions.connectedMode(mode);
  }, [mode]); // Only run once on mount

  return selected ? <Dashboard address={selected} /> : null;
}

export default PageProfile;
