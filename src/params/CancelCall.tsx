// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';
import type { CallProps } from './types';

import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function CancelCall({ call, jsonFallback, selectAccount, tx, type = 'base' }: CallProps & { tx?: Transaction; selectAccount?: (value: string) => void }) {
  if (!tx || !tx.cancelTx) {
    return jsonFallback ? <FallbackCall call={call} /> : null;
  }

  const cancelTx = tx.cancelTx.top;

  return (
    <>
      <Item
        content={
          <Typography color='primary.main' component={Link} onClick={() => selectAccount?.(cancelTx.sender)} to='/transactions'>
            No. {cancelTx.uuid.slice(0, 8).toUpperCase()}
          </Typography>
        }
        name='Transaction'
        type={type}
      />
      <Item content={cancelTx.action} name='Type' type={type} />
    </>
  );
}

export default React.memo(CancelCall);
