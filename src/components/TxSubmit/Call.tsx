// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid2 as Grid,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { useMemo } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { Call as CallComp } from '@mimir-wallet/params';

import Hex from '../Hex';

interface Extracted {
  callName: string;
  callHash: HexString;
  callData: HexString;
}

function extractState(value: IMethod): Extracted {
  const { method, section } = value.registry.findMetaCall(value.callIndex);

  return {
    callName: `${section}.${method}`,
    callHash: value.hash.toHex(),
    callData: value.toHex()
  };
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid container spacing={1} size={10} sx={{ fontSize: '0.75rem' }}>
      <Grid sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }} size={3}>
        {label}
      </Grid>
      <Grid sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }} size={7}>
        {value}
      </Grid>
    </Grid>
  );
}

function Call({ account, method }: { account: string; method: IMethod }) {
  const { api } = useApi();

  const { callData, callHash, callName } = useMemo(() => extractState(method), [method]);
  const [isOpen, toggleOpen] = useToggle();

  const details = (
    <Stack
      spacing={0.4}
      sx={{ bgcolor: 'secondary.main', borderRadius: 1, padding: 1 }}
      className='bg-secondary rounded-small p-2.5 space-y-1'
    >
      <Item label='Call Hash' value={<Hex value={callHash} withCopy />} />
      <Item label='Call Data' value={<Hex value={callData} withCopy />} />
    </Stack>
  );

  return (
    <Box>
      <Typography fontWeight={700}>Transaction details</Typography>
      <Accordion
        defaultExpanded
        variant='outlined'
        sx={{ padding: 0, marginTop: 1, bgcolor: 'transparent', border: 'none' }}
      >
        <AccordionSummary
          expandIcon={<SvgIcon component={ArrowDown} inheritViewBox color='inherit' />}
          sx={{ bgcolor: 'transparent', height: 'auto', color: 'primary.main' }}
        >
          {callName}
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            padding: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <CallComp from={account} api={api} call={method} jsonFallback />
          <Divider />

          <Box
            onClick={toggleOpen}
            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem' }}
          >
            {isOpen ? 'Hide Details' : 'View Details'}
          </Box>
          {isOpen ? details : null}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default Call;
