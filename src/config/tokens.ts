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
  }
];

export function findToken(api: ApiPromise): Token | undefined {
  return tokens.find((item) => item.genesisHash === api.genesisHash.toHex());
}
