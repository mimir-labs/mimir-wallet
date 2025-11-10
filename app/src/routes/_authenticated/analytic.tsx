// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PageAnalytic from '@/pages/analytic';
import { createFileRoute } from '@tanstack/react-router';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { queryClient, service, STALE_TIMES } from '@mimir-wallet/service';

/**
 * Analytics Dashboard Route (/analytic)
 *
 * Multisig analytics dashboard showing common extrinsics, recipient patterns,
 * transaction volume, and signer activity
 */
export const Route = createFileRoute('/_authenticated/analytic')({
  // Prefetch multi-chain stats before rendering
  loader: async ({ location }) => {
    const address = (location.search as any)?.address;

    if (!address) return;

    const addressHex = addressToHex(address);

    // Prefetch multi-chain stats for analytics dashboard
    // Use MODERATE staleTime since stats data is relatively static
    await queryClient.ensureQueryData({
      queryKey: ['multi-chain-stats', addressHex],
      queryFn: () => service.account.getMultiChainStats(addressHex),
      staleTime: STALE_TIMES.MODERATE
    });
  },
  component: PageAnalytic
});
