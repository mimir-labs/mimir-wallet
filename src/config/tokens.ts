// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

export type Token = {
  Icon: string;
  genesisHash: string;
};

export const tokens: Token[] = [
  {
    Icon: '/token-icons/Mimir.png',
    genesisHash: '0xe0804a0b86b52b29ff4c536e5d3ea31f2ca3ab2a2b4a9caee5ced16579f42c6f'
  },
  {
    Icon: '/token-icons/Polkadot.png',
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
  },
  {
    Icon: '/token-icons/Kusama.png',
    genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe'
  },
  {
    Icon: '/token-icons/Rococo.png',
    genesisHash: '0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e'
  }
];

export function findToken(api: ApiPromise): Token | undefined {
  return tokens.find((item) => item.genesisHash === api.genesisHash.toHex());
}
