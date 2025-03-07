// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call as ICall } from '@polkadot/types/interfaces';
import type { Codec, IMethod, Registry } from '@polkadot/types/types';
import type { ParamDef } from './types';

import { getTypeDef } from '@polkadot/types';

export function findAction(registry: Registry, call: IMethod | ICall): [string, string] | null {
  try {
    const callFunc = registry.findMetaCall(call.callIndex);

    return [callFunc.section, callFunc.method];
  } catch {
    return null;
  }
}

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
