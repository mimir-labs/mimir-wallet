// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { FormatBalance } from '@mimir-wallet/components';
import { findToken } from '@mimir-wallet/config';
import { useSelectedAccountCallback } from '@mimir-wallet/hooks';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

function ActionDisplay({ api, call, isSub, tx }: { isSub?: boolean; api: ApiPromise; call: IMethod; tx: Transaction }) {
  let comp: React.ReactNode;
  const selectAccount = useSelectedAccountCallback();

  if (api.tx.balances.transfer?.is(call) || api.tx.balances.transferKeepAlive?.is(call) || api.tx.balances.transferAllowDeath?.is(call)) {
    const token = findToken(api.genesisHash.toHex());

    comp = (
      <>
        <Box component='img' src={token.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[1]} />
        </Typography>
      </>
    );
  } else if (api.tx.multisig.cancelAsMulti.is(call)) {
    comp = isSub ? (
      <Typography color='primary.main' component={Link} onClick={() => tx && selectAccount(tx.sender)} to='/transactions'>
        No. {tx.uuid.slice(0, 8).toUpperCase()}
      </Typography>
    ) : (
      <Typography color='primary.main' component={Link} onClick={() => tx.cancelTx?.top && selectAccount(tx.cancelTx?.top.sender)} to='/transactions'>
        No. {tx.cancelTx?.top?.uuid.slice(0, 8).toUpperCase()}
      </Typography>
    );
  } else {
    comp = '--';
  }

  return comp;
}

export default React.memo(ActionDisplay);
