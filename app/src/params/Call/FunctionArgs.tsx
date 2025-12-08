// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';
import type { TypeDef } from '@polkadot/types/types';

import { getTypeDef } from '@polkadot/types';
import React, { forwardRef, useMemo } from 'react';

import { balanceCalls, balanceCallsOverrides } from '../overrides';
import Param from '../Param';
import Item from '../Param/Item';

import { mergeClasses } from './utils';

const FunctionArgs = forwardRef<HTMLDivElement | null, CallProps>(
  ({ registry, call, displayType, className }, ref) => {
    // Derive args and overrides from registry and call
    const { args, overrides } = useMemo(() => {
      try {
        const callFunction = registry.findMetaCall(call.callIndex);
        const action = `${callFunction.section}.${callFunction.method}`;

        return {
          args: callFunction.meta.args.map((item): [string, TypeDef] => [
            item.name.toString(),
            getTypeDef(item.type.toString()),
          ]),
          overrides: balanceCalls.includes(action)
            ? balanceCallsOverrides
            : undefined,
        };
      } catch {
        return { args: undefined, overrides: undefined };
      }
    }, [registry, call]);

    const done = true;

    return done ? (
      <div
        ref={ref}
        className={mergeClasses(
          'bg-secondary flex w-full shrink-0 flex-col gap-2.5 rounded-[10px] p-2.5',
          className,
        )}
      >
        {args ? (
          args.length > 0 ? (
            args.map(([name, type], index) => (
              <Item
                type={displayType}
                key={index}
                content={
                  <Param
                    displayType={displayType}
                    name={name}
                    overrides={overrides}
                    registry={registry}
                    type={type}
                    value={call.args[index]}
                  />
                }
                name={name}
              />
            ))
          ) : (
            <span className="font-bold">No parameter</span>
          )
        ) : null}
      </div>
    ) : null;
  },
);

FunctionArgs.displayName = 'FunctionArgs';

export default React.memo(FunctionArgs);
