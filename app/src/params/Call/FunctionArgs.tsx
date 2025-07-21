// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypeDef } from '@polkadot/types/types';
import type { CallProps } from './types';

import { getTypeDef } from '@polkadot/types';
import React, { forwardRef, useEffect, useState } from 'react';

import Param from '../Param';
import Item from '../Param/Item';
import { mergeClasses } from './utils';

const FunctionArgs = forwardRef<HTMLDivElement | null, CallProps>(({ registry, call, displayType, className }, ref) => {
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
    <div ref={ref} className={mergeClasses('', className)}>
      {args
        ? args.map(([name, type], index) => (
            <Item
              type={displayType}
              key={index}
              content={
                <Param displayType={displayType} name={name} registry={registry} type={type} value={call.args[index]} />
              }
              name={name}
            />
          ))
        : null}
    </div>
  ) : null;
});

FunctionArgs.displayName = 'FunctionArgs';

export default React.memo(FunctionArgs);
