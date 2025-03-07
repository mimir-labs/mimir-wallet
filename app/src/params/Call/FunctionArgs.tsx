// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypeDef } from '@polkadot/types/types';
import type { CallProps } from '../types';

import JsonView from '@/components/JsonView';
import { getTypeDef } from '@polkadot/types';
import React, { useEffect, useState } from 'react';

import Param from '../Param';
import Item from '../Param/Item';

function FunctionArgs({ registry, call, jsonFallback, displayType }: CallProps) {
  const [args, setArgs] = useState<[string, TypeDef][]>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const callFunction = registry.findMetaCall(call.callIndex);

      setArgs(callFunction.meta.args.map((item) => [item.name.toString(), getTypeDef(item.type.toString())]));
    } catch {
      /* empty */
    }

    setDone(true);
  }, [registry, call]);

  return done ? (
    <>
      {args ? (
        args.map(([name, type], index) => (
          <Item
            type={displayType}
            key={index}
            content={
              <Param displayType={displayType} name={name} registry={registry} type={type} value={call.args[index]} />
            }
            name={name}
          />
        ))
      ) : jsonFallback ? (
        <JsonView data={call.toHuman()} />
      ) : null}
    </>
  ) : null;
}

export default React.memo(FunctionArgs);
