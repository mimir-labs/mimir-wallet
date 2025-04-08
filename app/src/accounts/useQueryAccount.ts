// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { isEqual } from 'lodash-es';
import { useEffect } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { useClientQuery, useQuery } from '@mimir-wallet/service';

import { updateMeta } from './actions';

function transformAccount(chainSS58: number, genesisHash: HexString, account: AccountData): AccountData {
  const proposers = account.proposers
    ?.filter((item) => item.network === genesisHash)
    .map((item) => ({
      proposer: encodeAddress(item.proposer, chainSS58),
      creator: encodeAddress(item.creator, chainSS58),
      createdAt: item.createdAt,
      network: item.network
    }));

  if (account.type === 'pure' && account.network !== genesisHash) {
    return {
      createdAt: Date.now(),
      type: 'account',
      address: encodeAddress(account.address, chainSS58),
      name: account.name,
      delegatees: [],
      proposers
    };
  }

  return {
    ...account,
    address: encodeAddress(account.address, chainSS58),
    delegatees: account.delegatees
      .filter((item) => item.proxyNetwork === genesisHash)
      .map((delegatee) => transformAccount(chainSS58, genesisHash, delegatee)) as (AccountData & DelegateeProp)[],
    ...(account.type === 'multisig'
      ? {
          members: account.members.map((member) => transformAccount(chainSS58, genesisHash, member))
        }
      : {}),
    proposers
  };
}

export function useQueryAccount(
  address?: string | null
): [AccountData | null | undefined, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { genesisHash, chainSS58, network } = useApi();
  const { queryHash, queryKey } = useClientQuery(address ? `chains/${network}/${address}/details` : null);
  const { data, isFetched, isFetching, refetch } = useQuery<AccountData | null>({
    initialData: null,
    queryHash,
    queryKey,
    structuralSharing: (prev, next): AccountData | null => {
      if (!next) {
        return null;
      }

      const nextData = transformAccount(chainSS58, genesisHash, next as AccountData);

      return isEqual(prev, nextData) ? (prev as AccountData) : nextData;
    }
  });

  useEffect(() => {
    if (data) {
      updateMeta(data);
    }
  }, [data]);

  return [data, isFetched, isFetching, refetch];
}
