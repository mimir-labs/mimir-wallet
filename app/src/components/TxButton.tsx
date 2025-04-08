// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useTxQueue } from '@/hooks/useTxQueue';
import { useWallet } from '@/wallet/useWallet';
import React, { useCallback } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, type ButtonProps } from '@mimir-wallet/ui';

import { toastError } from './utils';

interface Props extends Omit<ButtonProps, 'onPress' | 'onClick'> {
  accountId?: string;
  filterPaths?: FilterPath[];
  transaction?: Transaction | null;
  onlySign?: boolean;
  website?: string;
  iconUrl?: string;
  appName?: string;
  relatedBatches?: number[];
  onReject?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onSignature?: (
    signer: string,
    signature: HexString,
    signedTransaction: HexString,
    payload: ExtrinsicPayloadValue
  ) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
  getCall?: () => IMethod;
  onDone?: () => void;
  overrideAction?: () => void;
}

function TxButton({
  getCall,
  children,
  accountId,
  transaction,
  website,
  appName,
  iconUrl,
  relatedBatches,
  filterPaths,
  beforeSend,
  onResults,
  isDisabled,
  disabled,
  onDone,
  overrideAction,
  ...props
}: Props) {
  const { network } = useApi();
  const { addQueue } = useTxQueue();
  const { walletAccounts } = useWallet();

  const handlePress = useCallback(() => {
    if (getCall) {
      const call = getCall();

      const address = accountId || transaction?.address || walletAccounts[0].address;

      if (!address) {
        toastError('Please select an account');

        return;
      }

      addQueue({
        accountId: address,
        transaction: transaction || undefined,
        call,
        website,
        appName,
        iconUrl,
        filterPaths,
        relatedBatches,
        onResults: (result) => onResults?.(result),
        beforeSend: async (extrinsic) => beforeSend?.(extrinsic),
        network
      });
    }

    onDone?.();
  }, [
    getCall,
    onDone,
    accountId,
    transaction,
    walletAccounts,
    addQueue,
    website,
    appName,
    iconUrl,
    filterPaths,
    relatedBatches,
    network,
    onResults,
    beforeSend
  ]);

  return (
    <Button {...props} isDisabled={isDisabled || disabled} onPress={overrideAction || handlePress}>
      {children}
    </Button>
  );
}

export default React.memo(TxButton);
