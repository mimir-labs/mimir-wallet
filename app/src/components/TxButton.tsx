// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useAccount } from '@/accounts/useAccount';
import { useTxQueue } from '@/hooks/useTxQueue';
import React, { useCallback } from 'react';

import { Tooltip } from '@mimir-wallet/ui';
import { Button, type ButtonProps } from '@mimir-wallet/ui';

interface Props extends Omit<ButtonProps, 'onPress' | 'onClick'> {
  accountId?: AccountId | Address | string;
  filterPaths?: FilterPath[];
  transaction?: Transaction | null;
  onlySign?: boolean;
  website?: string;
  iconUrl?: string;
  appName?: string;
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
  const { isLocalAccount } = useAccount();

  const hasPermission = accountId ? isLocalAccount(accountId.toString()) : true;

  const handlePress = useCallback(() => {
    if (getCall) {
      const call = getCall();

      addQueue({
        accountId,
        transaction: transaction || undefined,
        call,
        website,
        filterPaths,
        onResults: (result) => onResults?.(result),
        beforeSend: async (extrinsic) => beforeSend?.(extrinsic)
      });
    }

    onDone?.();
  }, [accountId, addQueue, beforeSend, filterPaths, getCall, onDone, onResults, transaction, website]);

  if (!hasPermission) {
    return (
      <Tooltip showArrow closeDelay={0} content='You have no permission' color='warning'>
        <Button {...props} isDisabled>
          {children}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button {...props} isDisabled={isDisabled || disabled} onPress={overrideAction || handlePress}>
      {children}
    </Button>
  );
}

export default React.memo(TxButton);
