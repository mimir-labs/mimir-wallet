// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod, Registry } from '@polkadot/types/types';

import { Avatar, Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import { findAssets, findToken } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';

function CallDisplayDetail({
  registry,
  fallbackWithName,
  call
}: {
  registry: Registry;
  fallbackWithName?: boolean;
  call?: IMethod | null;
}) {
  const { genesisHash } = useApi();
  let comp: React.ReactNode;

  const calllFunction = useMemo(() => (call ? registry.findMetaCall(call?.callIndex) : null), [call, registry]);

  if (!call || !calllFunction) {
    return null;
  }

  if (
    ['balances.transfer', 'balances.transferKeepAlive', 'balances.transferAllowDeath'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    const token = findToken(genesisHash);

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Avatar alt='Token' src={token.Icon} sx={{ width: 20, height: 20, borderRadius: '50%' }}>
          T
        </Avatar>

        <Typography>
          -<FormatBalance value={call.args[1].toString()} />
        </Typography>
      </Box>
    );
  } else if (
    ['assets.transfer', 'assets.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    const asset = findAssets(genesisHash).find((asset) => asset.assetId === call.args[0].toString());

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Avatar alt='Token' src={asset?.Icon} sx={{ width: 20, height: 20, borderRadius: '50%' }}>
          T
        </Avatar>
        <Typography>
          -<FormatBalance value={call.args[2].toString()} />
        </Typography>
      </Box>
    );
  } else if (
    ['tokens.transfer', 'tokens.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    const asset = findAssets(genesisHash).find((asset) => asset.assetId === call.args[1].toString());

    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Avatar alt='Token' src={asset?.Icon} sx={{ width: 20, height: 20, borderRadius: '50%' }}>
          T
        </Avatar>
        <Typography>
          -<FormatBalance value={call.args[2].toString()} />
        </Typography>
      </Box>
    );
  } else if (
    ['utility.batch', 'utility.forceBatch', 'utility.batchAll'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    comp = <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{(call.args?.[0] as any)?.length} calls</Box>;
  } else if (['proxy.proxy', 'proxy.announce'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Real'
          value={call.args[0].toString()}
        />
      </Box>
    );
  } else if (['proxy.proxyAnnounced'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Real'
          value={call.args[1].toString()}
        />
      </Box>
    );
  } else if (['proxy.addProxy', 'proxy.removeProxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Proxy'
          value={call.args[0].toString()}
        />
      </Box>
    );
  } else if (['proxy.removeProxies'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Remove Proxies</Box>;
  } else {
    return fallbackWithName ? `${calllFunction.section}.${calllFunction.method}` : null;
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetail>(CallDisplayDetail);
