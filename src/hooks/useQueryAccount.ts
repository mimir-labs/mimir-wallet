// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, DelegateeProp } from './types';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { createNamedHook } from './createNamedHook';
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

function useQueryAccountImpl(address?: string | null): AccountData | undefined {
  const { genesisHash } = useApi();
  const [account, setAccount] = useState<AccountData>();
  const { data } = useQuery<AccountData | null>({
    queryHash: serviceUrl(`accounts/full/${address}`),
    queryKey: [address ? serviceUrl(`accounts/full/${address}`) : null]
  });

  useEffect(() => {
    if (data) {
      setAccount(transformAccount(genesisHash, data));
    }
  }, [data, genesisHash]);

  return account;
}

export const useQueryAccount = createNamedHook('useQueryAccount', useQueryAccountImpl);
