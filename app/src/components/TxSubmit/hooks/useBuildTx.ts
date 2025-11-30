// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { TxBundle } from '../utils';

import { isHex } from '@polkadot/util';
import { useMemo } from 'react';

import { ApiManager, extrinsicReserve } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { buildTx } from '../utils';

interface BuildTxResult {
  txBundle: TxBundle;
  hashSet: Set<HexString>;
  reserve: Record<string, { value: BN }>;
  unreserve: Record<string, { value: BN }>;
  delay: Record<string, BN>;
}

export type BuildTx = {
  isLoading: boolean;
  txBundle: TxBundle | null;
  error: Error | null;
  hashSet: Set<HexString>;
  reserve: Record<string, { value: BN }>;
  unreserve: Record<string, { value: BN }>;
  delay: Record<string, BN>;
};

/**
 * Create queryFn for building transaction
 * Complex objects (filterPath, transaction) are passed via closure
 */
function createBuildTxQueryFn(filterPath: FilterPath[], transaction?: Transaction | null) {
  return async ({
    queryKey
  }: {
    queryKey: readonly [string, string, HexString | undefined, string, number | undefined];
  }): Promise<BuildTxResult> => {
    const [, network, methodHex] = queryKey;

    if (!methodHex) {
      throw new Error('Method is required');
    }

    const api = await ApiManager.getInstance().getApi(network);

    if (!api) {
      throw new Error('Failed to load API');
    }

    const hashSet = new Set<HexString>();
    const call = api.createType('Call', methodHex);
    const bundle = await buildTx(api, call, filterPath as [FilterPath, ...FilterPath[]], transaction, hashSet);
    const { reserve, unreserve, delay } = await extrinsicReserve(api, bundle.signer, bundle.tx);

    return {
      txBundle: bundle,
      hashSet,
      reserve,
      unreserve,
      delay
    };
  };
}

export function useBuildTx(
  network: string,
  method: IMethod | HexString | undefined,
  filterPath: FilterPath[],
  transaction?: Transaction | null | undefined
): BuildTx {
  // Generate stable key for filterPath
  const filterPathKey = useMemo(
    () => (filterPath.length > 0 ? filterPath.reduce<string>((result, item) => `${result}-${item.id}`, '') : 'none'),
    [filterPath]
  );

  // Check if this is a proposer-type path (no build needed)
  const isProposerPath = filterPath.length > 0 && filterPath.some((item) => item.type === 'proposer');

  // Convert method to hex string for stable query key
  const methodHex = useMemo(() => {
    if (!method) return undefined;

    return isHex(method) ? method : method.toHex();
  }, [method]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['build-tx', network, methodHex, filterPathKey, transaction?.id] as const,
    queryFn: createBuildTxQueryFn(filterPath, transaction),
    enabled: !!network && !!methodHex && filterPath.length > 0 && !isProposerPath,
    retry: false
  });

  // Return empty state for proposer paths
  if (isProposerPath) {
    return {
      isLoading: false,
      txBundle: null,
      error: null,
      hashSet: new Set<HexString>(),
      reserve: {},
      unreserve: {},
      delay: {}
    };
  }

  return {
    isLoading,
    txBundle: data?.txBundle ?? null,
    error: error as Error | null,
    hashSet: data?.hashSet ?? new Set<HexString>(),
    reserve: data?.reserve ?? {},
    unreserve: data?.unreserve ?? {},
    delay: data?.delay ?? {}
  };
}
