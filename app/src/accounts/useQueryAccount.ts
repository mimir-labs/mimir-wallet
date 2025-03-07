// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta, DelegateeProp } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { encodeAddress } from '@/api';
import { chainLinks } from '@/api/chain-links';
import { createNamedHook } from '@/hooks/createNamedHook';
import { useApi } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useEffect } from 'react';

import { useAccount } from './useAccount';

function transformAccount(genesisHash: HexString, account: AccountData): AccountData {
  if (account.type === 'pure' && account.network !== genesisHash) {
    return {
      createdAt: Date.now(),
      type: 'account',
      address: encodeAddress(account.address),
      name: account.name,
      delegatees: []
    };
  }

  return {
    ...account,
    address: encodeAddress(account.address),
    delegatees: account.delegatees
      .filter((item) => item.proxyNetwork === genesisHash)
      .map((delegatee) => transformAccount(genesisHash, delegatee)) as (AccountData & DelegateeProp)[],
    ...(account.type === 'multisig'
      ? { members: account.members.map((member) => transformAccount(genesisHash, member)) }
      : {})
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

function useQueryAccountImpl(
  address?: string | null
): [AccountData | null | undefined, isFetched: boolean, isFetching: boolean] {
  const { genesisHash } = useApi();
  const { appendMeta } = useAccount();
  const { data, isFetched, isFetching } = useQuery<AccountData | null>({
    initialData: null,
    queryHash: chainLinks.serviceUrl(`accounts/full/${address}`),
    queryKey: [address ? chainLinks.serviceUrl(`accounts/full/${address}`) : null],
    structuralSharing: (prev, next): AccountData | null => {
      if (!next) {
        return null;
      }

      const nextData = transformAccount(genesisHash, next as AccountData);

      return isEqual(prev, nextData) ? (prev as AccountData) : nextData;
    }
  });

  useEffect(() => {
    if (data) {
      const meta: Record<string, AddressMeta> = {};

      deriveMeta(data, meta);
      appendMeta(meta);
    }
  }, [appendMeta, data]);

  return [data, isFetched, isFetching];
}

export const useQueryAccount = createNamedHook('useQueryAccount', useQueryAccountImpl);
