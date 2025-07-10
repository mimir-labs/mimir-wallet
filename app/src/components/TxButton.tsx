// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { CONNECT_ORIGIN } from '@/constants';
import { useTxQueue } from '@/hooks/useTxQueue';
import { useAccountSource, useWallet } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import { GenericExtrinsic } from '@polkadot/types';
import React, { useCallback, useState } from 'react';

import { signAndSend, useApi } from '@mimir-wallet/polkadot-core';
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
  getCall?: () => IMethod | string;
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
  onError,
  overrideAction,
  ...props
}: Props) {
  const { api, network } = useApi();
  const { addQueue } = useTxQueue();
  const { walletAccounts } = useWallet();
  const address = accountId || transaction?.address || walletAccounts.at(0)?.address;
  const source = useAccountSource(address);
  const [loading, setLoading] = useState(false);
  const handlePress = useCallback(() => {
    if (getCall) {
      const call = getCall();

      if (!address) {
        toastError('Please select an account');

        return;
      }

      if (source) {
        setLoading(true);

        const events = signAndSend(
          api,
          api.tx(
            api.registry.createType(
              'Call',
              typeof call === 'string' ? call : call instanceof GenericExtrinsic ? call.method.toU8a() : call.toU8a()
            )
          ),
          address,
          () => enableWallet(source, CONNECT_ORIGIN),
          { beforeSend }
        );

        events.on('inblock', () => {
          onDone?.();
          setLoading(false);
        });
        events.on('error', (error: any) => {
          setLoading(false);
          onError?.(error);
          toastError(error);
        });
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
  }, [
    getCall,
    onDone,
    address,
    source,
    addQueue,
    transaction,
    website,
    appName,
    iconUrl,
    filterPaths,
    relatedBatches,
    network,
    onError,
    api,
    onResults,
    beforeSend
  ]);

  return (
    <Button {...props} isLoading={loading} isDisabled={isDisabled || disabled} onPress={overrideAction || handlePress}>
      {children}
    </Button>
  );
}

export default React.memo(TxButton);
