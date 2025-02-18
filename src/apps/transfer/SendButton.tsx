// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { TransferToken } from './types';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { BN, isHex } from '@polkadot/util';
import { useCallback } from 'react';
import { useToggle } from 'react-use';

import { FormatBalance } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useAssetInfo } from '@mimir-wallet/hooks/useAssets';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';
import { parseUnits } from '@mimir-wallet/utils';

function SendButton({
  amount,
  recipient,
  isAmountValid,
  enableUnified,
  notCex,
  format,
  sending,
  token,
  sendingBalances
}: {
  sending?: string;
  token?: TransferToken;
  sendingBalances: BN;
  amount: string;
  recipient: string;
  isAmountValid: boolean;
  enableUnified: boolean;
  notCex: boolean;
  format: [decimals: number, symbol: string];
}) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const [, assetExistentialDeposit] = useAssetInfo(token?.isNative ? null : token?.assetId);
  const [open, toggleOpen] = useToggle(false);
  const existentialDeposit = token?.isNative ? api.consts.balances.existentialDeposit : assetExistentialDeposit;
  const isInsufficientBalance = sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

  const handleTransferKeepAlive = useCallback(
    (api: ApiPromise, address: string, token: TransferToken, recipient: string, amount: bigint) => {
      if (token.isNative) {
        addQueue({
          call: api.tx.balances.transferAllowDeath(recipient, amount).method,
          accountId: address,
          website: 'mimir://app/transfer'
        });
      } else {
        if (api.tx.assets || api.tx.foreignAssets) {
          addQueue({
            call: api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transfer(token.assetId, recipient, amount)
              .method,
            accountId: address,
            website: 'mimir://app/transfer'
          });
        } else if (api.tx.tokens) {
          addQueue({
            call: api.tx.tokens.transfer(recipient, token.assetId, amount).method,
            accountId: address,
            website: 'mimir://app/transfer'
          });
        }
      }
    },
    [addQueue]
  );

  const handleTransferAllowDeath = useCallback(
    (api: ApiPromise, address: string, token: TransferToken, recipient: string, amount: bigint) => {
      if (token.isNative) {
        addQueue({
          call: api.tx.balances.transferKeepAlive(recipient, amount).method,
          accountId: address,
          website: 'mimir://app/transfer'
        });
      } else {
        if (api.tx.assets || api.tx.foreignAssets) {
          addQueue({
            call: api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transferKeepAlive(
              token.assetId,
              recipient,
              amount
            ).method,
            accountId: address,
            website: 'mimir://app/transfer'
          });
        } else if (api.tx.tokens) {
          addQueue({
            call: api.tx.tokens.transferKeepAlive(recipient, token.assetId, amount).method,
            accountId: address,
            website: 'mimir://app/transfer'
          });
        }
      }
    },
    [addQueue]
  );

  const handleClick = useCallback(() => {
    if (recipient && sending && amount && token) {
      if (!isAmountValid) {
        return;
      }

      if (sendingBalances.sub(new BN(parseUnits(amount, format[0]).toString())).lt(existentialDeposit)) {
        toggleOpen();
      } else {
        handleTransferKeepAlive(api, sending, token, recipient, parseUnits(amount, format[0]));
      }
    }
  }, [
    amount,
    api,
    existentialDeposit,
    format,
    handleTransferKeepAlive,
    isAmountValid,
    recipient,
    sending,
    sendingBalances,
    toggleOpen,
    token
  ]);

  return (
    <>
      <Button
        disabled={!amount || !recipient || !isAmountValid || isInsufficientBalance || (enableUnified && !notCex)}
        fullWidth
        onClick={handleClick}
        color={isInsufficientBalance ? 'error' : 'primary'}
      >
        {isInsufficientBalance ? `Insufficient ${format[1] || ''} balance` : 'Review'}
      </Button>

      <Dialog maxWidth='xs' open={open} onClose={toggleOpen}>
        <DialogTitle>Below Existing Deposit Alerts</DialogTitle>
        <DialogContent>
          <Typography>
            You need to ensure your account has more than{' '}
            <b>
              <FormatBalance withCurrency value={existentialDeposit} format={format} />
            </b>
            . After this transfer, your balance will be{' '}
            <b>
              <FormatBalance
                withCurrency
                value={sendingBalances.sub(new BN(parseUnits(amount, format[0]).toString()))}
                format={format}
              />
            </b>
            , which may result in the account being reaped.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant='outlined' onClick={toggleOpen}>
            Cancel
          </Button>
          {sending && token && recipient && (
            <Button
              fullWidth
              variant='contained'
              onClick={() => {
                toggleOpen();
                handleTransferAllowDeath(api, sending, token, recipient, parseUnits(amount, format[0]));
              }}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SendButton;
