// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address as AddressType } from '@polkadot/types/interfaces';

import React, { useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/api';

function Address({
  shorten,
  value
}: {
  shorten?: boolean;
  value?: AccountId | AccountIndex | AddressType | string | null;
}) {
  const address = value?.toString();

  const format = useMemo(() => (address ? encodeAddress(address) : undefined), [address]);

  return shorten ? `${format?.slice(0, 6)}…${format?.slice(-6)}` : format;
}

export default React.memo(Address);