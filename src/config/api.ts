// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isAddress } from '@polkadot/util-crypto';

import { encodeAddress } from '@mimir-wallet/api';
import { CURRENT_ADDRESS_PREFIX, CURRENT_NETWORK_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

export const API_URL_KEY = 'apiUrl';

export type Endpoint = {
  key: string;
  name: string;
  wsUrl: string;
  icon: string;
  tokenIcon: string;
  ss58Format: number;
  genesisHash: string;
  socketUrl: string;
  serviceUrl: string;
  explorerUrl?: string;
  proposalApi?: string;
  subsquareUrl?: string;
  identityNetwork?: string;
};

export const polkadotEndpoints: Endpoint[] = [
  {
    key: 'polkadot',
    icon: '/chain-icons/Polkadot.png',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'Polkadot',
    wsUrl: 'wss://polkadot.api.onfinality.io/public-ws',
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    ss58Format: 0,
    serviceUrl: 'https://polkadot-api.mimir.global/',
    socketUrl: 'wss://polkadot-api.mimir.global/',
    explorerUrl: 'https://polkadot.subscan.io/',
    proposalApi: 'https://polkadot.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://polkadot.subsquare.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'assethub-polkadot',
    icon: '/chain-icons/assethub.svg',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'AssetHub',
    wsUrl: 'wss://polkadot-asset-hub-rpc.polkadot.io',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    ss58Format: 0,
    serviceUrl: 'https://assethub-polkadot-api.mimir.global/',
    socketUrl: 'wss://assethub-polkadot-api.mimir.global/',
    explorerUrl: 'https://assethub-polkadot.subscan.io/',
    identityNetwork: 'people-polkadot'
  },
  // {
  //   icon: '/chain-icons/bridgehub.svg',
  //   tokenIcon: '/token-icons/Polkadot.png',
  //   name: 'BridgeHub',
  //   wsUrl: 'wss://polkadot-bridge-hub-rpc.polkadot.io/',
  //   genesisHash: '0xdcf691b5a3fbe24adc99ddc959c0561b973e329b1aef4c4b22e7bb2ddecb4464',
  //   serviceUrl: 'https://bridgehub-polkadot-api.mimir.global/',
  //   socketUrl: 'wss://bridgehub-polkadot-api.mimir.global/',
  //   explorerUrl: 'https://bridgehub-polkadot.subscan.io/'
  // },
  {
    key: 'coretime-polkadot',
    icon: '/chain-icons/coretime-polkadot.webp',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'Coretime',
    wsUrl: 'wss://polkadot-coretime-rpc.polkadot.io',
    genesisHash: '0xefb56e30d9b4a24099f88820987d0f45fb645992416535d87650d98e00f46fc4',
    ss58Format: 0,
    serviceUrl: 'https://coretime-polkadot-api.mimir.global/',
    socketUrl: 'wss://coretime-polkadot-api.mimir.global/',
    explorerUrl: 'https://coretime-polkadot.subscan.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'collectives-polkadot',
    icon: '/chain-icons/collectives.svg',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'Collectives',
    wsUrl: 'wss://polkadot-collectives-rpc.polkadot.io',
    genesisHash: '0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2',
    ss58Format: 0,
    serviceUrl: 'https://collectives-polkadot-api.mimir.global/',
    socketUrl: 'wss://collectives-polkadot-api.mimir.global/',
    explorerUrl: 'https://collectives-polkadot.subscan.io/',
    proposalApi: 'https://collectives.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://collectives.subsquare.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'people-polkadot',
    icon: '/chain-icons/people.svg',
    tokenIcon: '/token-icons/Polkadot.png',
    name: 'People',
    wsUrl: 'wss://polkadot-people-rpc.polkadot.io',
    genesisHash: '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
    ss58Format: 0,
    serviceUrl: 'https://people-polkadot-api.mimir.global/',
    socketUrl: 'wss://people-polkadot-api.mimir.global/',
    explorerUrl: 'https://people-polkadot.subscan.io/'
  },
  {
    key: 'bifrost-polkadot',
    icon: '/chain-icons/bifrost-polkadot.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost',
    wsUrl: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
    genesisHash: '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
    ss58Format: 0,
    serviceUrl: 'https://bifrost-polkadot-api.mimir.global/',
    socketUrl: 'wss://bifrost-polkadot-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/',
    proposalApi: 'https://bifrost.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://bifrost.subsquare.io/'
  },
  {
    key: 'crust-polkadot',
    icon: '/chain-icons/crust-polkadot.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    wsUrl: 'wss://crust-parachain.crustapps.net',
    genesisHash: '0x4319cc49ee79495b57a1fec4d2bd43f59052dcc690276de566c2691d6df4f7b8',
    ss58Format: 88,
    serviceUrl: 'https://crust-polkadot-api.mimir.global/',
    socketUrl: 'wss://crust-polkadot-api.mimir.global/',
    explorerUrl: 'https://crust-parachain.subscan.io/'
  },
  {
    key: 'pendulum',
    icon: '/chain-icons/pendulum.svg',
    tokenIcon: '/token-icons/pen.png',
    name: 'Pendulum',
    wsUrl: 'wss://rpc-pendulum.prd.pendulumchain.tech',
    genesisHash: '0x5d3c298622d5634ed019bf61ea4b71655030015bde9beb0d6a24743714462c86',
    ss58Format: 56,
    serviceUrl: 'https://pendulum-api.mimir.global/',
    socketUrl: 'wss://pendulum-api.mimir.global/',
    explorerUrl: 'https://pendulum.subscan.io/'
  },
  {
    key: 'acala',
    icon: '/chain-icons/Acala.svg',
    tokenIcon: '/token-icons/ACA.svg',
    name: 'Acala',
    wsUrl: 'wss://acala-rpc-0.aca-api.network',
    genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
    ss58Format: 10,
    serviceUrl: 'https://acala-api.mimir.global/',
    socketUrl: 'wss://acala-api.mimir.global/',
    explorerUrl: 'https://acala.subscan.io/',
    proposalApi: 'https://acala.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://acala.subsquare.io/'
  },
  {
    key: 'phala',
    icon: '/chain-icons/phala.svg',
    tokenIcon: '/token-icons/PHA.svg',
    name: 'Phala',
    wsUrl: 'wss://phala-rpc.dwellir.com',
    genesisHash: '0x1bb969d85965e4bb5a651abbedf21a54b6b31a21f66b5401cc3f1e286268d736',
    ss58Format: 30,
    serviceUrl: 'https://phala-api.mimir.global/',
    socketUrl: 'wss://phala-api.mimir.global/',
    explorerUrl: 'https://phala.subscan.io/',
    proposalApi: 'https://phala.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://phala.subsquare.io/'
  },
  {
    key: 'hydration',
    icon: '/chain-icons/hydration.svg',
    tokenIcon: '/token-icons/HDX.svg',
    name: 'Hydration',
    wsUrl: 'wss://rpc.hydradx.cloud',
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    ss58Format: 63,
    serviceUrl: 'https://hydration-api.mimir.global/',
    socketUrl: 'wss://hydration-api.mimir.global/',
    explorerUrl: 'https://hydration.subscan.io/',
    proposalApi: 'https://hydration.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://hydration.subsquare.io/'
  }
];
export const kusamaEndpoints: Endpoint[] = [
  {
    key: 'kusama',
    icon: '/chain-icons/Kusama.png',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'Kusama',
    wsUrl: 'wss://kusama.api.onfinality.io/public-ws',
    genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    ss58Format: 2,
    serviceUrl: 'https://kusama-api.mimir.global/',
    socketUrl: 'wss://kusama-api.mimir.global/',
    explorerUrl: 'https://kusama.subscan.io/',
    proposalApi: 'https://kusama.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://kusama.subsquare.io/',
    identityNetwork: 'people-kusama'
  },
  {
    key: 'assethub-kusama',
    icon: '/chain-icons/assethub-kusama.svg',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'AssetHub Kusama',
    wsUrl: 'wss://kusama-asset-hub-rpc.polkadot.io',
    genesisHash: '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
    ss58Format: 2,
    serviceUrl: 'https://assethub-kusama-api.mimir.global/',
    socketUrl: 'wss://assethub-kusama-api.mimir.global/',
    explorerUrl: 'https://assethub-kusama.subscan.io/',
    identityNetwork: 'people-kusama'
  },
  // {
  //   icon: '/chain-icons/bridgehub-kusama.svg',
  //   tokenIcon: '/token-icons/Kusama.png',
  //   name: 'BridgeHub Kusama',
  //   wsUrl: 'wss://kusama-bridge-hub-rpc.polkadot.io',
  //   genesisHash: '0x00dcb981df86429de8bbacf9803401f09485366c44efbf53af9ecfab03adc7e5',
  //   serviceUrl: 'https://bridgehub-kusama-api.mimir.global/',
  //   socketUrl: 'wss://bridgehub-kusama-api.mimir.global/',
  //   explorerUrl: 'https://bridgehub-kusama.subscan.io/'
  // },
  {
    key: 'coretime-kusama',
    icon: '/chain-icons/coretime-kusama.webp',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'Coretime Kusama',
    wsUrl: 'wss://kusama-coretime-rpc.polkadot.io',
    genesisHash: '0x638cd2b9af4b3bb54b8c1f0d22711fc89924ca93300f0caf25a580432b29d050',
    ss58Format: 2,
    serviceUrl: 'https://coretime-kusama-api.mimir.global/',
    socketUrl: 'wss://coretime-kusama-api.mimir.global/',
    explorerUrl: 'https://coretime-kusama.subscan.io/',
    identityNetwork: 'people-kusama'
  },
  {
    key: 'people-kusama',
    icon: '/chain-icons/people-kusama.svg',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'People Kusama',
    wsUrl: 'wss://kusama-people-rpc.polkadot.io',
    genesisHash: '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f',
    ss58Format: 2,
    serviceUrl: 'https://people-kusama-api.mimir.global/',
    socketUrl: 'wss://people-kusama-api.mimir.global/',
    explorerUrl: 'https://people-kusama.subscan.io/'
  },
  {
    key: 'bifrost-kusama',
    icon: '/chain-icons/bifrost-kusama.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost Kusama',
    wsUrl: 'wss://bifrost-rpc.liebi.com/ws',
    genesisHash: '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed',
    ss58Format: 2,
    serviceUrl: 'https://bifrost-kusama-api.mimir.global/',
    socketUrl: 'wss://bifrost-kusama-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/',
    proposalApi: 'https://bifrost.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://bifrost.subsquare.io/'
  },
  {
    key: 'amplitude',
    icon: '/chain-icons/amplitude.svg',
    tokenIcon: '/token-icons/ampe.svg',
    name: 'Amplitude',
    wsUrl: 'wss://rpc-amplitude.pendulumchain.tech',
    genesisHash: '0xcceae7f3b9947cdb67369c026ef78efa5f34a08fe5808d373c04421ecf4f1aaf',
    ss58Format: 57,
    serviceUrl: 'https://amplitude-api.mimir.global/',
    socketUrl: 'wss://amplitude-api.mimir.global/'
  },
  {
    key: 'karura',
    icon: '/chain-icons/Karura.svg',
    tokenIcon: '/token-icons/KAR.png',
    name: 'Karura',
    wsUrl: 'wss://karura-rpc-0.aca-api.network',
    genesisHash: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
    ss58Format: 8,
    serviceUrl: 'https://karura-api.mimir.global/',
    socketUrl: 'wss://karura-api.mimir.global/',
    explorerUrl: 'https://karura.subscan.io/',
    proposalApi: 'https://karura.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://karura.subsquare.io/'
  },
  {
    key: 'khala',
    icon: '/chain-icons/khala.svg',
    tokenIcon: '/token-icons/PHA.svg',
    name: 'Khala',
    wsUrl: 'wss://khala-rpc.dwellir.com',
    genesisHash: '0xd43540ba6d3eb4897c28a77d48cb5b729fea37603cbbfc7a86a73b72adb3be8d',
    ss58Format: 30,
    serviceUrl: 'https://khala-api.mimir.global/',
    socketUrl: 'wss://khala-api.mimir.global/',
    explorerUrl: 'https://khala.subscan.io/',
    proposalApi: 'https://khala.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://khala.subsquare.io/'
  }
];
export const paseoEndpoints: Endpoint[] = [
  {
    key: 'paseo',
    icon: '/chain-icons/Paseo.png',
    tokenIcon: '/token-icons/Paseo.png',
    name: 'Paseo',
    ss58Format: 0,
    wsUrl: 'wss://rpc.ibp.network/paseo',
    genesisHash: '0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f',
    serviceUrl:
      process.env.NODE_ENV === 'production' ? 'https://paseo-api.mimir.global/' : 'https://dev-api.mimir.global/',
    socketUrl: process.env.NODE_ENV === 'production' ? 'wss://paseo-api.mimir.global/' : 'wss://dev-api.mimir.global/',
    explorerUrl: 'https://paseo.subscan.io/'
  }
];
export const solochainEndpoints: Endpoint[] = [
  {
    key: 'vara',
    icon: '/chain-icons/vara.png',
    tokenIcon: '/token-icons/vara.png',
    name: 'Vara',
    wsUrl: 'wss://rpc.vara.network',
    genesisHash: '0xfe1b4c55fd4d668101126434206571a7838a8b6b93a6d1b95d607e78e6c53763',
    ss58Format: 137,
    serviceUrl: 'https://vara-api.mimir.global/',
    socketUrl: 'wss://vara-api.mimir.global/',
    explorerUrl: 'https://vara.subscan.io/',
    proposalApi: 'https://vara.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://vara.subsquare.io/'
  },
  {
    key: 'crust',
    icon: '/chain-icons/crust.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    wsUrl: 'wss://rpc.crust.network',
    genesisHash: '0x8b404e7ed8789d813982b9cb4c8b664c05b3fbf433309f603af014ec9ce56a8c',
    ss58Format: 66,
    serviceUrl: 'https://crust-api.mimir.global/',
    socketUrl: 'wss://crust-api.mimir.global/',
    explorerUrl: 'https://crust.subscan.io/',
    proposalApi: 'https://crust.subsquare.io/api/gov2/referendums?simple=true',
    subsquareUrl: 'https://crust.subsquare.io/'
  },
  {
    key: 'avail',
    icon: '/chain-icons/avail.png',
    tokenIcon: '/token-icons/avail.png',
    name: 'Avail',
    wsUrl: 'wss://mainnet-rpc.avail.so/ws',
    genesisHash: '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a',
    ss58Format: 42,
    serviceUrl: 'https://avail-api.mimir.global/',
    socketUrl: 'wss://avail-api.mimir.global/',
    explorerUrl: 'https://avail.subscan.io/'
  },
  {
    key: 'avail-turing',
    icon: '/chain-icons/avail.png',
    tokenIcon: '/token-icons/avail.png',
    name: 'Avail Turing',
    wsUrl: 'wss://turing-rpc.avail.so/ws',
    genesisHash: '0xd3d2f3a3495dc597434a99d7d449ebad6616db45e4e4f178f31cc6fa14378b70',
    ss58Format: 42,
    serviceUrl: 'https://avail-turing-api.mimir.global/',
    socketUrl: 'wss://avail-turing-api.mimir.global/',
    explorerUrl: 'https://avail-turing.subscan.io/'
  }
];

export const allEndpoints = polkadotEndpoints.concat(kusamaEndpoints).concat(paseoEndpoints).concat(solochainEndpoints);

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
    address = encodeAddress(urlAddress);
  } else if (localAddress && isAddress(localAddress)) {
    address = encodeAddress(localAddress);
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

export function groupedEndpoints(): Record<string, Endpoint[]> {
  return {
    polkadot: polkadotEndpoints,
    kusama: kusamaEndpoints,
    soloChain: solochainEndpoints,
    paseo: paseoEndpoints
  };
}

export function findEndpoint(genesisHash: string): Endpoint | undefined {
  return allEndpoints.find((item) => item.genesisHash === genesisHash);
}
