// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { CallProps } from '../types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { ellipsisMixin } from '@/components/utils';
import { Call as CallComp } from '@/params';
import { isArray } from '@polkadot/util';
import React, { useMemo, useState } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import CallDisplayDetail from '../CallDisplay/CallDisplayDetail';
import CallDisplayDetailMinor from '../CallDisplay/CallDisplayDetailMinor';
import CallDisplaySection from '../CallDisplay/CallDisplaySection';
import FunctionArgs from './FunctionArgs';

function Item({
  from,
  call,
  index,
  registry,
  jsonFallback,
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
      className='cursor-pointer h-10 px-2 sm:px-3 text-tiny grid grid-cols-9 sm:grid-cols-12 md:grid-cols-9 lg:grid-cols-12 gap-1'
      onClick={toggleOpen}
    >
      <div className='flex col-span-1 items-center'>{index}</div>
      <div style={ellipsisMixin()} className='flex col-span-4 items-center'>
        <CallDisplaySection section={action?.[0]} method={action?.[1]} />
      </div>
      <div className='flex col-span-3 items-center'>
        <CallDisplayDetail registry={registry} call={call} />
      </div>
      <div className='hidden sm:flex md:hidden lg:flex col-span-3 items-center'>
        <CallDisplayDetailMinor registry={registry} call={call} />
      </div>
      <div className='flex col-span-1 items-center justify-end'>
        <Button
          isIconOnly
          size='sm'
          data-state={isOpen ? 'open' : 'closed'}
          className='justify-self-end rotate-0 data-[state=open]:rotate-180 text-tiny transition-transform'
          color='primary'
          variant='light'
          onPress={(e) => e.continuePropagation()}
        >
          <ArrowDown className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );

  return (
    <div className='rounded-medium overflow-hidden bg-secondary'>
      {Top}
      {isOpen && (
        <div className='space-y-2 sm:space-y-3 mb-2 sm:mb-3 ml-2 sm:ml-3 mr-2 sm:mr-3 bg-content1 rounded-medium p-2 sm:p-3'>
          <CallComp from={from} registry={registry} call={call} jsonFallback={jsonFallback} />
        </div>
      )}
    </div>
  );
}

function BatchCall({ from, registry, call, jsonFallback, ...props }: CallProps) {
  const [isOpen, setOpen] = useState<Record<number, boolean>>({});

  const calls: Call[] | null = isArray(call.args?.[0]) ? (call.args[0] as Call[]) : null;

  if (!calls) {
    return <FunctionArgs from={from} registry={registry} call={call} jsonFallback={jsonFallback} {...props} />;
  }

  return (
    <div className='w-full space-y-2.5'>
      <div className='flex items-center justify-between font-bold text-small'>
        Actions
        <div>
          <Button
            color='primary'
            size='sm'
            variant='light'
            onPress={() =>
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
            onPress={() =>
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
          jsonFallback={jsonFallback}
          toggleOpen={() =>
            setOpen((values) => ({
              ...values,
              [index]: !values[index]
            }))
          }
        />
      ))}
    </div>
  );
}

export default React.memo(BatchCall);
