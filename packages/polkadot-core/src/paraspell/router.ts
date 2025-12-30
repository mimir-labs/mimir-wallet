// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { PolkadotClient } from 'polkadot-api';

import { RouterBuilder } from '@paraspell/xcm-router';

import { ApiManager } from '../api/ApiManager.js';
import { allEndpoints } from '../chains/config.js';

import {
  buildPapiOverrides,
  buildCurrencyCore,
  type XcmFeeAsset,
} from './index.js';

/**
 * Swap transaction type
 */
export type SwapTransactionType = 'TRANSFER' | 'SWAP' | 'SWAP_AND_TRANSFER';

/**
 * Swap transaction result with Polkadot.js format
 */
export interface SwapTransaction {
  tx: SubmittableExtrinsic<'promise'>;
  chain: string;
  type: SwapTransactionType;
  amountOut?: bigint;
}

/**
 * Parameters for building swap call
 */
export interface BuildSwapCallParams {
  fromChain: Endpoint;
  toChain: Endpoint;
  fromToken: AnyAssetInfo;
  toToken: AnyAssetInfo;
  amount: string; // Amount in smallest unit
  slippagePct: string; // e.g., "1" for 1%
  senderAddress: string;
  recipient: string;
  exchange?: string | string[]; // Optional: specify DEX
}

/**
 * Parameters for getting swap estimate
 */
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
 * Swap estimate result
 */
export interface SwapEstimateResult {
  outputAmount: string;
  exchange: string;
  originFee: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  hopFees: XcmFeeAsset[];
  priceImpact: number;
  exchangeRate: string;
}

/**
 * Build swap transactions using ParaSpell XCM Router
 * Returns Polkadot.js format transactions that can be submitted via TxButton
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

  const apiOverrides: Record<string, Promise<PolkadotClient>> = {
    ...buildPapiOverrides(fromChain, toChain, fromToken),
    Hydration: ApiManager.getInstance().getPapiClient('hydration'),
  };

  // Build the router
  let builder = RouterBuilder({
    apiOverrides: apiOverrides,
  })
    .exchange('HydrationDex')
    .from(fromParaspell)
    .to(toParaspell)
    .currencyFrom(buildCurrencyCore(fromToken))
    .currencyTo(buildCurrencyCore(toToken))
    .amount(amount)
    .slippagePct(slippagePct)
    .senderAddress(senderAddress)
    .recipientAddress(recipient);

  // Set exchange if specified
  if (exchange) {
    builder = builder.exchange(exchange as any);
  }

  // Build transactions (PAPI format)
  const transactions = await builder.buildTransactions();

  // Convert PAPI transactions to Polkadot.js format
  const apiManager = ApiManager.getInstance();

  const result: SwapTransaction[] = await Promise.all(
    transactions.map(async (tx) => {
      // Get SCALE encoded call data from PAPI transaction
      const encodedCallData = (await tx.tx.getEncodedData()).asHex();

      // Find the chain endpoint
      const chainEndpoint = allEndpoints.find(
        (e) => e.paraspellChain === tx.chain,
      );

      if (!chainEndpoint) {
        throw new Error(`Chain endpoint not found for ${tx.chain}`);
      }

      // Get Polkadot.js API and rebuild transaction
      const api = await apiManager.getApi(chainEndpoint.key);
      const pjsTx = api.tx(encodedCallData);

      return {
        tx: pjsTx,
        chain: tx.chain,
        type: tx.type as SwapTransactionType,
        amountOut: 'amountOut' in tx ? (tx.amountOut as bigint) : undefined,
      };
    }),
  );

  return result;
}

/**
 * Get the best output amount and selected exchange
 */
export async function getBestAmountOut(params: {
  fromChain: Endpoint;
  toChain: Endpoint;
  fromToken: AnyAssetInfo;
  toToken: AnyAssetInfo;
  amount: string;
}): Promise<{ amountOut: bigint; exchange: string }> {
  const { fromChain, toChain, fromToken, toToken, amount } = params;
  const apiOverrides: Record<string, Promise<PolkadotClient>> = {
    ...buildPapiOverrides(fromChain, toChain, fromToken),
    Hydration: ApiManager.getInstance().getPapiClient('hydration'),
  };

  const result = await RouterBuilder({
    apiOverrides: apiOverrides,
  })
    .exchange('HydrationDex')
    .currencyFrom(buildCurrencyCore(fromToken))
    .currencyTo(buildCurrencyCore(toToken))
    .amount(amount)
    .getBestAmountOut();

  return {
    amountOut: result.amountOut,
    exchange: result.exchange,
  };
}

