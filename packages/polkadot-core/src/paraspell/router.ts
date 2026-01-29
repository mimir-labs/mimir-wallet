// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  BuildSwapCallParams,
  DryRunChainResult,
  GetSwapEstimateParams,
  LightSpellBestAmountResponse,
  LightSpellDryRunResponse,
  LightSpellRouterTransaction,
  SwapEstimateResult,
  SwapRouteHop,
  SwapTransaction,
  XcmFeeAsset,
} from './types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';

import { ApiManager } from '../api/ApiManager.js';

import { LIGHTSPELL_ENDPOINTS, lightSpellPost } from './api-client.js';
import { buildCurrencyCore } from './currency.js';
import { buildXcmFeeAsset, calculateExchangeRate } from './utils.js';

/**
 * Default exchange for cross-chain swaps
 */
const HYDRATION_DEX = 'HydrationDex';

/**
 * Build swap transactions using ParaSpell XCM Router
 */
export async function buildSwapCall(
  params: BuildSwapCallParams,
): Promise<SwapTransaction[]> {
  const {
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    slippagePct,
    senderAddress,
    recipient,
    exchange,
  } = params;

  const fromParaspell = fromChain.paraspellChain;
  const toParaspell = toChain.paraspellChain;

  if (!fromParaspell || !toParaspell) {
    throw new Error('Chain does not support XCM Router');
  }

  const [result, api] = await Promise.all([
    lightSpellPost<LightSpellRouterTransaction[]>(LIGHTSPELL_ENDPOINTS.ROUTER, {
      from: fromParaspell,
      exchange,
      to: toParaspell,
      currencyFrom: buildCurrencyCore(fromToken),
      currencyTo: buildCurrencyCore(toToken),
      amount,
      slippagePct,
      recipientAddress: recipient,
      senderAddress,
    }),
    ApiManager.getInstance().getApi(fromChain.key),
  ]);

  return result.map((item) => ({
    chain: item.chain,
    type: item.type,
    tx: api.tx(api.createType('Call', item.tx)),
    amountOut: BigInt(item.amountOut),
  }));
}

/**
 * Get the best output amount and selected exchange
 */
export async function getBestAmountOut(params: {
  fromChain: { paraspellChain?: string };
  toChain: { paraspellChain?: string };
  fromToken: AnyAssetInfo;
  toToken: AnyAssetInfo;
  amount: string;
}): Promise<{ amountOut: bigint; exchange: string }> {
  const { fromChain, toChain, fromToken, toToken, amount } = params;

  const result = await lightSpellPost<LightSpellBestAmountResponse>(
    LIGHTSPELL_ENDPOINTS.ROUTER_BEST_AMOUNT,
    {
      from: fromChain.paraspellChain,
      to: toChain.paraspellChain,
      exchange: HYDRATION_DEX,
      currencyFrom: buildCurrencyCore(fromToken),
      currencyTo: buildCurrencyCore(toToken),
      amount,
    },
  );

  return {
    amountOut: result.amountOut,
    exchange: result.exchange,
  };
}

/**
 * Internal result type for getSwapDryRun
 */
interface DryRunResult {
  success: boolean;
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  hops: SwapRouteHop[];
  error?: string;
}

/**
 * Format chain error message for user display
 */
function formatChainError(
  chainType: string,
  result: DryRunChainResult,
): string {
  if (result.success) return '';

  const parts = [`${chainType}: ${result.failureReason}`];

  if (result.failureSubReason) {
    parts.push(result.failureSubReason);
  }

  return parts.join(' - ');
}

/**
 * Format top-level dry-run error for user display
 */
function formatDryRunError(response: LightSpellDryRunResponse): string {
  const parts: string[] = [];

  if (response.failureReason) {
    parts.push(response.failureReason);
  }

  if (response.failureSubReason) {
    parts.push(response.failureSubReason);
  }

  if (response.failureChain) {
    parts.push(`on ${response.failureChain}`);
  }

  return parts.join(': ') || 'Unknown error';
}

