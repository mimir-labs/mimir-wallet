// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { AddressRow, FormatBalance } from '@mimir-wallet/components';
import React, { useMemo } from 'react';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function TransferCall({ api, call, jsonFallback, type = 'base' }: CallProps) {
  const args = useMemo(() => (api.tx.balances.transferKeepAlive.is(call) ? ([call.args[0], call.args[1]] as const) : null), [api, call]);

  if (!args) {
    return jsonFallback ? <FallbackCall call={call} /> : null;
  }

  return (
    <>
      <Item content={<AddressRow defaultName={args[0].toString()} shorten={false} size='small' value={args[0]} withAddress={false} withCopy withName />} name='Recipient' type={type} />
      <Item content={<FormatBalance value={args[1]} />} name='Amount' type={type} />
    </>
  );
}

export default React.memo(TransferCall);
