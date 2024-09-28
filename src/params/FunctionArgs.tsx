// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import React, { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';

import { AddressRow } from '@mimir-wallet/components';

import Item from './Param/Item';

function FunctionArgs({ api, call, jsonFallback }: CallProps) {
  const [args, setArgs] = useState<[string, string][]>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const callFunction = api.registry.findMetaCall(call.callIndex);

      setArgs(callFunction.meta.args.map((item) => [item.name.toString(), item.type.toString()]));
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
            content={
              type === 'AccountId' || type === 'MultiAddress' ? (
                <AddressRow value={call.args[index].toString()} withCopy size='small' />
              ) : (
                call.args[index]?.toString()
              )
            }
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
