// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { BN, BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

export interface ProxyDepositResult {
  /** Base deposit required for proxy creation */
  proxyDepositBase: BN;
  /** Additional deposit per proxy */
  proxyDepositFactor: BN;
  /** Total deposit for one proxy (base + factor) */
  totalDeposit: BN;
  isLoading: boolean;
  error: Error | null;
}

interface ProxyDepositData {
  base: BN;
  factor: BN;
  total: BN;
}

async function fetchProxyDeposit(network: string): Promise<ProxyDepositData> {
  const api = await ApiManager.getInstance().getApi(network);

  if (!api.consts.proxy) {
    throw new Error(`Proxy pallet not available for network: ${network}`);
  }

  const base = api.consts.proxy.proxyDepositBase;
  const factor = api.consts.proxy.proxyDepositFactor;

  return {
    base,
    factor,
    total: base.add(factor)
  };
}

/**
 * Hook to get proxy deposit constants for a network
 *
 * This hook fetches the proxy deposit base and factor from the chain's proxy pallet.
 * These values determine how much deposit is required to create a proxy relationship.
 *
 * @param network - The network key to get proxy deposit for
 * @returns Object containing proxyDepositBase, proxyDepositFactor, totalDeposit, isLoading, and error
 *
 * @example
 * ```tsx
 * const { totalDeposit, isLoading } = useProxyDeposit('polkadot');
 *
 * if (isLoading) {
 *   return <Spinner />;
 * }
 *
 * return <FormatBalance value={totalDeposit} />;
 * ```
 */
export function useProxyDeposit(network: string): ProxyDepositResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proxyDeposit', network] as const,
    queryFn: ({ queryKey }) => fetchProxyDeposit(queryKey[1]),
    enabled: !!network,
    staleTime: Infinity,
    retry: false
  });

  return useMemo(
    () => ({
      proxyDepositBase: data?.base ?? BN_ZERO,
      proxyDepositFactor: data?.factor ?? BN_ZERO,
      totalDeposit: data?.total ?? BN_ZERO,
      isLoading,
      error: error as Error | null
    }),
    [data, isLoading, error]
  );
}
