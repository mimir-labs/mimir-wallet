// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint, XcmFeeAsset } from '@mimir-wallet/polkadot-core';

/**
 * Swap route step representing a hop in the swap path
 */
export interface SwapRouteStep {
  /** Resolved Endpoint (for displaying icon and name) */
  network: Endpoint;
  /** Token symbol displayed for this step */
  token?: string;
  /** Whether this step is an exchange (DEX) */
  isExchange?: boolean;
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

  // Fees
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;

  // Route info
  route: SwapRouteStep[];
  estimatedTime: string;

  // Exchange used for swap
  exchange: string;

  // Exchange rate display string
  exchangeRate: string;

  // Dry-run validation result
  dryRunSuccess: boolean;
  dryRunError?: string;

  // States
  isLoading: boolean;
  isFetched: boolean;
  error?: string;
}

/**
 * Default slippage value
 */
export const DEFAULT_SLIPPAGE: SlippageState = {
  type: 'preset',
  value: '1',
};
