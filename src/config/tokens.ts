// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { allEndpoints, localEndpoint } from './api';

export type Token = {
  Icon: string;
  genesisHash: string;
};

export type Asset = Token & { assetId: string | HexString };

export function findToken(genesisHash: string): Token {
  const endpoint = allEndpoints.find((item) => item.genesisHash === genesisHash) || localEndpoint;

  return {
    Icon: endpoint.tokenIcon,
    genesisHash
  };
}

export const assets: Asset[] = [
  {
    Icon: '/token-icons/DED.webp',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assetId: '30'
  },
  {
    Icon: '/token-icons/DOTA.png',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assetId: '18'
  },
  {
    Icon: '/token-icons/USDC.svg',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assetId: '1337'
  },
  {
    Icon: '/token-icons/USDT.svg',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assetId: '1984'
  },
  {
    Icon: '/token-icons/MYTH.webp',
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    assetId: '0x010100a534'
  }
];

export function findAssets(genesisHash: string): Asset[] {
  return assets.filter((item) => item.genesisHash === genesisHash);
}
