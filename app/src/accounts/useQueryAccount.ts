// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp } from '@/hooks/types';

import { isEqual } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { addressToHex, encodeAddress, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';

import { useAccount } from './useAccount';

export function transformAccount(
  chainSS58: number,
  account: AccountData,
  filterByGenesisHash: boolean = false,
  genesisHash?: string
): AccountData {
  const proposers = account.proposers?.map((item) => ({
    proposer: encodeAddress(item.proposer, chainSS58),
    creator: encodeAddress(item.creator, chainSS58),
    createdAt: item.createdAt,
    network: item.network
  }));

  return {
    ...account,
    // hide name for display
    name: undefined,
    address: encodeAddress(account.address, chainSS58),
    delegatees: account.delegatees
      .filter((delegatee) => {
        if (filterByGenesisHash) {
          return delegatee.proxyNetwork === genesisHash || remoteProxyRelations[delegatee.proxyNetwork] === genesisHash;
        }

        return true;
      })
      .map((delegatee) => ({
        ...transformAccount(chainSS58, delegatee, filterByGenesisHash, genesisHash),
        isRemoteProxy: filterByGenesisHash ? delegatee.proxyNetwork !== genesisHash : false
      })) as (AccountData & DelegateeProp)[],
    ...(account.type === 'multisig'
      ? {
          members: account.members.map((member) =>
            transformAccount(chainSS58, member, filterByGenesisHash, genesisHash)
          )
        }
      : {}),
    proposers
  };
}

export function useQueryAccount(
  address?: string | null
): [AccountData | null | undefined, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { chainSS58, genesisHash } = useApi();
  const { updateMetas } = useAccount();

  const addressHex: string = address ? addressToHex(address) : '';
  const { data, isFetched, isFetching, refetch } = useQuery({
    queryKey: [addressHex] as const,
    queryHash: `omni-chain-${addressHex}`,
    staleTime: 6_000,
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!addressHex,
    queryFn: ({ queryKey: [address] }) => service.account.getOmniChainDetails(address),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  const accountData = useMemo(
    () => (data ? transformAccount(chainSS58, data, true, genesisHash) : null),
    [data, chainSS58, genesisHash]
  );

  useEffect(() => {
    if (accountData) {
      updateMetas(accountData);
    }
  }, [accountData, updateMetas]);

  return [accountData, isFetched, isFetching, refetch];
}

export function useQueryAccountOmniChain(
  address?: string | null
): [
  AccountData | null | undefined,
  isFetched: boolean,
  isFetching: boolean,
  refetch: () => void,
  promise: Promise<AccountData | null>
] {
  const { chainSS58 } = useApi();
  const { updateMetas } = useAccount();

  const addressHex: string = address ? addressToHex(address) : '';
  const { data, isFetched, isFetching, refetch, promise } = useQuery({
    queryKey: [addressHex] as const,
    queryHash: `omni-chain-${addressHex}`,
    staleTime: 6_000,
    refetchInterval: 6_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: ({ queryKey: [address] }) => service.account.getOmniChainDetails(address),
    enabled: !!addressHex,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  const accountData = useMemo(() => (data ? transformAccount(chainSS58, data) : null), [data, chainSS58]);

  useEffect(() => {
    if (accountData) {
      updateMetas(accountData);
    }
  }, [accountData, updateMetas]);

  return [accountData, isFetched, isFetching, refetch, promise];
}
