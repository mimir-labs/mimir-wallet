// Copyright 2023-2025 dev.mimir authors & contributors
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

// Overload signatures
export async function sync(
  isOmni: true,
  chainSS58: number,
  walletAccounts: string[],
  cb: (values: AccountData[]) => void
): Promise<void>;
export async function sync(
  isOmni: false,
  network: string,
  chainSS58: number,
  walletAccounts: string[],
  cb: (values: AccountData[]) => void
): Promise<void>;

// Implementation
export async function sync(
  isOmni: boolean,
  networkOrChainSS58: string | number,
  chainSS58OrWalletAccounts: number | string[],
  walletAccountsOrCb: string[] | ((values: AccountData[]) => void),
  cb?: (values: AccountData[]) => void
): Promise<void> {
  let network: string | undefined;
  let chainSS58: number;
  let walletAccounts: string[];
  let callback: (values: AccountData[]) => void;

  if (isOmni) {
    // isOmni: true -> sync(true, chainSS58, walletAccounts, cb)
    chainSS58 = networkOrChainSS58 as number;
    walletAccounts = chainSS58OrWalletAccounts as string[];
    callback = walletAccountsOrCb as (values: AccountData[]) => void;
  } else {
    // isOmni: false -> sync(false, network, chainSS58, walletAccounts, cb)
    network = networkOrChainSS58 as string;
    chainSS58 = chainSS58OrWalletAccounts as number;
    walletAccounts = walletAccountsOrCb as string[];
    callback = cb!;
  }

  if (walletAccounts.length === 0) {
    callback([]);

    return;
  }

  const data = await (isOmni
    ? service.account.omniChainOwnedBy(walletAccounts)
    : service.account.ownedBy(network!, walletAccounts));

  data.forEach((item: AccountData) => {
    transformAccount(chainSS58, item);
  });

  callback(data);
}
