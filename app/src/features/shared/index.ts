// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Error handling utilities
export type { FeatureError, DecodeResult } from './error-handling';
export {
  createFeatureError,
  handleDecodeError,
  handleNetworkError,
  handleValidationError,
  formatErrorMessage,
  safeExecute,
  safeExecuteAsync
} from './error-handling';

// Error display components
export { ErrorDisplay, LegacyErrorDisplay } from './ErrorDisplay';

// Call data utilities
export type { CallSummary } from './calldata-utils';
export { decodeCallData, isValidCallData, formatCallData, getCallSummary, compareCallData } from './calldata-utils';
