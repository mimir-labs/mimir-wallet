// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

/**
 * Parse call data (hex string) into an IMethod object
 */
async function parseCallData({
  queryKey,
}: {
  queryKey: readonly [string, string, HexString | string | undefined | null];
}): Promise<IMethod | null> {
  const [, network, callData] = queryKey;

  if (!callData) {
    return null;
  }

  const api = await ApiManager.getInstance().getApi(network);

  try {
    return api.registry.createType<IMethod>('Call', callData);
  } catch (error) {
    console.error(error, network);

    return null;
  }
}

export interface UseParseCallResult {
  call: IMethod | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to parse call data into an IMethod object
 *
 * This hook handles the async API loading and call parsing,
 * replacing the common useState + useEffect pattern for createType('Call', callData)
 *
 * @param network - The network key
 * @param callData - The call data hex string to parse
 * @param options - Optional configuration
 * @returns Object containing the parsed call, loading state, and error
 *
 * @example
 * ```tsx
 * const { call, isLoading } = useParseCall(network, transaction.call);
 *
 * if (isLoading) return <Spinner />;
 * if (!call) return null;
 *
 * return <CallDisplay call={call} />;
 * ```
 */
export function useParseCall(
  network: string,
  callData: HexString | string | undefined | null,
  options?: {
    enabled?: boolean;
  },
): UseParseCallResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['parse-call', network, callData] as const,
    queryFn: parseCallData,
    enabled: (options?.enabled ?? true) && !!network && !!callData,
    staleTime: Infinity, // Call data parsing result doesn't change for same input
    retry: false, // Don't retry on parse errors
  });

  return {
    call: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to parse call data with a fallback to a provided call
 *
 * Useful when you already have an IMethod but need to parse from hex as fallback
 *
 * @param network - The network key
 * @param callData - The call data hex string to parse
 * @param existingCall - An existing IMethod to use if available
 * @returns The existing call or parsed call
 */
export function useParseCallWithFallback(
  network: string,
  callData: HexString | string | undefined | null,
  existingCall: IMethod | null | undefined,
): UseParseCallResult {
  const shouldParse = !existingCall && !!callData;

  const result = useParseCall(network, callData, {
    enabled: shouldParse,
  });

  if (existingCall) {
    return {
      call: existingCall,
      isLoading: false,
      error: null,
    };
  }

  return result;
}
