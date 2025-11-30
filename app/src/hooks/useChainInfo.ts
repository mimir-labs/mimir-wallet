// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/polkadot-core';

import { ApiManager, useChainStatus, useNetwork } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export interface ChainInfo {
  metadataHash?: string;
  runtimeChainName?: string;
  metadata?: string;
  specName?: string;
  specVersion?: number;
  chainInfo?: Endpoint;
}

export interface UseChainInfoResult {
  chainInfo: ChainInfo | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Async fetch chain info from API
 */
async function fetchChainInfo({
  queryKey
}: {
  queryKey: readonly [string, string, Endpoint | undefined, boolean];
}): Promise<ChainInfo | undefined> {
  const [, network, chain, isApiReady] = queryKey;

  if (!isApiReady || !chain) {
    return undefined;
  }

  const api = await ApiManager.getInstance().getApi(network);

  if (!api) {
    return undefined;
  }

  try {
    const chainInfo: ChainInfo = {
      chainInfo: chain,
      runtimeChainName: api.runtimeChain?.toString(),
      specName: api.runtimeVersion?.specName?.toString(),
      specVersion: api.runtimeVersion?.specVersion?.toNumber()
    };

    // Get metadata hash if available
    if (api.runtimeMetadata) {
      try {
        chainInfo.metadataHash = api.runtimeMetadata.hash.toHex();
        chainInfo.metadata = api.runtimeMetadata.toHex();
      } catch (e) {
        console.warn('Failed to get metadata hash:', e);
      }
    }

    return chainInfo;
  } catch (e) {
    console.warn('Failed to capture chain info:', e);

    return undefined;
  }
}

/**
 * Hook to get chain information asynchronously
 *
 * This hook replaces the useState + useEffect pattern for loading API
 * and extracting chain information.
 *
 * @returns Object containing chain info, loading state, and error
 *
 * @example
 * ```tsx
 * const { chainInfo, isLoading } = useChainInfo();
 *
 * if (isLoading) return <Spinner />;
 *
 * return <ChainInfoDisplay info={chainInfo} />;
 * ```
 */
export function useChainInfo(): UseChainInfoResult {
  const { network, chain } = useNetwork();
  const { isApiReady } = useChainStatus(network);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chain-info', network, chain, isApiReady] as const,
    queryFn: fetchChainInfo,
    enabled: !!network && !!chain && isApiReady,
    staleTime: Infinity, // Chain info doesn't change frequently
    retry: false
  });

  return {
    chainInfo: data,
    isLoading,
    error: error as Error | null
  };
}
