// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
  displayType?: 'horizontal' | 'vertical';
  from?: string;
  call: Call | IMethod;
  registry: Registry;
  jsonFallback?: boolean;
}
