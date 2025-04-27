// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, IMethod } from '@polkadot/types/types';
import type { ParamDef } from './types';

import { getTypeDef } from '@polkadot/types';

export function extractParams(value: IMethod) {
  const params = value.meta.args.map(
    ({ name, type }): ParamDef => ({
      name: name.toString(),
      type: getTypeDef(type.toString())
    })
  );
  const values: Codec[] = value.args;

  return { params, values };
}
