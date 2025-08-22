// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StagingXcmV4Junction, StagingXcmV5Junction, XcmV3Junction } from '@polkadot/types/lookup';

export type Junctions = XcmV3Junction[] | StagingXcmV4Junction[] | StagingXcmV5Junction[];

export interface LocationInfo {
  parents: number;
  interiors: Junctions;
}

export type SupportXcmChainConfig = {
  isSupport: true;
  key: string;
  name?: string;
  icon: string;
  tokenIcon: string;
  genesisHash: string;
  relayChain?: string;
  paraId?: number;
  wsUrl: Record<string, string>;
  httpUrl?: string;
};

export type UnSupportXcmChainConfig = {
  isSupport: false;
  paraId: number;
};

export type XcmChainConfig = SupportXcmChainConfig | UnSupportXcmChainConfig;
