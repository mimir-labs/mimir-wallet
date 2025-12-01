// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import { useMatches } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * Route metadata interface for page title
 */
export interface RouteMetadata {
  title?: string;
  /**
   * Function to generate dynamic title based on route context
   * Receives route params, search params, and other context
   */
  getTitle?: (context: {
    params?: Record<string, string>;
    search?: Record<string, any>;
    mode?: 'solo' | 'omni';
  }) => string;
}

/**
 * Hook to automatically set page title based on route metadata
 *
 * Best Practice: Define page titles in route definitions using staticData
 *
 * @example
 * // In route file (e.g., dapp.tsx)
 * export const Route = createFileRoute('/_authenticated/dapp')({
 *   staticData: {
 *     title: 'Dapp'
 *   },
 *   component: PageDapp
 * });
 *
 * @example
 * // For dynamic titles (e.g., transaction details)
 * export const Route = createFileRoute('/_authenticated/transactions/$id')({
 *   staticData: {
 *     getTitle: ({ params }) => `Transaction #${params.id}`
 *   },
 *   component: PageTransactionDetails
 * });
 */
export function usePageTitle() {
  const matches = useMatches();
  const { mode } = useChains();

  const PREFIX =
    mode === 'omni' ? 'Mimir|Your Ultimate Omni Web3 Multisig Wallet' : 'Mimir|Your Ultimate Web3 Multisig Wallet';

  useEffect(() => {
    // Find the deepest route match with metadata
    const matchWithMetadata = [...matches].reverse().find((match) => {
      const meta = match.staticData as RouteMetadata | undefined;

      return meta?.title || meta?.getTitle;
    });

    let title = PREFIX;

    if (matchWithMetadata) {
      const meta = matchWithMetadata.staticData as RouteMetadata;

      if (meta.getTitle) {
        // Use dynamic title generator
        const dynamicTitle = meta.getTitle({
          params: matchWithMetadata.params as Record<string, string>,
          search: matchWithMetadata.search as Record<string, any>,
          mode
        });

        title += ` - ${dynamicTitle}`;
      } else if (meta.title) {
        // Use static title
        title += ` - ${meta.title}`;
      }
    }

    document.title = title;
  }, [matches, PREFIX, mode]);
}
