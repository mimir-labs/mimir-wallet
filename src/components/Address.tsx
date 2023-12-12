// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';

function Address({ shorten, value }: { shorten?: boolean; value?: AccountId | AccountIndex | Address | string | null }) {
  const address = value?.toString();

  return shorten ? `${address?.slice(0, 6)}…${address?.slice(-6)}` : address;
}

export default React.memo(Address);
