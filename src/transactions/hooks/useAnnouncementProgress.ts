// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { BlockNumber } from '@polkadot/types/interfaces';
import type { PalletProxyAnnouncement } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';

import { BN, u8aEq } from '@polkadot/util';
import { useMemo } from 'react';

import { useApi, useCall } from '@mimir-wallet/hooks';
import { AccountData, ProxyTransaction, TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';

export function useAnnouncementProgress(
  transaction: ProxyTransaction,
  account: AccountData
): [startBlock: number, currentBlock: number, endBlock: number] {
  const { api } = useApi();

  const status = transaction.status;
  const type = transaction.type;
  const delegate = useMemo(
    () => account.delegatees.find((item) => addressEq(item.address, transaction.delegate)),
    [account.delegatees, transaction.delegate]
  );

  const result = useCall<ITuple<[Vec<PalletProxyAnnouncement>, u128]>>(
    api.query.proxy.announcements,
    status === TransactionStatus.Pending && type === TransactionType.Announce ? [transaction.delegate] : []
  );
  const bestNumber = useCall<BlockNumber>(api.derive.chain.bestNumber);
  const announcements = result?.[0];

  const announcement = useMemo(
    () =>
      announcements?.find(
        (item) =>
          addressEq(item.real.toString(), transaction.address) && u8aEq(item.callHash.toHex(), transaction.callHash)
      ),
    [announcements, transaction.address, transaction.callHash]
  );

  return [
    announcement?.height.toNumber() || 0,
    bestNumber?.toNumber() || 0,
    announcement?.height.add(new BN(delegate?.proxyDelay || 0)).toNumber() || 1
  ];
}
