// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, Paper, Stack, Switch, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { FormatBalance, Input, InputAddress } from '@mimir-wallet/components';
import {
  useAccount,
  useAllAccounts,
  useApi,
  useInputNumber,
  useQueryParam,
  useSelectedAccount,
  useTxQueue
} from '@mimir-wallet/hooks';
import { formatUnits, isValidNumber, parseUnits } from '@mimir-wallet/utils';

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
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const { addQueue } = useTxQueue();
  const filtered = useAllAccounts();
  const { addresses } = useAccount();
  const [token, setToken] = useState<TransferToken>();
  const [format, sendingBalances] = useTransferBalance(token, sending);
  const [keepAlive, toggleKeepAlive] = useToggle(true);

  const isInsufficientBalance = keepAlive
    ? sendingBalances.sub(api.consts.balances.existentialDeposit).lt(new BN(parseUnits(amount, format[0]).toString()))
    : sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

  useEffect(() => {
    setAmount('');
  }, [assetId, setAmount]);

  const handleClick = useCallback(() => {
    if (recipient && sending && amount && token) {
      if (!isAmountValid) {
        return;
      }

      if (token.isNative) {
        addQueue({
          call: keepAlive
            ? api.tx.balances.transferKeepAlive(recipient, parseUnits(amount, format[0])).method
            : api.tx.balances.transferAllowDeath(recipient, parseUnits(amount, format[0])).method,
          accountId: sending,
          website: 'mimir://app/transfer'
        });
      } else {
        if (!api.tx.assets) return;

        addQueue({
          call: keepAlive
            ? api.tx.assets.transferKeepAlive(token.assetId, recipient, parseUnits(amount, format[0])).method
            : api.tx.assets.transfer(token.assetId, recipient, parseUnits(amount, format[0])).method,
          accountId: sending,
          website: 'mimir://app/transfer'
        });
      }
    }
  }, [addQueue, amount, api, format, isAmountValid, keepAlive, recipient, sending, token]);

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: { sm: 2, xs: 1.5 } }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <Typography variant='h3'>Transfer</Typography>
          <InputAddress
            filtered={filtered}
            format={format}
            isSign
            label='Sending From'
            onChange={setSending}
            placeholder='Sender'
            value={sending}
          />
          <Divider />
          <InputAddress
            filtered={filtered.concat(addresses.map((item) => item.address))}
            format={format}
            label='Recipient'
            onChange={setRecipient}
            placeholder='Recipient'
            value={recipient}
          />
          <Input
            error={isAmountValid ? null : new Error('Invalid number')}
            key={assetId}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Amount
                <span style={{ opacity: 0.5 }}>
                  Balance: <FormatBalance format={format} value={sendingBalances} />
                </span>
              </Box>
            }
            value={amount}
            onChange={setAmount}
            placeholder='Input amount'
            endAdornment={
              <Button
                size='small'
                variant='outlined'
                sx={{ borderRadius: 0.5, padding: 0.5, paddingY: 0.1, minWidth: 0 }}
                onClick={() => {
                  setAmount(
                    keepAlive
                      ? formatUnits(sendingBalances.sub(api.consts.balances.existentialDeposit), format[0])
                      : formatUnits(sendingBalances, format[0])
                  );
                }}
              >
                Max
              </Button>
            }
          />
          <Box sx={{ display: 'flex', justifyContent: 'end', gap: 0.5 }}>
            <Switch checked={keepAlive} onChange={(e) => toggleKeepAlive(e.target.checked)} />
            Keep Sender Alive
          </Box>
          <SelectToken assetId={assetId} onChange={setToken} setAssetId={setAssetId} />
          <Button
            disabled={!amount || !recipient || !isValidNumber || isInsufficientBalance}
            fullWidth
            onClick={handleClick}
            color={isInsufficientBalance ? 'error' : 'primary'}
          >
            {isInsufficientBalance ? `Insufficient ${format[1] || ''} balance` : 'Review'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
