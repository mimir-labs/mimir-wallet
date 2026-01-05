// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';

import {
  findAssetInfo,
  isAssetXcEqual,
  normalizeLocation,
  compareLocations,
  getAssets,
  getAssetLocation,
  type TAssetInfo,
  type TCurrencyCore,
  type TCurrencyInputWithAmount,
} from '@paraspell/assets';
import {
  Foreign,
  getSupportedDestinations as paraspellGetSupportedDestinations,
  Native,
  type TLocation,
  type TGetXcmFeeResult,
} from '@paraspell/sdk-core';

import { ApiManager } from '../api/ApiManager.js';
import { allEndpoints, getRelayChainKey } from '../chains/config.js';

/**
 * Fee asset information from dry run
 * Extends TAssetInfo with fee amount for XCM transfers
 */
export type XcmFeeAsset = TAssetInfo & {
  /** Fee amount in smallest unit */
  fee: string;
};

export function getSupportedDestinations(
  source: string,
  token?: AnyAssetInfo,
): Endpoint[] {
  const sourceChain = allEndpoints.find(
    (item) => item.key === source,
  )?.paraspellChain;

  if (!sourceChain) {
    return [];
  }

  const sourceRelayChain = getRelayChainKey(source);

  if (!token) {
    return allEndpoints.filter((item) => {
      if (!item.paraspellChain) return false;

      const endpointRelayChain = item.relayChain || item.key;

      return endpointRelayChain === sourceRelayChain;
    });
  }

  const supportedChains = paraspellGetSupportedDestinations(
    sourceChain,
    buildCurrencyCore(token),
  );

  return allEndpoints.filter((item) => {
    if (!item.paraspellChain) return false;
    const endpointRelayChain = item.relayChain || item.key;

    return (
      endpointRelayChain === sourceRelayChain &&
      supportedChains.includes(item.paraspellChain)
    );
  });
}

// Build currency specification for ParaSpell API calls
export function buildCurrencySpec(
  token: AnyAssetInfo,
  amount: string,
): TCurrencyInputWithAmount {
  // Priority: isNative > location > assetId
  if (token.isNative) {
    return { symbol: Native(token.symbol), amount: amount };
  }

  if (token.location) {
    return { location: token.location as any, amount: amount };
  }

  if (token.assetId) {
    return { id: token.assetId, amount: amount };
  }

  // Fallback: use Foreign() for tokens without location/assetId
  return { symbol: Foreign(token.symbol), amount: amount };
}

export function buildCurrencyCore(token: AnyAssetInfo): TCurrencyCore {
  // Priority: location > isNative > assetId
  if (token.location) {
    return { location: token.location as any };
  }

  if (token.isNative) {
    return { symbol: Native(token.symbol) };
  }

  if (token.assetId) {
    return { id: token.assetId };
  }

  // Fallback: use Foreign() for tokens without location/assetId
  return { symbol: Foreign(token.symbol) };
}

/**
 * Parameters for buildXcmCall
 */
export interface BuildXcmCallParams {
  sourceChain: Endpoint;
  destChain: Endpoint;
  token: AnyAssetInfo;
  amount: string; // Amount in smallest unit (e.g., planck)
  recipient: string;
  senderAddress: string;
}

/**
 * Build XCM transfer call for submission
 * Returns the extrinsic that can be signed and submitted
 */
export async function buildXcmCall(params: BuildXcmCallParams) {
  const { sourceChain, destChain, token, amount, recipient, senderAddress } =
    params;

  const sourceParaspell = sourceChain.paraspellChain;
  const destParaspell = destChain.paraspellChain;

  if (!sourceParaspell || !destParaspell) {
    throw new Error('Chain does not support XCM transfers');
  }

  const api = await ApiManager.getInstance().getApi(sourceChain.key);

  // Build currency spec
  const currencySpec = buildCurrencySpec(token, amount);

  const result: string = await fetch(
    'https://api.lightspell.xyz/v5/x-transfer',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sourceParaspell,
        to: destParaspell,
        currency: currencySpec,
        address: recipient,
        senderAddress: senderAddress,
      }),
    },
  ).then((res) => res.text());

  return api.tx(api.createType('Call', result));
}

/**
 * Parameters for getXcmFee
 */
export interface GetXcmFeeParams {
  sourceChain: Endpoint;
  destChain: Endpoint;
  token: AnyAssetInfo;
  recipient: string;
  senderAddress: string;
}

/**
 * Get XCM fee from origin chain only (without amount)
 * Uses ParaSpell's getXcmFee which automatically falls back to PaymentInfo if DryRun fails
 */
export async function getXcmFee(params: GetXcmFeeParams) {
  const { sourceChain, destChain, token, recipient, senderAddress } = params;

  const sourceParaspell = sourceChain.paraspellChain;
  const destParaspell = destChain.paraspellChain;

  if (!sourceParaspell || !destParaspell) {
    throw new Error('Not Support chain');
  }

  // Use a minimal amount for fee estimation - XCM fees don't depend on transfer amount
  const currencySpec = buildCurrencySpec(token, '1');

  const result: TGetXcmFeeResult<false> = await fetch(
    'https://api.lightspell.xyz/v5/xcm-fee',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sourceParaspell,
        to: destParaspell,
        currency: currencySpec,
        address: recipient,
        senderAddress: senderAddress,
      }),
    },
  ).then((res) => res.json());

  return result;
}

/**
 * XCM fee information with origin, destination fees and ED
 */
export interface XcmFeeInfo {
  originFee: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  destED?: string;
  hopFees: XcmFeeAsset[];
  error?: string;
}

/**
 * Get XCM fee info (origin + destination) without requiring amount
 * Wraps getXcmFee and extracts fee data in a simplified format
 */
export async function getOriginXcmFee(
  params: GetXcmFeeParams,
): Promise<XcmFeeInfo> {
  const result = await getXcmFee(params);

  let errorMsg: string | undefined;

  // Check for failure in the transfer chain
  if (result.failureChain && result.failureReason) {
    errorMsg = `${result.failureChain}: ${result.failureReason}`;
  }

  const originFee: XcmFeeAsset = {
    fee: result.origin.fee.toString(),
    symbol: result.origin.asset.symbol,
    decimals: result.origin.asset.decimals,
  };

  const destFee: XcmFeeAsset | undefined = result.destination
    ? {
        fee: result.destination.fee.toString(),
        symbol: result.destination.asset.symbol,
        decimals: result.destination.asset.decimals,
      }
    : undefined;

  const destED = result.destination?.asset.existentialDeposit?.toString();

  // Note: getXcmFee's hops array doesn't include fee details (unlike getTransferInfo)
  // For multi-hop transfers, getTransferInfo should be used instead
  const hopFees: XcmFeeAsset[] = [];

  return { originFee, destFee, destED, hopFees, error: errorMsg };
}

export type { TAssetInfo, TLocation, findAssetInfo };
export {
  normalizeLocation,
  compareLocations,
  getAssets,
  getAssetLocation,
  isAssetXcEqual,
};

export * from './router.js';
