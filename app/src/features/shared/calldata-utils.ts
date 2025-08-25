// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';
import type { DecodeResult } from './error-handling';

import { handleValidationError, safeExecute } from './error-handling';

/**
 * Universal call data decoder for all features
 * @param registry - Polkadot registry
 * @param callData - Hex string call data
 * @returns Decoded call data or error
 */
export function decodeCallData(registry: Registry, callData: string): DecodeResult<Call> {
  if (!callData?.trim()) {
    return [null, null];
  }

  // Validate hex format
  if (!callData.startsWith('0x')) {
    return [null, handleValidationError('Call data must start with 0x')];
  }

  return safeExecute(() => {
    const call = registry.createType('Call', callData);

    return call;
  }, 'call data decoding');
}

/**
 * Validates if a string is a valid hex call data
 * @param callData - String to validate
 * @returns true if valid hex call data
 */
export function isValidCallData(callData: string): boolean {
  if (!callData?.trim() || !callData.startsWith('0x')) {
    return false;
  }

  try {
    // Check if it's valid hex (without 0x prefix)
    const hex = callData.slice(2);

    return /^[0-9a-fA-F]*$/.test(hex) && hex.length % 2 === 0;
  } catch {
    return false;
  }
}

/**
 * Formats call data for display
 * @param call - Decoded call data
 * @returns Human-readable formatted call data
 */
export function formatCallData(call: Call): Record<string, any> {
  return call.toHuman();
}

/**
 * Extracts call information summary
 * @param call - Decoded call data
 * @returns Call summary information
 */
export interface CallSummary {
  section: string;
  method: string;
  args: Record<string, any>;
  hash: string;
}

export function getCallSummary(call: Call): CallSummary {
  return {
    section: call.section,
    method: call.method,
    args: (call.args as any).toHuman() as Record<string, any>,
    hash: call.hash.toHex()
  };
}

/**
 * Compares two call data strings for equality
 * @param callData1 - First call data
 * @param callData2 - Second call data
 * @returns true if call data are equivalent
 */
export function compareCallData(callData1: string, callData2: string): boolean {
  if (!callData1 || !callData2) return false;

  return callData1.toLowerCase() === callData2.toLowerCase();
}
