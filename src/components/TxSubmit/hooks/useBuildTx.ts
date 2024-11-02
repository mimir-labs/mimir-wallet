// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath } from '@mimir-wallet/hooks/types';
import type { TxBundle } from '../utils';

import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/hooks';

import { buildTx } from '../utils';

const EMPTY_STATE = {
  isLoading: true,
  txBundle: null,
  error: null,
  hashSet: new Set<HexString>()
};

export type BuildTx = {
  isLoading: boolean;
  txBundle: TxBundle | null;
  error: Error | null;
  hashSet: Set<HexString>;
};

export function useBuildTx(method: IMethod | HexString, filterPath: FilterPath[], account?: string) {
  const { api } = useApi();
  const [state, setState] = useState<BuildTx>(EMPTY_STATE);

  useEffect(() => {
    setState(EMPTY_STATE);

    const hashSet = new Set<HexString>();

    buildTx(api, api.createType('Call', method), filterPath, account, hashSet)
      .then(async (bundle) => {
        setState({ isLoading: false, txBundle: bundle, error: null, hashSet });
      })
      .catch((error) => setState((state) => ({ ...state, isLoading: false, txBundle: null, error })));
  }, [account, api, filterPath, method]);

  return state;
}
