// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/promise/types';
import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from '@mimir-wallet/config';

// helpers for HOC props
export type OmitProps<T, K> = Pick<T, Exclude<keyof T, K>>;
export type SubtractProps<T, K> = OmitProps<T, keyof K>;

export interface BareProps {
  className?: string;
}

export interface ApiState {
  apiDefaultTx: SubmittableExtrinsicFunction;
  apiDefaultTxSudo: SubmittableExtrinsicFunction;
  chainSS58: number;
  isApiReady: boolean;
  isDevelopment: boolean;
  specName: string;
  specVersion: string;
  systemChain: string;
  systemName: string;
  systemVersion: string;
  tokenSymbol: string;
  genesisHash: HexString;
}

export interface ApiProps extends ApiState {
  api: ApiPromise;
  apiError: string | null;
  apiUrl: string;
  isApiConnected: boolean;
  isApiInitialized: boolean;
  network: string;
  chain: Endpoint;
  metadata: Record<string, HexString>;
  identityApi: ApiPromise | null;
}

export interface OnChangeCbObs {
  next: (value?: any) => any;
}

export type OnChangeCbFn = (value?: any) => any;
export type OnChangeCb = OnChangeCbObs | OnChangeCbFn;

export interface ChangeProps {
  callOnResult?: OnChangeCb;
}

export interface CallState {
  callResult?: unknown;
  callUpdated?: boolean;
  callUpdatedAt?: number;
}

export type CallProps = ApiProps & CallState;

export interface BaseProps<T> extends BareProps, CallProps, ChangeProps {
  children?: React.ReactNode;
  label?: string;
  render?: (value?: T) => React.ReactNode;
}

export type Formatter = (value?: any) => string;

export type Environment = 'web' | 'app';
