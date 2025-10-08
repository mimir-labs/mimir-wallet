// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useBlockInterval } from './useBlockInterval';

/**
 * Hook to fetch the best block from the relay chain of the current parachain
 *
 * This hook is specifically designed for parachains that require relay chain block numbers
 * for proxy announcement time calculations (e.g., assethub-kusama, assethub-paseo, assethub-westend).
 *
 * @returns A tuple containing:
 *   - bestBlock: The latest relay chain block header, or undefined if unavailable
 *   - isFetched: Whether the initial fetch has completed
 *   - isFetching: Whether a fetch is currently in progress
 *
 * @remarks
 * - Returns undefined if the current chain is not a parachain (no relayChain config)
 * - Returns undefined if the relay chain API is not initialized or ready
 * - Automatically refetches at the chain's block interval
 * - Query is disabled if relay chain API is not available
 */
export function useRelayBestBlock() {
  const { chain, allApis } = useApi();

  const relayChainKey = chain.relayChain;
  const relayApi = relayChainKey ? allApis[relayChainKey] : undefined;
  const relayGenesisHash = relayApi?.genesisHash;

  const blockInterval = useBlockInterval();

  const {
    data: bestBlock,
    isFetched,
    isFetching
  } = useQuery({
    queryKey: ['relayBestBlock', relayChainKey] as const,
    queryHash: `${relayGenesisHash}.api.rpc.chain.getHeader()`,
    // Only enable query when:
    // 1. Current chain has a relay chain (is a parachain)
    // 2. Relay chain API is initialized and ready
    enabled: !!relayApi?.isApiReady && !!relayChainKey,
    refetchOnMount: false,
    refetchInterval: blockInterval.toNumber(),
    queryFn: async () => {
      // Double-check API availability (defense in depth)
      if (!relayApi?.api) {
        throw new Error(`Relay chain API not available for ${relayChainKey || 'unknown chain'}`);
      }

      try {
        const header = await relayApi.api.rpc.chain.getHeader();

        return header;
      } catch (error) {
        console.error(`Failed to fetch relay chain block header for ${relayChainKey}:`, error);
        throw error;
      }
    }
  });

  return [bestBlock, isFetched, isFetching] as const;
}
