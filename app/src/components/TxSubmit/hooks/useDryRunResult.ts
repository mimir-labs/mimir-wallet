// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxBundle } from '../utils';

import { dryRun, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export function useDryRunResult(txBundle: TxBundle | null) {
  const method = txBundle?.tx.method.toU8a() || null;
  const address = txBundle?.signer || null;
  const { api, isApiReady, genesisHash } = useApi();

  return useQuery({
    queryHash: `${genesisHash}-dryRun-${method}-${address}`,
    queryKey: [method, address] as const,
    enabled: !!isApiReady && !!method && !!address && !!api.call.dryRunApi?.dryRunCall,
    queryFn: ({ queryKey: [method, address] }) => {
      if (!method || !address) {
        throw new Error('Method and address are required');
      }

      return dryRun(api, method, address);
    }
  });
}
