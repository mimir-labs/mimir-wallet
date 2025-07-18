// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address as AddressType } from '@polkadot/types/interfaces';

import React, { useMemo } from 'react';

import { encodeAddress, isPolkadotEvmAddress, sub2Eth, useApi } from '@mimir-wallet/polkadot-core';

function Address({
  shorten,
  value,
  ss58Format
}: {
  shorten?: boolean;
  ss58Format?: number;
  value?: AccountId | AccountIndex | AddressType | string | null;
}) {
  const { chainSS58 } = useApi();
  const format = useMemo(() => encodeAddress(value, ss58Format ?? chainSS58), [value, ss58Format, chainSS58]);

  if (isPolkadotEvmAddress(value?.toString())) {
    const ethAddress = sub2Eth(value?.toString());

    return shorten ? `${ethAddress?.slice(0, 6)}…${ethAddress?.slice(-3)}` : ethAddress;
  }

  return shorten ? `${format?.slice(0, 4)}…${format?.slice(-3)}` : format;
}

export default React.memo(Address);
