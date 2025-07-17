// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '../hooks/types';

import { encodeAddress } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';

function transformAccount(chainSS58: number, data: AccountData) {
  data.address = encodeAddress(data.address, chainSS58);
  data.proposers = data.proposers?.map((item) => ({
    ...item,
    proposer: encodeAddress(item.proposer, chainSS58),
    creator: encodeAddress(item.creator, chainSS58)
  }));

  for (const delegatee of data.delegatees) {
    transformAccount(chainSS58, delegatee);
  }

  if (data.type === 'multisig') {
    for (const member of data.members) {
      transformAccount(chainSS58, member);
    }
  }
}

export async function sync(
  isOmni: boolean,
  network: string,
  chainSS58: number,
  walletAccounts: string[],
  cb: (values: AccountData[]) => void
): Promise<void> {
  if (walletAccounts.length === 0) {
    cb([]);

    return;
  }

  const data = await (isOmni
    ? service.account.omniChainOwnedBy(walletAccounts)
    : service.account.ownedBy(network, walletAccounts));

  data.forEach((item: AccountData) => {
    transformAccount(chainSS58, item);
  });

  cb(data);
}
