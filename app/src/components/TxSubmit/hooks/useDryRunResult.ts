// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { TxBundle } from '../utils';

import { dryRun } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export function useDryRunResult(api: ApiPromise, txBundle: TxBundle | null) {
  const method = txBundle?.tx.method.toU8a() || null;
  const address = txBundle?.signer || null;

  return useQuery({
    queryHash: `dryRun-${method}-${address}`,
    queryKey: [method, address] as const,
    enabled: !!method && !!address && !!api.call.dryRunApi?.dryRunCall,
    queryFn: ({ queryKey: [method, address] }) => {
      if (!method || !address) {
        return undefined;
      }

      return dryRun(api, method, address);
    }
  });
}
