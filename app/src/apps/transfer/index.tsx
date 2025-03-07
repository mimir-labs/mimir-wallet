// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { useAccount } from '@/accounts/useAccount';
import { useAllAccounts } from '@/accounts/useGroupAccounts';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { FormatBalance, Input, InputAddress, TxButton } from '@/components';
import { useApi } from '@/hooks/useApi';
import { useAssetInfo } from '@/hooks/useAssets';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useQueryParam } from '@/hooks/useQueryParams';
import { formatUnits, parseUnits } from '@/utils';
import { Box, Button, Divider, Paper, Skeleton, Stack, Switch } from '@mui/material';
import { BN, isHex } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import SelectToken from './SelectToken';
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
  const filtered = useAllAccounts();
  const { addresses } = useAccount();
  const [token, setToken] = useState<TransferToken>();
  const [format, sendingBalances, isSendingFetched] = useTransferBalance(token, sending);
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [, assetExistentialDeposit] = useAssetInfo(token?.isNative ? null : token?.assetId);

  const existentialDeposit = token?.isNative ? api.consts.balances.existentialDeposit : assetExistentialDeposit;

  const isInsufficientBalance = keepAlive
    ? sendingBalances.sub(existentialDeposit).lt(new BN(parseUnits(amount, format[0]).toString()))
    : sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

  useEffect(() => {
    setAmount('');
  }, [setAmount]);

  const getCall = useCallback(() => {
    if (recipient && sending && amount && token) {
      if (!isAmountValid) {
        throw new Error('Invalid amount');
      }

      if (token.isNative) {
        return keepAlive
          ? api.tx.balances.transferKeepAlive(recipient, parseUnits(amount, format[0])).method
          : api.tx.balances.transferAllowDeath(recipient, parseUnits(amount, format[0])).method;
      }

      if (api.tx.assets || api.tx.foreignAssets) {
        return keepAlive
          ? api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transferKeepAlive(
              token.assetId,
              recipient,
              parseUnits(amount, format[0])
            ).method
          : api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transfer(
              token.assetId,
              recipient,
              parseUnits(amount, format[0])
            ).method;
      }

      if (api.tx.tokens) {
        return keepAlive
          ? api.tx.tokens.transferKeepAlive(recipient, token.assetId, parseUnits(amount, format[0])).method
          : api.tx.tokens.transfer(recipient, token.assetId, parseUnits(amount, format[0])).method;
      }
    }

    throw new Error('Invalid arguments');
  }, [amount, api, format, isAmountValid, keepAlive, recipient, sending, token]);

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: { sm: 2, xs: 1.5 } }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <h3>Transfer</h3>
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
                  setAmount(
                    keepAlive
                      ? formatUnits(sendingBalances.sub(existentialDeposit), format[0])
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
          <SelectToken address={sending} assetId={assetId} onChange={setToken} setAssetId={setAssetId} />
          <TxButton
            fullWidth
            color={isInsufficientBalance ? 'danger' : 'primary'}
            isDisabled={!(amount && recipient && isAmountValid && token)}
            accountId={sending}
            website='mimir://app/transfer'
            getCall={getCall}
          >
            {isInsufficientBalance ? `Insufficient ${format[1] || ''} balance` : 'Review'}
          </TxButton>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageTransfer;
