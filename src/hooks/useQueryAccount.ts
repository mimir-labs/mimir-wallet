// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AddressMeta, DelegateeProp } from './types';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { createNamedHook } from './createNamedHook';
import { useAccount } from './useAccounts';
import { useApi } from './useApi';

function transformAccount(genesisHash: HexString, account: AccountData): AccountData {
  if (account.type === 'pure' && account.network !== genesisHash) {
    return {
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

  account.delegatees.forEach((item) => {
    deriveMeta(item, meta);
  });

  if (account.type === 'multisig') {
    account.members.forEach((item) => {
      deriveMeta(item, meta);
    });
  }
}

function useQueryAccountImpl(address?: string | null): AccountData | undefined {
  const { genesisHash } = useApi();
  const { appendMeta } = useAccount();
  const [account, setAccount] = useState<AccountData>();
  const { data } = useQuery<AccountData | null>({
    queryHash: serviceUrl(`accounts/full/${address}`),
    queryKey: [address ? serviceUrl(`accounts/full/${address}`) : null]
  });

  useEffect(() => {
    if (data) {
      const account = transformAccount(genesisHash, data);
      const meta: Record<string, AddressMeta> = {};

      deriveMeta(account, meta);
      appendMeta(meta);
      setAccount(account);
    }
  }, [appendMeta, data, genesisHash]);

  return account;
}

export const useQueryAccount = createNamedHook('useQueryAccount', useQueryAccountImpl);
