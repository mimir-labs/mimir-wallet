// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { TxToastCtx, useApi } from '@mimir-wallet/hooks';
import { PrepareMultisig, sign, signAndSend, TxEvents } from '@mimir-wallet/utils';
import { LoadingButton } from '@mui/lab';
import { BN } from '@polkadot/util';
import React, { useCallback, useContext, useEffect, useState } from 'react';

function SendTx({
  beforeSend,
  canSend,
  disabled,
  onClose,
  onResults,
  onSignature,
  onlySign,
  prepare
}: {
  onResults?: (results: ISubmittableResult) => void;
  disabled?: boolean;
  prepare?: PrepareMultisig;
  canSend: boolean;
  onlySign: boolean;
  onClose: () => void;
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
      } catch (error) {
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
      });
      events.on('error', () => {
        setLoading(false);
      });
    }

    onClose();
  }, [addToast, beforeSend, onClose, onResults, onSignature, onlySign, prepare]);

  useEffect(() => {
    if (prepare) {
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
    }
  }, [api, prepare]);

  return (
    <LoadingButton disabled={disabled || !canSend || !prepare || !isEnought} fullWidth loading={loading} onClick={onConfirm} variant='contained'>
      Confirm
    </LoadingButton>
  );
}

export default React.memo(SendTx);
