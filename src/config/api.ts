// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import store from 'store';

export const API_URL_KEY = 'apiUrl';

type Endpoint = {
  name: string;
  wsUrl: string;
  icon: string;
  tokenIcon: string;
  genesisHash?: string;
  socketUrl: string;
  serviceUrl: string;
  explorerUrl?: string;
  proposalApi?: string;
  subsquareUrl?: string;
};

export const localEndpoint: Endpoint = {
  icon: '/chain-icons/Mimir.svg',
  tokenIcon: '/token-icons/Mimir.svg',
  name: 'Development',
  wsUrl: 'ws://127.0.0.1:9944/',
  serviceUrl: 'http://127.0.0.1:8080/',
  socketUrl: 'ws://127.0.0.1:8080/'
};
export const devEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Mimir.svg',
    tokenIcon: '/token-icons/Mimir.svg',
    name: 'Mimir',
    wsUrl: 'wss://dev-ws.mimir.global/',
    genesisHash: '0xc47e0ed91f4362642787756a15618b5cb558a3952187c6dfb3fb8e9db5128678',
    serviceUrl: 'https://dev-api.mimir.global/',
    socketUrl: 'wss://dev-api.mimir.global/',
    proposalApi: 'https://rococo.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://rococo.subsquare.io/'
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
    socketUrl: 'wss://rococo-api.mimir.global/',
    explorerUrl: 'https://rococo.subscan.io/',
    proposalApi: 'https://rococo.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://rococo.subsquare.io/'
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
    socketUrl: 'wss://polkadot-api.mimir.global/',
    explorerUrl: 'https://polkadot.subscan.io/',
    proposalApi: 'https://polkadot.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://polkadot.subsquare.io/'
  },
  {
    icon: '/chain-icons/assethub.svg',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'AssetHub',
    wsUrl: 'wss://polkadot-asset-hub-rpc.polkadot.io/',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    serviceUrl: 'https://assethub-polkadot-api.mimir.global/',
    socketUrl: 'wss://assethub-polkadot-api.mimir.global/',
    explorerUrl: 'https://assethub-polkadot.subscan.io/'
  },
  {
    icon: '/chain-icons/bifrost-polkadot.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost',
    wsUrl: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
    genesisHash: '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
    serviceUrl: 'https://bifrost-polkadot-api.mimir.global/',
    socketUrl: 'wss://bifrost-polkadot-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/',
    proposalApi: 'https://bifrost.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://bifrost.subsquare.io/'
  },
  {
    icon: '/chain-icons/crust-polkadot.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    wsUrl: 'wss://crust-parachain.crustapps.net/',
    genesisHash: '0x4319cc49ee79495b57a1fec4d2bd43f59052dcc690276de566c2691d6df4f7b8',
    serviceUrl: 'https://crust-polkadot-api.mimir.global/',
    socketUrl: 'wss://crust-polkadot-api.mimir.global/',
    explorerUrl: 'https://crust-parachain.subscan.io/'
  },
  {
    icon: '/chain-icons/pendulum.svg',
    tokenIcon: '/token-icons/pen.png',
    name: 'Pendulum',
    wsUrl: 'wss://rpc-pendulum.prd.pendulumchain.tech/',
    genesisHash: '0x5d3c298622d5634ed019bf61ea4b71655030015bde9beb0d6a24743714462c86',
    serviceUrl: 'https://pendulum-api.mimir.global/',
    socketUrl: 'wss://pendulum-api.mimir.global/',
    explorerUrl: 'https://pendulum.subscan.io/'
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
    socketUrl: 'wss://kusama-api.mimir.global/',
    explorerUrl: 'https://kusama.subscan.io/',
    proposalApi: 'https://kusama.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://kusama.subsquare.io/'
  },
  {
    icon: '/chain-icons/bifrost-kusama.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost Kusama',
    wsUrl: 'wss://bifrost-rpc.liebi.com/ws',
    genesisHash: '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed',
    serviceUrl: 'https://bifrost-kusama-api.mimir.global/',
    socketUrl: 'wss://bifrost-kusama-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/',
    proposalApi: 'https://bifrost.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://bifrost.subsquare.io/'
  },
  {
    icon: '/chain-icons/amplitude.svg',
    tokenIcon: '/token-icons/ampe.svg',
    name: 'Amplitude',
    wsUrl: 'wss://rpc-amplitude.pendulumchain.tech',
    genesisHash: '0xcceae7f3b9947cdb67369c026ef78efa5f34a08fe5808d373c04421ecf4f1aaf',
    serviceUrl: 'https://amplitude-api.mimir.global/',
    socketUrl: 'wss://amplitude-api.mimir.global/'
  }
];
export const paseoEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/Paseo.png',
    tokenIcon: '/token-icons/Paseo.png',
    name: 'Paseo',
    wsUrl: 'wss://paseo.rpc.amforc.com/',
    genesisHash: '0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f',
    serviceUrl: 'https://paseo-api.mimir.global/',
    socketUrl: 'wss://paseo-api.mimir.global/'
  }
];
export const solochainEndpoints: Endpoint[] = [
  {
    icon: '/chain-icons/vara.png',
    tokenIcon: '/token-icons/vara.png',
    name: 'Vara',
    wsUrl: 'wss://rpc.vara.network',
    genesisHash: '0xfe1b4c55fd4d668101126434206571a7838a8b6b93a6d1b95d607e78e6c53763',
    serviceUrl: 'https://vara-api.mimir.global/',
    socketUrl: 'wss://vara-api.mimir.global/',
    explorerUrl: 'https://vara.subscan.io/',
    proposalApi: 'https://vara.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://vara.subsquare.io/'
  },
  {
    icon: '/chain-icons/crust.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    wsUrl: 'wss://rpc.crust.network/',
    genesisHash: '0x8b404e7ed8789d813982b9cb4c8b664c05b3fbf433309f603af014ec9ce56a8c',
    serviceUrl: 'https://crust-api.mimir.global/',
    socketUrl: 'wss://crust-api.mimir.global/',
    explorerUrl: 'https://crust.subscan.io/',
    proposalApi: 'https://crust.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://crust.subsquare.io/'
  }
];

