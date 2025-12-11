// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BuildTx } from './hooks/useBuildTx';
import type { FilterPath } from '@/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type {
  ExtrinsicPayloadValue,
  ISubmittableResult,
} from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import {
  ApiManager,
  sign,
  signAndSend,
  TxEvents,
  useNetwork,
} from '@mimir-wallet/polkadot-core';
import { service, useMutation } from '@mimir-wallet/service';
import { Button, buttonSpinner } from '@mimir-wallet/ui';
import React from 'react';

import { toastError } from '../utils';

import { buildTxAsync } from './hooks/useBuildTx';

import { analyticsActions } from '@/analytics';
import { CONNECT_ORIGIN } from '@/constants';
import { addTxToast } from '@/hooks/useTxQueue';
import { useAccountSource } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';

function SendTx({
  disabled,
  dryRunDisabled,
  buildTx,
  methodHex,
  filterPath,
  transactionId,
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
  beforeSend,
}: {
  disabled?: boolean;
  dryRunDisabled?: boolean;
  buildTx: BuildTx;
  methodHex: HexString | undefined;
  filterPath: FilterPath[];
  transactionId?: number;
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
  onSignature?: (
    signer: string,
    signature: HexString,
    tx: HexString,
    payload: ExtrinsicPayloadValue,
  ) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}) {
  const { network } = useNetwork();
  const { txBundle, isLoading, error } = buildTx;
  const source = useAccountSource(txBundle?.signer);

  // Use mutation for submit with latest chain state
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!methodHex || filterPath.length === 0) {
        throw new Error('Method and filter path are required');
      }

      // Rebuild transaction with latest chain state
      const result = await buildTxAsync(
        network,
        methodHex,
        filterPath,
        transactionId,
      );

      const { txBundle: latestTxBundle, hashSet } = result;
      const { tx, signer } = latestTxBundle;

      if (!signer) {
        throw new Error('No signer available');
      }

      if (!source) {
        throw new Error('No available signing address.');
      }

      const api = await ApiManager.getInstance().getApi(network, true);

      // Update calldata for all hashes
      for await (const item of hashSet) {
        await service.chain.updateCalldata(network, item);
      }

      let events: TxEvents = new TxEvents();

      if (onlySign) {
        addTxToast({ events });

        const [signature, payload, extrinsicHash, signedTransaction] =
          await sign(
            api,
            tx,
            signer,
            () => enableWallet(source, CONNECT_ORIGIN),
            {
              assetId: assetId === 'native' ? undefined : assetId,
            },
          );

        await service.transaction.uploadWebsite(
          network,
          extrinsicHash.toHex(),
          website,
          appName,
          iconUrl,
          note,
          relatedBatches,
        );

        onSignature?.(signer, signature, signedTransaction, payload);
        events.emit('success', 'Sign success');

        // Track transaction success
        analyticsActions.transactionResult(true);
      } else {
        await (async () =>
          new Promise((resolve, reject) => {
            events = signAndSend(
              api,
              tx,
              signer,
              () => enableWallet(source, CONNECT_ORIGIN),
              {
                beforeSend,
                assetId: assetId === 'native' ? undefined : assetId,
              },
            );

            addTxToast({ events });

            events.once('signed', (_, extrinsic) => {
              service.transaction.uploadWebsite(
                network,
                extrinsic.hash.toHex(),
                website,
                appName,
                iconUrl,
                note,
                relatedBatches,
              );
            });
            events.once('inblock', (result) => {
              resolve(result);
              onResults?.(result);
            });
            events.once('error', (error) => {
              reject(error);
              onError?.(error);
            });

            events.once('finalized', (result) => {
              onFinalized?.(result);

              // Track transaction finalized successfully
              analyticsActions.transactionResult(true);

              setTimeout(() => {
                // clear all listener after 3s
                events.removeAllListeners();
              }, 3000);
            });
          }))();
      }
    },
    onError: (error) => {
      toastError(error);
      onError?.(error);

      // Track transaction failure
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      analyticsActions.transactionResult(false, errorMessage);
    },
  });

  const onConfirm = () => {
    submitMutation.mutate();
  };

  return (
    <Button
      fullWidth
      variant="solid"
      color="primary"
      onClick={error ? undefined : onConfirm}
      disabled={
        submitMutation.isPending ||
        isLoading ||
        !txBundle?.signer ||
        !!error ||
        disabled ||
        dryRunDisabled
      }
    >
      {submitMutation.isPending || isLoading ? buttonSpinner : null}
      Submit
    </Button>
  );
}

export default React.memo(SendTx);
