// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath } from '@mimir-wallet/hooks/types';
import type { TxBundle } from '../utils';

import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/hooks';

import { buildTx } from '../utils';

export function useBuildTx(method: IMethod | HexString, filterPath: FilterPath[]) {
  const { api } = useApi();
  const [state, setState] = useState<{ isLoading: boolean; txBundle: TxBundle }>({
    isLoading: true,
    txBundle: { canProxyExecute: false, tx: null }
  });

  useEffect(() => {
    buildTx(api, api.createType('Call', method), filterPath).then((bundle) =>
      setState({ isLoading: false, txBundle: bundle })
    );
  }, [api, filterPath, method]);

  return state;
}
