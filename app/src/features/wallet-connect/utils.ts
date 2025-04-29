// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

export const POLKADOT_NAMESPACE = 'polkadot';

export const isPairingUri = (uri: string): boolean => {
  return uri.startsWith('wc:') && uri.length > 20;
};

export const getPolkadotChain = (genesisHash: HexString | 'all'): string => {
  return `${POLKADOT_NAMESPACE}:${genesisHash === 'all' ? 'all' : genesisHash.slice(2, 34)}`;
};
