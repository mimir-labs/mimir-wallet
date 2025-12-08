// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/**
 * Transaction Details Route (/transactions/:id)
 *
 * Multisig transaction details with signature collection status,
 * simulation results, and proposer information
 */

const transactionDetailsSearchSchema = z.object({
  network: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/transactions/$id')({
  validateSearch: transactionDetailsSearchSchema,
  staticData: {
    getTitle: ({ params }) => `Transaction ${params?.id || ''}`,
  } as RouteMetadata,
});
