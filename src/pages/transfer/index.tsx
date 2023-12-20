// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';

import { InputAddress, InputNumber } from '@mimir-wallet/components';
import { useAddresses, useApi, useCall, useSelectedAccount, useTxQueue, useVisibleAccounts } from '@mimir-wallet/hooks';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PageTransfer() {
  const { api } = useApi();
  const navigate = useNavigate();
  const selected = useSelectedAccount();
  const [sending, setSending] = useState<string | undefined>(selected);
  const [recipient, setRecipient] = useState<string>();
  const [amount, setAmount] = useState<BN>();
  const { addQueue } = useTxQueue();
  const filtered = useVisibleAccounts();
  const { allAddresses } = useAddresses();
  const [amountError, setAmountError] = useState<Error | null>(null);

  const sendingBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [sending]);
  const recipientBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [recipient]);

  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      setAmountError(null);
    }
  }, [amount]);

  const handleClick = useCallback(() => {
    if (recipient && sending && amount) {
      if (isNaN(Number(amount))) {
        setAmountError(new Error('Please input number value'));

        return;
      }

      addQueue({
        extrinsic: api.tx.balances.transferKeepAlive(recipient, amount),
        accountId: sending
      });
    }
  }, [addQueue, amount, api.tx.balances, recipient, sending]);

  return (
    <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <Typography variant='h3'>Transfer</Typography>
          <InputAddress balance={sendingBalances?.freeBalance} filtered={filtered} isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} withBalance />
          <Divider />
          <InputAddress balance={recipientBalances?.freeBalance} filtered={filtered.concat(allAddresses)} label='Recipient' onChange={setRecipient} placeholder='Recipient' withBalance />
          <InputNumber error={amountError} label='Amount' maxValue={sendingBalances?.freeBalance} onChange={setAmount} placeholder='Input amount' withMax />
          <Button disabled={!amount || !recipient} fullWidth onClick={handleClick}>
            Review
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
