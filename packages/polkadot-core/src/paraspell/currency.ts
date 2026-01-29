// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  TCurrencyCore,
  TCurrencyInputWithAmount,
  TLocation,
} from './types.js';
import type { AnyAssetInfo } from '@mimir-wallet/service';

import { Foreign, Native } from '@paraspell/sdk-core';

/**
 * Build currency specification with amount for ParaSpell API calls
 *
 * Priority: isNative > location > assetId > symbol (Foreign)
 */
export function buildCurrencyWithAmount(
  token: AnyAssetInfo,
  amount: string,
): TCurrencyInputWithAmount {
  if (token.location) {
    return { location: token.location as TLocation, amount };
  }

  if (token.isNative) {
    return { symbol: Native(token.symbol), amount };
  }

  if (token.assetId) {
    return { id: token.assetId, amount };
  }

  // Fallback: use Foreign() for tokens without location/assetId
  return { symbol: Foreign(token.symbol), amount };
}

/**
 * Build currency core specification (without amount) for ParaSpell SDK
 *
 * Priority: isNative > location > assetId > symbol (Foreign)
 * Unified with buildCurrencyWithAmount for consistency
 */
export function buildCurrencyCore(token: AnyAssetInfo): TCurrencyCore {
  if (token.location) {
    return { location: token.location as TLocation };
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

// Backward compatibility alias
export { buildCurrencyWithAmount as buildCurrencySpec };
