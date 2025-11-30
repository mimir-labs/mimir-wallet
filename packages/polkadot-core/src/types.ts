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
  relayChain?: string;
  isRelayChain?: boolean;
  paraId?: number;
  isTestnet?: boolean;
  wsUrl: Record<string, string>;
  httpUrl?: string;
  icon: string;
  tokenIcon: string;
  ss58Format: number;
  genesisHash: HexString;
  explorerUrl?: string;
  statescanUrl?: string;
  subsquareUrl?: string;
  identityNetwork?: string;
  polkavm?: boolean;
  remoteProxyTo?: HexString;
  // Indicates if proxy announcements use relay chain block numbers instead of parachain block numbers
  useRelayBlockForProxy?: boolean;
  // Native token decimals (e.g., 10 for DOT, 12 for KSM)
  nativeDecimals: number;
  // Native token symbol (e.g., 'DOT', 'KSM')
  nativeToken: string;
  // Indicates if the chain supports dry-run API (api.call.dryRunApi)
  supportsDryRun?: boolean;
  // Indicates if the chain supports proxy pallet (api.tx.proxy)
  supportsProxy?: boolean;
};

export type Network = Endpoint & {
  enabled: boolean;
};

export interface ApiState {
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
  chainSS58: number;
  ss58Chain: string;
  setSs58Chain: (chain: string) => void;
  allApis: Record<string, ValidApiState>;
  setNetwork: (network: string) => string | null;
}

export type ValidApiState = ApiState & {
  api: ApiPromise;
  chain: Endpoint;
  apiError: string | null;
  isApiInitialized: boolean;
  network: string;
};

// New types for refactored API management

/**
 * Chain connection status
 */
export interface ChainStatus {
  isApiReady: boolean;
  isApiInitialized: boolean;
  apiError: string | null;
}

/**
 * API connection state managed by ApiManager
 */
export interface ApiConnection {
  api: ApiPromise | null;
  chain: Endpoint;
  network: string;
  status: ChainStatus;
  genesisHash: HexString;
  tokenSymbol: string;
}

/**
 * SS58 format control returned by useSs58Format
 */
export interface Ss58FormatControl {
  /** Current SS58 format number */
  ss58: number;
  /** Current chain key for SS58 */
  ss58Chain: string;
  /** Chain info for current SS58 format */
  chainInfo: Endpoint;
  /** Set SS58 chain by network key */
  setSs58Chain: (chain: string) => void;
}

/**
 * Listener type for ApiManager state changes
 */
export type ApiManagerListener = (apis: Record<string, ApiConnection>) => void;
