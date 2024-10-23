// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { Box, Button, Grid2 as Grid, IconButton, Stack, SvgIcon } from '@mui/material';
import { Call } from '@polkadot/types/interfaces';
import { isArray } from '@polkadot/util';
import React, { useMemo, useState } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';

import CallComp from './Call';
import { CallDisplayDetail, CallDisplayDetailMinor, CallDisplaySection } from './CallDisplay';
import FunctionArgs from './FunctionArgs';
import { findAction } from './utils';

function Item({
  from,
  call,
  index,
  api,
  jsonFallback,
  isOpen,
  toggleOpen
}: {
  index: number;
  isOpen: boolean;
  toggleOpen: () => void;
} & CallProps) {
  const action = useMemo(() => (call ? findAction(api, call) : null), [api, call]);

  const Top = (
    <Grid
      container
      columns={12}
      sx={{ cursor: 'pointer', height: 40, paddingX: 1.2, fontSize: '0.75rem' }}
      onClick={toggleOpen}
    >
      <Grid size={1} sx={{ display: 'flex', alignItems: 'center' }}>
        {index}
      </Grid>
      <Grid size={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <CallDisplaySection section={action?.[0]} method={action?.[1]} />
      </Grid>
      <Grid size={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <CallDisplayDetail api={api} call={call} />
      </Grid>
      <Grid size={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <CallDisplayDetailMinor api={api} call={call} />
      </Grid>

      <Grid size={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
        <IconButton
          size='small'
          sx={{ justifySelf: 'end', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.75rem' }}
          color='primary'
        >
          <SvgIcon inheritViewBox component={ArrowDown} />
        </IconButton>
      </Grid>
    </Grid>
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
          spacing={1}
          sx={{ marginBottom: 1, marginLeft: 1, marginRight: 1, bgcolor: 'white', borderRadius: 1, padding: 1 }}
        >
          <CallComp from={from} api={api} call={call} jsonFallback={jsonFallback} />
        </Stack>
      )}
    </Box>
  );
}

function BatchCall({ from, api, call, jsonFallback, ...props }: CallProps) {
  const [isOpen, setOpen] = useState<Record<number, boolean>>({});

  const calls: Call[] | null = isArray(call.args?.[0]) ? (call.args[0] as Call[]) : null;

  if (!calls) {
    return <FunctionArgs from={from} api={api} call={call} jsonFallback={jsonFallback} {...props} />;
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
          api={api}
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
