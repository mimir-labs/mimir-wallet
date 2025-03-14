// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useTxQueue } from '@/hooks/useTxQueue';
import React, { useCallback } from 'react';

import { Button, type ButtonProps } from '@mimir-wallet/ui';

interface Props extends Omit<ButtonProps, 'onPress' | 'onClick'> {
  accountId?: AccountId | Address | string;
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
  const { addQueue } = useTxQueue();

  const handlePress = useCallback(() => {
    if (getCall) {
      const call = getCall();

      addQueue({
        accountId,
        transaction: transaction || undefined,
        call,
        website,
        appName,
        iconUrl,
        filterPaths,
        relatedBatches,
        onResults: (result) => onResults?.(result),
        beforeSend: async (extrinsic) => beforeSend?.(extrinsic)
      });
    }

    onDone?.();
  }, [
    accountId,
    addQueue,
    appName,
    beforeSend,
    filterPaths,
    getCall,
    iconUrl,
    onDone,
    onResults,
    relatedBatches,
    transaction,
    website
  ]);

  return (
    <Button {...props} isDisabled={isDisabled || disabled} onPress={overrideAction || handlePress}>
      {children}
    </Button>
  );
}

export default React.memo(TxButton);
