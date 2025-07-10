// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { allEndpoints } from '@mimir-wallet/polkadot-core';

export type Token = {
  Icon: string;
  network: string;
};

export type Asset = Token & { assetId: string | HexString };

export function findToken(genesisHash: HexString) {
  const endpoint = allEndpoints.find((item) => item.genesisHash === genesisHash);

  return {
    Icon: endpoint?.tokenIcon || '/token-icons/DOT.webp'
  };
}

export const assets: Asset[] = [
  {
    Icon: '/token-icons/DED.webp',
    network: 'assethub-polkadot',
    assetId: '30'
  },
  {
    Icon: '/token-icons/DOTA.png',
    network: 'assethub-polkadot',
    assetId: '18'
  },
  {
    Icon: '/token-icons/USDC.svg',
    network: 'assethub-polkadot',
    assetId: '1337'
  },
  {
    Icon: '/token-icons/USDT.svg',
    network: 'assethub-polkadot',
    assetId: '1984'
  },
  {
    Icon: '/token-icons/MYTH.webp',
    network: 'assethub-polkadot',
    assetId: '0x010100a534'
  },
  {
    Icon: '/token-icons/USDC.svg',
    network: 'hydration',
    assetId: '22'
  },
  {
    Icon: '/token-icons/USDT.svg',
    network: 'hydration',
    assetId: '10'
  },
  {
    Icon: '/token-icons/DOT.webp',
    network: 'hydration',
    assetId: '5'
  }
];

export function findAsset(network: string, assetId: string): Asset | undefined {
  return assets.find((item) => item.network === network && item.assetId === assetId);
}
