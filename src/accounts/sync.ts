// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from '@mimir-wallet/config';
import type { AccountData, AccountDataExtra } from '../hooks/types';

import { encodeAddress } from '@mimir-wallet/api';
import { service } from '@mimir-wallet/utils';

export function extraAccounts(
  genesisHash: HexString,
  walletAccounts: { address: string; name?: string; type?: string; source: string }[],
  data: AccountData[],
  ss58Format: number
): (AccountDataExtra & AccountData)[] {
  const accountMap: Record<string, AccountDataExtra & AccountData> = {};

  const proxied: string[] = [];
  const proxy: string[] = [];

  for (const item of data) {
    const account: AccountData = {
      ...item,
      address: encodeAddress(item.address, ss58Format),
      delegatees: item.delegatees
        .filter((delegatee: any) => delegatee.proxyNetwork === genesisHash)
        .map((delegatee: any) => {
          const address = encodeAddress(delegatee.address, ss58Format);

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
        members: account.members.map((member) => ({
          ...member,
          address: encodeAddress(member.address, ss58Format)
        }))
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
  chain: Endpoint,
  genesisHash: HexString,
  walletAccounts: { address: string; name?: string; type?: string; source: string }[],
  chainSS58: number,
  cb: (values: (AccountDataExtra & AccountData)[]) => void
): Promise<void> {
  const data = await service.getMultisigs(
    chain,
    walletAccounts.map((item) => item.address)
  );
  const accounts = extraAccounts(genesisHash, walletAccounts, data, chainSS58);

  cb(accounts);
}
