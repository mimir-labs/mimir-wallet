// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PageProfile from '@/pages/profile';
import { createFileRoute } from '@tanstack/react-router';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { queryClient, service, STALE_TIMES } from '@mimir-wallet/service';

/**
 * Home Page Route (/)
 *
 * Multisig control center with account structure view, balance overview,
 * transaction analytics, and quick actions for Polkadot ecosystem
 */
export const Route = createFileRoute('/_authenticated/')({
  // Prefetch dashboard data before rendering
  loader: async ({ location }) => {
    const address = (location.search as any)?.address;

    if (!address) return;

    const addressHex = addressToHex(address);

    // Prefetch transaction counts for dashboard widgets
    // Use MODERATE staleTime since transaction counts don't change frequently
    await queryClient.ensureQueryData({
      queryKey: ['transaction-counts', addressHex],
      queryFn: () => service.transaction.getTransactionCounts(addressHex),
      staleTime: STALE_TIMES.MODERATE
    });
  },
  component: PageProfile
});
