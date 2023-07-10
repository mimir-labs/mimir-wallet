// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import { Box, Divider, Paper, Stack, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { IconAddFill, IconFailedFill, IconInfoFill, IconSuccessFill, IconWaitingFill } from '@mimirdev/app-config/icons';
import { AddressSmall } from '@mimirdev/react-components';
import { getAddressMeta } from '@mimirdev/react-components/utils';
import { MultisigStatus } from '@mimirdev/react-hooks/types';

function getAddressInfo(address?: string): [threshold: number, owners: string[]] {
  if (!address) return [0, []];

  const meta = getAddressMeta(address);

  return [meta.threshold || 0, (meta.who as string[]) || []];
}

function AddIcon() {
  return <IconAddFill />;
}

function InfoIcon() {
  return <IconInfoFill />;
}

function WaitingIcon() {
  return <IconWaitingFill />;
}

function SuccessIcon() {
  return <IconSuccessFill />;
}

function FailIcon() {
  return <IconFailedFill />;
}

function Process({ accountId, approvals, status }: { accountId: string; approvals: (string | AccountId)[]; status: MultisigStatus }) {
  const [threshold, owners] = useMemo(() => getAddressInfo(accountId), [accountId]);

  return (
    <Stack bgcolor='secondary.main' component={Paper} minWidth={280} padding={2} spacing={1} variant='elevation'>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          <Typography sx={{ color: 'primary.main' }} variant='h6'>
            Process
          </Typography>
          <Box component='span'>
            {approvals.length}/{threshold} in {owners.length}
          </Box>
        </Box>
        <Box sx={{ marginTop: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {Array.from({ length: threshold }).map((_, index) => (
            <Box
              key={index}
              sx={{
                bgcolor: 'primary.main',
                height: 6,
                borderRadius: '3px',
                flex: '1',
                opacity: index < approvals.length ? 1 : 0.1
              }}
            />
          ))}
        </Box>
      </Box>
      <Divider />
      <Stepper activeStep={1} orientation='vertical'>
        <Step>
          <StepLabel StepIconComponent={AddIcon} StepIconProps={{ sx: { fontSize: '1.5rem' } }}>
            Created
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={InfoIcon} StepIconProps={{ sx: { fontSize: '1.5rem' } }}>
            Confirmations
          </StepLabel>
          <StepContent>
            <Stack spacing={1}>
              {approvals.map((account) => (
                <Box key={account.toString()} sx={{ padding: 1, borderRadius: 1, bgcolor: 'secondary.main' }}>
                  <AddressSmall value={account} />
                </Box>
              ))}
            </Stack>
          </StepContent>
        </Step>
        <Step>
          <StepLabel StepIconComponent={status === MultisigStatus.Created ? WaitingIcon : status === MultisigStatus.Executed ? SuccessIcon : FailIcon} StepIconProps={{ sx: { fontSize: '1.5rem' } }}>
            <Typography color={status === MultisigStatus.Created ? undefined : 'text.primary'} fontWeight={700}>
              {status === MultisigStatus.Created ? 'Waiting' : status === MultisigStatus.Executed ? 'Executed' : 'Canceled'}
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>
    </Stack>
  );
}

export default React.memo(Process);
