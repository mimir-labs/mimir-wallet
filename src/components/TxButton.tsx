// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { TxButtonProps } from './types';

import { Button } from '@mui/material';
import { isFunction } from '@polkadot/util';
import React, { useCallback } from 'react';

import { useTxQueue } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

function TxButton({ accountId, disabled, isMultisigCancel, params, tx, ...props }: TxButtonProps): React.ReactElement<TxButtonProps> {
  const { setTx } = useTxQueue() as any;
  const onClick = useCallback(() => {
    if (!accountId) return;

    const extrinsic: SubmittableExtrinsic<'promise'> | undefined = tx?.(...(isFunction(params) ? params() : params || []));

    const meta = getAddressMeta(accountId);

    if (extrinsic) {
      setTx({ accountId, extrinsic, isMultisig: !!meta.isMultisig, isMultisigCancel: !!isMultisigCancel });
    }
  }, [accountId, isMultisigCancel, params, setTx, tx]);

  return <Button {...props} disabled={!accountId || disabled} onClick={onClick} />;
}

export default React.memo(TxButton);
