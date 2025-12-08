// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';

import kusamaChains from '../chains/kusama.json' with { type: 'json' };
import paseoChains from '../chains/paseo.json' with { type: 'json' };
import polkadotChains from '../chains/polkadot.json' with { type: 'json' };
import solochainChains from '../chains/solochain.json' with { type: 'json' };
import westendChains from '../chains/westend.json' with { type: 'json' };

/**
 * Union type of all chain configurations from JSON files
 */
type AllChains =
  | (typeof polkadotChains)[number]
  | (typeof kusamaChains)[number]
  | (typeof paseoChains)[number]
  | (typeof westendChains)[number]
  | (typeof solochainChains)[number];

/**
 * Get all possible keys from a union (union of keys)
 */
type AllKeys<T> = T extends unknown ? keyof T : never;

/**
 * Get keys that exist in ALL union members (intersection of keys)
 * keyof Union returns only shared keys
 */
type SharedKeys<T> = keyof T;

/**
 * Get keys that exist in SOME but not ALL union members
 */
type OptionalKeys<T> = Exclude<AllKeys<T>, SharedKeys<T>>;

/**
 * Get the type of a key from any member of the union
 */
type UnionValue<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never;

/**
 * Widen literal types to base types
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

/**
 * Required fields: exist in ALL chain configs, non-optional
 * Except genesisHash which is overridden to HexString, and wsUrl to Record<string, string>
 */
type RequiredFieldsFromJSON = {
  [K in Exclude<SharedKeys<AllChains>, 'genesisHash' | 'wsUrl'>]: Widen<
    AllChains[K]
  >;
};

/**
 * Optional fields: exist in SOME but not ALL chain configs
 */
type OptionalFieldsFromJSON = {
  [K in OptionalKeys<AllChains>]?: Widen<UnionValue<AllChains, K>>;
};

/**
 * Endpoint type: automatically derived from JSON
 * - Fields in ALL chains -> required
 * - Fields in SOME chains -> optional
 * - genesisHash -> HexString (type safety)
 * - wsUrl -> Record<string, string> (different providers per chain)
 */
export type Endpoint = RequiredFieldsFromJSON &
  OptionalFieldsFromJSON & {
    genesisHash: HexString;
    wsUrl: Record<string, string>;
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
  /** WebSocket is physically connected (socket level) */
  isApiConnected: boolean;
  /** API is fully initialized and ready for use */
  isApiReady: boolean;
  /** API instance has been created (connection attempt started) */
  isApiInitialized: boolean;
  /** Error message if connection failed */
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
