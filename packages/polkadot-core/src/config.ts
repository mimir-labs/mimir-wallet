// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from './types.js';

const isDevEnv =
  import.meta.env.DEV ||
  window.location.hostname.startsWith('dev.mimir.global') ||
  window.location.hostname.startsWith('localhost');

export const polkadotEndpoints: Endpoint[] = [
  {
    key: 'polkadot',
    icon: '/chain-icons/Polkadot.webp',
    tokenIcon: '/token-icons/DOT.webp',
    name: 'Polkadot',
    isRelayChain: true,
    wsUrl: {
      Allnodes: 'wss://polkadot-rpc.publicnode.com',
      Blockops: 'wss://polkadot-public-rpc.blockops.network/ws',
      Dwellir: 'wss://polkadot-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://polkadot-rpc-tn.dwellir.com',
      IBP1: 'wss://rpc.ibp.network/polkadot',
      IBP2: 'wss://polkadot.dotters.network',
      LuckyFriday: 'wss://rpc-polkadot.luckyfriday.io',
      OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
      RadiumBlock: 'wss://polkadot.public.curie.radiumblock.co/ws',
      RockX: 'wss://rockx-dot.w3node.com/polka-public-dot/ws',
      Stakeworld: 'wss://dot-rpc.stakeworld.io',
      SubQuery: 'wss://polkadot.rpc.subquery.network/public/ws'
    },
    httpUrl: 'https://polkadot-rpc.publicnode.com',
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    ss58Format: 0,
    socketUrl: 'wss://polkadot-api.mimir.global/',
    explorerUrl: 'https://polkadot.subscan.io/',
    statescanUrl: 'https://polkadot.statescan.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'assethub-polkadot',
    icon: '/chain-icons/assethub.svg',
    tokenIcon: '/token-icons/DOT.webp',
    name: 'AssetHub',
    relayChain: 'polkadot',
    wsUrl: {
      Dwellir: 'wss://asset-hub-polkadot-rpc.dwellir.com',
      OnFinality: 'wss://statemint.api.onfinality.io/public-ws',
      'Dwellir Tunisia': 'wss://statemint-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/asset-hub-polkadot',
      IBP2: 'wss://asset-hub-polkadot.dotters.network',
      LuckyFriday: 'wss://rpc-asset-hub-polkadot.luckyfriday.io',
      Parity: 'wss://polkadot-asset-hub-rpc.polkadot.io',
      RadiumBlock: 'wss://statemint.public.curie.radiumblock.co/ws',
      Stakeworld: 'wss://dot-rpc.stakeworld.io/assethub'
    },
    httpUrl: 'https://asset-hub-polkadot-rpc.dwellir.com',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    ss58Format: 0,
    socketUrl: 'wss://assethub-polkadot-api.mimir.global/',
    explorerUrl: 'https://assethub-polkadot.subscan.io/',
    statescanUrl: 'https://assethub-polkadot.statescan.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'people-polkadot',
    icon: '/chain-icons/people.svg',
    tokenIcon: '/token-icons/DOT.webp',
    name: 'People',
    relayChain: 'polkadot',
    wsUrl: {
      IBP1: 'wss://sys.ibp.network/people-polkadot',
      IBP2: 'wss://people-polkadot.dotters.network',
      LuckyFriday: 'wss://rpc-people-polkadot.luckyfriday.io',
      Parity: 'wss://polkadot-people-rpc.polkadot.io',
      RadiumBlock: 'wss://people-polkadot.public.curie.radiumblock.co/ws'
    },
    httpUrl: 'https://sys.ibp.network/people-polkadot',
    genesisHash: '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
    ss58Format: 0,
    socketUrl: 'wss://people-polkadot-api.mimir.global/',
    explorerUrl: 'https://people-polkadot.subscan.io/',
    statescanUrl: 'https://people-polkadot.statescan.io/'
  },
  // {
  //   icon: '/chain-icons/bridgehub.svg',
  //   tokenIcon: '/token-icons/DOT.webp',
  //   name: 'BridgeHub',
  //   wsUrl: 'wss://polkadot-bridge-hub-rpc.polkadot.io/',
  //   genesisHash: '0xdcf691b5a3fbe24adc99ddc959c0561b973e329b1aef4c4b22e7bb2ddecb4464',
  //   socketUrl: 'wss://bridgehub-polkadot-api.mimir.global/',
  //   explorerUrl: 'https://bridgehub-polkadot.subscan.io/'
  // },
  {
    key: 'coretime-polkadot',
    icon: '/chain-icons/coretime-polkadot.webp',
    tokenIcon: '/token-icons/DOT.webp',
    name: 'Coretime',
    relayChain: 'polkadot',
    wsUrl: {
      Parity: 'wss://polkadot-coretime-rpc.polkadot.io',
      IBP1: 'wss://sys.ibp.network/coretime-polkadot',
      IBP2: 'wss://coretime-polkadot.dotters.network'
    },
    httpUrl: 'https://polkadot-coretime-rpc.polkadot.io',
    genesisHash: '0xefb56e30d9b4a24099f88820987d0f45fb645992416535d87650d98e00f46fc4',
    ss58Format: 0,
    socketUrl: 'wss://coretime-polkadot-api.mimir.global/',
    explorerUrl: 'https://coretime-polkadot.subscan.io/',
    statescanUrl: 'https://coretime-polkadot.statescan.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'collectives-polkadot',
    icon: '/chain-icons/collectives.svg',
    tokenIcon: '/token-icons/DOT.webp',
    name: 'Collectives',
    relayChain: 'polkadot',
    wsUrl: {
      Parity: 'wss://polkadot-collectives-rpc.polkadot.io',
      OnFinality: 'wss://collectives.api.onfinality.io/public-ws',
      Dwellir: 'wss://collectives-polkadot-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://polkadot-collectives-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/collectives-polkadot',
      IBP2: 'wss://collectives-polkadot.dotters.network',
      LuckyFriday: 'wss://rpc-collectives-polkadot.luckyfriday.io',
      RadiumBlock: 'wss://collectives.public.curie.radiumblock.co/ws',
      Stakeworld: 'wss://dot-rpc.stakeworld.io/collectives'
    },
    httpUrl: 'https://polkadot-collectives-rpc.polkadot.io',
    genesisHash: '0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2',
    ss58Format: 0,
    socketUrl: 'wss://collectives-polkadot-api.mimir.global/',
    explorerUrl: 'https://collectives-polkadot.subscan.io/',
    statescanUrl: 'https://collectives.statescan.io/',
    identityNetwork: 'people-polkadot'
  },
  {
    key: 'bifrost-polkadot',
    icon: '/chain-icons/bifrost-polkadot.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost',
    relayChain: 'polkadot',
    wsUrl: {
      Liebi: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
      Dwellir: 'wss://bifrost-polkadot-rpc.dwellir.com',
      IBP1: 'wss://bifrost-polkadot.ibp.network',
      IBP2: 'wss://bifrost-polkadot.dotters.network',
      LiebiEU: 'wss://eu.bifrost-polkadot-rpc.liebi.com/ws'
    },
    httpUrl: 'https://hk.p.bifrost-rpc.liebi.com',
    genesisHash: '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
    ss58Format: 0,
    socketUrl: 'wss://bifrost-polkadot-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/'
  },
  {
    key: 'hydration',
    icon: '/chain-icons/hydration.svg',
    tokenIcon: '/token-icons/HDX.svg',
    name: 'Hydration',
    relayChain: 'polkadot',
    wsUrl: {
      IBP1: 'wss://hydration.ibp.network',
      Dwellir: 'wss://hydration-rpc.n.dwellir.com',
      'Galactic Council': 'wss://rpc.hydradx.cloud',
      Helikon: 'wss://rpc.helikon.io/hydradx',
      IBP2: 'wss://hydration.dotters.network'
    },
    httpUrl: 'https://hydration.ibp.network',
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    ss58Format: 63,
    socketUrl: 'wss://hydration-api.mimir.global/',
    explorerUrl: 'https://hydration.subscan.io/'
  },
  {
    key: 'crust-polkadot',
    icon: '/chain-icons/crust-polkadot.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    relayChain: 'polkadot',
    wsUrl: {
      Crust: 'wss://crust-parachain.crustapps.net',
      'Crust APP': 'wss://crust-parachain.crustnetwork.app',
      'Crust CC': 'wss://crust-parachain.crustnetwork.cc',
      'Crust XYZ': 'wss://crust-parachain.crustnetwork.xyz'
    },
    httpUrl: 'https://crust-parachain.crustapps.net',
    genesisHash: '0x4319cc49ee79495b57a1fec4d2bd43f59052dcc690276de566c2691d6df4f7b8',
    ss58Format: 88,
    socketUrl: 'wss://crust-polkadot-api.mimir.global/',
    explorerUrl: 'https://crust-parachain.subscan.io/'
  },
  {
    key: 'pendulum',
    icon: '/chain-icons/pendulum.svg',
    tokenIcon: '/token-icons/pen.png',
    name: 'Pendulum',
    relayChain: 'polkadot',
    wsUrl: {
      PendulumChain: 'wss://rpc-pendulum.prd.pendulumchain.tech'
    },
    httpUrl: 'https://rpc-pendulum.prd.pendulumchain.tech',
    genesisHash: '0x5d3c298622d5634ed019bf61ea4b71655030015bde9beb0d6a24743714462c86',
    ss58Format: 56,
    socketUrl: 'wss://pendulum-api.mimir.global/',
    explorerUrl: 'https://pendulum.subscan.io/'
  },
  {
    key: 'acala',
    icon: '/chain-icons/Acala.svg',
    tokenIcon: '/token-icons/ACA.svg',
    name: 'Acala',
    relayChain: 'polkadot',
    wsUrl: {
      'Acala Foundation 3': 'wss://acala-rpc-3.aca-api.network/ws',
      'Acala Foundation 0': 'wss://acala-rpc-0.aca-api.network',
      'Acala Foundation 1': 'wss://acala-rpc-1.aca-api.network',
      Dwellir: 'wss://acala-rpc.dwellir.com',
      IBP1: 'wss://acala.ibp.network',
      IBP2: 'wss://acala.dotters.network',
      OnFinality: 'wss://acala-polkadot.api.onfinality.io/public-ws'
    },
    httpUrl: 'https://acala-rpc-0.aca-api.network',
    genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
    ss58Format: 10,
    socketUrl: 'wss://acala-api.mimir.global/',
    explorerUrl: 'https://acala.subscan.io/'
  },
  {
    key: 'phala',
    icon: '/chain-icons/phala.svg',
    tokenIcon: '/token-icons/PHA.svg',
    name: 'Phala',
    relayChain: 'polkadot',
    wsUrl: {
      Phala: 'wss://api.phala.network/ws',
      OnFinality: 'wss://phala.api.onfinality.io/public-ws',
      Dwellir: 'wss://phala-rpc.dwellir.com',
      Helikon: 'wss://rpc.helikon.io/phala',
      RadiumBlock: 'wss://phala.public.curie.radiumblock.co/ws'
    },
    httpUrl: 'https://api.phala.network/ws',
    genesisHash: '0x1bb969d85965e4bb5a651abbedf21a54b6b31a21f66b5401cc3f1e286268d736',
    ss58Format: 30,
    socketUrl: 'wss://phala-api.mimir.global/',
    explorerUrl: 'https://phala.subscan.io/'
  },
  {
    key: 'nexus',
    icon: '/chain-icons/nexus.webp',
    tokenIcon: '/token-icons/BRIDGE.webp',
    name: 'Hyperbridge (Nexus)',
    relayChain: 'polkadot',
    wsUrl: {
      IBP1: 'wss://nexus.ibp.network',
      BlockOps: 'wss://hyperbridge-nexus-rpc.blockops.network',
      IBP2: 'wss://nexus.dotters.network'
    },
    httpUrl: 'https://nexus.ibp.network',
    genesisHash: '0x61ea8a51fd4a058ee8c0e86df0a89cc85b8b67a0a66432893d09719050c9f540',
    ss58Format: 0,
    socketUrl: 'wss://nexus-api.mimir.global/',
    statescanUrl: 'https://nexus.statescan.io/'
  },
  {
    key: 'polimec',
    icon: '/chain-icons/polimec.svg',
    tokenIcon: '/token-icons/PLMC.webp',
    name: 'Polimec Polkadot',
    relayChain: 'polkadot',
    wsUrl: {
      IBP1: 'wss://polimec.ibp.network',
      Amforc: 'wss://polimec.rpc.amforc.com',
      'Polimec Foundation': 'wss://rpc.polimec.org',
      IBP2: 'wss://polimec.dotters.network',
      Helikon: 'wss://rpc.helikon.io/polimec'
    },
    httpUrl: 'https://polimec.ibp.network',
    genesisHash: '0x7eb9354488318e7549c722669dcbdcdc526f1fef1420e7944667212f3601fdbd',
    ss58Format: 41,
    socketUrl: 'wss://polimec-api.mimir.global/',
    statescanUrl: 'https://polimec.statescan.io/'
  }
];

