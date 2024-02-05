// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import store from 'store';

export const API_URL_KEY = 'apiUrl';

type Endpoint = {
  name: string;
  wsUrl: string;
  icon: string;
  tokenIcon: string;
  genesisHash?: string;
  serviceUrl?: string;
  explorerUrl?: string;
};

export const localEndpoint: Endpoint = { icon: '/chain-icons/Mimir.svg', tokenIcon: '/token-icons/Mimir.svg', name: 'Development', wsUrl: 'ws://127.0.0.1:9944/' };
export const devEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Mimir.svg',
    tokenIcon: '/token-icons/Mimir.svg',
    name: 'Mimir',
    wsUrl: 'wss://dev-ws.mimir.global/',
    genesisHash: '0xc47e0ed91f4362642787756a15618b5cb558a3952187c6dfb3fb8e9db5128678',
    serviceUrl: 'https://dev-api.mimir.global/'
  }
];
export const testnetEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Rococo.png',
    tokenIcon: '/token-icons/Rococo.png',
    name: 'Rococo',
    wsUrl: 'wss://rococo-rpc.polkadot.io/',
    genesisHash: '0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e',
    serviceUrl: 'https://rococo-api.mimir.global/',
    explorerUrl: 'https://rococo.subscan.io/'
  }
];
export const polkadotEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Polkadot.png',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'Polkadot',
    wsUrl: 'wss://polkadot.api.onfinality.io/public-ws/',
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    serviceUrl: 'https://polkadot-api.mimir.global/',
    explorerUrl: 'https://polkadot.subscan.io/'
  }
];
export const kusamaEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Kusama.png',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'Kusama',
    wsUrl: 'wss://kusama.api.onfinality.io/public-ws/',
    genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    serviceUrl: 'https://kusama-api.mimir.global/',
    explorerUrl: 'https://kusama.subscan.io/'
  }
];

export const allEndpoints = devEndpoints.concat(testnetEndpoints).concat(polkadotEndpoints).concat(kusamaEndpoints);

function _defaultApiUrl() {
  let wsUrl = store.get(API_URL_KEY);

  if (wsUrl) {
    return wsUrl;
  }

  if (process.env.NODE_ENV === 'production') {
    if (window.location.hostname === 'dev.mimir.global') {
      wsUrl = devEndpoints[0].wsUrl;
    } else if (window.location.hostname === 'app.mimir.global') {
      wsUrl = testnetEndpoints[0].wsUrl;
    } else {
      wsUrl = localEndpoint.wsUrl;
    }
  } else {
    wsUrl = localEndpoint.wsUrl;
  }

  store.set(API_URL_KEY, wsUrl);

  return wsUrl;
}

export const apiUrl = _defaultApiUrl();

export function groupedEndpoints(): Record<string, Endpoint[]> {
  if (process.env.NODE_ENV === 'production') {
    if (window.location.hostname === 'dev.mimir.global') {
      return {
        mimir: devEndpoints,
        local: [localEndpoint]
      };
    } else if (window.location.hostname === 'app.mimir.global') {
      return {
        // polkadot: polkadotEndpoints,
        // kusama: kusamaEndpoints,
        rococo: testnetEndpoints
      };
    } else {
      return {};
    }
  } else {
    return {
      local: [localEndpoint]
    };
  }
}

export async function serviceUrl(api: ApiPromise, path: string): Promise<string> {
  let url: string;

  if (process.env.NODE_ENV === 'production') {
    await api.isReady;

    url = allEndpoints.find((item) => item.genesisHash === api.genesisHash.toHex())?.serviceUrl || 'http://127.0.0.1:8080/';
  } else {
    url = 'http://127.0.0.1:8080/';
  }

  return `${url}${path}`;
}

export function findEndpoint(genesisHash: string): Endpoint {
  return (
    testnetEndpoints.find((item) => item.genesisHash === genesisHash) ||
    polkadotEndpoints.find((item) => item.genesisHash === genesisHash) ||
    kusamaEndpoints.find((item) => item.genesisHash === genesisHash) ||
    devEndpoints.find((item) => item.genesisHash === genesisHash) ||
    localEndpoint
  );
}
