// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { BN, BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

export interface ExistentialDepositResult {
  existentialDeposit: BN;
  existentialDepositBigInt: bigint;
  isLoading: boolean;
  error: Error | null;
}

async function fetchExistentialDeposit(network: string): Promise<{ bn: BN; bigint: bigint }> {
  const api = await ApiManager.getInstance().getApi(network);

  const ed = api.consts.balances.existentialDeposit;

  return {
    bn: ed,
    bigint: ed.toBigInt()
  };
}

/**
 * Hook to get existential deposit for a network
 *
 * This hook fetches the existential deposit from the chain's balances pallet.
 * The existential deposit is the minimum balance required to keep an account alive.
 *
 * @param network - The network key to get existential deposit for
 * @returns Object containing existentialDeposit (BN), existentialDepositBigInt (bigint), isLoading, and error
 *
 * @example
 * ```tsx
 * const { existentialDeposit, isLoading } = useExistentialDeposit('polkadot');
 *
 * if (isLoading) {
 *   return <Spinner />;
 * }
 *
 * const isEnough = balance.gte(amount.add(existentialDeposit));
 * ```
 */
export function useExistentialDeposit(network: string): ExistentialDepositResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['existentialDeposit', network] as const,
    queryFn: ({ queryKey }) => fetchExistentialDeposit(queryKey[1]),
    enabled: !!network,
    staleTime: Infinity,
    retry: false
  });

  return useMemo(
    () => ({
      existentialDeposit: data?.bn ?? BN_ZERO,
      existentialDepositBigInt: data?.bigint ?? 0n,
      isLoading,
      error: error as Error | null
    }),
    [data, isLoading, error]
  );
}
