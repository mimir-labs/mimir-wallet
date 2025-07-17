// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProxyTransaction, Transaction } from '@/hooks/types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconMember from '@/assets/svg/icon-member-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconWaiting from '@/assets/svg/icon-waiting-fill.svg?react';
import { TransactionStatus } from '@/hooks/types';
import { useMemo } from 'react';

import { Button, Spinner } from '@mimir-wallet/ui';

import { useAnnouncementStatus } from './hooks/useAnnouncementStatus';

export function AnnouncementStatus({ account, transaction }: { account: AccountData; transaction: ProxyTransaction }) {
  const [status, isFetching] = useAnnouncementStatus(transaction, account);

  if (isFetching) {
    return <Spinner size='sm' />;
  }

  const SvgIcon =
    status === 'indexing' || status === 'reviewing'
      ? IconWaiting
      : status === 'executable' || status === 'success'
        ? IconSuccess
        : IconFailed;

  return (
    <div
      data-pending={status === 'indexing' || status === 'reviewing'}
      data-success={status === 'executable' || status === 'success'}
      data-failed={!['indexing', 'reviewing', 'executable', 'success'].includes(status)}
      className='data-[pending=true]:text-warning data-[success=true]:text-success data-[failed=true]:text-danger flex items-center gap-[5px] break-words whitespace-nowrap'
    >
      <SvgIcon color='inherit' />
      {status === 'indexing'
        ? 'Indexing'
        : status === 'reviewing'
          ? 'Under Reviewing'
          : status === 'executable'
            ? 'Executable'
            : status === 'success'
              ? 'Success'
              : status === 'failed'
                ? 'Failed'
                : status === 'rejected'
                  ? 'Rejected'
                  : status === 'removed'
                    ? 'Removed'
                    : 'Proxy Removed'}
    </div>
  );
}

export function MultisigStatus({ transaction, onClick }: { transaction: Transaction; onClick: () => void }) {
  const { meta } = useAddressMeta(transaction.address);
  const approvals = useMemo(() => {
    return transaction.children.filter((item) => item.status === TransactionStatus.Success).length;
  }, [transaction.children]);

  return (
    <div className='flex-1'>
      <Button onPress={onClick} size='sm' startContent={<IconMember />} variant='ghost'>
        {approvals}/{meta.threshold}
      </Button>
    </div>
  );
}

export function Status({ transaction }: { transaction: Transaction }) {
  const status = transaction.status;

  const SvgIcon =
    status < TransactionStatus.Success
      ? IconWaiting
      : status === TransactionStatus.Success
        ? IconSuccess
        : status === TransactionStatus.Failed
          ? IconFailed
          : status === TransactionStatus.Cancelled
            ? IconCancel
            : IconFailed;

  return (
    <div
      data-pending={status < TransactionStatus.Success}
      data-success={status === TransactionStatus.Success}
      data-failed={status > TransactionStatus.Success}
      className='data-[pending=true]:text-warning data-[success=true]:text-success data-[failed=true]:text-danger flex items-center gap-[5px] break-words whitespace-nowrap'
    >
      <SvgIcon color='inherit' />
      {status < TransactionStatus.Success
        ? 'Pending'
        : status === TransactionStatus.Success
          ? 'Success'
          : status === TransactionStatus.Failed
            ? 'Failed'
            : status === TransactionStatus.MemberChanged
              ? 'MemberChanged'
              : status === TransactionStatus.Cancelled
                ? 'Cancelled'
                : status === TransactionStatus.AnnounceReject
                  ? 'AnnounceReject'
                  : 'AnnounceRemoved'}
    </div>
  );
}
