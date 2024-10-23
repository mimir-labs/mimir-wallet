// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypeDef } from '@polkadot/types/types';
import type { CallProps } from './types';

import { getTypeDef } from '@polkadot/types';
import React, { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';

import Item from './Param/Item';
import Param from './Param';

function FunctionArgs({ api, call, jsonFallback }: CallProps) {
  const [args, setArgs] = useState<[string, TypeDef][]>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const callFunction = api.registry.findMetaCall(call.callIndex);

      setArgs(callFunction.meta.args.map((item) => [item.name.toString(), getTypeDef(item.type.toString())]));
    } catch {
      /* empty */
    }

    setDone(true);
  }, [api.registry, call]);

  return done ? (
    <>
      {args ? (
        args.map(([name, type], index) => (
          <Item
            key={index}
            content={<Param name={name} registry={api.registry} type={type} value={call.args[index]} />}
            name={name}
          />
        ))
      ) : jsonFallback ? (
        <ReactJson enableClipboard indentWidth={2} src={call.toHuman() as any} theme='summerfruit:inverted' />
      ) : null}
    </>
  ) : null;
}

export default React.memo(FunctionArgs);
