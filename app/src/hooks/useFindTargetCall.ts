// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { ApiManager, findTargetCall } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

/**
 * Find target call from nested proxy/multisig calls
 */
async function findTarget({
  queryKey,
}: {
  queryKey: readonly [
    string,
    string,
    string,
    HexString | string | undefined | null,
  ];
}): Promise<[string, IMethod | null | undefined]> {
  const [, network, address, callData] = queryKey;

  if (!callData) {
    return [address, null];
  }

  const api = await ApiManager.getInstance().getApi(network);

  try {
    const call = api.registry.createTypeUnsafe<IMethod>('Call', [callData]);

    return findTargetCall(api, address, call);
  } catch {
    return [address, null];
  }
}

export interface UseFindTargetCallResult {
  from: string;
  targetCall: IMethod | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to find the target call from nested proxy/multisig calls
 *
 * This hook handles the async API loading and call traversal,
 * replacing the common useState + useEffect + useMemo pattern for findTargetCall
 *
 * @param network - The network key
 * @param address - The transaction address
 * @param callData - The call data hex string (or IMethod)
 * @returns Object containing the from address, target call, loading state, and error
 *
 * @example
 * ```tsx
 * const { from, targetCall, isLoading } = useFindTargetCall(network, address, transaction.call);
 *
 * if (isLoading) return <Spinner />;
 * if (!targetCall) return null;
 *
 * return <CallDisplay from={from} call={targetCall} />;
 * ```
 */
export function useFindTargetCall(
  network: string,
  address: string,
  callData: HexString | string | undefined | null,
): UseFindTargetCallResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['find-target-call', network, address, callData] as const,
    queryFn: findTarget,
    enabled: !!network && !!address && !!callData,
    staleTime: Infinity, // Result doesn't change for same input
    retry: false,
  });

  return {
    from: data?.[0] ?? address,
    targetCall: data?.[1] ?? null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to find target call with an existing parsed call
 *
 * When you already have a parsed IMethod, use this to avoid re-parsing
 */
export function useFindTargetCallFromMethod(
  network: string,
  address: string,
  call: IMethod | null | undefined,
): UseFindTargetCallResult {
  const callHex = call?.toHex();

  const { data, isLoading, error } = useQuery({
    queryKey: ['find-target-call-method', network, address, callHex] as const,
    queryFn: async ({ queryKey: [, network, address, callHex] }) => {
      if (!callHex) {
        return [address, null] as [string, IMethod | null];
      }

      const api = await ApiManager.getInstance().getApi(network);

      // Recreate call from hex since IMethod can't be used in queryKey
      const parsedCall = api.registry.createTypeUnsafe<IMethod>('Call', [
        callHex,
      ]);

      return findTargetCall(api, address, parsedCall);
    },
    enabled: !!network && !!address && !!callHex,
    staleTime: Infinity,
    retry: false,
  });

  return {
    from: data?.[0] ?? address,
    targetCall: data?.[1] ?? null,
    isLoading,
    error: error as Error | null,
  };
}
