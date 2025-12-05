// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, type ButtonProps, buttonSpinner } from '@mimir-wallet/ui';
import React, { forwardRef, useState } from 'react';

import { toastError } from './utils';

import { useTxQueue } from '@/hooks/useTxQueue';
import { useWallet } from '@/wallet/useWallet';

interface Props extends Omit<ButtonProps, 'onClick' | 'startContent' | 'endContent'> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
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
  getCall?: () => IMethod | string | Promise<IMethod | string>;
  onDone?: () => void;
  overrideAction?: () => void | Promise<void>;
}

const TxButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
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
      disabled,
      onDone,
      onError,
      overrideAction,
      startContent,
      endContent,
      ...props
    },
    ref
  ) => {
    const { network } = useNetwork();
    const { addQueue } = useTxQueue();
    const { walletAccounts } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const address = accountId || transaction?.address || walletAccounts.at(0)?.address;

    const handleClick = async () => {
      setIsLoading(true);

      try {
        if (overrideAction) {
          await overrideAction();
        } else if (getCall) {
          const call = await getCall();

          if (!address) {
            toastError('Please select an account');
          } else {
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
              network,
              onError
            });
            onDone?.();
          }
        }
      } catch (error) {
        toastError(error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button {...props} ref={ref} disabled={disabled || isLoading} onClick={handleClick}>
        {isLoading && buttonSpinner}
        {startContent}
        {children}
        {endContent}
      </Button>
    );
  }
);

TxButton.displayName = 'TxButton';

export default React.memo(TxButton);
