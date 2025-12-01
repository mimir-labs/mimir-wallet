// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import PageDapp from '@/pages/dapp';

/**
 * DApp Hub Route (/dapp)
 *
 * Integrated DApp hub with deep integrations (Subsquare, DOTConsole, Bifrost)
 * for Polkadot ecosystem
 */

const dappSearchSchema = z.object({
  tab: z.enum(['apps', 'custom']).optional().default('apps')
});

export const Route = createFileRoute('/_authenticated/dapp')({
  validateSearch: dappSearchSchema,
  staticData: {
    title: 'Dapp'
  } as RouteMetadata,
  component: PageDapp
});
