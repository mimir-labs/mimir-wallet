// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address as AddressType } from '@polkadot/types/interfaces';

import React, { useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { useApi } from '@mimir-wallet/hooks/useApi';

function Address({
  shorten,
  value,
  ss58Format
}: {
  ss58Format?: number;
  shorten?: boolean;
  value?: AccountId | AccountIndex | AddressType | string | null;
}) {
  const { chainSS58 } = useApi();
  const format = useMemo(() => encodeAddress(value, ss58Format ?? chainSS58), [value, ss58Format, chainSS58]);

  return shorten ? `${format?.slice(0, 6)}…${format?.slice(-6)}` : format;
}

export default React.memo(Address);
