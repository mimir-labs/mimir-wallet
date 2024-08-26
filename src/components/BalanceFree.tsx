// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';

import { useApi, useCall } from '@mimir-wallet/hooks';

import FormatBalance from './FormatBalance';

interface Props {
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function BalanceFree({ params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [params]);

  return <FormatBalance value={allBalances?.freeBalance} />;
}

export default React.memo(BalanceFree);
