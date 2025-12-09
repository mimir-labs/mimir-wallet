// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TimepointMismatchInfo, TxBundleWithWarning } from '../utils';
import type { FilterPath, Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';

import { ApiManager, extrinsicReserve } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';
import { isHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';
import { useMemo } from 'react';

import { buildTx, MultisigAlreadyExecutedError } from '../utils';

/**
 * Check if an error is a MultisigAlreadyExecutedError
 */
export function isMultisigAlreadyExecutedError(
  error: unknown,
): error is MultisigAlreadyExecutedError {
  return error instanceof MultisigAlreadyExecutedError;
}

export interface BuildTxResult {
  txBundle: TxBundleWithWarning;
  hashSet: Set<HexString>;
  reserve: Record<string, { value: BN }>;
  unreserve: Record<string, { value: BN }>;
  delay: Record<string, BN>;
}

export type BuildTx = {
  isLoading: boolean;
  txBundle: TxBundleWithWarning | null;
  error: Error | null;
  hashSet: Set<HexString>;
  reserve: Record<string, { value: BN }>;
  unreserve: Record<string, { value: BN }>;
  delay: Record<string, BN>;
  timepointMismatch?: TimepointMismatchInfo;
};

/**
 * Build transaction with latest on-chain state
 * This is the imperative version that can be used in mutations
 */
export async function buildTxAsync(
  network: string,
  methodHex: HexString,
  filterPath: FilterPath[],
  transactionId?: number,
): Promise<BuildTxResult> {
  const api = await ApiManager.getInstance().getApi(network);

  // Fetch latest transaction state if transactionId is provided
  let transaction: Transaction | null = null;

  if (transactionId) {
    transaction = await service.transaction.getTransactionDetail(
      network,
      transactionId.toString(),
    );
  }

  const hashSet = new Set<HexString>();
  const call = api.createType('Call', methodHex);
  const bundle = await buildTx(
    api,
    call,
    filterPath as [FilterPath, ...FilterPath[]],
    transaction,
    hashSet,
  );
  const { reserve, unreserve, delay } = await extrinsicReserve(
    api,
    bundle.signer,
    bundle.tx,
  );

  return {
    txBundle: bundle,
    hashSet,
    reserve,
    unreserve,
    delay,
  };
}

export function useBuildTx(
  network: string,
  method: IMethod | HexString | undefined,
  filterPath: FilterPath[],
  transactionId?: number,
): BuildTx {
  // Check if this is a proposer-type path (no build needed)
  const isProposerPath =
    filterPath.length > 0 &&
    filterPath.some((item) => item.type === 'proposer');

  // Convert method to hex string for stable query key
  const methodHex = useMemo(() => {
    if (!method) return undefined;

    return isHex(method) ? method : method.toHex();
  }, [method]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'build-tx',
      network,
      methodHex,
      filterPath,
      transactionId,
    ] as const,
    queryFn: ({
      queryKey: [, network, methodHex, filterPath, transactionId],
    }) => buildTxAsync(network, methodHex!, filterPath, transactionId),
    enabled:
      !!network && !!methodHex && filterPath.length > 0 && !isProposerPath,
    staleTime: 0,
    refetchInterval: 6000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    structuralSharing: (prev: unknown | undefined, next: unknown) => {
      return isEqual(prev, next) ? prev : next;
    },
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
      delay: {},
      timepointMismatch: undefined,
    };
  }

  return {
    isLoading,
    txBundle: data?.txBundle ?? null,
    error: error as Error | null,
    hashSet: data?.hashSet ?? new Set<HexString>(),
    reserve: data?.reserve ?? {},
    unreserve: data?.unreserve ?? {},
    delay: data?.delay ?? {},
    timepointMismatch: data?.txBundle?.timepointMismatch,
  };
}
