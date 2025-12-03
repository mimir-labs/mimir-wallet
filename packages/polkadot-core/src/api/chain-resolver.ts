// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';

import { isHex } from '@polkadot/util';

import { allEndpoints } from '../chains/config.js';

/**
 * Resolve chain identifier (network key or genesis hash) to Endpoint
 *
 * @param chainOrGenesisHash - Network key (e.g., 'polkadot') or genesis hash
 * @returns Endpoint configuration or undefined if not found
 *
 * @example
 * ```ts
 * // By network key
 * resolveChain('polkadot') // => { key: 'polkadot', ... }
 *
 * // By genesis hash
 * resolveChain('0x91b171bb...') // => { key: 'polkadot', ... }
 * ```
 */
export function resolveChain(chainOrGenesisHash: string): Endpoint | undefined {
  if (isHex(chainOrGenesisHash)) {
    return allEndpoints.find((item) => item.genesisHash === chainOrGenesisHash);
  }

  return allEndpoints.find((item) => item.key === chainOrGenesisHash);
}

/**
 * Get the identity network key for a given network
 * Some chains delegate identity to another chain (e.g., parachains to relay chains)
 *
 * @param network - Network key
 * @returns Identity network key (same as input if no delegation)
 *
 * @example
 * ```ts
 * getIdentityNetwork('assethub-polkadot') // => 'polkadot'
 * getIdentityNetwork('polkadot') // => 'polkadot'
 * ```
 */
export function getIdentityNetwork(network: string): string {
  const chainInfo = allEndpoints.find((e) => e.key === network);

  return chainInfo?.identityNetwork ?? network;
}
