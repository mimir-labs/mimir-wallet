// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp } from '@/hooks/types';

import { isEqual } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { addressToHex, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { useClientQuery, useQuery } from '@mimir-wallet/service';

import { useAccount } from './useAccount';

function transformAccount(
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
      .filter((delegatee) => (filterByGenesisHash ? delegatee.proxyNetwork === genesisHash : true))
      .map((delegatee) => transformAccount(chainSS58, delegatee, filterByGenesisHash, genesisHash)) as (AccountData &
      DelegateeProp)[],
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
  const { queryHash, queryKey } = useClientQuery(address ? `omni-chain/${addressToHex(address)}/details` : null);

  const { data, isFetched, isFetching, refetch } = useQuery<AccountData | null>({
    initialData: null,
    queryHash,
    queryKey,
    structuralSharing: (prev, next: any): AccountData | null => {
      if (!next) {
        return null;
      }

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
  const { queryHash, queryKey } = useClientQuery(address ? `omni-chain/${addressToHex(address)}/details` : null);

  const { data, isFetched, isFetching, refetch, promise } = useQuery<AccountData | null>({
    initialData: null,
    queryHash,
    queryKey,
    structuralSharing: (prev, next: any): AccountData | null => {
      if (!next) {
        return null;
      }

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
