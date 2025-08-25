// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';

import { decodeCallData } from '../shared/calldata-utils';

/**
 * Decodes call section and method from call data
 * @param registry - Polkadot registry
 * @param callData - Hex string call data
 * @returns Tuple of section and method, or undefined if decode fails
 */
export function decodeCallSection(registry: Registry, callData: string): [string, string] | undefined {
  const [call, error] = decodeCallData(registry, callData);

  if (error || !call) {
    return undefined;
  }

  return [call.section, call.method];
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use decodeCallSection with shared utilities
 */
export function decodeCallSectionLegacy(registry: Registry, callData: string): [string, string] | undefined {
  if (!callData) return undefined;

  try {
    const call = registry.createType('Call', callData);

    return [call.section, call.method];
  } catch {
    return undefined;
  }
}
