// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingButton } from '@mui/lab';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useApi } from '@mimirdev/hooks';
import { canSendMultisig, PrepareMultisig, prepareMultisig, signAndSend } from '@mimirdev/utils';

import { useToastPromise } from '../ToastRoot';

function SendTx({ accounts, address, beforeSend, extrinsic }: { beforeSend: () => Promise<void>; extrinsic: SubmittableExtrinsic; accounts: Record<string, string | undefined>; address: string }) {
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts, address), [accounts, address]);

  useEffect(() => {
    if (canSend) {
      prepareMultisig(api, extrinsic, accounts, address).then(setPrepare);
    }
  }, [accounts, address, api, canSend, extrinsic]);

  const [loading, onConfirm] = useToastPromise(
    useCallback(async () => {
      if (!prepare) return;

      const [tx, signer] = prepare;

      return signAndSend(tx, signer, {
        beforeSend
      });
    }, [beforeSend, prepare]),
    { pending: 'Transaction Pending...', success: 'Transaction Success' }
  );

  return (
    <LoadingButton disabled={!canSend || !prepare} fullWidth loading={loading} onClick={onConfirm} variant='contained'>
      Confirm
    </LoadingButton>
  );
}

export default React.memo(SendTx);
