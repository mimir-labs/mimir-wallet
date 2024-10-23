// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { Codec, IMethod, Registry, TypeDef } from '@polkadot/types/types';

export interface ParamDef {
  name: string;
  type: TypeDef;
}

export interface ParamsProps {
  type: TypeDef;
  values: Codec[];
  registry: Registry;
}

export interface CallProps {
  from?: string;
  call: Call | IMethod;
  api: ApiPromise;
  jsonFallback?: boolean;
}
