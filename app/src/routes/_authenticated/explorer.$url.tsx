// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { dapps } from '@/config';
import { isSameOrigin } from '@/utils';

/**
 * DApp Explorer Route (/explorer/:url)
 *
 * Sandboxed DApp container with Mimir SDK integration for in-wallet
 * DApp execution and transaction signing
 */

const explorerSearchSchema = z.object({
  // Transfer app parameters
  from: z.string().optional(),
  assetId: z.string().optional(),
  asset_network: z.string().optional(),
  to: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/explorer/$url')({
  validateSearch: explorerSearchSchema,
  beforeLoad: () => {
    // Explorer needs full-screen layout without padding
    return {
      layoutOptions: {
        withPadding: false,
      },
    };
  },
  staticData: {
    getTitle: ({ params }) => {
      const appUrl = params?.url;

      if (!appUrl) return 'Explorer';

      const dapp = dapps.find(
        (item) =>
          item.url.startsWith('https://') && isSameOrigin(item.url, appUrl),
      );

      return dapp ? dapp.name : `Explorer(${appUrl})`;
    },
  } as RouteMetadata,
});
