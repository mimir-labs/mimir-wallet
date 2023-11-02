// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, Registry, TypeDef } from '@polkadot/types/types';

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
