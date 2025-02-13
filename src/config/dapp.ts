// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

import { isArray } from '@polkadot/util';

import BatchIcon from '@mimir-wallet/assets/images/batch.svg';
import Failed from '@mimir-wallet/assets/images/failed.svg';
import LogoCircle from '@mimir-wallet/assets/svg/logo-circle.svg';

export interface DappOption {
  // (1 - 500) is internal app
  // (500 - 999) is internal feature
  // (1000 - ...) is external app
  id: number;
  icon: string;
  name: string;
  description: string;
  url: string;
  supportedChains: true | HexString[];
  destChain?: Record<HexString, HexString>;
  tags?: string[];
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  matrix?: string;
  isDrawer?: boolean;
  Component?: () => Promise<React.ComponentType>; // only for mimir://dapp/*
}

export const dapps: DappOption[] = [
  {
    id: 1,
    icon: '/dapp-icons/transfer.png',
    name: 'Transfer',
    description: 'Swiftly transfer assets.',
    url: 'mimir://app/transfer',
    supportedChains: true,
    tags: ['Assets'],
    website: 'https://mimir.global',
    twitter: 'https://twitter.com/Mimir_global',
    github: 'https://github.com/mimir-labs',
    Component: () => import('@mimir-wallet/apps/transfer').then((res) => res.default)
  },
  {
    id: 2,
    name: 'Cache',
    description: 'Batch multiple actions into one.',
    url: 'mimir://app/batch',
    icon: BatchIcon,
    supportedChains: true,
    website: 'https://mimir.global/',
    github: 'https://github.com/mimir-labs/',
    twitter: 'https://x.com/Mimir_global/',
    tags: ['Batch', 'Cache'],
    Component: () => import('@mimir-wallet/apps/batch').then((res) => res.default),
    isDrawer: true
  },
  {
    id: 500,
    icon: LogoCircle,
    name: 'Setup',
    description: 'setup member of proxy',
    url: 'mimir://internal/setup',
    supportedChains: true
  },
  {
    id: 501,
    icon: LogoCircle,
    name: 'Fund',
    description: 'Fund',
    url: 'mimir://internal/fund',
    supportedChains: true
  },
  {
    id: 502,
    icon: Failed,
    name: 'Cancel',
    description: 'Cancel Tx',
    url: 'mimir://internal/cancel',
    supportedChains: true
  },
  {
    id: 503,
    icon: Failed,
    name: 'Deny Announcement',
    description: 'Deny announcement',
    url: 'mimir://internal/deny-announcement',
    supportedChains: true
  },
  {
    id: 505,
    icon: LogoCircle,
    name: 'Create Pure',
    description: 'Create Pure',
    url: 'mimir://internal/create-pure',
    supportedChains: true
  },
  {
    id: 506,
    icon: LogoCircle,
    name: 'Execute Announcement',
    description: 'Execute Announcement',
    url: 'mimir://internal/execute-announcement',
    supportedChains: true
  },
  {
    id: 507,
    icon: LogoCircle,
    name: 'Remove All Proxies',
    description: 'Remove All Proxies',
    url: 'mimir://internal/remove-proxies',
    supportedChains: true
  },
  {
    id: 507,
    icon: LogoCircle,
    name: 'Remove Account',
    description: 'Remove Account',
    url: 'mimir://internal/remove-account',
    supportedChains: true
  },
  {
    id: 1000,
    icon: '/dapp-icons/apps.svg',
    name: 'Apps',
    description: "Transactions can be constructed according to users' needs",
    url: 'https://apps.mimir.global/',
    supportedChains: true,
    tags: ['Wallet', 'Tool'],
    website: 'https://polkadot.js.org/',
    github: 'https://github.com/polkadot-js'
  },
  {
    id: 1001,
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
    icon: '/dapp-icons/staking.png',
    name: 'Staking',
    description:
      'Polkadot Staking Dashboard is the easiest way to stake DOT, check validator stats, manage your nominations and join nomination pools.',
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
  },
  {
    id: 1007,
    icon: '/dapp-icons/avail.png',
    name: 'Avail Staking',
    description:
      'Avail Staking Dashboard is the easiest way to stake AVAIL, check validator stats, manage your nominations and join nomination pools. Stake on Avail (AVAIL).',
    url: 'https://staking.avail.tools/#/overview',
    supportedChains: [
      '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a',
      '0xd3d2f3a3495dc597434a99d7d449ebad6616db45e4e4f178f31cc6fa14378b70'
    ],
    tags: ['Staking'],
    website: 'https://www.availproject.org/',
    twitter: 'https://x.com/AvailProject',
    discord: 'https://discord.com/invite/y6fHnxZQX8',
    github: 'https://github.com/availproject'
  },
  {
    id: 1008,
    icon: '/dapp-icons/polkaidentity.svg',
    name: 'Polkaidentity',
    description:
      'PolkaIdentity is a decentralized identity platform on Polkadot that empowers users to securely manage, verify, and share their digital identity across Web3 applications with full control and privacy.',
    url: 'https://app.polkaidentity.com/',
    supportedChains: [
      // polkadot
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
      '0xefb56e30d9b4a24099f88820987d0f45fb645992416535d87650d98e00f46fc4',
      '0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2',
      '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
      // kusama
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
      '0x638cd2b9af4b3bb54b8c1f0d22711fc89924ca93300f0caf25a580432b29d050',
      '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f'
    ],
    destChain: {
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3':
        '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
      '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f':
        '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
      '0xefb56e30d9b4a24099f88820987d0f45fb645992416535d87650d98e00f46fc4':
        '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
      '0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2':
        '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
      // kusama
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe':
        '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f',
      '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a':
        '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f',
      '0x638cd2b9af4b3bb54b8c1f0d22711fc89924ca93300f0caf25a580432b29d050':
        '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f'
    },
    tags: ['Identity'],
    matrix: 'https://matrix.to/#/#polkaidentity:matrix.org'
  }
];

export function findSupportedDapps(api: ApiPromise): DappOption[] {
  return dapps.filter((item) =>
    isArray(item.supportedChains) ? item.supportedChains.includes(api.genesisHash.toHex()) : true
  );
}
