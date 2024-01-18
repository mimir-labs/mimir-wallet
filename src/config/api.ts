// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import store from 'store';

export const API_URL_KEY = 'apiUrl';

type Endpoint = {
  name: string;
  wsUrl: string;
  icon: string;
  genesisHash?: string;
};

const localEndpoint: Endpoint = { icon: '/chain-icons/Mimir.png', name: 'Development', wsUrl: 'ws://127.0.0.1:9944/' };
const devEndpoints: Endpoint[] = [
  { icon: '/chain-icons/Mimir.png', name: 'Mimir', wsUrl: 'wss://dev-ws.mimir.global/', genesisHash: '0xc47e0ed91f4362642787756a15618b5cb558a3952187c6dfb3fb8e9db5128678' }
];
const testnetEndpoints: Endpoint[] = [
  { icon: '/chain-icons/Rococo.png', name: 'Rococo', wsUrl: 'wss://rococo-rpc.polkadot.io/', genesisHash: '0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e' }
];
const polkadotEndpoints: Endpoint[] = [
  { icon: '/chain-icons/Polkadot.png', name: 'Polkadot', wsUrl: 'wss://polkadot.api.onfinality.io/public-ws/', genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3' }
];
const kusamaEndpoints: Endpoint[] = [
  { icon: '/chain-icons/Kusama.png', name: 'Kusama', wsUrl: 'wss://kusama.api.onfinality.io/public-ws/', genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' }
];

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

const serviceUrls: Record<string, string> = {
  '0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e': 'https://rococo-api.mimir.global/', // rococo
  '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3': 'https://polkadot-api.mimir.global/', // polkadot
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe': 'https://kusama-api.mimir.global/', // kusama
  '0xc47e0ed91f4362642787756a15618b5cb558a3952187c6dfb3fb8e9db5128678': 'https://dev-api.mimir.global/' // mimir dev
};

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

    url = serviceUrls[api.genesisHash.toHex()] || 'http://127.0.0.1:8080/';
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
