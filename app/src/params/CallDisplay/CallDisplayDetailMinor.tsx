// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { KitchensinkRuntimeProxyType } from '@polkadot/types/lookup';
import type { IMethod, Registry } from '@polkadot/types/types';

import { AddressRow } from '@/components';
import React, { useMemo } from 'react';

function CallDisplayDetailMinor({ registry, call }: { registry: Registry; call?: IMethod | null }) {
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
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow shorten withName withAddress={false} withCopy iconSize={20} value={call.args[0].toString()} />
      </div>
    );
  } else if (
    ['assets.transfer', 'assets.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow shorten withName withAddress={false} withCopy iconSize={20} value={call.args[1].toString()} />
      </div>
    );
  } else if (
    ['tokens.transfer', 'tokens.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    comp = (
      <div className='flex items-center gap-1'>
        <AddressRow shorten withName withAddress={false} withCopy iconSize={20} value={call.args[1].toString()} />
      </div>
    );
  } else if (['proxy.proxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <div className='flex items-center gap-1'>
        {(call.args[1] as Option<KitchensinkRuntimeProxyType>)?.unwrapOrDefault?.()?.type}
      </div>
    );
  } else if (['proxy.proxyAnnounced'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = (
      <div className='flex items-center gap-1'>
        {(call.args[2] as Option<KitchensinkRuntimeProxyType>)?.unwrapOrDefault?.()?.type}
      </div>
    );
  } else if (['proxy.addProxy', 'proxy.removeProxy'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = <div className='flex items-center gap-1'>{(call.args[1] as KitchensinkRuntimeProxyType)?.type}</div>;
  } else {
    return null;
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetailMinor>(CallDisplayDetailMinor);
