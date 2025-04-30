// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp } from '@/hooks/types';

import { isEqual } from 'lodash-es';
import { useEffect } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { useClientQuery, useQuery } from '@mimir-wallet/service';

import { useAccount } from './useAccount';

function transformAccount(chainSS58: number, account: AccountData): AccountData {
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
    delegatees: account.delegatees.map((delegatee) => transformAccount(chainSS58, delegatee)) as (AccountData &
      DelegateeProp)[],
    ...(account.type === 'multisig'
      ? {
          members: account.members.map((member) => transformAccount(chainSS58, member))
        }
      : {}),
    proposers
  };
}

export function useQueryAccount(
  address?: string | null
): [AccountData | null | undefined, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { chainSS58, network } = useApi();
  const { updateMetas } = useAccount();
  const { queryHash, queryKey } = useClientQuery(address ? `chains/${network}/${address}/details` : null);
  const { data, isFetched, isFetching, refetch } = useQuery<AccountData | null>({
    initialData: null,
    queryHash,
    queryKey,
    structuralSharing: (prev, next): AccountData | null => {
      if (!next) {
        return null;
      }

      const nextData = transformAccount(chainSS58, next as AccountData);

      return isEqual(prev, nextData) ? (prev as AccountData) : nextData;
    }
  });

  useEffect(() => {
    if (data) {
      updateMetas(data);
    }
  }, [data, updateMetas]);

  return [data, isFetched, isFetching, refetch];
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
  const { queryHash, queryKey } = useClientQuery(address ? `omni-chain/${address}/details` : null);

  const { data, isFetched, isFetching, refetch, promise } = useQuery<AccountData | null>({
    initialData: null,
    queryHash,
    queryKey,
    structuralSharing: (prev, next): AccountData | null => {
      if (!next) {
        return null;
      }

      const nextData = transformAccount(chainSS58, next as AccountData);

      return isEqual(prev, nextData) ? (prev as AccountData) : nextData;
    }
  });

  useEffect(() => {
    if (data) {
      updateMetas(data);
    }
  }, [data, updateMetas]);

  return [data, isFetched, isFetching, refetch, promise];
}
