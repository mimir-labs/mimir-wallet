// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod, Registry } from '@polkadot/types/types';

import { FormatBalance } from '@/components';
import { findToken } from '@/config';
import { useParseTransfer } from '@/hooks/useParseTransfer';
import { useXcmAsset } from '@/hooks/useXcmAssets';
import { dataToUtf8 } from '@/utils';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Skeleton } from '@mimir-wallet/ui';

function TransferDetail({
  from: propsFrom,
  registry,
  call
}: {
  from?: string;
  registry: Registry;
  call: IMethod | null;
}) {
  const { network, genesisHash } = useApi();
  const results = useParseTransfer(registry, propsFrom, call);
  const [assetInfo] = useXcmAsset(network, results?.[0]);

  if (!results) {
    return null;
  }

  const [assetId, , , value, isAll] = results;

  if (assetId === null) {
    return isAll ? (
      'All'
    ) : (
      <div className='flex items-center gap-1'>
        <Avatar alt='Token' src={findToken(genesisHash).Icon} style={{ width: 20, height: 20 }} />
        <p>
          -<FormatBalance value={value} withCurrency />
        </p>
      </div>
    );
  }

  return assetInfo ? (
    isAll ? (
      `All ${assetInfo.symbol}`
    ) : (
      <div className='flex items-center gap-1'>
        <Avatar
          alt='Token'
          fallback={assetInfo.symbol.slice(0, 1)}
          src={assetInfo.logoUri}
          style={{ width: 20, height: 20 }}
        />
        <p>
          -<FormatBalance value={value} withCurrency format={[assetInfo.decimals, assetInfo.symbol]} />
        </p>
      </div>
    )
  ) : (
    <Skeleton style={{ width: 50, height: 16 }} />
  );
}

function CallDisplayDetail({
  registry,
  fallbackWithName,
  call
}: {
  registry: Registry;
  fallbackWithName?: boolean;
  call?: IMethod | null;
}) {
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
    comp = <TransferDetail registry={registry} call={call} />;
  } else if (
    ['assets.transfer', 'assets.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    comp = <TransferDetail registry={registry} call={call} />;
  } else if (
    ['tokens.transfer', 'tokens.transferKeepAlive'].includes(`${calllFunction.section}.${calllFunction.method}`)
  ) {
    comp = <TransferDetail registry={registry} call={call} />;
  } else if (
    ['utility.batch', 'utility.forceBatch', 'utility.batchAll'].includes(
      `${calllFunction.section}.${calllFunction.method}`
    )
  ) {
    comp = <div className='flex items-center gap-1'>{(call.args?.[0] as any)?.length} calls</div>;
  } else if (['identity.setIdentity'].includes(`${calllFunction.section}.${calllFunction.method}`)) {
    comp = <div className='flex items-center gap-1 font-bold'>{dataToUtf8((call.args?.[0] as any)?.display)}</div>;
  } else {
    return fallbackWithName ? `${calllFunction.section}.${calllFunction.method}` : null;
  }

  return comp;
}

export default React.memo<typeof CallDisplayDetail>(CallDisplayDetail);
