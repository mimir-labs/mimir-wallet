// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, Paper, Skeleton, Stack, SvgIcon, Switch, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { useAllAccounts } from '@mimir-wallet/accounts/useGroupAccounts';
import { useSelectedAccount } from '@mimir-wallet/accounts/useSelectedAccount';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import { FormatBalance, Input, InputAddress } from '@mimir-wallet/components';
import { UNIFIED_ADDRESS_FORMAT_KEY } from '@mimir-wallet/constants';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useInputNumber } from '@mimir-wallet/hooks/useInputNumber';
import { useQueryParam } from '@mimir-wallet/hooks/useQueryParams';
import { formatUnits, store } from '@mimir-wallet/utils';

import SelectToken from './SelectToken';
import SendButton from './SendButton';
import { TransferToken } from './types';
import { useTransferBalance } from './useTransferBalances';

function PageTransfer() {
  const { chain } = useApi();
  const navigate = useNavigate();
  const selected = useSelectedAccount();
  const [fromParam] = useQueryParam<string>('from');
  const [toParam] = useQueryParam<string>('to');
  const [assetId, setAssetId] = useQueryParam<string>('assetId', 'native', { replace: true });
  const [sending, setSending] = useState<string | undefined>(fromParam || selected || '');
  const [recipient, setRecipient] = useState<string>(toParam || '');
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const filtered = useAllAccounts();
  const { addresses } = useAccount();
  const [token, setToken] = useState<TransferToken>();
  const [format, sendingBalances, isSendingFetched] = useTransferBalance(token, sending);
  const enableUnified = useMemo(
    () => chain.relayChainSs58Format !== undefined && store.get(UNIFIED_ADDRESS_FORMAT_KEY) === 'unified',
    [chain.relayChainSs58Format]
  );
  const [notCex, toggleNotCex] = useToggle(false);

  useEffect(() => {
    setAmount('');
  }, [assetId, setAmount]);

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: { sm: 2, xs: 1.5 } }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: { xs: 2, sm: 2.5 }, borderRadius: '20px', marginTop: 1.25 }}>
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
                {!isSendingFetched ? (
                  <Skeleton variant='text' width={50} height={14} />
                ) : (
                  <span style={{ opacity: 0.5 }}>
                    Balance: <FormatBalance format={format} value={sendingBalances} />
                  </span>
                )}
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
                  setAmount(formatUnits(sendingBalances, format[0]));
                }}
              >
                Max
              </Button>
            }
          />

          {enableUnified && (
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                NOT sending to CEX
                <Switch checked={notCex} onChange={(e) => toggleNotCex(e.target.checked)} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <SvgIcon inheritViewBox component={IconInfo} color='error' />
                <Typography fontSize='0.75rem' color='textSecondary'>
                  I confirm that I am not sending funds to centralized exchange as it would result in loss of funds.
                </Typography>
              </Box>
            </Stack>
          )}

          <SelectToken address={sending} assetId={assetId} onChange={setToken} setAssetId={setAssetId} />

          <SendButton
            amount={amount}
            recipient={recipient}
            isAmountValid={isAmountValid}
            enableUnified={enableUnified}
            notCex={notCex}
            format={format}
            token={token}
            sending={sending}
            sendingBalances={sendingBalances}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
