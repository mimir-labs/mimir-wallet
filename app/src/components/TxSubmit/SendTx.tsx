// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { BuildTx } from './hooks/useBuildTx';

import { CONNECT_ORIGIN } from '@/constants';
import { addTxToast } from '@/hooks/useTxQueue';
import { useAccountSource } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import React, { useState } from 'react';

import { sign, signAndSend, TxEvents, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Alert, AlertTitle, Button, buttonSpinner } from '@mimir-wallet/ui';

import { toastError } from '../utils';
import { useDryRunResult } from './hooks/useDryRunResult';

function SendTx({
  disabled,
  buildTx,
  note,
  onlySign,
  assetId,
  website,
  iconUrl,
  appName,
  relatedBatches,
  onError,
  onFinalized,
  onResults,
  onSignature,
  beforeSend
}: {
  disabled?: boolean;
  buildTx: BuildTx;
  assetId?: string;
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
  note?: string;
  relatedBatches?: number[];
  onlySign?: boolean;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onError?: (error: unknown) => void;
  onSignature?: (signer: string, signature: HexString, tx: HexString, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}) {
  const { api, network } = useApi();
  const [loading, setLoading] = useState(false);
  const { txBundle, isLoading, error, hashSet, delay } = buildTx;
  const source = useAccountSource(txBundle?.signer);
  const { data: dryRunResult } = useDryRunResult(txBundle);

  const onConfirm = async () => {
    let events: TxEvents = new TxEvents();

    if (!txBundle) {
      return;
    }

    const { tx, signer } = txBundle;

    if (!signer) {
      return;
    }

    if (!source) {
      toastError('No available signing address.');

      return;
    }

    setLoading(true);

    try {
      for await (const item of hashSet) {
        await service.chain.updateCalldata(network, item);
      }

      if (onlySign) {
        addTxToast({ events });

        const [signature, payload, extrinsicHash, signedTransaction] = await sign(
          api,
          tx,
          signer,
          () => enableWallet(source, CONNECT_ORIGIN),
          {
            assetId: assetId === 'native' ? undefined : assetId
          }
        );

        await service.transaction.uploadWebsite(
          network,
          extrinsicHash.toHex(),
          website,
          appName,
          iconUrl,
          note,
          relatedBatches
        );

        onSignature?.(signer, signature, signedTransaction, payload);
        events.emit('success', 'Sign success');
        setLoading(false);
      } else {
        events = signAndSend(api, tx, signer, () => enableWallet(source, CONNECT_ORIGIN), {
          beforeSend,
          assetId: assetId === 'native' ? undefined : assetId
        });

        addTxToast({ events });

        events.once('signed', (_, extrinsic) => {
          service.transaction.uploadWebsite(
            network,
            extrinsic.hash.toHex(),
            website,
            appName,
            iconUrl,
            note,
            relatedBatches
          );
        });
        events.once('inblock', (result) => {
          onResults?.(result);
        });
        events.once('error', (error) => {
          setLoading(false);
          onError?.(error);
        });

        events.once('finalized', (result) => {
          setLoading(false);
          onFinalized?.(result);
          setTimeout(() => {
            // clear all listener after 3s
            events.removeAllListeners();
          }, 3000);
        });
      }
    } catch (error) {
      onError?.(error);
      events.emit('error', error);
      setLoading(false);
    }
  };

  return (
    <>
      {error ? (
        <Alert variant='destructive'>
          <AlertTitle>
            <span className='break-all'>{error.message}</span>
          </AlertTitle>
        </Alert>
      ) : null}

      {Object.keys(delay).length > 0 ? (
        <Alert variant='warning'>
          <AlertTitle>This transaction can be executed after review window</AlertTitle>
        </Alert>
      ) : null}

      {dryRunResult && !dryRunResult.success ? (
        <Alert variant='destructive'>
          <AlertTitle>{dryRunResult.error.message}</AlertTitle>
        </Alert>
      ) : null}

      <Button
        fullWidth
        variant='solid'
        color='primary'
        onClick={error ? undefined : onConfirm}
        disabled={
          loading ||
          isLoading ||
          !txBundle?.signer ||
          !!error ||
          disabled ||
          (dryRunResult ? !dryRunResult.success : false)
        }
      >
        {loading || isLoading ? buttonSpinner : null}
        Submit
      </Button>
    </>
  );
}

export default React.memo(SendTx);
