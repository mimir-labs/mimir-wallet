// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call as ICall } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { ParamDef, RawParam } from './types';

import { getTypeDef } from '@polkadot/types';

export function findAction(api: ApiPromise, call: IMethod | ICall): [string, string] {
  try {
    const callFunc = api.registry.findMetaCall(call.callIndex);

    return [callFunc.section, callFunc.method];
  } catch {
    return ['unknown', 'unknown'];
  }
}

export function extractParams(value: IMethod) {
  const params = value.meta.args.map(
    ({ name, type }): ParamDef => ({
      name: name.toString(),
      type: getTypeDef(type.toString())
    })
  );
  const values = value.args.map(
    (value): RawParam => ({
      isValid: true,
      value
    })
  );

  return { params, values };
}
