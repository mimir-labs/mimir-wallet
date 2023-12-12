// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN, bnToBn } from '@polkadot/util';
import { useMemo } from 'react';

import { createNamedHook } from './createNamedHook';
import { useBlockInterval } from './useBlockInterval';

export const A_DAY = new BN(24 * 60 * 60 * 1000);

function useBlocksPerDaysImpl(days: BN | number = 1): BN {
  const blockTime = useBlockInterval();

  return useMemo(() => A_DAY.mul(bnToBn(days)).div(blockTime), [blockTime, days]);
}

export const useBlocksPerDays = createNamedHook('useBlocksPerDays', useBlocksPerDaysImpl);
