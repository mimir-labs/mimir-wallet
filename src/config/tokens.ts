// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, localEndpoint } from './api';

export type Token = {
  Icon: string;
  genesisHash: string;
};

export type Asset = {
  Icon: string;
  genesisHash: string;
  assetId: string;
};

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
  }
];

export function findAssets(genesisHash: string): Asset[] {
  return assets.filter((item) => item.genesisHash === genesisHash);
}
