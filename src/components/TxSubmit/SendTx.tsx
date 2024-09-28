// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Extrinsic, Timepoint } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import { u8aSorted } from '@polkadot/util';
import React, { useContext, useState } from 'react';

import { decodeAddress } from '@mimir-wallet/api';
import { useAddressMeta, useApi } from '@mimir-wallet/hooks';
import { TxToastCtx } from '@mimir-wallet/providers';
import { service, sign, signAndSend, TxEvents } from '@mimir-wallet/utils';

async function asMulti(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  multisig: string,
  threshold: number,
  otherSignatories: string[]
) {
  const [info, { weight }] = await Promise.all([
    api.query.multisig.multisigs(multisig, tx.method.hash),
    tx.paymentInfo(multisig)
  ]);

  let timepoint: Timepoint | null = null;

  if (info.isSome) {
    timepoint = info.unwrap().when;
  }

  return api.tx.multisig.asMulti.meta.args.length === 6
    ? (api.tx.multisig.asMulti as any)(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method,
        false,
        weight
      )
    : api.tx.multisig.asMulti(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method,
        weight
      );
}

async function buildTx(api: ApiPromise, call: IMethod, path: FilterPath[], calls: Set<HexString>) {
  const functionMeta = api.registry.findMetaCall(call.callIndex);

  let tx = api.tx[functionMeta.section][functionMeta.method](...call.args);

  for (const item of path) {
    if (item.type === 'multisig') {
      tx = await asMulti(api, tx, item.multisig, item.threshold, item.otherSignatures);
    } else if (item.type === 'proxy') {
      if (item.delay) {
        calls.add(tx.method.toHex());
        tx = api.tx.proxy.announce(item.real, tx.method.hash);
      } else {
        tx = api.tx.proxy.proxy(item.real, item.proxyType as any, tx.method);
      }
    }
  }

  return tx;
}

function SendTx({
  account,
  call,
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
  account: string;
  call: IMethod | HexString;
  filterPath: FilterPath[];
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  website?: string;
  iconUrl?: string;
  appName?: string;
  note?: string;
  onlySign?: boolean;
  onError?: (error: unknown) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: () => Promise<void>;
}) {
  const { api } = useApi();
  const { addToast } = useContext(TxToastCtx);
  const signer = filterPath[filterPath.length - 1]?.address || account;
  const { meta } = useAddressMeta(signer);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);

    let events: TxEvents = new TxEvents();

    try {
      const hashSet = new Set<HexString>();
      const tx = await buildTx(api, api.createType('Call', call), filterPath, hashSet);

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
    <LoadingButton fullWidth variant='contained' onClick={onConfirm} loading={loading}>
      Submit
    </LoadingButton>
  );
}

export default React.memo(SendTx);
