// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { allEndpoints } from '@mimir-wallet/polkadot-core';

export type Token = {
  Icon: string;
  genesisHash: string;
};

export type Asset = Token & { assetId: string | HexString };

export function findToken(genesisHash: string): Token {
  const endpoint = allEndpoints.find((item) => item.genesisHash === genesisHash);

  return {
    Icon: endpoint?.tokenIcon || '/token-icons/Polkadot.png',
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
  },
  {
    Icon: '/token-icons/USDC.svg',
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    assetId: '22'
  },
  {
    Icon: '/token-icons/USDT.svg',
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    assetId: '10'
  },
  {
    Icon: '/token-icons/Polkadot.svg',
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    assetId: '5'
  }
];

export function findAssets(genesisHash: string): Asset[] {
  return assets.filter((item) => item.genesisHash === genesisHash);
}
