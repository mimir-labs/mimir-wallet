// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { Codec, IMethod, Registry, TypeDef } from '@polkadot/types/types';

export type ParamType = 'base' | 'tx';

export interface ParamDef {
  name: string;
  type: TypeDef;
}

export interface RawParam {
  isValid: boolean;
  value: Codec;
}

export interface ParamsProps {
  params: ParamDef[];
  values: RawParam[];
  registry: Registry;
  type?: ParamType;
}

export interface CallProps extends Record<string, any> {
  call: Call | IMethod;
  api: ApiPromise;
  type?: ParamType;
  jsonFallback?: boolean;
}
