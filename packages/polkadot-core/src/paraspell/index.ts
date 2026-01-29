// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Re-export all types
export type {
  BuildSwapCallParams,
  BuildXcmCallParams,
  GetSwapEstimateParams,
  GetXcmFeeParams,
  SwapEstimateResult,
  SwapRouteHop,
  SwapTransaction,
  SwapTransactionType,
  TAssetInfo,
  TLocation,
  XcmFeeAsset,
  XcmFeeInfo,
} from './types.js';

// Re-export paraspell utilities
export {
  compareLocations,
  findAssetInfo,
  getAssetLocation,
  getAssets,
  isAssetXcEqual,
  normalizeLocation,
} from '@paraspell/assets';

// Currency utilities
export {
  buildCurrencyCore,
  buildCurrencySpec,
  buildCurrencyWithAmount,
} from './currency.js';

// Transfer functions
export {
  buildXcmCall,
  getOriginXcmFee,
  getSupportedDestinations,
  getXcmFee,
} from './transfer.js';

// Router functions
export { buildSwapCall, getSwapEstimate } from './router.js';

// API client (for advanced usage)
export { LightSpellApiError, LIGHTSPELL_ENDPOINTS } from './api-client.js';