/**
 * Get swap dry-run result with fee estimation and validation
 * Always parses the full response even if there are failures
 */
export async function getSwapDryRun(
  params: GetSwapEstimateParams,
  exchange: string,
): Promise<DryRunResult> {
  const {
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    slippagePct,
    senderAddress,
    recipient,
  } = params;

  const fromParaspell = fromChain.paraspellChain;
  const toParaspell = toChain.paraspellChain;

  if (!fromParaspell || !toParaspell) {
    return {
      success: false,
      hops: [],
      error: 'Chain does not support XCM Router',
    };
  }

  const response = await lightSpellPost<LightSpellDryRunResponse>(
    LIGHTSPELL_ENDPOINTS.ROUTER_DRY_RUN,
    {
      from: fromParaspell,
      exchange,
      to: toParaspell,
      currencyFrom: buildCurrencyCore(fromToken),
      currencyTo: buildCurrencyCore(toToken),
      amount,
      slippagePct,
      recipientAddress: recipient,
      senderAddress,
    },
  );

  // Collect errors but continue parsing
  const errors: string[] = [];

  // Check for top-level failure
  if (response.failureReason) {
    errors.push(formatDryRunError(response));
  }

  // Check origin result
  if (response.origin && !response.origin.success) {
    errors.push(formatChainError('Origin', response.origin));
  }

  // Check destination result
  if (response.destination && !response.destination.success) {
    errors.push(formatChainError('Destination', response.destination));
  }

  // Check hops for failures
  for (const hop of response.hops ?? []) {
    if (!hop.result.success) {
      errors.push(formatChainError(hop.chain, hop.result));
    }
  }

  // Build hops from response (always parse)
  const hops: SwapRouteHop[] = (response.hops ?? []).map(
    (hop: { chain: string; result: DryRunChainResult }) => ({
      chain: hop.chain,
      isExchange: hop.chain === exchange,
      fee: hop.result.success
        ? buildXcmFeeAsset(hop.result.asset, hop.result.fee)
        : undefined,
    }),
  );

  // Parse origin fee if available (only when success)
  const originFee =
    response.origin?.success === true
      ? buildXcmFeeAsset(response.origin.asset, response.origin.fee)
      : undefined;

  // Parse destination fee if available (only when success)
  const destFee =
    response.destination?.success === true
      ? buildXcmFeeAsset(response.destination.asset, response.destination.fee)
      : undefined;

  const success = errors.length === 0;

  return {
    success,
    originFee,
    destFee,
    hops,
    error: success ? undefined : errors.join('; '),
  };
}

/**
 * Get full swap estimate including output amount and fees
 */
export async function getSwapEstimate(
  params: GetSwapEstimateParams,
): Promise<SwapEstimateResult> {
  // Parallel API calls with fixed exchange
  const [{ amountOut }, dryRunResult] = await Promise.all([
    getBestAmountOut({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
    }),
    getSwapDryRun(params, HYDRATION_DEX),
  ]);

  const inputAmount = BigInt(params.amount);
  const inputDecimals = params.fromToken.decimals || 10;
  const outputDecimals = params.toToken.decimals || 10;

  // Default empty fee for failed dry-run
  const emptyFee: XcmFeeAsset = { symbol: '', decimals: 0, fee: '0' };

  return {
    outputAmount: amountOut.toString(),
    exchange: HYDRATION_DEX,
    originFee: dryRunResult.originFee ?? emptyFee,
    destFee: dryRunResult.destFee,
    hops: dryRunResult.hops,
    exchangeRate: calculateExchangeRate(
      inputAmount,
      amountOut,
      params.fromToken.symbol,
      params.toToken.symbol,
      inputDecimals,
      outputDecimals,
    ),
    dryRunSuccess: dryRunResult.success,
    dryRunError: dryRunResult.error,
  };
}
