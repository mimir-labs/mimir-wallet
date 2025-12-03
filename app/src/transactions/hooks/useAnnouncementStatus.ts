// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { addressEq, ApiManager, useNetwork } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { BN, u8aEq } from '@polkadot/util';
import { useMemo } from 'react';

import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@/hooks/types';
import { useProxyBestBlock } from '@/hooks/useProxyBestBlock';

type AnnouncementStatus =
  | 'reviewing'
  | 'indexing'
  | 'executable'
  | 'success'
  | 'failed'
  | 'rejected'
  | 'removed'
  | 'proxy_removed';

async function fetchAnnouncementsForStatus({ queryKey }: { queryKey: readonly [string, string, string] }) {
  const [, network, delegate] = queryKey;

  if (!delegate) {
    throw new Error('Invalid delegate');
  }

  const api = await ApiManager.getInstance().getApi(network);

  if (!api) {
    throw new Error(`API not available for network: ${network}`);
  }

  return api.query.proxy.announcements(delegate);
}

export function useAnnouncementStatus(
  transaction: Transaction,
  account: AccountData
): [status: AnnouncementStatus, isFetching: boolean] {
  const { network } = useNetwork();

  const status = transaction.status;
  const type = transaction.type;
  const delegate = useMemo(
    () => account.delegatees.find((item) => addressEq(item.address, transaction.delegate) && item.proxyDelay > 0),
    [account.delegatees, transaction.delegate]
  );

  const [bestBlock, isFetched, isFetching] = useProxyBestBlock(network);
  const {
    data: result,
    isFetched: isFetchedResult,
    isFetching: isFetchingResult
  } = useQuery({
    queryKey: ['announcement-status', network, transaction.delegate || ''] as const,
    enabled: !!transaction.delegate && status === TransactionStatus.Pending && type === TransactionType.Announce,
    refetchOnMount: false,
    queryFn: fetchAnnouncementsForStatus
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
