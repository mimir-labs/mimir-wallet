// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React, { useContext, useState } from 'react';

import { useAddressMeta, useApi } from '@mimir-wallet/hooks';
import { TxToastCtx } from '@mimir-wallet/providers';
import { service, sign, signAndSend, TxEvents } from '@mimir-wallet/utils';

import { buildTx } from './utils';

function SendTx({
  account,
  call,
  disabled,
  filterPath,
  note,
  onlySign,
  website,
  iconUrl,
  appName,
  onError,
  onFinalized,
  onResults,
  onSignature,
  beforeSend
}: {
  account?: string;
  call: IMethod | HexString;
  disabled: boolean;
  filterPath: FilterPath[];
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
  note?: string;
  onlySign?: boolean;
  onError?: (error: unknown) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}) {
  const { api } = useApi();
  const { addToast } = useContext(TxToastCtx);
  const signer = filterPath[filterPath.length - 1]?.address || account;
  const { meta } = useAddressMeta(signer);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (!signer) {
      return;
    }

    setLoading(true);

    let events: TxEvents = new TxEvents();

    try {
      const hashSet = new Set<HexString>();
      const txBundle = await buildTx(api, api.createType('Call', call), filterPath, hashSet);

      if (!txBundle.canProxyExecute) {
        return;
      }

      const tx = txBundle.tx;

      for await (const item of hashSet) {
        await service.updateCalldata(item);
      }

      if (onlySign) {
        addToast({ events });

        const [signature, payload, extrinsicHash] = await sign(tx, signer, meta.source || '');

        await service.uploadWebsite(extrinsicHash.toHex(), website, appName, iconUrl, note);

        onSignature?.(signer, signature, tx, payload);
        events.emit('success', 'Sign success');
        setLoading(false);
      } else {
        events = signAndSend(tx, signer, meta.source || '', {
          beforeSend
        });

        addToast({ events });

        events.on('inblock', (result) => {
          service.uploadWebsite(result.txHash.toHex(), website, appName, iconUrl, note);
          onResults?.(result);
        });
        events.on('error', (error) => {
          setLoading(false);
          onError?.(error);
        });

        events.on('finalized', (result) => {
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
    <LoadingButton fullWidth variant='contained' onClick={onConfirm} loading={loading} disabled={!signer || disabled}>
      Submit
    </LoadingButton>
  );
}

export default React.memo(SendTx);
