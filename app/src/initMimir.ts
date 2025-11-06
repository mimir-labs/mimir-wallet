// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_HEX_KEY, CURRENT_ADDRESS_PREFIX, FAVORITE_DAPP_KEY } from '@/constants';
import { internalToUrlNetwork, urlToInternalNetwork } from '@/utils/networkMapping';
import { encodeAddress } from '@polkadot/util-crypto';

import { addressToHex, allEndpoints, CURRENT_NETWORK_KEY, isPolkadotAddress } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

export function initMimir(omni: boolean) {
  const search = new URLSearchParams(window.location.search);

  // Read network from URL and convert to internal key
  // This allows URL to use friendly names (e.g., 'polkadot') while code uses internal keys (e.g., 'assethub-polkadot')
  const urlNetwork = search.get('network');
  const internalNetwork = urlNetwork ? urlToInternalNetwork(urlNetwork) : null;
  const localNetwork = store.get(CURRENT_NETWORK_KEY) as string;

  let network = internalNetwork || localNetwork;

  let chain = allEndpoints[0];

  if (network) {
    const _chain = allEndpoints.find((chain) => chain.key === network);

    if (_chain) {
      chain = _chain;
    }
  }

  network = chain.key;

  store.set(CURRENT_NETWORK_KEY, chain.key);

  let address: string | undefined;
  const urlAddress = search.get('address');
  const localAddress = omni
    ? (store.get(CURRENT_ADDRESS_HEX_KEY) as string)
    : (store.get(`${CURRENT_ADDRESS_PREFIX}${network}`) as string);

  if (urlAddress && isPolkadotAddress(urlAddress)) {
    address = encodeAddress(urlAddress, chain.ss58Format);
  } else if (localAddress && isPolkadotAddress(localAddress)) {
    address = encodeAddress(localAddress, chain.ss58Format);
  }

  if (address) {
    omni
      ? store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(address))
      : store.set(`${CURRENT_ADDRESS_PREFIX}${network}`, addressToHex(address));
  } else {
    omni ? store.remove(CURRENT_ADDRESS_HEX_KEY) : store.remove(`${CURRENT_ADDRESS_PREFIX}${network}`);
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
    chain
  };
}

export function initFavoriteDapps() {
  const value = store.get(FAVORITE_DAPP_KEY) as (string | number)[];

  if (!value || value.length === 0) {
    store.set(FAVORITE_DAPP_KEY, [1, 2, 4, 5, 1002, 1004].reverse());
  }
}
