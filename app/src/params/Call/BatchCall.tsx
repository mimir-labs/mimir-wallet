// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { CallProps } from './types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { ellipsisMixin } from '@/components/utils';
import { Call as CallComp, FunctionArgs } from '@/params';
import { isArray } from '@polkadot/util';
import React, { forwardRef, useMemo, useState } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import CallDisplayDetail from '../CallDisplay/CallDisplayDetail';
import CallDisplayDetailMinor from '../CallDisplay/CallDisplayDetailMinor';
import CallDisplaySection from '../CallDisplay/CallDisplaySection';
import { mergeClasses } from './utils';

function Item({
  from,
  call,
  index,
  registry,
  isOpen,
  toggleOpen
}: {
  index: number;
  isOpen: boolean;
  toggleOpen: () => void;
} & CallProps) {
  const action = useMemo(() => (call ? findAction(registry, call) : null), [registry, call]);

  const Top = (
    <div
      className='grid h-10 cursor-pointer grid-cols-9 gap-1 px-2 text-xs sm:grid-cols-12 sm:px-3 md:grid-cols-9 lg:grid-cols-12'
      onClick={toggleOpen}
    >
      <div className='col-span-1 flex items-center'>{index}</div>
      <div style={ellipsisMixin()} className='col-span-4 flex items-center'>
        <CallDisplaySection section={action?.[0]} method={action?.[1]} />
      </div>
      <div className='col-span-3 flex items-center'>
        <CallDisplayDetail registry={registry} call={call} />
      </div>
      <div className='col-span-3 hidden items-center sm:flex md:hidden lg:flex'>
        <CallDisplayDetailMinor registry={registry} call={call} />
      </div>
      <div className='col-span-1 flex items-center justify-end'>
        <Button
          isIconOnly
          size='sm'
          data-state={isOpen ? 'open' : 'closed'}
          className='rotate-0 justify-self-end text-xs transition-transform data-[state=open]:rotate-180'
          color='primary'
          variant='light'
          continuePropagation
        >
          <ArrowDown className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );

  return (
    <div className='bg-secondary overflow-hidden rounded-[10px]'>
      {Top}
      {isOpen && (
        <div className='bg-content1 mr-2 mb-2 ml-2 space-y-2 rounded-[10px] p-2 sm:mr-3 sm:mb-3 sm:ml-3 sm:space-y-3 sm:p-3'>
          <CallComp showFallback fallbackComponent={FunctionArgs} from={from} registry={registry} call={call} />
        </div>
      )}
    </div>
  );
}

const BatchCall = forwardRef<HTMLDivElement | null, CallProps>((props, ref) => {
  const { from, registry, call, className, showFallback, fallbackComponent: FallbackComponent = FunctionArgs } = props;
  const [isOpen, setOpen] = useState<Record<number, boolean>>({});

  const calls: Call[] | null = isArray(call.args?.[0]) ? (call.args[0] as Call[]) : null;

  if (!calls) {
    return showFallback ? <FallbackComponent ref={ref} {...props} /> : null;
  }

  return (
    <div className={mergeClasses('w-full space-y-2.5', className)} ref={ref}>
      <div className='flex items-center justify-between text-sm font-bold'>
        Actions
        <div>
          <Button
            color='primary'
            size='sm'
            variant='light'
            onClick={() =>
              setOpen(
                Array.from({ length: calls.length }).reduce<Record<number, boolean>>((result, _, index) => {
                  result[index] = true;

                  return result;
                }, {})
              )
            }
          >
            Expand all
          </Button>
          <Button
            color='primary'
            size='sm'
            variant='light'
            onClick={() =>
              setOpen(
                Array.from({ length: calls.length }).reduce<Record<number, boolean>>((result, _, index) => {
                  result[index] = false;

                  return result;
                }, {})
              )
            }
          >
            Collapse all
          </Button>
        </div>
      </div>
      {calls.map((call, index) => (
        <Item
          from={from}
          index={index + 1}
          key={index}
          isOpen={!!isOpen[index]}
          call={call}
          registry={registry}
          toggleOpen={() =>
            setOpen((values) => ({
              ...values,
              [index]: !values[index]
            }))
          }
          fallbackComponent={FallbackComponent}
        />
      ))}
    </div>
  );
});

BatchCall.displayName = 'BatchCall';

export default React.memo(BatchCall);