export const kusamaEndpoints: Endpoint[] = [
  {
    key: 'kusama',
    icon: '/chain-icons/Kusama.png',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'Kusama',
    isRelayChain: true,
    wsUrl: {
      Allnodes: 'wss://kusama-rpc.publicnode.com',
      OnFinality: 'wss://kusama.api.onfinality.io/public-ws',
      Dwellir: 'wss://kusama-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://kusama-rpc-tn.dwellir.com',
      IBP1: 'wss://rpc.ibp.network/kusama',
      IBP2: 'wss://kusama.dotters.network',
      LuckyFriday: 'wss://rpc-kusama.luckyfriday.io',
      RadiumBlock: 'wss://kusama.public.curie.radiumblock.co/ws',
      RockX: 'wss://rockx-ksm.w3node.com/polka-public-ksm/ws',
      Stakeworld: 'wss://ksm-rpc.stakeworld.io'
    },
    httpUrl: 'https://kusama-rpc.publicnode.com',
    genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    ss58Format: 2,
    socketUrl: 'wss://kusama-api.mimir.global/',
    explorerUrl: 'https://kusama.subscan.io/',
    statescanUrl: 'https://kusama.statescan.io/',
    identityNetwork: 'people-kusama'
  },
  {
    key: 'assethub-kusama',
    icon: '/chain-icons/assethub-kusama.svg',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'AssetHub Kusama',
    relayChain: 'kusama',
    wsUrl: {
      Dwellir: 'wss://asset-hub-kusama-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://statemine-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/asset-hub-kusama',
      IBP2: 'wss://asset-hub-kusama.dotters.network',
      LuckyFriday: 'wss://rpc-asset-hub-kusama.luckyfriday.io',
      Parity: 'wss://kusama-asset-hub-rpc.polkadot.io',
      RadiumBlock: 'wss://statemine.public.curie.radiumblock.co/ws',
      Stakeworld: 'wss://ksm-rpc.stakeworld.io/assethub'
    },
    httpUrl: 'https://statemine-rpc-tn.dwellir.com',
    genesisHash: '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
    ss58Format: 2,
    socketUrl: 'wss://assethub-kusama-api.mimir.global/',
    explorerUrl: 'https://assethub-kusama.subscan.io/',
    statescanUrl: 'https://assethub-kusama.statescan.io/',
    identityNetwork: 'people-kusama'
  },
  {
    key: 'people-kusama',
    icon: '/chain-icons/people-kusama.svg',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'People Kusama',
    relayChain: 'kusama',
    wsUrl: {
      Parity: 'wss://kusama-people-rpc.polkadot.io',
      Dwellir: 'wss://people-kusama-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/people-kusama',
      IBP2: 'wss://people-kusama.dotters.network',
      LuckyFriday: 'wss://rpc-people-kusama.luckyfriday.io',
      Stakeworld: 'wss://ksm-rpc.stakeworld.io/people'
    },
    httpUrl: 'https://kusama-people-rpc.polkadot.io',
    genesisHash: '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f',
    ss58Format: 2,
    socketUrl: 'wss://people-kusama-api.mimir.global/',
    explorerUrl: 'https://people-kusama.subscan.io/',
    statescanUrl: 'https://people-kusama.statescan.io/'
  },
  {
    key: 'coretime-kusama',
    icon: '/chain-icons/coretime-kusama.webp',
    tokenIcon: '/token-icons/Kusama.png',
    name: 'Coretime Kusama',
    relayChain: 'kusama',
    wsUrl: {
      Parity: 'wss://kusama-coretime-rpc.polkadot.io',
      Dwellir: 'wss://coretime-kusama-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/coretime-kusama',
      IBP2: 'wss://coretime-kusama.dotters.network',
      LuckyFriday: 'wss://rpc-coretime-kusama.luckyfriday.io',
      Stakeworld: 'wss://ksm-rpc.stakeworld.io/coretime'
    },
    httpUrl: 'https://kusama-coretime-rpc.polkadot.io',
    genesisHash: '0x638cd2b9af4b3bb54b8c1f0d22711fc89924ca93300f0caf25a580432b29d050',
    ss58Format: 2,
    socketUrl: 'wss://coretime-kusama-api.mimir.global/',
    explorerUrl: 'https://coretime-kusama.subscan.io/',
    statescanUrl: 'https://coretime-kusama.statescan.io/',
    identityNetwork: 'people-kusama'
  },
  {
    key: 'bifrost-kusama',
    icon: '/chain-icons/bifrost-kusama.png',
    tokenIcon: '/token-icons/bnc.png',
    name: 'Bifrost Kusama',
    relayChain: 'kusama',
    wsUrl: {
      Liebi: 'wss://bifrost-rpc.liebi.com/ws',
      Dwellir: 'wss://bifrost-rpc.dwellir.com',
      LiebiUS: 'wss://us.bifrost-rpc.liebi.com/ws',
      RadiumBlock: 'wss://bifrost.public.curie.radiumblock.co/ws'
    },
    httpUrl: 'https://bifrost-rpc.liebi.com',
    genesisHash: '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed',
    ss58Format: 0,
    socketUrl: 'wss://bifrost-kusama-api.mimir.global/',
    explorerUrl: 'https://bifrost.subscan.io/'
  },
  {
    key: 'amplitude',
    icon: '/chain-icons/amplitude.svg',
    tokenIcon: '/token-icons/ampe.svg',
    name: 'Amplitude',
    relayChain: 'kusama',
    wsUrl: {
      Dwellir: 'wss://amplitude-rpc.dwellir.com',
      PendulumChain: 'wss://rpc-amplitude.pendulumchain.tech'
    },
    httpUrl: 'https://amplitude-rpc.dwellir.com',
    genesisHash: '0xcceae7f3b9947cdb67369c026ef78efa5f34a08fe5808d373c04421ecf4f1aaf',
    ss58Format: 57,
    socketUrl: 'wss://amplitude-api.mimir.global/'
  },
  {
    key: 'karura',
    icon: '/chain-icons/Karura.svg',
    tokenIcon: '/token-icons/KAR.png',
    name: 'Karura',
    relayChain: 'kusama',
    wsUrl: {
      'Acala Foundation 1': 'wss://karura-rpc-1.aca-api.network',
      'Acala Foundation 0': 'wss://karura-rpc-0.aca-api.network',
      'Acala Foundation 2': 'wss://karura-rpc-2.aca-api.network/ws',
      'Acala Foundation 3': 'wss://karura-rpc-3.aca-api.network/ws',
      Dwellir: 'wss://karura-rpc.dwellir.com',
      OnFinality: 'wss://karura.api.onfinality.io/public-ws'
    },
    httpUrl: 'https://karura-rpc-1.aca-api.network',
    genesisHash: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
    ss58Format: 8,
    socketUrl: 'wss://karura-api.mimir.global/',
    explorerUrl: 'https://karura.subscan.io/'
  }
];

