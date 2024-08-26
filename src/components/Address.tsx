// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address as AddressType } from '@polkadot/types/interfaces';

import React from 'react';

function Address({
  shorten,
  value
}: {
  shorten?: boolean;
  value?: AccountId | AccountIndex | AddressType | string | null;
}) {
  const address = value?.toString();

  return shorten ? `${address?.slice(0, 6)}…${address?.slice(-6)}` : address;
}

export default React.memo(Address);
