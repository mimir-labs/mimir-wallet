// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';
import type {
  TAssetInfo,
  TCurrencyCore,
  TCurrencyInputWithAmount,
} from '@paraspell/assets';
import type { TGetXcmFeeResult, TLocation } from '@paraspell/sdk-core';
import type { SubmittableExtrinsic } from '@polkadot/api/types';

// ============================================
// Common Types
// ============================================

/**
 * Fee asset information with fee amount
 */
export interface XcmFeeAsset {
  symbol: string;
  decimals: number;
  fee: string;
}

/**
 * XCM fee breakdown for transfers
 */
export interface XcmFeeInfo {
  originFee: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  destED?: string;
  hopFees: XcmFeeAsset[];
  error?: string;
}

// ============================================
// Transfer Types
// ============================================

/**
 * Parameters for XCM transfer call building
 */
export interface BuildXcmCallParams {
  /** Source chain configuration */
  fromChain: Endpoint;
  /** Destination chain configuration */
  toChain: Endpoint;
  /** Token to transfer */
  token: AnyAssetInfo;
  /** Amount in smallest unit (e.g., planck) */
  amount: string;
  /** Recipient address on destination chain */
  recipient: string;
  /** Sender address on source chain */
  senderAddress: string;
}

/**
 * Parameters for XCM fee estimation
 */
export interface GetXcmFeeParams {
  fromChain: Endpoint;
  toChain: Endpoint;
  token: AnyAssetInfo;
  recipient: string;
  senderAddress: string;
}

// ============================================
// Router Types
// ============================================

export type SwapTransactionType = 'TRANSFER' | 'SWAP' | 'SWAP_AND_TRANSFER';

export interface SwapTransaction {
  tx: SubmittableExtrinsic<'promise'>;
  chain: string;
  type: SwapTransactionType;
  amountOut?: bigint;
}

export interface BuildSwapCallParams {
  fromChain: Endpoint;
  toChain: Endpoint;
  fromToken: AnyAssetInfo;
  toToken: AnyAssetInfo;
  amount: string;
  slippagePct: string;
  senderAddress: string;
  recipient: string;
  exchange: string;
}

export interface GetSwapEstimateParams {
  fromChain: Endpoint;
  toChain: Endpoint;
  fromToken: AnyAssetInfo;
  toToken: AnyAssetInfo;
  amount: string;
  slippagePct: string;
  senderAddress: string;
  recipient: string;
}

/**
 * A hop in the swap route path
 */
export interface SwapRouteHop {
  /** ParaSpell chain name */
  chain: string;
  /** Whether this hop is an exchange (DEX) */
  isExchange: boolean;
  /** Fee for this hop (if available) */
  fee?: XcmFeeAsset;
}

export interface SwapEstimateResult {
  outputAmount: string;
  exchange: string;
  originFee: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  /** Route hops between origin and destination */
  hops: SwapRouteHop[];
  exchangeRate: string;
  /** Whether dry-run validation succeeded */
  dryRunSuccess: boolean;
  /** Error message from dry-run (for UI display) */
  dryRunError?: string;
}

// ============================================
// LightSpell API Response Types
// ============================================

export interface LightSpellRouterTransaction {
  chain: string;
  type: SwapTransactionType;
  tx: string;
  amountOut: string;
}

export interface LightSpellBestAmountResponse {
  amountOut: bigint;
  exchange: string;
}

/**
 * Chain result from dry-run (success case)
 */
export interface DryRunChainSuccess {
  success: true;
  fee: bigint;
  asset: TAssetInfo;
}

/**
 * Chain result from dry-run (failure case)
 */
export interface DryRunChainFailure {
  success: false;
  failureReason: string;
  failureSubReason?: string;
}

export type DryRunChainResult = DryRunChainSuccess | DryRunChainFailure;

/**
 * LightSpell API response for router dry-run
 * Matches the structure returned by ROUTER_DRY_RUN endpoint
 */
export interface LightSpellDryRunResponse {
  /** Top-level failure reason */
  failureReason?: string;
  /** Detailed failure reason */
  failureSubReason?: string;
  /** Chain where failure occurred */
  failureChain?: string;
  /** Origin chain result */
  origin: DryRunChainResult;
  /** Destination chain result */
  destination?: DryRunChainResult;
  /** Intermediate hops in the route */
  hops: Array<{
    chain: string;
    result: DryRunChainResult;
  }>;
}

// ============================================
// Re-exports from paraspell
// ============================================

export type {
  TAssetInfo,
  TCurrencyCore,
  TCurrencyInputWithAmount,
  TGetXcmFeeResult,
  TLocation,
};
