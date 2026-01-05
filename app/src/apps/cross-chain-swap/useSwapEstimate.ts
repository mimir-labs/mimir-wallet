// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SlippageState, SwapEstimate, SwapRouteStep } from './types';
import type { TokenNetworkItem } from '@/components/InputNetworkToken';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import {
  allEndpoints,
  getSwapEstimate as getSwapEstimateApi,
} from '@mimir-wallet/polkadot-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { parseUnits } from '@/utils';

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
 * Build swap route display from chain endpoints
 */
function buildSwapRoute(
  fromChain: Endpoint,
  toChain: Endpoint,
  fromToken: TokenNetworkItem,
  toToken: TokenNetworkItem,
  exchange: string,
): SwapRouteStep[] {
  const route: SwapRouteStep[] = [];

  // Source chain
  route.push({
    network: fromChain,
    token: fromToken.token.symbol,
    icon: fromChain.icon,
  });

  // Find the exchange chain (DEX hub)
  // For cross-chain swaps, route goes through the exchange chain
  if (fromChain.key !== toChain.key) {
    const exchangeChain = allEndpoints.find(
      (e) => e.paraspellChain === exchange,
    );

    if (exchangeChain && exchangeChain.key !== fromChain.key) {
      route.push({
        network: exchangeChain,
        token: 'SWAP',
        icon: exchangeChain.icon,
      });
    }
  }

  // Destination chain
  route.push({
    network: toChain,
    token: toToken.token.symbol,
    icon: toChain.icon,
  });

  return route;
}

/**
 * Hook for swap fee estimation and output calculation
 *
 * Uses mock data for now - replace queryFn with real API call when backend is ready.
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
  // Parse amount to smallest unit
  const amountInSmallestUnit = useMemo(() => {
    if (!amount || !fromToken?.token.decimals) return '';

    try {
      return parseUnits(amount, fromToken.token.decimals).toString();
    } catch {
      return '';
    }
  }, [amount, fromToken]);

  // Query for swap estimate
  const {
    data,
    isLoading,
    isFetched,
    error: queryError,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- Using keys for cache identity, full objects for queryFn
    queryKey: [
      'swap-estimate',
      fromChain?.key,
      toChain?.key,
      fromToken?.key,
      toToken?.key,
      amountInSmallestUnit,
      slippage.value,
      senderAddress,
      recipient,
    ] as const,
    enabled:
      !!fromChain &&
      !!toChain &&
      !!fromToken &&
      !!toToken &&
      !!amountInSmallestUnit &&
      !!senderAddress &&
      !!recipient,
    staleTime: 30_000, // Cache for 30 seconds
    retry: 1,
    queryFn: async () => {
      // Call ParaSpell XCM Router API
      const result = await getSwapEstimateApi({
        fromChain: fromChain!,
        toChain: toChain!,
        fromToken: fromToken!.token,
        toToken: toToken!.token,
        amount: amountInSmallestUnit,
        slippagePct: slippage.value,
        senderAddress,
        recipient,
      });

      // Build route for display
      const route = buildSwapRoute(
        fromChain!,
        toChain!,
        fromToken!,
        toToken!,
        result.exchange,
      );

      // Calculate estimated time based on route length
      const estimatedTime =
        route.length <= 2 ? '~15s' : route.length === 3 ? '~30s' : '~45s';

      return {
        outputAmount: result.outputAmount,
        outputAmountUsd: 0, // TODO: Add price conversion when available
        originFee: result.originFee,
        destFee: result.destFee,
        route,
        estimatedTime,
        priceImpact: result.priceImpact,
        exchangeRate: result.exchangeRate,
      };
    },
  });

  return {
    outputAmount: data?.outputAmount ?? '0',
    outputAmountUsd: data?.outputAmountUsd ?? 0,
    originFee: data?.originFee,
    destFee: data?.destFee,
    route: data?.route ?? [],
    estimatedTime: data?.estimatedTime ?? '~22s',
    priceImpact: data?.priceImpact ?? 0,
    exchangeRate: data?.exchangeRate ?? '',
    isLoading,
    isFetched,
    error: queryError?.message,
  };
}
