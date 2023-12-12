// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import React, { useMemo } from 'react';

import { AddressRow, FormatBalance } from '@mimirdev/components';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function TransferCall({ api, call, type = 'base' }: CallProps) {
  const args = useMemo(() => (api.tx.balances.transferKeepAlive.is(call) ? ([call.args[0], call.args[1]] as const) : null), [api, call]);

  if (!args) {
    return <FallbackCall call={call} />;
  }

  return (
    <>
      <Item content={<AddressRow defaultName={args[0].toString()} shorten={false} size='small' value={args[0]} withAddress={false} withCopy withName />} name='Recipient' type={type} />
      <Item content={<FormatBalance value={args[1]} />} name='Amount' type={type} />
    </>
  );
}

export default React.memo(TransferCall);
