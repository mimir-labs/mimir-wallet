// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

import { isArray } from '@polkadot/util';
import store from 'store';

import { FAVORITE_DAPP_KEY } from '@mimir-wallet/constants';

export interface DappOption {
  // (1 - 999) is internal app
  // (1000 - ...) is external app
  id: number;
  internal: boolean;
  icon: string;
  name: string;
  description: string;
  url: string;
  supportedChains: true | HexString[];
  tags: string[];
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

export const dapps: DappOption[] = [
  {
    id: 1,
    internal: true,
    icon: '/dapp-icons/transfer.png',
    name: 'Transfer',
    description: 'Swiftly complete asset transfers with other users, developed by Mimir.',
    url: '/transfer',
    supportedChains: true,
    tags: ['Assets'],
    website: 'https://mimir.global',
    twitter: 'https://twitter.com/Mimir_global',
    github: 'https://github.com/mimir-labs'
  },
  {
    id: 1000,
    internal: false,
    icon: '/dapp-icons/apps.svg',
    name: 'Apps',
    description:
      'Using the Mimir-modified version of the Polkadot.js App, users can quickly perform all operations related to Substrate.',
    url: 'https://apps.mimir.global/',
    supportedChains: true,
    tags: ['Wallet', 'Tool'],
    website: 'https://polkadot.js.org/',
    github: 'https://github.com/polkadot-js'
  },
  {
    id: 1001,
    internal: false,
    icon: '/dapp-icons/subsquare.svg',
    name: 'Subsquare(Rococo)',
    description: 'SubSquare enables community members to propose, discuss and vote on governance proposals.',
    url: 'https://rococo.subsquare.io/',
    supportedChains: ['0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e'],
    tags: ['Governance'],
    website: 'https://www.subsquare.io/',
    twitter: 'https://twitter.com/OpensquareN',
    github: 'https://github.com/opensquare-network'
  },
  {
    id: 1002,
    internal: false,
    icon: '/dapp-icons/subsquare.svg',
    name: 'Subsquare(Polkadot)',
    description: 'SubSquare enables community members to propose, discuss and vote on governance proposals.',
    url: 'https://polkadot.subsquare.io/',
    supportedChains: ['0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'],
    tags: ['Governance'],
    website: 'https://www.subsquare.io/',
    twitter: 'https://twitter.com/OpensquareN',
    github: 'https://github.com/opensquare-network'
  },
  {
    id: 1003,
    internal: false,
    icon: '/dapp-icons/subsquare.svg',
    name: 'Subsquare(Kusama)',
    description: 'SubSquare enables community members to propose, discuss and vote on governance proposals.',
    url: 'https://kusama.subsquare.io/',
    supportedChains: ['0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe'],
    tags: ['Governance'],
    website: 'https://www.subsquare.io/',
    twitter: 'https://twitter.com/OpensquareN',
    github: 'https://github.com/opensquare-network'
  },
  {
    id: 1004,
    internal: false,
    icon: '/dapp-icons/staking.png',
    name: 'Staking',
    description:
      'Staking DOT natively provides the function of securing the network and allows you to collect DOT tokens for your help.',
    url: 'https://staking.mimir.global/',
    supportedChains: [
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe'
    ],
    tags: ['Staking'],
    website: 'https://staking.polkadot.network/',
    github: 'https://github.com/paritytech/polkadot-staking-dashboard'
  },
  {
    id: 1005,
    internal: false,
    icon: '/dapp-icons/bifrost.png',
    name: 'Bifrost App',
    description:
      'The Bifrost App integrates operations such as cross-chain transfers, swaps, and Yield Farming, providing vital liquidity and asset management services for the Polkadot ecosystem. This makes Bifrost an indispensable part of the Polkadot ecosystem.',
    url: 'https://bifrost.app/',
    supportedChains: [
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed',
      '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f'
    ],
    tags: ['Defi'],
    website: 'https://bifrost.finance/',
    github: 'https://github.com/bifrost-finance'
  },
  {
    id: 1006,
    internal: false,
    icon: '/dapp-icons/crust.webp',
    name: 'Crust Files',
    description:
      "Crust Files is the world's first Web 3.0 personal file storage application, launched by Crust Network. The Crust Files application enables safe storage of your personal files on IPFS, secured by the Crust Network public blockchain.",
    url: 'https://crustfiles.io/',
    supportedChains: ['0x8b404e7ed8789d813982b9cb4c8b664c05b3fbf433309f603af014ec9ce56a8c'],
    tags: ['Defi'],
    website: 'https://crust.network/',
    twitter: 'https://x.com/CrustNetwork',
    discord: 'https://discord.gg/prkGRTeMGN',
    github: 'https://github.com/crustio'
  }
];

export function findSupportedDapps(api: ApiPromise): DappOption[] {
  return dapps.filter((item) =>
    isArray(item.supportedChains) ? item.supportedChains.includes(api.genesisHash.toHex()) : true
  );
}

export function initializeFavoriteDapps() {
  if (!store.get(FAVORITE_DAPP_KEY)) {
    store.set(FAVORITE_DAPP_KEY, [1, 1000]);
  }
}
