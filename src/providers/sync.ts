// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AccountDataExtra } from '../hooks/types';
import type { AddressState } from './types';

import { isEqual } from 'lodash-es';

import { encodeAddress } from '@mimir-wallet/api';
import { service, sleep } from '@mimir-wallet/utils';

export function extraAccounts(
  genesisHash: HexString,
  walletAccounts: { address: string; name?: string; type?: string; source: string }[],
  data: AccountData[]
): (AccountDataExtra & AccountData)[] {
  const accountMap: Record<string, AccountDataExtra & AccountData> = {};

  const proxied: string[] = [];
  const proxy: string[] = [];

  for (const item of data) {
    const account: AccountData = {
      ...item,
      address: encodeAddress(item.address),
      delegatees: item.delegatees
        .filter((delegatee: any) => delegatee.proxyNetwork === genesisHash)
        .map((delegatee: any) => {
          const address = encodeAddress(delegatee.address);

          proxy.push(address);

          return { ...delegatee, address };
        })
    };

    if (account.delegatees.length > 0) {
      proxied.push(account.address);
    }

    // exclude pure on other networks
    if (account.type === 'pure') {
      if (account.network === genesisHash && account.delegatees.length > 0) {
        accountMap[account.address] = account;
      }

      continue;
    }

    if (account.type === 'multisig') {
      accountMap[account.address] = {
        ...account,
        members: account.members.map((member) => ({ ...member, address: encodeAddress(member.address) }))
      };

      continue;
    }

    // exclude the account have no delegatee
    if (account.delegatees.length > 0) {
      accountMap[account.address] = account;
    }
  }

  // add wallet account;
  for (const item of walletAccounts) {
    accountMap[item.address] = {
      ...accountMap[item.address],
      address: item.address,
      type: 'account',
      name: item.name,
      source: item.source,
      cryptoType: item.type
    };
  }

  return Object.values(accountMap)
    .filter((item) =>
      item.type === 'multisig' ? item.members.findIndex((member) => !!accountMap[member.address]) > -1 : true
    )
    .map((item): AccountDataExtra & AccountData => ({
      ...item,
      isProxied: proxied.includes(item.address),
      isProxy: proxy.includes(item.address)
    }));
}

export async function sync(
  genesisHash: HexString,
  walletAccounts: { address: string; name?: string; type?: string; source: string }[],
  setState: React.Dispatch<React.SetStateAction<AddressState>>
): Promise<void> {
  while (true) {
    try {
      const data = await service.getMultisigs(walletAccounts.map((item) => item.address));
      const accounts = extraAccounts(genesisHash, walletAccounts, data);

      setState((state) => ({
        ...state,
        isMultisigSyned: true,
        accounts: isEqual(state.accounts, accounts) ? state.accounts : accounts
      }));

      break;
    } catch {
      await sleep(6000);
      /* empty */
    }
  }
}
