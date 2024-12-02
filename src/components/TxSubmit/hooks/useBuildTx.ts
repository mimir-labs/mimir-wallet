// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';
import type { TxBundle } from '../utils';

import { useEffect, useState } from 'react';

import { extrinsicReserve } from '@mimir-wallet/api';
import { useApi } from '@mimir-wallet/hooks';

import { buildTx } from '../utils';

const EMPTY_STATE = {
  isLoading: true,
  txBundle: null,
  error: null,
  hashSet: new Set<HexString>(),
  reserve: {},
  unreserve: {},
  delay: {}
};

export type BuildTx = {
  isLoading: boolean;
  txBundle: TxBundle | null;
  error: Error | null;
  hashSet: Set<HexString>;
  reserve: Record<string, { value: BN }>;
  unreserve: Record<string, { value: BN }>;
  delay: Record<string, BN>;
};

export function useBuildTx(
  method: IMethod | HexString,
  filterPath: FilterPath[],
  account?: string,
  transaction?: Transaction | null | undefined
): BuildTx {
  const { api } = useApi();
  const [state, setState] = useState<Record<string, BuildTx>>({});

  useEffect(() => {
    if (filterPath.length > 0) {
      const hashSet = new Set<HexString>();

      const key = filterPath.reduce<string>((result, item) => `${result}-${item.id}`, '');

      buildTx(api, api.createType('Call', method), filterPath as [FilterPath, ...FilterPath[]], transaction, hashSet)
        .then(async (bundle) => {
          const { reserve, unreserve, delay } = await extrinsicReserve(api, bundle.signer, bundle.tx);

          setState((state) => ({
            ...state,
            [key]: { isLoading: false, txBundle: bundle, error: null, hashSet, reserve, unreserve, delay }
          }));
        })
        .catch((error) => {
          setState((state) => ({
            ...state,
            [key]: { ...EMPTY_STATE, isLoading: false, error }
          }));
        });
    } else if (account) {
      const hashSet = new Set<HexString>();

      const key = account;

      buildTx(api, api.createType('Call', method), account, transaction, hashSet)
        .then(async (bundle) => {
          const { reserve, unreserve, delay } = await extrinsicReserve(api, bundle.signer, bundle.tx);

          setState((state) => ({
            ...state,
            [key]: { isLoading: false, txBundle: bundle, error: null, hashSet, reserve, unreserve, delay }
          }));
        })
        .catch((error) => {
          setState((state) => ({
            ...state,
            [key]: { ...EMPTY_STATE, isLoading: false, error }
          }));
        });
    }
  }, [account, api, filterPath, method, transaction]);

  const key =
    filterPath.length > 0 ? filterPath.reduce<string>((result, item) => `${result}-${item.id}`, '') : account || '';

  return state[key] || EMPTY_STATE;
}