// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { CallProps } from '../types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { ellipsisMixin } from '@/components/utils';
import { Call as CallComp } from '@/params';
import { Box, Button, IconButton, Stack, SvgIcon } from '@mui/material';
import { isArray } from '@polkadot/util';
import React, { useMemo, useState } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';

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
        <IconButton
          size='small'
          sx={{ justifySelf: 'end', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.75rem' }}
          color='primary'
        >
          <SvgIcon inheritViewBox component={ArrowDown} />
        </IconButton>
      </div>
    </div>
  );

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'secondary.main'
      }}
    >
      {Top}
      {isOpen && (
        <Stack
          spacing={{ sm: 1.2, xs: 0.8 }}
          sx={{
            marginBottom: { sm: 1.2, xs: 0.8 },
            marginLeft: { sm: 1.2, xs: 0.8 },
            marginRight: { sm: 1.2, xs: 0.8 },
            bgcolor: 'white',
            borderRadius: 1,
            padding: { sm: 1.2, xs: 0.8 }
          }}
        >
          <CallComp from={from} registry={registry} call={call} jsonFallback={jsonFallback} />
        </Stack>
      )}
    </Box>
  );
}

function BatchCall({ from, registry, call, jsonFallback, ...props }: CallProps) {
  const [isOpen, setOpen] = useState<Record<number, boolean>>({});

  const calls: Call[] | null = isArray(call.args?.[0]) ? (call.args[0] as Call[]) : null;

  if (!calls) {
    return <FunctionArgs from={from} registry={registry} call={call} jsonFallback={jsonFallback} {...props} />;
  }

  return (
    <Stack spacing={1} width='100%'>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.875rem'
        }}
      >
        Actions
        <Box>
          <Button
            color='primary'
            size='small'
            variant='text'
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
            size='small'
            variant='text'
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
        </Box>
      </Box>
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
    </Stack>
  );
}

export default React.memo(BatchCall);
