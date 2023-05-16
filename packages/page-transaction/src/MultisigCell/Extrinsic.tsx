// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Codec, IMethod, TypeDef } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { getTypeDef } from '@polkadot/types';
import React, { useMemo } from 'react';

import { ArrowDown } from '@mimirdev/app-config/icons';
import { useApi, useToggle } from '@mimirdev/react-hooks';
import Params from '@mimirdev/react-params';

import ApproveButton from './ApproveButton';
import CallDetail from './CallDetail';
import CancelButton from './CancelButton';

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
  fn: SubmittableExtrinsicFunction<'promise'>;
}

function extractState(api: ApiPromise, value: IMethod): Extracted {
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

  const fn: SubmittableExtrinsicFunction<'promise'> = api.tx[section]?.[method];

  return {
    callName: `${section}.${method}`,
    callHash: value.hash.toHex(),
    callData: value.toHex(),
    params,
    values,
    fn
  };
}

function Extrinsic({ accountId, depositor, method }: { accountId: string; depositor: string | AccountId | AccountIndex | Address; method: IMethod }) {
  const { api } = useApi();
  const { callData, callHash, callName, fn, params, values } = useMemo(() => extractState(api, method), [api, method]);
  const [detailOpen, toggleDetailOpen] = useToggle();

  return (
    <Stack spacing={1.5}>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: 'error.main' }} />
          <Typography color='primary.main' fontWeight={700} variant='h4'>
            No 233
          </Typography>
          <Chip color='secondary' label={callName} variant='filled' />
        </Stack>
      </Stack>
      <Divider />
      <Params params={params} registry={api.registry} type='tx' values={values} />
      {detailOpen ? (
        <CallDetail calldata={callData} callhash={callHash} depositor={depositor} />
      ) : (
        <Button color='secondary' fullWidth onClick={toggleDetailOpen} variant='contained'>
          Detail <ArrowDown color='inherit' sx={{ ml: 1, width: 11, height: 8 }} />
        </Button>
      )}
      <Box display='flex' gap={1.25}>
        <ApproveButton accountId={accountId} params={method.args} tx={fn} />
        <CancelButton accountId={accountId} params={method.args} tx={fn} />
      </Box>
    </Stack>
  );
}

export default React.memo(Extrinsic);