export const allEndpoints = devEndpoints.concat(testnetEndpoints).concat(polkadotEndpoints).concat(kusamaEndpoints).concat(paseoEndpoints).concat(solochainEndpoints);

function _defaultApiUrl() {
  const url = new URL(window.location.href);

  const rpc = url.searchParams.get('rpc');

  if (rpc) {
    try {
      const url = new URL(decodeURIComponent(rpc));

      url.protocol === 'wss:' && store.set(API_URL_KEY, decodeURIComponent(rpc));
    } catch {}
  }

  let wsUrl = store.get(API_URL_KEY);

  if (wsUrl) {
    return wsUrl;
  }

  if (process.env.NODE_ENV === 'production') {
    if (window.location.hostname === 'dev.mimir.global') {
      wsUrl = devEndpoints[0].wsUrl;
    } else if (window.location.hostname === 'app.mimir.global' || window.location.hostname === 'staging-app.mimir.global') {
      wsUrl = polkadotEndpoints[0].wsUrl;
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
        polkadot: polkadotEndpoints,
        kusama: kusamaEndpoints,
        solochain: solochainEndpoints,
        rococo: testnetEndpoints,
        paseo: paseoEndpoints,
        mimir: devEndpoints,
        local: [localEndpoint]
      };
    } else if (window.location.hostname === 'app.mimir.global' || window.location.hostname === 'staging-app.mimir.global') {
      return {
        polkadot: polkadotEndpoints,
        kusama: kusamaEndpoints,
        solochain: solochainEndpoints,
        rococo: testnetEndpoints,
        paseo: paseoEndpoints
      };
    } else {
      return {};
    }
  } else {
    return {
      polkadot: polkadotEndpoints,
      kusama: kusamaEndpoints,
      soloChain: solochainEndpoints,
      rococo: testnetEndpoints,
      paseo: paseoEndpoints,
      mimir: devEndpoints,
      local: [localEndpoint]
    };
  }
}

export function findEndpoint(genesisHash: string): Endpoint {
  return allEndpoints.find((item) => item.genesisHash === genesisHash) || localEndpoint;
}
