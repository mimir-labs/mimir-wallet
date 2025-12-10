// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  addressToHex,
  allEndpoints,
  CURRENT_NETWORK_KEY,
  DEFAULT_NETWORKS,
  DEFAULE_SS58_CHAIN_KEY,
  ENABLED_NETWORKS_KEY,
  isPolkadotAddress,
  NETWORK_MODE_KEY,
} from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { encodeAddress } from '@polkadot/util-crypto';

import {
  CURRENT_ADDRESS_HEX_KEY,
  CURRENT_ADDRESS_PREFIX,
  FAVORITE_DAPP_KEY,
  RECENT_NETWORKS_KEY,
} from '@/constants';
import {
  internalToUrlNetwork,
  urlToInternalNetwork,
} from '@/utils/networkMapping';

export function initMimir(omni: boolean) {
  const search = new URLSearchParams(window.location.search);

  let chain = allEndpoints[0];

  if (omni) {
    // Omni mode: use first enabled network
    const enabledNetworks = (store.get(ENABLED_NETWORKS_KEY) as string[]) || [];
    const firstEnabled = enabledNetworks[0];

    if (firstEnabled) {
      const _chain = allEndpoints.find((c) => c.key === firstEnabled);

      if (_chain) {
        chain = _chain;
      }
    }
  } else {
    // Solo mode: read network from URL or localStorage
    const urlNetwork = search.get('network');
    const internalNetwork = urlNetwork
      ? urlToInternalNetwork(urlNetwork)
      : null;
    const localNetwork = store.get(CURRENT_NETWORK_KEY) as string;

    const network = internalNetwork || localNetwork;

    if (network) {
      const _chain = allEndpoints.find((c) => c.key === network);

      if (_chain) {
        chain = _chain;
      }
    }

    store.set(CURRENT_NETWORK_KEY, chain.key);
  }

  let address: string | undefined;
  const urlAddress = search.get('address');
  const localAddress = omni
    ? (store.get(CURRENT_ADDRESS_HEX_KEY) as string)
    : (store.get(`${CURRENT_ADDRESS_PREFIX}${chain.key}`) as string);

  if (urlAddress && isPolkadotAddress(urlAddress)) {
    address = encodeAddress(urlAddress, chain.ss58Format);
  } else if (localAddress && isPolkadotAddress(localAddress)) {
    address = encodeAddress(localAddress, chain.ss58Format);
  }

  if (address) {
    omni
      ? store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(address))
      : store.set(
          `${CURRENT_ADDRESS_PREFIX}${chain.key}`,
          addressToHex(address),
        );
  } else {
    omni
      ? store.remove(CURRENT_ADDRESS_HEX_KEY)
      : store.remove(`${CURRENT_ADDRESS_PREFIX}${chain.key}`);
  }

  // Sync URL with final values if they're not present
  // This ensures the URL always reflects the current address and network
  const currentUrl = new URL(window.location.href);
  let urlUpdated = false;

  if (address && !currentUrl.searchParams.has('address')) {
    currentUrl.searchParams.set('address', address);
    urlUpdated = true;
  }

  // Solo mode: Add network parameter to URL if missing
  // Omni mode: Remove network parameter from URL if present
  if (!omni && chain.key && !currentUrl.searchParams.has('network')) {
    // Convert internal key to URL-friendly format
    // e.g., 'assethub-polkadot' → 'polkadot', 'polkadot' → 'polkadot-relay'
    currentUrl.searchParams.set('network', internalToUrlNetwork(chain.key));
    urlUpdated = true;
  } else if (omni && currentUrl.searchParams.has('network')) {
    // Omni mode doesn't use network parameter in URL
    currentUrl.searchParams.delete('network');
    urlUpdated = true;
  }

  if (urlUpdated) {
    window.history.replaceState({}, '', currentUrl.toString());
  }

  return {
    address,
    chain,
  };
}

export function initFavoriteDapps() {
  const value = store.get(FAVORITE_DAPP_KEY) as (string | number)[];

  if (!value || value.length === 0) {
    store.set(FAVORITE_DAPP_KEY, [1, 2, 4, 5, 1002, 1004].reverse());
  }
}

const MAX_RECENT_NETWORKS = 10;

/**
 * Initialize network mode from localStorage
 * Returns 'omni' or 'solo', defaults to 'omni' if not set
 */
export function initNetworkMode(): 'omni' | 'solo' {
  const stored = store.get(NETWORK_MODE_KEY) as 'omni' | 'solo' | undefined;

  if (stored === 'omni' || stored === 'solo') {
    return stored;
  }

  // Default to omni mode
  store.set(NETWORK_MODE_KEY, 'omni');

  return 'omni';
}

/**
 * Initialize enabled networks with defaults if not set
 */
export function initEnabledNetworks() {
  let enabledNetworks = store.get(ENABLED_NETWORKS_KEY) as string[] | undefined;

  if (
    !enabledNetworks ||
    !Array.isArray(enabledNetworks) ||
    enabledNetworks.length === 0
  ) {
    enabledNetworks = DEFAULT_NETWORKS;
    store.set(ENABLED_NETWORKS_KEY, enabledNetworks);
  }

  return enabledNetworks;
}

/**
 * Initialize SS58 chain with default if not set
 */
export function initSs58Chain() {
  const stored = store.get(DEFAULE_SS58_CHAIN_KEY) as string | undefined;

  // Validate stored value against available endpoints
  if (stored && allEndpoints.some((e) => e.key === stored)) {
    return stored;
  }

  // Default to first endpoint
  const defaultChain = allEndpoints[0]?.key ?? 'polkadot';

  store.set(DEFAULE_SS58_CHAIN_KEY, defaultChain);

  return defaultChain;
}

/**
 * Initialize recent networks with default networks if not enough
 * Priority: enabled networks first, then other networks
 */
export function initRecentNetworks() {
  const existing = (store.get(RECENT_NETWORKS_KEY) as string[]) || [];

  if (existing.length >= MAX_RECENT_NETWORKS) {
    return;
  }

  // Get enabled networks first
  const enabledNetworks = (store.get(ENABLED_NETWORKS_KEY) as string[]) || [];

  // Get all network keys
  const allNetworkKeys = allEndpoints.map((endpoint) => endpoint.key);

  // Fill up: existing + enabled (not in existing) + others (not in existing)
  const existingSet = new Set(existing);

  // Add enabled networks first
  const enabledToAdd = enabledNetworks.filter((key) => !existingSet.has(key));

  // Then add other networks
  const enabledSet = new Set([...existing, ...enabledToAdd]);
  const othersToAdd = allNetworkKeys.filter((key) => !enabledSet.has(key));

  const filled = [...existing, ...enabledToAdd, ...othersToAdd].slice(
    0,
    MAX_RECENT_NETWORKS,
  );

  store.set(RECENT_NETWORKS_KEY, filled);
}
