// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxBundle } from '../utils';

import { useEffect, useState } from 'react';

import { dryRun, type DryRunResult, useApi } from '@mimir-wallet/polkadot-core';

export function useDryRunResult(txBundle: TxBundle | null) {
  const method = txBundle?.tx.method.toHex() || null;
  const address = txBundle?.signer || null;
  const { api, isApiReady } = useApi();
  const [dryRunResult, setDryRunResult] = useState<DryRunResult>();

  useEffect(() => {
    if (method && address && isApiReady && !!api.call.dryRunApi?.dryRunCall) {
      dryRun(api, method, address).then(setDryRunResult);
    }
  }, [address, api, isApiReady, method]);

  return {
    dryRunResult
  };
}
