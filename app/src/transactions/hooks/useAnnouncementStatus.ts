// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { BlockNumber } from '@polkadot/types/interfaces';
import type { PalletProxyAnnouncement } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';

import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@/hooks/types';
import { useCall } from '@/hooks/useCall';
import { BN, u8aEq } from '@polkadot/util';
import { useMemo } from 'react';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';

export type AnnouncementStatus =
  | 'reviewing'
  | 'indexing'
  | 'executable'
  | 'success'
  | 'failed'
  | 'rejected'
  | 'removed'
  | 'proxy_removed';

export function useAnnouncementStatus(
  transaction: Transaction,
  account: AccountData
): [status: AnnouncementStatus, isFetching: boolean] {
  const { api } = useApi();

  const status = transaction.status;
  const type = transaction.type;
  const delegate = useMemo(
    () => account.delegatees.find((item) => addressEq(item.address, transaction.delegate) && item.proxyDelay > 0),
    [account.delegatees, transaction.delegate]
  );

  const result = useCall<ITuple<[Vec<PalletProxyAnnouncement>, u128]>>(
    api.query.proxy?.announcements,
    status === TransactionStatus.Pending && type === TransactionType.Announce ? [transaction.delegate] : []
  );
  const bestNumber = useCall<BlockNumber>(api.derive.chain.bestNumber);

  const announcements = result?.[0];

  const announcement = useMemo(
    () =>
      announcements?.findLast(
        (item) =>
          addressEq(item.real.toString(), transaction.address) && u8aEq(item.callHash.toHex(), transaction.callHash)
      ),
    [announcements, transaction.address, transaction.callHash]
  );

  if (status < TransactionStatus.Success) {
    return [
      !delegate && result
        ? 'proxy_removed'
        : announcements
          ? announcement
            ? announcement.height.add(new BN(delegate?.proxyDelay || 0)).lte(bestNumber || new BN(0))
              ? 'executable'
              : 'reviewing'
            : 'indexing'
          : 'reviewing',
      status === TransactionStatus.Pending ? !(bestNumber && result) : !bestNumber
    ];
  }

  return [
    status === TransactionStatus.Success
      ? 'success'
      : status === TransactionStatus.Failed
        ? 'failed'
        : status === TransactionStatus.AnnounceReject
          ? 'rejected'
          : 'removed',
    !(bestNumber && result)
  ];
}
