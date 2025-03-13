// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_PREFIX, CURRENT_NETWORK_KEY } from '@/constants';
import { encodeAddress, isAddress } from '@polkadot/util-crypto';

import { store } from '@mimir-wallet/service';

import { allEndpoints } from './config';

export function initMimir() {
  const search = new URLSearchParams(window.location.search);

  const urlNetwork = search.get('network');

  if (urlNetwork) {
    store.set(CURRENT_NETWORK_KEY, urlNetwork);
  }

  const localNetwork = store.get(CURRENT_NETWORK_KEY) as string;
  const network = urlNetwork || localNetwork;

  let chain = allEndpoints[0];

  if (network) {
    const _chain = allEndpoints.find((chain) => chain.key === network);

    if (_chain) {
      chain = _chain;
    }
  }

  window.currentChain = chain;

  store.set(CURRENT_NETWORK_KEY, chain.key);

  let address: string | undefined;
  const urlAddress = search.get('address');
  const localAddress = store.get(`${CURRENT_ADDRESS_PREFIX}${chain.key}`) as string;

  if (urlAddress && isAddress(urlAddress)) {
    address = encodeAddress(urlAddress, chain.ss58Format);
  } else if (localAddress && isAddress(localAddress)) {
    address = encodeAddress(localAddress, chain.ss58Format);
  }

  if (address) {
    store.set(`${CURRENT_ADDRESS_PREFIX}${chain.key}`, address);
  } else {
    store.remove(`${CURRENT_ADDRESS_PREFIX}${chain.key}`);
  }

  return {
    address,
    chain
  };
}
