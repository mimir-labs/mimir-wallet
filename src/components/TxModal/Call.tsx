// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import { useApi } from '@mimirdev/hooks';
import { Call as CallComp } from '@mimirdev/params';

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

function CallHash({ label, value }: { label: string; value: HexString }) {
  return (
    <Stack direction='row' spacing={3}>
      <Typography fontSize='0.75rem' fontWeight={700}>
        {label}
      </Typography>
      <Hex color='text.secondary' fontSize='0.75rem' fontWeight={700} value={value} />
    </Stack>
  );
}

function Call({ isCancelled, method }: { isCancelled: boolean; method: IMethod }) {
  const { api } = useApi();

  const { callData, callHash, callName } = useMemo(() => extractState(method), [method]);

  return (
    <Stack spacing={2.5}>
      <Typography color='primary.main' fontWeight={700} variant='h6'>
        {isCancelled ? 'Cancel Call' : 'Call'}
      </Typography>
      <Box>
        <Typography fontWeight={700} mb={0.5}>
          Action
        </Typography>
        <Chip color='secondary' label={callName} variant='filled' />
      </Box>
      <CallComp api={api} call={method} />
      <Paper sx={{ padding: 1.25, bgcolor: 'secondary.main' }}>
        <CallHash label='Call Hash' value={callHash} />
        <CallHash label='Call Data' value={callData} />
      </Paper>
    </Stack>
  );
}

export default Call;
