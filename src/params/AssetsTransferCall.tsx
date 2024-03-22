// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import { useAssetInfo } from '@mimir-wallet/hooks';
import React, { useMemo } from 'react';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function AssetsTransferCall({ api, call, jsonFallback, type = 'base' }: CallProps) {
  const args = useMemo(() => (api.tx.assets && (api.tx.assets.transferKeepAlive.is(call) || api.tx.assets.transfer?.is(call)) ? call.args : null), [api, call]);

  const info = useAssetInfo(args?.[0].toBn());

  if (!args || !info) {
    return jsonFallback ? <FallbackCall call={call} /> : null;
  }

  return (
    <>
      <Item content={<AddressRow defaultName={args[0].toString()} shorten={false} size='small' value={args[1]} withAddress={false} withCopy withName />} name='Recipient' type={type} />
      <Item content={<FormatBalance format={info ? [info.decimals, info.symbol] : undefined} value={args[2]} />} name='Amount' type={type} />
    </>
  );
}

export default React.memo(AssetsTransferCall);
