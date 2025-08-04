// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@/hooks/types';
import { useBestBlock } from '@/hooks/useBestBlock';
import { BN, u8aEq } from '@polkadot/util';
import { useMemo } from 'react';

import { addressEq, addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

type AnnouncementStatus =
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
  const { api, isApiReady, genesisHash } = useApi();

  const status = transaction.status;
  const type = transaction.type;
  const delegate = useMemo(
    () => account.delegatees.find((item) => addressEq(item.address, transaction.delegate) && item.proxyDelay > 0),
    [account.delegatees, transaction.delegate]
  );

  const [bestBlock, isFetched, isFetching] = useBestBlock();
  const {
    data: result,
    isFetched: isFetchedResult,
    isFetching: isFetchingResult
  } = useQuery({
    queryKey: [transaction.delegate] as const,
    queryHash: `${genesisHash}.api.query.proxy.announcements(${transaction.delegate ? addressToHex(transaction.delegate) : ''})`,
    enabled:
      isApiReady &&
      !!api.query.proxy?.announcements &&
      !!transaction.delegate &&
      status === TransactionStatus.Pending &&
      type === TransactionType.Announce,
    refetchOnMount: false,
    queryFn: async ({ queryKey }) => {
      const [delegate] = queryKey;

      if (!delegate) {
        throw new Error('Invalid delegate');
      }

      return api.query.proxy.announcements(delegate);
    }
  });

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
            ? announcement.height.add(new BN(delegate?.proxyDelay || 0)).lte(bestBlock?.number.toBn() || new BN(0))
              ? 'executable'
              : 'reviewing'
            : 'indexing'
          : 'reviewing',
      status === TransactionStatus.Pending
        ? (!isFetched && isFetching) || (!isFetchedResult && isFetchingResult)
        : !isFetched && isFetching
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
    (!isFetched && isFetching) || (!isFetchedResult && isFetchingResult)
  ];
}
