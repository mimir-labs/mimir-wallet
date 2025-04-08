// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address as AddressType } from '@polkadot/types/interfaces';

import React, { useMemo } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';

function Address({
  shorten,
  value
}: {
  shorten?: boolean;
  value?: AccountId | AccountIndex | AddressType | string | null;
}) {
  const { chainSS58 } = useApi();
  const format = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);

  return shorten ? `${format?.slice(0, 6)}…${format?.slice(-6)}` : format;
}

export default React.memo(Address);
