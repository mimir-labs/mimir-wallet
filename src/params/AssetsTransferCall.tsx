// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import React, { useMemo } from 'react';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import { useAssetInfo } from '@mimir-wallet/hooks';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function AssetsTransferCall({ api, call, jsonFallback }: CallProps) {
  const args = useMemo(
    () =>
      api.tx.assets && (api.tx.assets.transferKeepAlive.is(call) || api.tx.assets.transfer?.is(call))
        ? call.args
        : null,
    [api, call]
  );

  const info = useAssetInfo(args?.[0].toBn());

  if (!args || !info) {
    return jsonFallback ? <FallbackCall call={call} /> : null;
  }

  return (
    <>
      <Item
        content={
          <AddressRow
            defaultName={args[0].toString()}
            shorten={false}
            value={args[1]}
            withAddress={false}
            withCopy
            withName
          />
        }
        name='Recipient'
      />
      <Item
        content={<FormatBalance format={info ? [info.decimals, info.symbol] : undefined} value={args[2]} />}
        name='Amount'
      />
    </>
  );
}

export default React.memo(AssetsTransferCall);
