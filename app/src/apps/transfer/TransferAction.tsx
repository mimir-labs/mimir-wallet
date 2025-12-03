// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { ApiManager, useNetwork } from '@mimir-wallet/polkadot-core';
import { BN, isHex } from '@polkadot/util';
import React, { useCallback, useMemo } from 'react';

import { useTransferBalance } from './useTransferBalances';

import { TxButton } from '@/components';
import { useExistentialDeposit } from '@/hooks/useExistentialDeposit';
import { useXcmAsset } from '@/hooks/useXcmAssets';
import { parseUnits } from '@/utils';

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
  const { network: currentNetwork } = useNetwork();
  const { existentialDeposit: nativeED } = useExistentialDeposit(currentNetwork);

  const [format, sendingBalances] = useTransferBalance(token, sending);
  const [assetInfo] = useXcmAsset(network, token?.isNative ? null : token?.assetId);

  // Determine existential deposit based on token type
  const existentialDeposit = useMemo(() => {
    if (token?.isNative) {
      return nativeED;
    } else if (assetInfo?.existentialDeposit) {
      return new BN(assetInfo.existentialDeposit.toString());
    }

    return new BN(0);
  }, [token?.isNative, nativeED, assetInfo?.existentialDeposit]);

  const isInsufficientBalance = keepAlive
    ? sendingBalances.sub(existentialDeposit).lt(new BN(parseUnits(amount, format[0]).toString()))
    : sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

  const getCall = useCallback(async () => {
    const api = await ApiManager.getInstance().getApi(currentNetwork);

    if (!api) {
      throw new Error('API not ready');
    }

    if (recipient && sending && amount && token) {
      if (!isAmountValid) {
        throw new Error('Invalid amount');
      }

      if (token.isNative) {
        return keepAlive
          ? api.tx.balances.transferKeepAlive(recipient, parseUnits(amount, format[0])).method
          : api.tx.balances.transferAllowDeath(recipient, parseUnits(amount, format[0])).method;
      }

      if (api.tx.assets && token.assetId) {
        if (isHex(token.assetId) && !api.tx.foreignAssets) {
          throw new Error('Invalid asset id');
        }

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

      if (api.tx.tokens && token.assetId) {
        return keepAlive
          ? api.tx.tokens.transferKeepAlive(recipient, token.key, parseUnits(amount, format[0])).method
          : api.tx.tokens.transfer(recipient, token.key, parseUnits(amount, format[0])).method;
      }
    }

    throw new Error('Invalid arguments');
  }, [amount, currentNetwork, format, isAmountValid, keepAlive, recipient, sending, token]);

  return (
    <TxButton
      fullWidth
      color={isInsufficientBalance ? 'danger' : 'primary'}
      disabled={!(amount && recipient && token)}
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
