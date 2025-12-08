// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { remoteProxyRelations, useChains } from '@mimir-wallet/polkadot-core';
import { useMemo } from 'react';

import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';

/**
 * Get structure-related networks for an account based on its delegatees
 * Used in AccountStructure component to filter networks
 *
 * @param address - The address to check
 * @returns Array of networks where the account has delegatees, or undefined if all networks are supported
 *
 * @remarks
 * Logic:
 * 1. Multisig accounts → returns undefined (support all networks)
 * 2. Accounts with delegatees → returns networks from delegatees' proxyNetwork
 * 3. Other cases → returns undefined (support all networks)
 */
export function useAddressStructureNetworks(address?: string | null) {
  const { chains } = useChains();
  const [account] = useQueryAccountOmniChain(address);

  const structureNetworks = useMemo(() => {
    if (!account) return undefined;

    // 1. Multisig accounts support all networks
    if (account.type === 'multisig') {
      return undefined;
    }

    // 2. If account has delegatees, return their networks
    if (account.delegatees && account.delegatees.length > 0) {
      const genesisHashes = new Set<string>();

      // Collect all proxy networks from delegatees
      account.delegatees.forEach((delegatee) => {
        genesisHashes.add(delegatee.proxyNetwork);

        // Add remote proxy relations if exists (e.g., Polkadot <-> AssetHub)
        if (remoteProxyRelations[delegatee.proxyNetwork]) {
          genesisHashes.add(remoteProxyRelations[delegatee.proxyNetwork]);
        }
      });

      // Filter and return networks
      const supported = chains.filter((item) =>
        genesisHashes.has(item.genesisHash),
      );

      return supported.length > 0 ? supported : undefined;
    }

    // 3. Other cases: support all networks
    return undefined;
  }, [account, chains]);

  return structureNetworks;
}
