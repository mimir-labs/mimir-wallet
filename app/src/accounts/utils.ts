// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AddressMeta } from '../hooks/types';

import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';
import { u8aToHex } from '@polkadot/util';

import { addressToHex, decodeAddress } from '@mimir-wallet/polkadot-core';

export function deriveAccountMeta(account: AccountData, metas: Record<string, AddressMeta>) {
  const addressHex = addressToHex(account.address);

  if (account.type === 'multisig' && (!metas[addressHex]?.isMultisig || (metas[addressHex]?.who || []).length === 0)) {
    const existingMeta = metas[addressHex] || {};
    const baseMeta = {
      name: account.name || existingMeta.name || '',
      isMimir: !!account.isMimir
    };

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      ...{
        isMultisig: true,
        threshold: account.threshold,
        who: account.members.map(({ address }) => address)
      }
    } as AddressMeta;

    for (const member of account.members) {
      deriveAccountMeta(member, metas);
    }
  }

  if (account.type === 'pure') {
    const existingMeta: AddressMeta = metas[addressHex] || {};
    const baseMeta = {
      name: account.name || existingMeta.name || '',
      isMimir: !!account.isMimir
    };

    const multisigDelegatees = account.delegatees.filter((item) => item.type === 'multisig');

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      isPure: true,
      createdBlock: account.createdBlock,
      createdBlockHash: account.createdBlockHash,
      createdExtrinsicHash: account.createdExtrinsicHash,
      createdExtrinsicIndex: account.createdExtrinsicIndex,
      creator: account.creator,
      disambiguationIndex: account.disambiguationIndex,
      pureCreatedAt: account.network,
      ...(multisigDelegatees.length === 1
        ? {
            threshold: multisigDelegatees[0].threshold,
            who: multisigDelegatees[0].members.map(({ address }) => address)
          }
        : {})
    } as AddressMeta;
  }

  if (account.delegatees.length > 0) {
    const existingMeta = metas[addressHex] || {};
    const baseMeta = {
      name: account.name || existingMeta.name || '',
      isMimir: !!account.isMimir
    };

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      ...{
        isProxied: true,
        multipleMultisig: account.delegatees.filter((item) => item.type === 'multisig').length > 1,
        proxyNetworks: Array.from(new Set(account.delegatees.map((item) => item.proxyNetwork)))
      }
    } as AddressMeta;

    for (const delegatee of account.delegatees) {
      const delegateeHex = addressToHex(delegatee.address);
      const existingMeta = metas[delegateeHex] || {};

      const baseMeta = {
        name: delegatee.name || existingMeta.name || '',
        isMimir: !!delegatee.isMimir
      };

      metas[delegateeHex] = {
        ...existingMeta,
        ...baseMeta,
        ...{
          isProxy: true,
          proxyType: delegatee.proxyType,
          network: delegatee.proxyNetwork,
          delay: delegatee.proxyDelay
        }
      } as AddressMeta;

      deriveAccountMeta(delegatee, metas);
    }
  }
}

export type GroupName = 'mimir' | 'injected';

export function groupAccounts(
  accounts: AccountData[],
  hideAccountHex: HexString[],
  metas: Record<string, AddressMeta>,
  filter?: string
): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    mimir: [],
    injected: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    const addressHex = addressToHex(account.address);
    const meta = metas[addressHex];

    if (filter) {
      const identity = useIdentityStore.getState()[addressHex];

      // if filter is provided, only add accounts that match the filter
      if (
        !account.address.toLowerCase().includes(filter.toLowerCase()) &&
        !meta.name?.toLowerCase().includes(filter.toLowerCase()) &&
        (identity ? !identity.toLowerCase().includes(filter.toLowerCase()) : true)
      ) {
        continue;
      }
    }

    if (meta?.isInjected) {
      ret.injected.push(account.address);
    } else if (!hideAccountHex.includes(u8aToHex(decodeAddress(account.address)))) {
      ret.mimir.push(account.address);
    }
  }

  ret.mimir = sortAccounts(ret.mimir, metas);
  ret.injected = sortAccounts(ret.injected, metas);

  return ret;
}

export function reduceAccount(
  account: AccountData,
  cb: (account: AccountData, proxyType?: string, delay?: number) => void,
  proxyType?: string,
  delay?: number
) {
  if (account.type === 'multisig') {
    for (const member of account.members) {
      reduceAccount(member, cb);
    }
  }

  for (const delegatee of account.delegatees) {
    reduceAccount(delegatee, cb, delegatee.proxyType, delegatee.proxyDelay);
  }

  cb(account, proxyType, delay);
}

export function sortAccounts(addresses: string[], metas: Record<HexString, AddressMeta>) {
  // sort addresses by the order of the metas
  // injected accounts first
  // pure accounts next
  // otherwise, sort by address name
  return [...addresses].sort((a, b) => {
    const metaA = metas[addressToHex(a)];
    const metaB = metas[addressToHex(b)];
    const addressNameA = metaA?.name || a;
    const addressNameB = metaB?.name || b;

    // First compare by account type
    if (metaA?.isInjected && !metaB?.isInjected) return -1;
    if (!metaA?.isInjected && metaB?.isInjected) return 1;
    // If both are injected accounts, sort by name
    if (metaA?.isInjected && metaB?.isInjected) return addressNameA.localeCompare(addressNameB);

    if (metaA?.isPure && !metaB?.isPure) return -1;
    if (!metaA?.isPure && metaB?.isPure) return 1;
    // If both are pure accounts, sort by name
    if (metaA?.isPure && metaB?.isPure) return addressNameA.localeCompare(addressNameB);

    // otherwise, sort by address name
    return addressNameA.localeCompare(addressNameB);
  });
}
