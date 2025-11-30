// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxBundle } from '../utils';

import { useSupportsDryRun } from '@/hooks/useChainCapabilities';

import { ApiManager, dryRun, type DryRunResult, useNetwork } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export function useDryRunResult(txBundle: TxBundle | null) {
  const method = txBundle?.tx.method.toHex() || null;
  const address = txBundle?.signer || null;
  const { network } = useNetwork();
  const { supportsDryRun } = useSupportsDryRun(network);

  const { data: dryRunResult } = useQuery({
    queryKey: ['dry-run-result', network, method, address] as const,
    queryFn: async () => {
      if (!method || !address) {
        return undefined;
      }

      const api = await ApiManager.getInstance().getApi(network);

      if (!api) {
        return undefined;
      }

      return dryRun(api, method, address);
    },
    enabled: !!network && !!method && !!address && supportsDryRun,
    staleTime: 0, // Always refetch for new transactions
    retry: false
  });

  return {
    dryRunResult: dryRunResult as DryRunResult | undefined
  };
}
