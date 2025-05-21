// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_HEX_KEY, CURRENT_ADDRESS_PREFIX } from '@/constants';
import { encodeAddress } from '@polkadot/util-crypto';

import { addressToHex, allEndpoints, CURRENT_NETWORK_KEY, isPolkadotAddress } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

export function initMimir(omni: boolean) {
  const search = new URLSearchParams(window.location.search);

  const urlNetwork = search.get('network');
  const localNetwork = store.get(CURRENT_NETWORK_KEY) as string;

  let network = urlNetwork || localNetwork;

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

  return {
    address,
    chain
  };
}
