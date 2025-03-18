// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { BN, BN_THOUSAND, BN_TWO, bnMin } from '@polkadot/util';
import { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import { createNamedHook } from './createNamedHook';
import { A_DAY } from './useBlocksPerDays';

// Some chains incorrectly use these, i.e. it is set to values such as 0 or even 2
// Use a low minimum validity threshold to check these against
const THRESHOLD = BN_THOUSAND.div(BN_TWO);
const DEFAULT_TIME = new BN(6_000);

function calcInterval(api: ApiPromise): BN {
  return bnMin(
    A_DAY,
    // Babe, e.g. Relay chains (Substrate defaults)
    api.consts.babe?.expectedBlockTime ||
      // POW, eg. Kulupu
      api.consts.difficulty?.targetBlockTime ||
      // Subspace
      api.consts.subspace?.expectedBlockTime ||
      // Check against threshold to determine value validity
      (api.consts.timestamp?.minimumPeriod.gte(THRESHOLD)
        ? // Default minimum period config
          api.consts.timestamp.minimumPeriod.mul(BN_TWO)
        : api.query.parachainSystem
          ? // default guess for a parachain
            DEFAULT_TIME.mul(BN_TWO)
          : // default guess for others
            DEFAULT_TIME)
  );
}

function useBlockIntervalImpl(apiOverride?: ApiPromise | null): BN {
  const { api } = useApi();

  return useMemo(() => calcInterval(apiOverride || api), [api, apiOverride]);
}

export const useBlockInterval = createNamedHook('useBlockInterval', useBlockIntervalImpl);
