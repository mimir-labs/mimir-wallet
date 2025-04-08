// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

// helpers for HOC props
export type OmitProps<T, K> = Pick<T, Exclude<keyof T, K>>;
export type SubtractProps<T, K> = OmitProps<T, keyof K>;

export type Endpoint = {
  key: string;
  name: string;
  wsUrl: Record<string, string>;
  httpUrl?: string;
  icon: string;
  tokenIcon: string;
  ss58Format: number;
  genesisHash: HexString;
  socketUrl: string;
  statescan?: boolean;
  explorerUrl?: string;
  proposalApi?: string;
  subsquareUrl?: string;
  identityNetwork?: string;
};

export interface ApiState {
  chainSS58: number;
  isApiReady: boolean;
  tokenSymbol: string;
  genesisHash: HexString;
}

export interface ApiProps extends ApiState {
  api?: ApiPromise | null;
  apiError: string | null;
  isApiInitialized: boolean;
  network: string;
  chain: Endpoint;
}

export interface ApiContextProps extends ValidApiState, Omit<ApiProps, 'api'> {
  setNetwork: (network: string) => void;
}

export type ValidApiState = ApiState & {
  api: ApiPromise;
  chain: Endpoint;
  apiError: string | null;
  isApiInitialized: boolean;
  network: string;
};
