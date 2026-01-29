// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SlippageState, SwapEstimate, SwapRouteStep } from './types';
import type { TokenNetworkItem } from '@/components/InputNetworkToken';
import type { Endpoint, SwapRouteHop } from '@mimir-wallet/polkadot-core';

import {
  allEndpoints,
  getSwapEstimate as getSwapEstimateApi,
} from '@mimir-wallet/polkadot-core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'react-use';

import { parseUnits } from '@/utils';

/**
 * Debounce delay for inputs (ms)
 */
const DEBOUNCE_MS = 500;

/**
 * Parameters for useSwapEstimate hook
 */
export interface UseSwapEstimateParams {
  fromChain?: Endpoint;
  toChain?: Endpoint;
  fromToken?: TokenNetworkItem;
  toToken?: TokenNetworkItem;
  amount: string;
  slippage: SlippageState;
  senderAddress: string;
  recipient: string;
}

/**
 * Cached endpoint map for O(1) lookup by paraspellChain
 */
const endpointByParaspellChain = new Map<string, Endpoint>(
  allEndpoints
    .filter((e) => e.paraspellChain)
    .map((e) => [e.paraspellChain!, e]),
);

/**
 * Build swap route display from API hops
 */
function buildSwapRoute(
  fromChain: Endpoint,
  toChain: Endpoint,
  fromToken: TokenNetworkItem,
  toToken: TokenNetworkItem,
  hops: SwapRouteHop[],
): SwapRouteStep[] {
  const route: SwapRouteStep[] = [
    // Origin chain
    {
      network: fromChain,
      token: fromToken.token.symbol,
      isExchange: false,
    },
  ];

  // Add intermediate hops
  for (const hop of hops) {
    const endpoint = endpointByParaspellChain.get(hop.chain);

    if (endpoint) {
      route.push({
        network: endpoint,
        token: hop.isExchange ? 'SWAP' : undefined,
        isExchange: hop.isExchange,
      });
    }
  }

  // Destination chain
  route.push({
    network: toChain,
    token: toToken.token.symbol,
    isExchange: false,
  });

  return route;
}

/**
 * Calculate estimated time based on route length
 */
function getEstimatedTime(routeLength: number): string {
  if (routeLength <= 2) return '~15s';
  if (routeLength === 3) return '~30s';

  return '~45s';
}

/**
 * Parse amount string to smallest unit
 */
function parseAmountToSmallestUnit(
  amount: string,
  decimals: number | undefined,
): string {
  if (!amount || !decimals) return '';

  try {
    return parseUnits(amount, decimals).toString();
  } catch {
    return '';
  }
}

/**
 * Hook for swap fee estimation and output calculation
 */
export function useSwapEstimate({
  fromChain,
  toChain,
  fromToken,
  toToken,
  amount,
  slippage,
  senderAddress,
  recipient,
}: UseSwapEstimateParams): SwapEstimate {
  // Debounced state - all params combined
  const [debouncedParams, setDebouncedParams] = useState({
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
  });

  // Single debounce effect for all params
  useDebounce(
    () => {
      setDebouncedParams({ fromChain, toChain, fromToken, toToken, amount });
    },
    DEBOUNCE_MS,
    [fromChain, toChain, fromToken, toToken, amount],
  );

  // Parse amount to smallest unit
  const amountInSmallestUnit = parseAmountToSmallestUnit(
    debouncedParams.amount,
    debouncedParams.fromToken?.token.decimals,
  );

  // Check if query should be enabled
  const isQueryEnabled =
    !!debouncedParams.fromChain &&
    !!debouncedParams.toChain &&
    !!debouncedParams.fromToken &&
    !!debouncedParams.toToken &&
    !!amountInSmallestUnit &&
    !!senderAddress &&
    !!recipient;

  // Query for swap estimate
  const {
    data,
    isLoading,
    isFetched,
    error: queryError,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- Using .key for cache identity, full objects in queryFn
    queryKey: [
      'swap-estimate',
      debouncedParams.fromChain?.key,
      debouncedParams.toChain?.key,
      debouncedParams.fromToken?.key,
      debouncedParams.toToken?.key,
      amountInSmallestUnit,
      slippage.value,
      senderAddress,
      recipient,
    ],
    enabled: isQueryEnabled,
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      if (
        !debouncedParams.fromChain ||
        !debouncedParams.toChain ||
        !debouncedParams.fromToken ||
        !debouncedParams.toToken
      ) {
        throw new Error('Missing required parameters');
      }

      const result = await getSwapEstimateApi({
        fromChain: debouncedParams.fromChain,
        toChain: debouncedParams.toChain,
        fromToken: debouncedParams.fromToken.token,
        toToken: debouncedParams.toToken.token,
        amount: amountInSmallestUnit,
        slippagePct: slippage.value,
        senderAddress,
        recipient,
      });

      const route = buildSwapRoute(
        debouncedParams.fromChain!,
        debouncedParams.toChain!,
        debouncedParams.fromToken!,
        debouncedParams.toToken!,
        result.hops,
      );

      return {
        outputAmount: result.outputAmount,
        originFee: result.originFee,
        destFee: result.destFee,
        route,
        estimatedTime: getEstimatedTime(route.length),
        exchange: result.exchange,
        exchangeRate: result.exchangeRate,
        dryRunSuccess: result.dryRunSuccess,
        dryRunError: result.dryRunError,
      };
    },
  });

  return {
    outputAmount: data?.outputAmount ?? '0',
    originFee: data?.originFee,
    destFee: data?.destFee,
    route: data?.route ?? [],
    estimatedTime: data?.estimatedTime ?? '~22s',
    exchange: data?.exchange ?? '',
    exchangeRate: data?.exchangeRate ?? '',
    dryRunSuccess: data?.dryRunSuccess ?? false,
    dryRunError: data?.dryRunError,
    isLoading,
    isFetched,
    error: queryError?.message,
  };
}
