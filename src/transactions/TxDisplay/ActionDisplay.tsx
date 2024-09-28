// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { FormatBalance } from '@mimir-wallet/components';
import { findAssets, findToken } from '@mimir-wallet/config';

function ActionDisplay({ api, call }: { api: ApiPromise; call?: IMethod | null }) {
  let comp: React.ReactNode;

  if (!call) {
    return 'unknown';
  }

  if (
    api.tx.balances.transfer?.is(call) ||
    api.tx.balances.transferKeepAlive?.is(call) ||
    api.tx.balances.transferAllowDeath?.is(call)
  ) {
    const token = findToken(api.genesisHash.toHex());

    comp = (
      <>
        <Box component='img' src={token.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[1].toString()} />
        </Typography>
      </>
    );
  } else if (api.tx.assets && (api.tx.assets.transfer?.is(call) || api.tx.assets.transferKeepAlive?.is(call))) {
    const asset = findAssets(api.genesisHash.toHex()).find((asset) => asset.assetId === call.args[0].toString());

    comp = (
      <>
        <Box component='img' src={asset?.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[2].toString()} />
        </Typography>
      </>
    );
  } else {
    comp = '--';
  }

  return comp;
}

export default React.memo<typeof ActionDisplay>(ActionDisplay);
