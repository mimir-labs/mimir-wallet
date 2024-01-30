// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

import { isArray } from '@polkadot/util';

export interface DappOption {
  internal: boolean;
  icon: string;
  name: string;
  description: string;
  url: string;
  supportedChains: true | HexString[];
}

export const dapps: DappOption[] = [
  {
    internal: true,
    icon: '/dapp-icons/transfer.png',
    name: 'Transfer',
    description: 'Swiftly complete asset transfers with other users, developed by Mimir.',
    url: '/transfer',
    supportedChains: true
  },
  {
    internal: false,
    icon: '/dapp-icons/apps.svg',
    name: 'Apps',
    description: 'Using the Mimir-modified version of the Polkadot.js App, users can quickly perform all operations related to Substrate.',
    url: 'https://apps.mimir.global',
    supportedChains: true
  },
  {
    internal: false,
    icon: '/dapp-icons/subsquare.svg',
    name: 'Subsquare(Rococo)',
    description: 'SubSquare enables community members to propose, discuss and vote on governance proposals.',
    url: 'https://rococo.subsquare.io/',
    supportedChains: ['0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e']
  }
];

export function findSupportedDapps(api: ApiPromise): DappOption[] {
  return dapps.filter((item) => (isArray(item.supportedChains) ? item.supportedChains.includes(api.genesisHash.toHex()) : true));
}
