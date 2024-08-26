// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { type BN, BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InputAddress, InputNumber } from '@mimir-wallet/components';
import {
  useAddresses,
  useAllAccounts,
  useApi,
  useQueryParam,
  useSelectedAccount,
  useTxQueue
} from '@mimir-wallet/hooks';

import SelectToken from './SelectToken';
import { TransferToken } from './types';
import { useTransferBalance } from './useTransferBalances';

function PageTransfer() {
  const { api } = useApi();
  const navigate = useNavigate();
  const selected = useSelectedAccount();
  const [fromParam] = useQueryParam<string>('from');
  const [toParam] = useQueryParam<string>('to');
  const [assetId, setAssetId] = useQueryParam<string>('assetId', 'native', { replace: true });
  const [sending, setSending] = useState<string | undefined>(fromParam || selected || '');
  const [recipient, setRecipient] = useState<string>(toParam || '');
  const [amount, setAmount] = useState<BN>(BN_ZERO);
  const { addQueue } = useTxQueue();
  const filtered = useAllAccounts();
  const { allAddresses } = useAddresses();
  const [amountError, setAmountError] = useState<Error | null>(null);
  const [token, setToken] = useState<TransferToken>();
  const [format, sendingBalances, recipientBalances] = useTransferBalance(token, sending, recipient);

  useEffect(() => {
    setAmount(BN_ZERO);
  }, [assetId]);

  useEffect(() => {
    if (amount && amount.gt(BN_ZERO)) {
      setAmountError(null);
    }
  }, [amount]);

  const handleClick = useCallback(() => {
    if (recipient && sending && amount && token) {
      if (Number.isNaN(Number(amount))) {
        setAmountError(new Error('Please input number value'));

        return;
      }

      if (token.isNative) {
        addQueue({
          extrinsic: api.tx.balances.transferKeepAlive(recipient, amount),
          accountId: sending
        });
      } else {
        if (!api.tx.assets) return;

        addQueue({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          extrinsic: api.tx.assets.transferKeepAlive(token.assetId, recipient, amount),
          accountId: sending
        });
      }
    }
  }, [addQueue, amount, api, recipient, sending, token]);

  return (
    <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <Typography variant='h3'>Transfer</Typography>
          <InputAddress
            balance={sendingBalances}
            filtered={filtered}
            format={format}
            isSign
            label='Sending From'
            onChange={setSending}
            placeholder='Sender'
            value={sending}
            withBalance
          />
          <Divider />
          <InputAddress
            balance={recipientBalances}
            filtered={filtered.concat(allAddresses)}
            format={format}
            label='Recipient'
            onChange={setRecipient}
            placeholder='Recipient'
            value={recipient}
            withBalance
          />
          <InputNumber
            error={amountError}
            format={format}
            key={assetId}
            label='Amount'
            maxValue={sendingBalances}
            onChange={setAmount}
            placeholder='Input amount'
            withMax
          />
          <SelectToken assetId={assetId} onChange={setToken} setAssetId={setAssetId} />
          <Button disabled={!amount || !recipient || amount.eq(BN_ZERO)} fullWidth onClick={handleClick}>
            Review
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
