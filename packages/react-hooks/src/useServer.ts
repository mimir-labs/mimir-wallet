// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HexString } from '@polkadot/util/types';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { appConfig } from '@mimirdev/app-config';

import { createNamedHook } from './createNamedHook';
import { fetcher } from './fetcher';
import { MultisigTransaction } from './types';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';
import { useEndpoint } from './useEndpoint';
import { useGroupAccounts } from './useGroupAccounts';

const jsonHeader = { 'Content-Type': 'application/json' };

function useServerImpl() {
  const endpoint = useEndpoint();

  const server = endpoint?.server || appConfig.server;

  const createMultisig = useCallback(
    (address: string, who: string[], threshold: number) => {
      return fetcher(`${server}multisig`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify({ address, who, threshold })
      });
    },
    [server]
  );

  const createCalldata = useCallback(
    (calldata: HexString) => {
      return fetcher(`${server}calldata`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify({ calldata })
      });
    },
    [server]
  );

  return { createMultisig, createCalldata };
}

export const useServer = createNamedHook('useServer', useServerImpl);

export function useMultisigs() {
  const endpoint = useEndpoint();
  const server = endpoint?.server || appConfig.server;
  const { allAccounts } = useAccounts();

  const { data } = useSWR<
    Array<
      Array<{
        address: HexString;
        threshold: number;
        who: HexString[];
        name: string;
      }>
    >
  >([allAccounts], ([allAccounts]: [string[]]) => Promise.all(allAccounts.map((address) => fetcher(`${server}multisig?address=${address}`))));

  return useMemo(() => (data ? data.flat() : []), [data]);
}

export function useTransactions() {
  const endpoint = useEndpoint();
  const { systemChain } = useApi();
  const server = endpoint?.server || appConfig.server;
  const { multisig } = useGroupAccounts();

  const { data } = useSWR<MultisigTransaction[][]>([multisig], ([multisigs]: [string[]]) =>
    Promise.all(multisigs.map((address) => fetcher(`${server}transactions?address=${address}&chain_name=${systemChain}`)))
  );

  return useMemo(() => (data ? data.flat() : []), [data]);
}

export function useCalldata(callhash: HexString) {
  const endpoint = useEndpoint();
  const server = endpoint?.server || appConfig.server;

  const { data } = useSWR<{ id: HexString; data: HexString }>(`${server}calldata/${callhash}`, fetcher);

  return data;
}
