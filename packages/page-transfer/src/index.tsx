// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';

import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AddressRow, InputAddress, InputNumber, TxButton } from '@mimirdev/react-components';
import { useApi, useCall } from '@mimirdev/react-hooks';

function PageTransfer() {
  const { api } = useApi();
  const navigate = useNavigate();
  const { sender } = useParams<{ sender?: string }>();
  const [sending, setSending] = useState<string | undefined>(sender);
  const [recipient, setRecipient] = useState<string>();
  const [amount, setAmount] = useState<BN>();

  const sendingBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [sending]);
  const recipientBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [recipient]);

  return (
    <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <Typography variant='h3'>Transfer</Typography>
          {sender ? (
            <Paper sx={{ padding: 1.25, bgcolor: 'secondary.main' }}>
              <AddressRow balance={sendingBalances?.freeBalance} size='small' value={sender} withBalance />
            </Paper>
          ) : (
            <InputAddress balance={sendingBalances?.freeBalance} label='Sending From' onChange={setSending} placeholder='Sender' withBalance />
          )}
          <Divider />
          <InputAddress balance={recipientBalances?.freeBalance} label='Recipient' onChange={setRecipient} placeholder='Recipient' withBalance />
          <InputNumber label='Amount' maxValue={sendingBalances?.freeBalance} onChange={setAmount} placeholder='Input amount' withMax />
          <TxButton accountId={sending} disabled={!amount || !recipient} fullWidth params={[recipient, amount]} tx={api.tx.balances?.transferKeepAlive} variant='contained'>
            Review
          </TxButton>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
