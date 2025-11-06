// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageTransactions from '@/pages/transactions';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/**
 * Transactions List Route
 *
 * Multisig transaction queue with batch operations, simulation preview,
 * and AssetHub migration status tracking
 */

const transactionsSearchSchema = z.object({
  status: z.enum(['pending', 'history']).optional().default('pending'),
  tx_id: z.string().optional()
});

export const Route = createFileRoute('/_authenticated/transactions/')({
  validateSearch: transactionsSearchSchema,
  staticData: {
    title: 'Transactions'
  } as RouteMetadata,
  component: PageTransactions
});
