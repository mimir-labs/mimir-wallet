// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

import { FAVORITE_DAPP_KEY } from '@mimir-wallet/constants';
import { isArray } from '@polkadot/util';
import store from 'store';

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
    description: 'Using the Mimir-modified version of the Polkadot.js App, users can quickly perform all operations related to Substrate.',
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
  }
];

export function findSupportedDapps(api: ApiPromise): DappOption[] {
  return dapps.filter((item) => (isArray(item.supportedChains) ? item.supportedChains.includes(api.genesisHash.toHex()) : true));
}

export function initializeFavoriteDapps() {
  if (!store.get(FAVORITE_DAPP_KEY)) {
    store.set(FAVORITE_DAPP_KEY, [1, 1000]);
  }
}
