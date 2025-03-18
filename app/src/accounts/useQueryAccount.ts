// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AccountDataWithProposers, AddressMeta, DelegateeProp } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { service } from '@/utils';
import { isEqual } from 'lodash-es';
import { useEffect } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useAccount } from './useAccount';

function transformAccount(genesisHash: HexString, account: AccountDataWithProposers): AccountDataWithProposers {
  const proposers = account.proposers?.map((item) => ({
    proposer: encodeAddress(item.proposer),
    creator: encodeAddress(item.creator),
    createdAt: item.createdAt,
    network: item.network
  }));

  if (account.type === 'pure' && account.network !== genesisHash) {
    return {
      createdAt: Date.now(),
      type: 'account',
      address: encodeAddress(account.address),
      name: account.name,
      delegatees: [],
      proposers
    };
  }

  return {
    ...account,
    address: encodeAddress(account.address),
    delegatees: account.delegatees
      .filter((item) => item.proxyNetwork === genesisHash)
      .map((delegatee) =>
        transformAccount(genesisHash, delegatee as unknown as AccountDataWithProposers)
      ) as (AccountDataWithProposers & DelegateeProp)[],
    ...(account.type === 'multisig'
      ? {
          members: account.members.map((member) =>
            transformAccount(genesisHash, member as unknown as AccountDataWithProposers)
          )
        }
      : {}),
    proposers
  };
}

function deriveMeta(account: AccountData, meta: Record<string, AddressMeta> = {}) {
  meta[account.address] = {
    ...meta[account.address],
    isMimir: !!account.isMimir,
    isPure: account.type === 'pure',
    isMultisig: account.type === 'multisig'
  };

  if (account.delegatees.length > 0) {
    meta[account.address] = {
      ...meta[account.address],
      isProxied: true
    };
  }

  if (account.type === 'multisig') {
    meta[account.address] = {
      ...meta[account.address],
      threshold: account.threshold,
      who: account.members.map((item) => item.address)
    };
  }

  for (const item of account.delegatees) {
    deriveMeta(item, meta);
    meta[item.address] = {
      ...meta[item.address],
      isProxy: true
    };
  }

  if (account.type === 'multisig') {
    for (const item of account.members) {
      deriveMeta(item, meta);
    }
  }
}

export function useQueryAccount(
  address?: string | null
): [AccountDataWithProposers | null | undefined, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { genesisHash } = useApi();
  const { appendMeta } = useAccount();
  const { data, isFetched, isFetching, refetch } = useQuery<AccountDataWithProposers | null>({
    initialData: null,
    queryHash: service.getNetworkUrl(`accounts/full/${address}`),
    queryKey: [address ? service.getNetworkUrl(`accounts/full/${address}`) : null],
    structuralSharing: (prev, next): AccountDataWithProposers | null => {
      if (!next) {
        return null;
      }

      const nextData = transformAccount(genesisHash, next as AccountDataWithProposers);

      return isEqual(prev, nextData) ? (prev as AccountDataWithProposers) : nextData;
    }
  });

  useEffect(() => {
    if (data) {
      const meta: Record<string, AddressMeta> = {};

      deriveMeta(data, meta);
      appendMeta(meta);
    }
  }, [appendMeta, data]);

  return [data, isFetched, isFetching, refetch];
}
