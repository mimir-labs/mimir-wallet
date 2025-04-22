// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod, Registry } from '@polkadot/types/types';

import { AddressRow, FormatBalance } from '@/components';
import { findAssets, findToken } from '@/config';
import { dataToUtf8 } from '@/utils';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar } from '@mimir-wallet/ui';

function CallDisplayDetail({
  registry,
  fallbackWithName,
  call
}: {
  registry: Registry;
  fallbackWithName?: boolean;
  call?: IMethod | null;
}) {
  const { network, genesisHash } = useApi();
  let comp: React.ReactNode;

  const calllFunction = useMemo(() => (call ? registry.findMetaCall(call?.callIndex) : null), [call, registry]);

  if (!(call && calllFunction)) {
    return null;
  }

  if (
    ['balances.transfer', 'balances.transferKeepAlive', 'balances.transferAllowDeath'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    const token = findToken(genesisHash);

    comp = (
      <div className='flex items-center gap-1'>
        <Avatar alt='Token' src={token.Icon} style={{ width: 20, height: 20, background: 'transparent' }}>
          T
        </Avatar>

        <p>
          -<FormatBalance value={call.args[1].toString()} />
        </p>
      </div>
    );
  } else if (
    ['assets.transfer', 'assets.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    const asset = findAssets(network).find((asset) => asset.assetId === call.args[0].toHex());

    comp = (
      <div className='flex items-center gap-1'>
        <Avatar alt='Token' src={asset?.Icon} style={{ width: 20, height: 20, background: 'transparent' }}>
          T
        </Avatar>
        <p>
          -<FormatBalance value={call.args[2].toString()} assetId={call.args[0].toHex()} />
        </p>
      </div>
    );
  } else if (
    ['tokens.transfer', 'tokens.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    const asset = findAssets(genesisHash).find((asset) => asset.assetId === call.args[1].toHex());

    comp = (
      <div className='flex items-center gap-1'>
        <Avatar alt='Token' src={asset?.Icon} style={{ width: 20, height: 20, background: 'transparent' }}>
          T
        </Avatar>
        <p>
          -<FormatBalance value={call.args[2].toString()} assetId={call.args[1].toHex()} />
        </p>
      </div>
    );
  } else if (
    ['utility.batch', 'utility.forceBatch', 'utility.batchAll'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    comp = <div className='flex items-center gap-1'>{(call.args?.[0] as any)?.length} calls</div>;
  } else if (['proxy.proxy', 'proxy.announce'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Real'
          value={call.args[0].toString()}
        />
      </div>
    );
  } else if (['proxy.proxyAnnounced'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Real'
          value={call.args[1].toString()}
        />
      </div>
    );
  } else if (['proxy.addProxy', 'proxy.removeProxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow
          shorten
          withName
          withAddress={false}
          iconSize={20}
          defaultName='Proxy'
          value={call.args[0].toString()}
        />
      </div>
    );
  } else if (['proxy.removeProxies'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = <div className='flex items-center gap-1'>Remove Proxies</div>;
  } else if (['identity.setIdentity'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = <div className='flex items-center gap-1 font-bold'>{dataToUtf8((call.args?.[0] as any)?.display)}</div>;
  } else {
    return fallbackWithName ? `${calllFunction.section}.${calllFunction.method}` : null;
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetail>(CallDisplayDetail);
