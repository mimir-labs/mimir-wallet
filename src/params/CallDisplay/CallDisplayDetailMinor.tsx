// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { KitchensinkRuntimeProxyType } from '@polkadot/types/lookup';
import type { IMethod, Registry } from '@polkadot/types/types';

import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import { findAssets } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';

import Param from '../Param';
import { extractParams } from '../utils';

function CallDisplayDetailMinor({ registry, call }: { registry: Registry; call?: IMethod | null }) {
  const { genesisHash } = useApi();
  let comp: React.ReactNode;

  const params = useMemo(() => (call ? extractParams(call) : null), [call]);
  const calllFunction = useMemo(() => (call ? registry.findMetaCall(call?.callIndex) : null), [call, registry]);

  if (!call || !calllFunction) {
    return null;
  }

  if (
    ['balances.transfer', 'balances.transferKeepAlive', 'balances.transferAllowDeath'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          withCopy
          iconSize={20}
          defaultName='Real'
          value={call.args[0].toString()}
        />
      </Box>
    );
  } else if (
    ['assets.transfer', 'assets.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    const asset = findAssets(genesisHash).find((asset) => asset.assetId === call.args[0].toString());

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box component='img' src={asset?.Icon} sx={{ width: 20, height: 20 }} />
        <Typography>
          -<FormatBalance value={call.args[2].toString()} />
        </Typography>
      </Box>
    );
  } else if (['proxy.proxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {(call.args[1] as Option<KitchensinkRuntimeProxyType>)?.unwrapOrDefault?.()?.type}
      </Box>
    );
  } else if (['proxy.proxyAnnounced'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {(call.args[2] as Option<KitchensinkRuntimeProxyType>)?.unwrapOrDefault?.()?.type}
      </Box>
    );
  } else if (['proxy.addProxy', 'proxy.removeProxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {(call.args[1] as KitchensinkRuntimeProxyType)?.type}
      </Box>
    );
  } else {
    if (!params) {
      return null;
    }

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {params.params.length > 1 ? (
          <Param registry={registry} type={params.params[1].type} value={params.values[1]} />
        ) : null}
      </Box>
    );
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetailMinor>(CallDisplayDetailMinor);