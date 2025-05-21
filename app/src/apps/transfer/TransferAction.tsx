// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { TxButton } from '@/components';
import { useAssetInfo } from '@/hooks/useAssets';
import { parseUnits } from '@/utils';
import { BN, isHex } from '@polkadot/util';
import React, { useCallback } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import { useTransferBalance } from './useTransferBalances';

function TransferAction({
  network,
  token,
  amount,
  isAmountValid,
  keepAlive,
  sending,
  recipient,
  children,
  onDone,
  onError
}: {
  network: string;
  token?: TransferToken;
  amount: string;
  isAmountValid: boolean;
  keepAlive: boolean;
  sending: string;
  recipient: string;
  onDone?: () => void;
  onError?: (error: unknown) => void;
  children?: React.ReactNode;
}) {
  const { api } = useApi();

  const [format, sendingBalances] = useTransferBalance(token, sending);
  const [, assetExistentialDeposit] = useAssetInfo(network, token?.isNative ? null : token?.assetId);

  const existentialDeposit = token?.isNative ? api.consts.balances.existentialDeposit : assetExistentialDeposit;
  const isInsufficientBalance = keepAlive
    ? sendingBalances.sub(existentialDeposit).lt(new BN(parseUnits(amount, format[0]).toString()))
    : sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

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
    <TxButton
      fullWidth
      color={isInsufficientBalance ? 'danger' : 'primary'}
      isDisabled={!(amount && recipient && token)}
      accountId={sending}
      website='mimir://app/transfer'
      getCall={getCall}
      onDone={onDone}
      onError={onError}
    >
      {isInsufficientBalance ? `Insufficient ${format[1] || ''} balance` : children}
    </TxButton>
  );
}

export default TransferAction;
