// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import { useMimirLayout } from './useMimirLayout';

/**
 * Custom hook to open a dapp (decentralized application) in the appropriate location.
 *
 * @param dapp - The dapp option configuration object containing URL and other metadata
 *
 * @returns A memoized callback function that accepts:
 *   - `path` (optional): The specific path to navigate to within the dapp
 *   - `network` (optional): The network to use, defaults to the current network
 *
 * @remarks
 * The hook handles three types of dapp URLs:
 * - Internal batch transactions: `mimir://app/batch` - Opens the batch tab in the right sidebar
 * - Internal templates: `mimir://app/template` - Opens the template tab in the right sidebar
 * - Internal decoder: `mimir://app/decoder` - Opens the decoder tab in the right sidebar
 * - External URLs: Navigates to the explorer view with the dapp URL
 *
 * For external URLs, if a path is provided, it will be added either as a hash or pathname
 * based on the `isSubPathHash` configuration in the dapp option.
 *
 * @example
 * ```typescript
 * const openDapp = useOpenDapp(myDappOption);
 *
 * // Open dapp with default settings
 * openDapp();
 *
 * // Open dapp with specific path and network
 * openDapp('/transfer', 'mainnet');
 * ```
 */
export function useOpenDapp(dapp: DappOption) {
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { network: defaultNetwork } = useApi();
  const navigate = useNavigate();

  return useCallback(
    (path?: string, network?: string) => {
      if (dapp.url === 'mimir://app/batch') {
        setRightSidebarTab('batch');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/template') {
        setRightSidebarTab('template');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/decoder') {
        setRightSidebarTab('decoder');
        openRightSidebar();
      } else {
        const _url = dapp.urlSearch?.(network || defaultNetwork) || new URL(dapp.url);

        if (path) {
          dapp.isSubPathHash ? (_url.hash = path) : (_url.pathname = path);
        }

        navigate(`/explorer/${encodeURIComponent(_url.toString())}`);
      }
    },
    [dapp, navigate, defaultNetwork, openRightSidebar, setRightSidebarTab]
  );
}
