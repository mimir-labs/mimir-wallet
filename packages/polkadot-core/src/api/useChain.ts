// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';

import { useMemo } from 'react';

import { allEndpoints } from '../chains/config.js';

import { ApiManager } from './ApiManager.js';

/**
 * Hook to get chain configuration by network key or genesis hash
 *
 * @param chain - Network key (e.g., 'polkadot') or genesis hash (0x...), or undefined
 * @returns Endpoint configuration object, or undefined if chain is undefined
 *
 * @example
 * ```tsx
 * // Using network key
 * const chain = useChain('polkadot');
 * console.log(chain.name); // 'Polkadot'
 *
 * // Using genesis hash
 * const chain = useChain('0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3');
 * console.log(chain.key); // 'polkadot'
 *
 * // Using undefined (returns undefined)
 * const chain = useChain(undefined);
 * console.log(chain); // undefined
 * ```
 *
 * @remarks
 * - Returns undefined if chain parameter is undefined
 * - Always returns a valid Endpoint for non-undefined input (falls back to first endpoint if not found)
 * - Memoized to prevent unnecessary re-computations
 */
export function useChain(chain: string): Endpoint;
export function useChain(
  chain: string | '' | undefined | null,
): Endpoint | undefined;
export function useChain(chain: '' | undefined | null): undefined;

export function useChain(
  chain: string | undefined | null,
): Endpoint | undefined {
  return useMemo(() => {
    if (chain === undefined || chain === null) return undefined;

    return ApiManager.resolveChain(chain) ?? allEndpoints[0];
  }, [chain]);
}
