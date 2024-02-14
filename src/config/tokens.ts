// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, localEndpoint } from './api';

export type Token = {
  Icon: string;
  genesisHash: string;
};

export function findToken(genesisHash: string): Token {
  const endpoint = allEndpoints.find((item) => item.genesisHash === genesisHash) || localEndpoint;

  return {
    Icon: endpoint.tokenIcon,
    genesisHash
  };
}
