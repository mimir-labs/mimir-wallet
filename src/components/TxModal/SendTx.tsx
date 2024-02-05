// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { TxToastCtx, useApi } from '@mimir-wallet/hooks';
import { PrepareMultisig, service, sign, signAndSend, TxEvents } from '@mimir-wallet/utils';
import { LoadingButton } from '@mui/lab';
import { BN } from '@polkadot/util';
import React, { useCallback, useContext, useEffect, useState } from 'react';

function SendTx({
  beforeSend,
  canSend,
  disabled,
  onClose,
  onError,
  onFinalized,
  onResults,
  onSignature,
  onlySign,
  prepare,
  website
}: {
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  disabled?: boolean;
  prepare?: PrepareMultisig;
  website?: string;
  canSend: boolean;
  onlySign: boolean;
  onClose: () => void;
  onError: (error: unknown) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend: () => Promise<void>;
}) {
  const { api } = useApi();
  const [isEnought, setIsEnought] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(TxToastCtx);

  const onConfirm = useCallback(async () => {
    if (!prepare) return;

    const [tx, signer] = prepare;

    setLoading(true);

    if (onlySign) {
      const events = new TxEvents();

      addToast({ events });

      try {
        const [signature, payload] = await sign(tx, signer);

        onSignature?.(signer, signature, tx, payload);
        events.emit('success', 'Sign success');
        onClose();
      } catch (error) {
        onError(error);
        events.emit('error', error);
      } finally {
        setLoading(false);
      }
    } else {
      const events = signAndSend(tx, signer, {
        beforeSend
      });

      addToast({ events });

      events.on('inblock', (result) => {
        setLoading(false);
        onResults?.(result);
        onClose();
      });
      events.on('error', (error) => {
        onError(error);
        setLoading(false);
      });

      events.on('finalized', (result) => {
        onFinalized?.(result);
        setTimeout(() => {
          // clear all listener after 3s
          events.removeAllListeners();
        }, 3000);
      });
    }

    website && service.uploadWebsite(tx.hash.toHex(), website);
  }, [addToast, beforeSend, onClose, onError, onFinalized, onResults, onSignature, onlySign, prepare, website]);

  useEffect(() => {
    let unsubPromise: Promise<() => void> | undefined;

    if (prepare) {
      unsubPromise = api.rpc.chain.subscribeFinalizedHeads(() => {
        const addresses = Object.keys(prepare[2]);
        const values = Object.values(prepare[2]);

        if (addresses.length > 0) {
          Promise.all(addresses.map((address) => api.derive.balances.all(address))).then((results) => {
            setIsEnought(
              results
                .map((item) => item.freeBalance)
                .reduce((l, r) => l.add(r), new BN(0))
                .gte(values.reduce((l, r) => l.add(r)))
            );
          });
        } else {
          setIsEnought(true);
        }
      });
    }

    return () => {
      unsubPromise?.then((unsub) => unsub());
    };
  }, [api, prepare]);

  return (
    <LoadingButton disabled={disabled || !canSend || !prepare || !isEnought} fullWidth loading={loading} onClick={onConfirm} variant='contained'>
      Confirm
    </LoadingButton>
  );
}

export default React.memo(SendTx);