export const paseoEndpoints: Endpoint[] = [
  {
    key: 'paseo',
    icon: '/chain-icons/Paseo.png',
    tokenIcon: '/token-icons/Paseo.png',
    name: 'Paseo',
    ss58Format: 0,
    isRelayChain: true,
    isTestnet: true,
    wsUrl: {
      Dwellir: 'wss://paseo-rpc.dwellir.com',
      IBP1: 'wss://rpc.ibp.network/paseo',
      StakeWorld: 'wss://pas-rpc.stakeworld.io',
      IBP2: 'wss://paseo.dotters.network',
      Amforc: 'wss://paseo.rpc.amforc.com',
      Zondax: 'wss://api2.zondax.ch/pas/node/rpc'
    },
    httpUrl: 'https://paseo-rpc.dwellir.com',
    genesisHash: '0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f',
    socketUrl: !isDevEnv ? 'wss://paseo-api.mimir.global/' : 'wss://dev-api.mimir.global/',
    explorerUrl: 'https://paseo.subscan.io/',
    statescanUrl: 'https://paseo.statescan.io/'
  },
  {
    key: 'assethub-paseo',
    icon: '/chain-icons/assethub-paseo.webp',
    tokenIcon: '/token-icons/Paseo.png',
    name: 'AssetHub Paseo',
    ss58Format: 0,
    relayChain: 'paseo',
    isTestnet: true,
    wsUrl: {
      Dwellir: 'wss://asset-hub-paseo-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/asset-hub-paseo',
      IBP2: 'wss://asset-hub-paseo.dotters.network',
      StakeWorld: 'wss://pas-rpc.stakeworld.io/assethub',
      TurboFlakes: 'wss://sys.turboflakes.io/asset-hub-paseo'
    },
    httpUrl: 'https://asset-hub-paseo-rpc.dwellir.com',
    genesisHash: '0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2',
    socketUrl: 'wss://assethub-paseo-api.mimir.global/',
    explorerUrl: 'https://assethub-paseo.subscan.io/',
    statescanUrl: 'https://assethub-paseo.statescan.io/'
  },
  ...(isDevEnv
    ? ([
        {
          key: 'xcavate-dev',
          icon: '/chain-icons/xcavate.png',
          tokenIcon: '/token-icons/XCAV.png',
          name: 'Xcavate Devnet',
          relayChain: 'paseo',
          isTestnet: true,
          wsUrl: {
            'xcavate Devnet': 'wss://rpc2-paseo.xcavate.io'
          },
          httpUrl: 'https://rpc2-paseo.xcavate.io/',
          genesisHash: '0xea979dc47498ad76dd4dedb153d4d029d8739dd6d2ff7ff969decc9a4ff5e005',
          ss58Format: 42,
          socketUrl: 'wss://xcavate-dev-api.mimir.global/'
        }
      ] as const)
    : [])
];

