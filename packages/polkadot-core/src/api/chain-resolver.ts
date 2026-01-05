// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints } from '../chains/config.js';

// Re-export for backwards compatibility
export { resolveChain, type ChainIdentifier } from '../chains/config.js';

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
