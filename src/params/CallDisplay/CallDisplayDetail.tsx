// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import { findAssets, findToken } from '@mimir-wallet/config';

import Param from '../Param';
import { extractParams } from '../utils';

function CallDisplayDetail({ api, call }: { api: ApiPromise; call?: IMethod | null }) {
  let comp: React.ReactNode;

  const params = useMemo(() => (call ? extractParams(call) : null), [call]);

  if (!call) {
    return null;
  }

  if (
    api.tx.balances.transfer?.is(call) ||
    api.tx.balances.transferKeepAlive?.is(call) ||
    api.tx.balances.transferAllowDeath?.is(call)
  ) {
    const token = findToken(api.genesisHash.toHex());

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box component='img' src={token.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[1].toString()} />
        </Typography>
      </Box>
    );
  } else if (api.tx.assets?.transfer?.is(call) || api.tx.assets?.transferKeepAlive?.is(call)) {
    const asset = findAssets(api.genesisHash.toHex()).find((asset) => asset.assetId === call.args[0].toString());

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box component='img' src={asset?.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[2].toString()} />
        </Typography>
      </Box>
    );
  } else if (
    api.tx.utility?.batch?.is(call) ||
    api.tx.utility?.forceBatch?.is(call) ||
    api.tx.utility?.batchAll?.is(call)
  ) {
    comp = <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{call.args[0].length} calls</Box>;
  } else if (api.tx.proxy?.announce?.is(call) || api.tx.proxy?.proxy?.is(call)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          withCopy
          iconSize={20}
          defaultName='Real'
          value={call.args[0]}
        />
      </Box>
    );
  } else if (api.tx.proxy?.proxyAnnounced?.is(call)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          withCopy
          iconSize={20}
          defaultName='Real'
          value={call.args[1]}
        />
      </Box>
    );
  } else if (api.tx.proxy?.addProxy?.is(call) || api.tx.proxy?.removeProxy?.is(call)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          withCopy
          iconSize={20}
          defaultName='Proxy'
          value={call.args[0]}
        />
      </Box>
    );
  } else {
    if (!params) {
      return null;
    }

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {params.params.length > 0 ? (
          <Param registry={api.registry} type={params.params[0].type} value={params.values[0]} />
        ) : null}
      </Box>
    );
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetail>(CallDisplayDetail);
