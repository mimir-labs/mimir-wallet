// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Transaction } from '@mimir-wallet/hooks/types';

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
import moment from 'moment';
import { useMemo } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useToggle } from '@mimir-wallet/hooks/useToggle';
import { Call as CallComp } from '@mimir-wallet/params';

import Bytes from '../Bytes';
import Hash from '../Hash';

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

function Call({
  account,
  method,
  transaction
}: {
  account?: string;
  method: IMethod;
  transaction?: Transaction | null;
}) {
  const { api } = useApi();

  // TODO: check if the call is a multisig, if so, use the blake2 of the call data as the call hash
  const { callData, callHash, callName } = useMemo(() => extractState(method), [method]);
  const [isOpen, toggleOpen] = useToggle();

  const details = (
    <Stack spacing={0.4} sx={{ bgcolor: 'secondary.main', borderRadius: 1, padding: 1 }}>
      <Item label='Call Hash' value={<Hash value={callHash} withCopy />} />
      <Item label='Call Data' value={<Bytes value={callData} />} />

      {transaction?.note && <Item label='Call Data' value={transaction.note} />}
      {transaction?.createdBlock && <Item label='Created Block' value={transaction.createdBlock} />}
      {transaction?.createdExtrinsicHash && (
        <Item
          label='Created Extrinsic'
          value={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
        />
      )}
      {transaction?.createdAt && <Item label='Created Time' value={moment(transaction.createdAt).format()} />}
      {transaction?.executedBlock && <Item label='Executed Block' value={transaction.executedBlock} />}
      {transaction?.executedExtrinsicHash && (
        <Item
          label='Executed Extrinsic'
          value={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
        />
      )}
      {transaction?.cancelBlock && <Item label='Cancel Block' value={transaction.cancelBlock} />}
      {transaction?.cancelExtrinsicHash && (
        <Item label='Cancel Extrinsic' value={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />} />
      )}
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
          <CallComp from={account} registry={api.registry} call={method} jsonFallback />
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
