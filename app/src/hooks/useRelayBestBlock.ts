// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Header } from '@polkadot/types/interfaces';

import { ApiManager, useChain } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useBlockInterval } from './useBlockInterval';

async function fetchRelayBestBlock({ queryKey }: { queryKey: readonly [string, string] }): Promise<Header> {
  const [, relayChainKey] = queryKey;

  const api = await ApiManager.getInstance().getApi(relayChainKey);

  return api.rpc.chain.getHeader();
}

/**
 * Hook to fetch the best block from the relay chain of a parachain
 *
 * This hook is specifically designed for parachains that require relay chain block numbers
 * for proxy announcement time calculations (e.g., assethub-kusama, assethub-paseo, assethub-westend).
 *
 * @param network - The parachain network key to get relay chain block for
 * @returns A tuple containing:
 *   - bestBlock: The latest relay chain block header, or undefined if unavailable
 *   - isFetched: Whether the initial fetch has completed
 *   - isFetching: Whether a fetch is currently in progress
 *
 * @remarks
 * - Returns undefined if the current chain is not a parachain (no relayChain config)
 * - Automatically refetches at the chain's block interval
 * - Query is disabled if relay chain is not available
 */
export function useRelayBestBlock(network: string) {
  const chain = useChain(network);
  const relayChainKey = chain?.relayChain;
  const blockInterval = useBlockInterval(relayChainKey ?? network);

  const {
    data: bestBlock,
    isFetched,
    isFetching
  } = useQuery({
    queryKey: ['relayBestBlock', relayChainKey ?? ''] as const,
    // Only enable query when current chain has a relay chain (is a parachain)
    enabled: !!relayChainKey,
    refetchOnMount: false,
    refetchInterval: blockInterval.toNumber(),
    queryFn: fetchRelayBestBlock
  });

  return [bestBlock, isFetched, isFetching] as const;
}
