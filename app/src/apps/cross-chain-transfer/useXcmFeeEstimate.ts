// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem } from '@/components/InputNetworkToken';
import type { Endpoint, XcmFeeAsset } from '@mimir-wallet/polkadot-core';

import {
  buildXcmCall,
  getOriginXcmFee,
  isAssetXcEqual,
} from '@mimir-wallet/polkadot-core';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { parseUnits } from '@/utils';

// Block time constants
const RELAY_BLOCK_TIME = 6; // seconds
const PARACHAIN_BLOCK_TIME = 12; // seconds

/**
 * Estimate cross-chain transfer time based on chain types
 */
function estimateTransferTime(
  isSourceRelay: boolean,
  isDestRelay: boolean,
): string {
  let totalSeconds: number;

  if (isSourceRelay && !isDestRelay) {
    // Relay → Parachain
    totalSeconds = 1 * RELAY_BLOCK_TIME + 1 * PARACHAIN_BLOCK_TIME;
  } else if (!isSourceRelay && isDestRelay) {
    // Parachain → Relay
    totalSeconds = 2 * PARACHAIN_BLOCK_TIME + 1 * RELAY_BLOCK_TIME;
  } else if (!isSourceRelay && !isDestRelay) {
    // Parachain → Parachain (via relay)
    totalSeconds =
      2 * PARACHAIN_BLOCK_TIME +
      1 * RELAY_BLOCK_TIME +
      1 * PARACHAIN_BLOCK_TIME;
  } else {
    // Relay → Relay (rare case)
    totalSeconds = RELAY_BLOCK_TIME * 2;
  }

  return `~${totalSeconds}s`;
}

/**
 * Result of XCM fee estimation
 */
export interface XcmFeeEstimate {
  // Fee info
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  receivableAmount?: XcmFeeAsset;
  minTransferAmount?: XcmFeeAsset;
  time?: string;

  // States
  isLoading: boolean;
  isFetched: boolean;
  isEdSufficient?: boolean;
  isFormValid: boolean;
  error?: string;

  // Actions
  getCall: () => Promise<Awaited<ReturnType<typeof buildXcmCall>>>;
}

export interface UseXcmFeeEstimateParams {
  fromChain?: Endpoint;
  toChain?: Endpoint;
  token?: TokenNetworkItem;
  amount: string;
  senderAddress: string;
  recipient: string;
}

/**
 * Hook for XCM fee estimation and validation.
 * Uses getOriginXcmFee (which doesn't require amount) for fee fetching,
 * then calculates receivableAmount, minTransferAmount, and isEdSufficient on client side.
 */
export function useXcmFeeEstimate({
  fromChain,
  toChain,
  token,
  amount,
  senderAddress,
  recipient,
}: UseXcmFeeEstimateParams): XcmFeeEstimate {
  // Parse amount to smallest unit
  const amountInSmallestUnit = useMemo(() => {
    if (!amount || !token?.token.decimals) return '';

    try {
      return parseUnits(amount, token.token.decimals).toString();
    } catch {
      return '';
    }
  }, [amount, token?.token.decimals]);

  // Fetch XCM fee info (doesn't depend on amount)
  const {
    data,
    isLoading,
    isFetched,
    error: queryError,
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'xcm-fee',
      fromChain?.key,
      toChain?.key,
      token?.token.key,
      senderAddress,
      recipient,
    ] as const,
    enabled:
      !!fromChain &&
      !!toChain &&
      !!token?.token &&
      !!senderAddress &&
      !!recipient,
    staleTime: 5 * 60_000, // Cache for 5 minutes since XCM fees are relatively stable
    retry: 1,
    queryFn: async () => {
      return getOriginXcmFee({
        sourceChain: fromChain!,
        destChain: toChain!,
        token: token!.token,
        recipient,
        senderAddress,
      });
    },
  });

  // Calculate receivableAmount, minTransferAmount, isEdSufficient
  const { receivableAmount, minTransferAmount, isEdSufficient } =
    useMemo(() => {
      if (!data || !amountInSmallestUnit || !token?.token) {
        return {
          receivableAmount: undefined,
          minTransferAmount: undefined,
          isEdSufficient: undefined,
        };
      }

      const amountBigInt = BigInt(amountInSmallestUnit);
      const destED = data.destED ? BigInt(data.destED) : 0n;
      const destFeeAmount = data.destFee ? BigInt(data.destFee.fee) : 0n;

      // Check if destFee asset matches transfer token using isAssetXcEqual
      const isSameFeeAsset =
        data.destFee &&
        isAssetXcEqual(
          { symbol: data.destFee.symbol, decimals: data.destFee.decimals },
          { symbol: token.token.symbol, decimals: token.token.decimals },
        );

      // Calculate receivableAmount = amount - destFee (if same asset)
      const receivableAmountValue = isSameFeeAsset
        ? amountBigInt > destFeeAmount
          ? amountBigInt - destFeeAmount
          : 0n
        : amountBigInt;

      // Calculate minTransferAmount = destED + destFee (if same asset) + hopFees + 1
      let minAmount = destED + 1n;

      if (isSameFeeAsset) {
        minAmount += destFeeAmount;
      }

      // Add hop fees if same asset
      for (const hopFee of data.hopFees) {
        const isHopSameAsset = isAssetXcEqual(
          { symbol: hopFee.symbol, decimals: hopFee.decimals },
          { symbol: token.token.symbol, decimals: token.token.decimals },
        );

        if (isHopSameAsset) {
          minAmount += BigInt(hopFee.fee);
        }
      }

      return {
        receivableAmount: {
          fee: receivableAmountValue.toString(),
          symbol: token.token.symbol,
          decimals: token.token.decimals,
        } as XcmFeeAsset,
        minTransferAmount: {
          fee: minAmount.toString(),
          symbol: token.token.symbol,
          decimals: token.token.decimals,
        } as XcmFeeAsset,
        isEdSufficient: receivableAmountValue >= destED,
      };
    }, [data, amountInSmallestUnit, token]);

  // Calculate transfer time
  const time = useMemo(() => {
    if (!fromChain || !toChain) return undefined;
    const isSourceRelay = !fromChain.relayChain;
    const isDestRelay = !toChain.relayChain;

    return estimateTransferTime(isSourceRelay, isDestRelay);
  }, [fromChain, toChain]);

  // Form validation (includes ED check)
  const isFormValid =
    !!fromChain &&
    !!toChain &&
    !!token?.token &&
    !!amountInSmallestUnit &&
    !!recipient &&
    isEdSufficient !== false;

  // Build XCM call for transaction submission
  const tokenData = token?.token;
  const getCall = useCallback(async () => {
    if (!fromChain || !toChain || !tokenData || !amountInSmallestUnit) {
      throw new Error('Missing required parameters');
    }

    return buildXcmCall({
      sourceChain: fromChain,
      destChain: toChain,
      token: tokenData,
      amount: amountInSmallestUnit,
      recipient,
      senderAddress,
    });
  }, [
    fromChain,
    toChain,
    tokenData,
    amountInSmallestUnit,
    recipient,
    senderAddress,
  ]);

  // Determine error message
  const error =
    queryError?.message ||
    data?.error ||
    (isEdSufficient === false
      ? 'Transfer amount does not meet destination existential deposit'
      : undefined);

  return {
    originFee: data?.originFee,
    destFee: data?.destFee,
    receivableAmount,
    minTransferAmount,
    time,
    isLoading,
    isFetched,
    isEdSufficient,
    isFormValid,
    error,
    getCall,
  };
}
