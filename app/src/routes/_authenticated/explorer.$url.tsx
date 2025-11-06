// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { dapps } from '@/config';
import PageExplorer from '@/pages/explorer';
import { isSameOrigin } from '@/utils';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/**
 * DApp Explorer Route (/explorer/:url)
 *
 * Sandboxed DApp container with Mimir SDK integration for in-wallet
 * DApp execution and transaction signing
 */

const explorerSearchSchema = z.object({
  // Transfer app parameters
  from: z.string().optional(),
  assetId: z.string().optional().default('native'),
  asset_network: z.string().optional(),
  to: z.string().optional()
});

export const Route = createFileRoute('/_authenticated/explorer/$url')({
  validateSearch: explorerSearchSchema,
  staticData: {
    getTitle: ({ params }) => {
      const appUrl = params?.url;

      if (!appUrl) return 'Explorer';

      const dapp = dapps.find((item) => item.url.startsWith('https://') && isSameOrigin(item.url, appUrl));

      return dapp ? dapp.name : `Explorer(${appUrl})`;
    }
  } as RouteMetadata,
  component: PageExplorer
});
