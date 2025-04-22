// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AddressMeta } from '../hooks/types';

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
    const multisigMeta: AddressMeta = {
      isMultisig: true,
      threshold: account.threshold,
      who: account.members.map(({ address }) => address)
    };

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      ...multisigMeta
    } as AddressMeta;

    for (const member of account.members) {
      deriveAccountMeta(member, metas);
    }
  }

  if (account.type === 'pure' && !metas[addressHex]?.isPure) {
    const existingMeta = metas[addressHex] || {};
    const baseMeta = {
      name: account.name || existingMeta.name || '',
      isMimir: !!account.isMimir
    };
    const pureMeta: AddressMeta = {
      isPure: true,
      createdBlock: account.createdBlock,
      createdBlockHash: account.createdBlockHash,
      createdExtrinsicHash: account.createdExtrinsicHash,
      createdExtrinsicIndex: account.createdExtrinsicIndex,
      creator: account.creator,
      disambiguationIndex: account.disambiguationIndex,
      pureCreatedAt: account.network
    };

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      ...pureMeta
    } as AddressMeta;
  }

  if (account.delegatees.length > 0) {
    const existingMeta = metas[addressHex] || {};
    const baseMeta = {
      name: account.name || existingMeta.name || '',
      isMimir: !!account.isMimir
    };
    const proxiedMeta: AddressMeta = {
      isProxied: true,
      multipleMultisig: account.delegatees.filter((item) => item.type === 'multisig').length > 1
    };

    metas[addressHex] = {
      ...existingMeta,
      ...baseMeta,
      ...proxiedMeta
    } as AddressMeta;

    for (const delegatee of account.delegatees) {
      const delegateeHex = addressToHex(delegatee.address);
      const existingMeta = metas[delegateeHex] || {};

      const baseMeta = {
        name: delegatee.name || existingMeta.name || '',
        isMimir: !!delegatee.isMimir
      };

      const proxyMeta: AddressMeta = {
        isProxy: true,
        proxyType: delegatee.proxyType,
        network: delegatee.proxyNetwork,
        delay: delegatee.proxyDelay
      };

      metas[delegateeHex] = {
        ...existingMeta,
        ...baseMeta,
        ...proxyMeta
      } as AddressMeta;

      deriveAccountMeta(delegatee, metas);
    }
  }
}

export type GroupName = 'mimir' | 'injected';

export function groupAccounts(
  accounts: AccountData[],
  hideAccountHex: HexString[],
  metas: Record<string, AddressMeta>
): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    mimir: [],
    injected: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    const addressHex = addressToHex(account.address);

    if (metas[addressHex]?.isInjected) {
      ret.injected.push(account.address);
    } else if (!hideAccountHex.includes(u8aToHex(decodeAddress(account.address)))) {
      ret.mimir.push(account.address);
    }
  }

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