export const westendEndpoints: Endpoint[] = [
  {
    key: 'westend',
    icon: '/chain-icons/Westend.webp',
    tokenIcon: '/token-icons/WND.webp',
    name: 'Westend',
    ss58Format: 42,
    isRelayChain: true,
    isTestnet: true,
    wsUrl: {
      Dwellir: 'wss://westend-rpc.dwellir.com',
      OnFinality: 'wss://westend.api.onfinality.io/public-ws',
      Parity: 'wss://westend-rpc.polkadot.io',
      IBP1: 'wss://rpc.ibp.network/westend',
      'Dwellir Tunisia': 'wss://westend-rpc-tn.dwellir.com',
      IBP2: 'wss://westend.dotters.network',
      RadiumBlock: 'wss://westend.public.curie.radiumblock.co/ws'
    },
    httpUrl: 'https://westend-rpc.dwellir.com',
    genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
    socketUrl: 'wss://westend-api.mimir.global/',
    explorerUrl: 'https://westend.subscan.io/',
    statescanUrl: 'https://westend.statescan.io/'
  },
  {
    key: 'assethub-westend',
    icon: '/chain-icons/assethub-westend.webp',
    tokenIcon: '/token-icons/WND.webp',
    name: 'AssetHub Westend',
    ss58Format: 42,
    relayChain: 'westend',
    isTestnet: true,
    wsUrl: {
      Dwellir: 'wss://asset-hub-westend-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/asset-hub-westend',
      Parity: 'wss://westend-asset-hub-rpc.polkadot.io',
      'Dwellir Tunisia': 'wss://westmint-rpc-tn.dwellir.com',
      IBP2: 'wss://asset-hub-westend.dotters.network',
      'Permanence DAO EU': 'wss://asset-hub-westend.rpc.permanence.io'
    },
    httpUrl: 'https://asset-hub-westend-rpc.dwellir.com',
    genesisHash: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
    socketUrl: 'wss://assethub-westend-api.mimir.global/',
    explorerUrl: 'https://assethub-westend.subscan.io/',
    statescanUrl: 'https://assethub-westend.statescan.io/'
  },
  {
    key: 'assethub-next-westend',
    icon: '/chain-icons/assethub-westend.webp',
    tokenIcon: '/token-icons/WND.webp',
    name: 'AssetHub Next',
    ss58Format: 42,
    relayChain: 'westend',
    isTestnet: true,
    wsUrl: {
      Parity: 'wss://westend-asset-hub-next-rpc.parity-chains-scw.parity.io'
    },
    genesisHash: '0x6ddaae15f85a6a5035da7c842ba7a8a90c06d1f53d410a08d19fe899d9d9c7c8',
    socketUrl: 'wss://assethub-next-westend-api.mimir.global/',
    explorerUrl: 'https://assethub-westend-next.subscan.io/'
  }
];

