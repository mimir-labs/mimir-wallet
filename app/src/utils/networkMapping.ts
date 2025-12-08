// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Network URL parameter mapping utilities
 *
 * Maps between internal chain keys and URL-friendly names:
 * - Internal key (chain.key) remains unchanged in code and storage
 * - URL parameter uses new user-friendly names
 *
 * This allows us to present cleaner URLs to users while maintaining
 * backward compatibility with existing code and stored data.
 */

// Internal chain key → URL parameter value
const INTERNAL_TO_URL: Record<string, string> = {
  'assethub-polkadot': 'polkadot',
  polkadot: 'polkadot-relay',
  'assethub-kusama': 'kusama',
  kusama: 'kusama-relay',
  'assethub-paseo': 'paseo',
  paseo: 'paseo-relay',
  'assethub-westend': 'westend',
  westend: 'westend-relay',
};

// URL parameter value → Internal chain key (reverse mapping)
const URL_TO_INTERNAL: Record<string, string> = {
  polkadot: 'assethub-polkadot',
  'polkadot-relay': 'polkadot',
  kusama: 'assethub-kusama',
  'kusama-relay': 'kusama',
  paseo: 'assethub-paseo',
  'paseo-relay': 'paseo',
  westend: 'assethub-westend',
  'westend-relay': 'westend',
};

/**
 * Convert URL parameter value to internal chain key
 *
 * Used when reading network parameter from URL
 *
 * @param urlNetwork - Network value from URL (e.g., 'polkadot', 'polkadot-relay')
 * @returns Internal chain key (e.g., 'assethub-polkadot', 'polkadot')
 *
 * @example
 * urlToInternalNetwork('polkadot') // returns 'assethub-polkadot'
 * urlToInternalNetwork('polkadot-relay') // returns 'polkadot'
 * urlToInternalNetwork('assethub-polkadot') // returns 'assethub-polkadot' (backward compat)
 */
export function urlToInternalNetwork(urlNetwork: string): string {
  // Support both new URL values and old internal keys for backward compatibility
  return URL_TO_INTERNAL[urlNetwork] || urlNetwork;
}

/**
 * Convert internal chain key to URL parameter value
 *
 * Used when writing network parameter to URL
 *
 * @param internalKey - Internal chain key (e.g., 'assethub-polkadot', 'polkadot')
 * @returns URL-friendly network value (e.g., 'polkadot', 'polkadot-relay')
 *
 * @example
 * internalToUrlNetwork('assethub-polkadot') // returns 'polkadot'
 * internalToUrlNetwork('polkadot') // returns 'polkadot-relay'
 * internalToUrlNetwork('other-network') // returns 'other-network' (passthrough)
 */
export function internalToUrlNetwork(internalKey: string): string {
  return INTERNAL_TO_URL[internalKey] || internalKey;
}
