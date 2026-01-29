// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  BuildXcmCallParams,
  GetXcmFeeParams,
  TGetXcmFeeResult,
  XcmFeeInfo,
} from './types.js';
import type { Endpoint } from '../types/types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';

import { getSupportedDestinations as paraspellGetSupportedDestinations } from '@paraspell/sdk-core';

import { ApiManager } from '../api/ApiManager.js';
import { allEndpoints, getRelayChainKey } from '../chains/config.js';

import {
  LIGHTSPELL_ENDPOINTS,
  lightSpellPost,
  lightSpellPostText,
} from './api-client.js';
import { buildCurrencyCore, buildCurrencyWithAmount } from './currency.js';
import { buildXcmFeeAsset } from './utils.js';

/**
 * Get supported XCM destination chains for a source chain and optional token
 */
export function getSupportedDestinations(
  source: string,
  token?: AnyAssetInfo,
): Endpoint[] {
  const sourceChain = allEndpoints.find((item) => item.key === source);
  const sourceParaspell = sourceChain?.paraspellChain;

  if (!sourceParaspell) {
    return [];
  }

  const sourceRelayChain = getRelayChainKey(source);

  const sameRelayChain = (endpoint: Endpoint) => {
    if (!endpoint.paraspellChain) return false;
    const endpointRelayChain = endpoint.relayChain || endpoint.key;

    return endpointRelayChain === sourceRelayChain;
  };

  if (!token) {
    return allEndpoints.filter(sameRelayChain);
  }

  const supportedChains = paraspellGetSupportedDestinations(
    sourceParaspell,
    buildCurrencyCore(token),
  );

  return allEndpoints.filter(
    (endpoint) =>
      sameRelayChain(endpoint) &&
      supportedChains.includes(endpoint.paraspellChain!),
  );
}

/**
 * Build XCM transfer call for submission
 */
export async function buildXcmCall(params: BuildXcmCallParams) {
  const { fromChain, toChain, token, amount, recipient, senderAddress } =
    params;

  const sourceParaspell = fromChain.paraspellChain;
  const destParaspell = toChain.paraspellChain;

  if (!sourceParaspell || !destParaspell) {
    throw new Error('Chain does not support XCM transfers');
  }

  const api = await ApiManager.getInstance().getApi(fromChain.key);
  const currencySpec = buildCurrencyWithAmount(token, amount);

  const callData = await lightSpellPostText(LIGHTSPELL_ENDPOINTS.TRANSFER, {
    from: sourceParaspell,
    to: destParaspell,
    currency: currencySpec,
    address: recipient,
    senderAddress,
  });

  return api.tx(api.createType('Call', callData));
}

/**
 * Get XCM fee estimation
 */
export async function getXcmFee(
  params: GetXcmFeeParams,
): Promise<TGetXcmFeeResult<false>> {
  const { fromChain, toChain, token, recipient, senderAddress } = params;

  const sourceParaspell = fromChain.paraspellChain;
  const destParaspell = toChain.paraspellChain;

  if (!sourceParaspell || !destParaspell) {
    throw new Error('Chain does not support XCM transfers');
  }

  // Use a minimal amount for fee estimation - XCM fees don't depend on transfer amount
  const currencySpec = buildCurrencyWithAmount(token, '1');

  return lightSpellPost<TGetXcmFeeResult<false>>(LIGHTSPELL_ENDPOINTS.XCM_FEE, {
    from: sourceParaspell,
    to: destParaspell,
    currency: currencySpec,
    address: recipient,
    senderAddress,
  });
}

/**
 * Get XCM fee info with structured format
 */
export async function getOriginXcmFee(
  params: GetXcmFeeParams,
): Promise<XcmFeeInfo> {
  const result = await getXcmFee(params);

  const error =
    result.failureChain && result.failureReason
      ? `${result.failureChain}: ${result.failureReason}`
      : undefined;

  return {
    originFee: buildXcmFeeAsset(result.origin.asset, result.origin.fee),
    destFee: result.destination
      ? buildXcmFeeAsset(result.destination.asset, result.destination.fee)
      : undefined,
    destED: result.destination?.asset.existentialDeposit?.toString(),
    hopFees: [],
    error,
  };
}
