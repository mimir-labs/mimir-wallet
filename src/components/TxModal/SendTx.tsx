// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ISubmittableResult } from '@polkadot/types/types';

import { LoadingButton } from '@mui/lab';
import { BN } from '@polkadot/util';
import React, { useCallback, useEffect, useState } from 'react';

import { useApi } from '@mimirdev/hooks';
import { PrepareMultisig, signAndSend } from '@mimirdev/utils';

import { useToastPromise } from '../ToastRoot';

function SendTx({
  beforeSend,
  canSend,
  disabled,
  onClose,
  onResults,
  prepare
}: {
  onResults?: (results: ISubmittableResult) => void;
  disabled?: boolean;
  prepare?: PrepareMultisig;
  canSend: boolean;
  onClose: () => void;
  beforeSend: () => Promise<void>;
}) {
  const { api } = useApi();
  const [isEnought, setIsEnought] = useState<boolean>(false);
  const [loading, onConfirm] = useToastPromise(
    useCallback(async () => {
      if (!prepare) return;

      const [tx, signer] = prepare;

      const results = await signAndSend(tx, signer, {
        beforeSend
      });

      onResults?.(results);

      onClose();
    }, [beforeSend, onClose, onResults, prepare]),
    { pending: 'Transaction Pending...', success: 'Transaction Success' }
  );

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