/**
 * Get swap XCM fees
 */
export async function getSwapXcmFees(params: GetSwapEstimateParams): Promise<{
  originFee: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  hopFees: XcmFeeAsset[];
}> {
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
    throw new Error('Chain does not support XCM Router');
  }

  const apiOverrides: Record<string, Promise<PolkadotClient>> = {
    ...buildPapiOverrides(fromChain, toChain, fromToken),
    Hydration: ApiManager.getInstance().getPapiClient('hydration'),
  };

  const fees = await RouterBuilder({
    apiOverrides: apiOverrides,
  })
    .exchange('HydrationDex')
    .from(fromParaspell)
    .to(toParaspell)
    .currencyFrom(buildCurrencyCore(fromToken))
    .currencyTo(buildCurrencyCore(toToken))
    .amount(amount)
    .slippagePct(slippagePct)
    .senderAddress(senderAddress)
    .recipientAddress(recipient)
    .getXcmFees();

  const originFee: XcmFeeAsset = {
    fee: (fees.origin.fee ?? 0n).toString(),
    symbol: fees.origin.asset.symbol,
    decimals: fees.origin.asset.decimals,
  };

  const destFee: XcmFeeAsset | undefined =
    fees.destination && fees.destination.fee !== undefined
      ? {
          fee: fees.destination.fee.toString(),
          symbol: fees.destination.asset.symbol,
          decimals: fees.destination.asset.decimals,
        }
      : undefined;

  // Extract hop fees if available - hops may not have fee info
  const hopFees: XcmFeeAsset[] = [];

  return { originFee, destFee, hopFees };
}

/**
 * Get full swap estimate including output amount and fees
 */
export async function getSwapEstimate(
  params: GetSwapEstimateParams,
): Promise<SwapEstimateResult> {
  try {
    // Get best amount out first
    const { amountOut, exchange } = await getBestAmountOut({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
    });

    // Get fees
    const { originFee, destFee, hopFees } = await getSwapXcmFees(params);

    // Calculate price impact
    const inputAmount = BigInt(params.amount);
    const priceImpact = calculatePriceImpact(
      inputAmount,
      amountOut,
      params.fromToken.decimals || 10,
      params.toToken.decimals || 10,
    );

    // Calculate exchange rate
    const exchangeRate = calculateExchangeRate(
      inputAmount,
      amountOut,
      params.fromToken,
      params.toToken,
    );

    return {
      outputAmount: amountOut.toString(),
      exchange,
      originFee,
      destFee,
      hopFees,
      priceImpact,
      exchangeRate,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Calculate price impact as a percentage (0-1)
 */
function calculatePriceImpact(
  inputAmount: bigint,
  outputAmount: bigint,
  inputDecimals: number,
  outputDecimals: number,
): number {
  if (inputAmount === 0n) return 0;

  // Normalize to same decimals for comparison
  const normalizedInput = Number(inputAmount) / Math.pow(10, inputDecimals);
  const normalizedOutput = Number(outputAmount) / Math.pow(10, outputDecimals);

  // Assuming 1:1 is perfect, calculate deviation
  // This is simplified - real price impact needs oracle data
  const ratio = normalizedOutput / normalizedInput;
  const impact = Math.abs(1 - ratio);

  return Math.min(impact, 1); // Cap at 100%
}

/**
 * Calculate exchange rate string
 */
function calculateExchangeRate(
  inputAmount: bigint,
  outputAmount: bigint,
  fromToken: AnyAssetInfo,
  toToken: AnyAssetInfo,
): string {
  if (inputAmount === 0n) return '';

  const inputDecimals = fromToken.decimals || 10;
  const outputDecimals = toToken.decimals || 10;

  const normalizedInput = Number(inputAmount) / Math.pow(10, inputDecimals);
  const normalizedOutput = Number(outputAmount) / Math.pow(10, outputDecimals);

  const rate = normalizedOutput / normalizedInput;

  return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`;
}
