// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint, XcmFeeAsset } from '@mimir-wallet/polkadot-core';

/**
 * Swap route step representing a hop in the swap path
 */
export interface SwapRouteStep {
  network: Endpoint;
  token: string;
  icon?: string;
}

/**
 * Slippage setting type
 */
export type SlippagePreset = '0.1' | '1' | '5';

export interface SlippageState {
  type: 'preset' | 'custom';
  value: string; // percentage string
}

/**
 * Swap estimate result from mock/real API
 */
export interface SwapEstimate {
  // Output amount
  outputAmount: string;
  outputAmountUsd: number;

  // Fees
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;

  // Route info
  route: SwapRouteStep[];
  estimatedTime: string;

  // Price impact (percentage, e.g. 0.01 = 1%)
  priceImpact: number;

  // Exchange rate display string
  exchangeRate: string;

  // States
  isLoading: boolean;
  isFetched: boolean;
  error?: string;
}

/**
 * Price impact threshold levels
 */
export const PRICE_IMPACT_THRESHOLDS = {
  LOW: 0.01, // 1%
  MEDIUM: 0.03, // 3%
  HIGH: 0.05, // 5%
} as const;

/**
 * Default slippage value
 */
export const DEFAULT_SLIPPAGE: SlippageState = {
  type: 'preset',
  value: '1',
};
