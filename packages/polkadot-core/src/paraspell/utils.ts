// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { XcmFeeAsset } from './types.js';
import type { TAssetInfo } from '@paraspell/assets';

/**
 * Build XcmFeeAsset from TAssetInfo and fee
 */
export function buildXcmFeeAsset(
  asset: TAssetInfo,
  fee: bigint | number,
): XcmFeeAsset {
  return {
    symbol: asset.symbol,
    decimals: asset.decimals,
    fee: fee.toString(),
  };
}

/**
 * Calculate exchange rate string
 */
export function calculateExchangeRate(
  inputAmount: bigint,
  outputAmount: bigint,
  fromSymbol: string,
  toSymbol: string,
  inputDecimals: number,
  outputDecimals: number,
): string {
  if (inputAmount === 0n) return '';

  const normalizedInput = Number(inputAmount) / Math.pow(10, inputDecimals);
  const normalizedOutput = Number(outputAmount) / Math.pow(10, outputDecimals);
  const rate = normalizedOutput / normalizedInput;

  return `1 ${fromSymbol} = ${rate.toFixed(6)} ${toSymbol}`;
}
