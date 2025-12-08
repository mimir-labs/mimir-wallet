// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { BN, BN_THOUSAND, BN_TWO, bnMin } from '@polkadot/util';

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
            DEFAULT_TIME),
  );
}

async function fetchBlockInterval({
  queryKey,
}: {
  queryKey: readonly [string, string];
}): Promise<BN> {
  const [, network] = queryKey;

  const api = await ApiManager.getInstance().getApi(network);

  return calcInterval(api);
}

/**
 * Hook to get block interval for a specific network
 * @param network - The network key to query
 * @returns Block interval in milliseconds as BN
 */
export function useBlockInterval(network: string): BN {
  const { data } = useQuery({
    queryKey: ['block-interval', network] as const,
    queryFn: fetchBlockInterval,
    enabled: !!network,
    staleTime: Infinity, // Block interval doesn't change
  });

  return data ?? DEFAULT_TIME;
}
