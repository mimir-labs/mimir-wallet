// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AccountDataExtra, AddressMeta, DelegateeProp, MultisigAccountData } from '../hooks/types';

import { decodeAddress } from '@/api';
import { u8aToHex } from '@polkadot/util';

export function deriveAddressMeta(
  accounts: (AccountDataExtra & AccountData)[],
  addresses: { name: string; address: string }[]
): Record<string, AddressMeta> {
  const meta: Record<string, AddressMeta> = {};

  for (const item of accounts) {
    const address = item.address;
    const name = item?.name || address.slice(0, 8).toUpperCase();

    meta[address] = {
      ...meta[address],
      name,
      cryptoType: item.cryptoType,
      isMimir: !!item.isMimir,
      isPure: item.type === 'pure',
      isProxied: !!item.isProxied,
      isProxy: !!item.isProxy,
      isInjected: !!item.source,
      isMultisig: item.type === 'multisig',
      source: item.source,
      threshold: item.type === 'multisig' ? item.threshold : undefined,
      who: item.type === 'multisig' ? item.members.map(({ address }) => address) : undefined
    };
  }

  // make pure account multisig meta
  for (const item of accounts) {
    if (item.type === 'pure') {
      const multisigAccounts = item.delegatees.filter(
        (item): item is MultisigAccountData & DelegateeProp =>
          item.proxyType === 'Any' && item.proxyDelay === 0 && item.type === 'multisig'
      );

      if (multisigAccounts.length > 0) {
        if (multisigAccounts.length === 1) {
          const account = accounts.find(
            (account): account is MultisigAccountData =>
              account.type === 'multisig' && account.address === multisigAccounts[0].address
          );
          const threshold = account?.threshold;
          const who = account?.members?.map(({ address }) => address);

          meta[item.address] = { ...meta[item.address], threshold, who };
        } else {
          meta[item.address] = { ...meta[item.address], multipleMultisig: true };
        }
      }
    }
  }

  for (const { name, address } of addresses) {
    meta[address] = {
      ...meta[address],
      name
    };
  }

  return meta;
}

export type GroupName = 'mimir' | 'injected' | 'hide';

export function groupAccounts(
  accounts: (AccountDataExtra & AccountData)[],
  hideAccountHex: HexString[]
): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    mimir: [],
    injected: [],
    hide: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    if (account.source) {
      ret.injected.push(account.address);
    } else if (hideAccountHex.includes(u8aToHex(decodeAddress(account.address)))) {
      ret.hide.push(account.address);
    } else {
      ret.mimir.push(account.address);
    }
  }

  return ret;
}

// export function deriveAddressMeta(
//   account?: AccountDataExtra & AccountData,
//   address?: { name: string; address: string },
//   value?: string | null
// ): AddressMeta {
//   if (!value) {
//     return {
//       name: 'Empty',
//       isPure: false,
//       isMimir: false,
//       isProxied: false,
//       isProxy: false,
//       isInjected: false,
//       isMultisig: false
//     };
//   }

//   value = encodeAddress(value);
//   const name = address?.name || account?.name || value.slice(0, 8).toUpperCase();

//   if (account) {
//     let who: string[] | undefined;
//     let threshold: number | undefined;

//     if (account.type === 'multisig') {
//       who = account.members.map((item) => item.address);
//       threshold = account.threshold;
//     } else if (account.type === 'pure') {
//       if (
//         account.delegatees.length === 1 &&
//         account.delegatees[0].type === 'multisig' &&
//         account.delegatees[0].proxyType.toLowerCase() === 'any' &&
//         account.delegatees[0].proxyDelay === 0
//       ) {
//         who = account.delegatees[0].members.map((item) => item.address);
//         threshold = account.delegatees[0].threshold;
//       }
//     }

//     return {
//       name,
//       cryptoType: account.cryptoType,
//       isMimir: !!account.isMimir,
//       isPure: account.type === 'pure',
//       isProxied: !!account.isProxied,
//       isProxy: !!account.isProxy,
//       isInjected: !!account.source,
//       isMultisig: account.type === 'multisig',
//       source: account.source,
//       threshold: account.type === 'multisig' ? account.threshold : undefined,
//       who: account.type === 'multisig' ? account.members.map((item) => item.address) : undefined
//     };
//   }

//   if (address) {
//     return {
//       name,
//       isMimir: false,
//       isPure: false,
//       isProxied: false,
//       isProxy: false,
//       isInjected: false,
//       isMultisig: false
//     };
//   }

//   return {
//     name,
//     isMimir: false,
//     isPure: false,
//     isProxied: false,
//     isProxy: false,
//     isInjected: false,
//     isMultisig: false
//   };
// }
