// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, IMethod, TypeDef } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { getTypeDef } from '@polkadot/types';
import { useMemo } from 'react';

import { useApi } from '@mimirdev/react-hooks';
import Params from '@mimirdev/react-params';

import Hex from '../Hex';

interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}
interface Extracted {
  callName: string;
  callHash: HexString;
  callData: HexString;
  params: Param[];
  values: Value[];
}

function extractState(value: IMethod): Extracted {
  const { method, section } = value.registry.findMetaCall(value.callIndex);
  const params = value.meta.args.map(
    ({ name, type }): Param => ({
      name: name.toString(),
      type: getTypeDef(type.toString())
    })
  );
  const values = value.args.map(
    (value): Value => ({
      isValid: true,
      value
    })
  );

  return {
    callName: `${section}.${method}`,
    callHash: value.hash.toHex(),
    callData: value.toHex(),
    params,
    values
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

function Call({ extrinsic }: { extrinsic: IMethod }) {
  const { api } = useApi();

  const { callData, callHash, callName, params, values } = useMemo(() => extractState(extrinsic), [extrinsic]);

  return (
    <Stack spacing={2.5}>
      <Typography color='primary.main' fontWeight={700} variant='h6'>
        Call
      </Typography>
      <Box>
        <Typography fontWeight={700} mb={0.5}>
          Action
        </Typography>
        <Chip color='secondary' label={callName} variant='filled' />
      </Box>
      <Params params={params} registry={api.registry} values={values} />
      <Paper sx={{ padding: 1.25, bgcolor: 'secondary.main' }}>
        <CallHash label='Call Hash' value={callHash} />
        <CallHash label='Call Data' value={callData} />
      </Paper>
    </Stack>
  );
}

export default Call;