export const solochainEndpoints: Endpoint[] = [
  {
    key: 'vara',
    icon: '/chain-icons/vara.png',
    tokenIcon: '/token-icons/vara.png',
    name: 'Vara',
    wsUrl: {
      Blast: 'wss://vara-mainnet.public.blastapi.io',
      Gear: 'wss://rpc.vara.network',
      'P2P.org': 'wss://vara.substrate-rpc.p2p.org/'
    },
    httpUrl: 'https://vara-mainnet.public.blastapi.io',
    genesisHash: '0xfe1b4c55fd4d668101126434206571a7838a8b6b93a6d1b95d607e78e6c53763',
    ss58Format: 137,
    socketUrl: 'wss://vara-api.mimir.global/',
    explorerUrl: 'https://vara.subscan.io/'
  },
  {
    key: 'crust',
    icon: '/chain-icons/crust.svg',
    tokenIcon: '/token-icons/cru.svg',
    name: 'Crust',
    wsUrl: {
      OnFinality: 'wss://crust.api.onfinality.io/public-ws',
      Dwellir: 'wss://crust-mainnet-rpc.dwellir.com',
      'Crust Network': 'wss://rpc.crust.network',
      'Crust Network APP': 'wss://rpc.crustnetwork.app',
      'Crust Network CC': 'wss://rpc.crustnetwork.cc',
      'Crust Network XYZ': 'wss://rpc.crustnetwork.xyz'
    },
    httpUrl: 'https://crust.api.onfinality.io/public',
    genesisHash: '0x8b404e7ed8789d813982b9cb4c8b664c05b3fbf433309f603af014ec9ce56a8c',
    ss58Format: 66,
    socketUrl: 'wss://crust-api.mimir.global/',
    explorerUrl: 'https://crust.subscan.io/'
  },
  {
    key: 'avail',
    icon: '/chain-icons/avail.png',
    tokenIcon: '/token-icons/avail.png',
    name: 'Avail',
    wsUrl: {
      OnFinality: 'wss://avail.api.onfinality.io/public-ws',
      Avail: 'wss://mainnet-rpc.avail.so/ws'
    },
    httpUrl: 'https://avail.api.onfinality.io/public',
    genesisHash: '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a',
    ss58Format: 42,
    socketUrl: 'wss://avail-api.mimir.global/',
    explorerUrl: 'https://avail.subscan.io/'
  },
  {
    key: 'avail-turing',
    icon: '/chain-icons/avail.png',
    tokenIcon: '/token-icons/avail.png',
    name: 'Avail Turing',
    isTestnet: true,
    wsUrl: {
      Avail: 'wss://turing-rpc.avail.so/ws'
    },
    genesisHash: '0xd3d2f3a3495dc597434a99d7d449ebad6616db45e4e4f178f31cc6fa14378b70',
    ss58Format: 42,
    socketUrl: 'wss://avail-turing-api.mimir.global/',
    explorerUrl: 'https://avail-turing.subscan.io/'
  },
  {
    key: 'zkverify-testnet',
    icon: '/chain-icons/zkverify.svg',
    tokenIcon: '/token-icons/ACME.svg',
    name: 'zkVerify Testnet',
    isTestnet: true,
    wsUrl: {
      zkVerify: 'wss://testnet-rpc.zkverify.io'
    },
    genesisHash: '0xc00425dcaa0a1bc5bf1163a2d69d7abb2cc6180de78b4e10297b31a4d9cc928a',
    ss58Format: 251,
    socketUrl: 'wss://zkverify-testnet-api.mimir.global/',
    explorerUrl: 'https://zkverify-testnet.subscan.io/'
  },
  {
    key: '5ire',
    icon: '/chain-icons/5ire.svg',
    tokenIcon: '/token-icons/5IRE.webp',
    name: '5ire',
    wsUrl: {
      '5ire': 'wss://rpc.5ire.network'
    },
    httpUrl: 'https://rpc.5ire.network/',
    genesisHash: '0x8c24aac175a803c999b25e1cdd89fefcf2ce6af24e27aa9b773463a7fa88c385',
    ss58Format: 42,
    socketUrl: 'wss://5ire-api.mimir.global/'
    // explorerUrl: 'https://5irescan.io/'
  }
];

export const allEndpoints = polkadotEndpoints
  .concat(kusamaEndpoints)
  .concat(paseoEndpoints)
  .concat(westendEndpoints)
  .concat(solochainEndpoints);
