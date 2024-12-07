// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProxyTransaction, Transaction } from '@mimir-wallet/hooks/types';

import { Box, Button, CircularProgress, SvgIcon } from '@mui/material';
import { useMemo } from 'react';

import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconMember from '@mimir-wallet/assets/svg/icon-member-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconWaiting from '@mimir-wallet/assets/svg/icon-waiting-fill.svg?react';
import { useAddressMeta } from '@mimir-wallet/hooks';
import { TransactionStatus } from '@mimir-wallet/hooks/types';

import { useAnnouncementStatus } from './hooks/useAnnouncementStatus';

export function AnnouncementStatus({ account, transaction }: { account: AccountData; transaction: ProxyTransaction }) {
  const [status, isFetching] = useAnnouncementStatus(transaction, account);

  if (isFetching) {
    return <CircularProgress size={16} />;
  }

  return (
    <Box
      sx={{
        wordBreak: 'break-word',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        whiteSpace: 'nowrap',
        color:
          status === 'indexing' || status === 'reviewing'
            ? 'warning.main'
            : status === 'executable' || status === 'success'
              ? 'success.main'
              : 'error.main'
      }}
    >
      <SvgIcon
        color='inherit'
        component={
          status === 'indexing' || status === 'reviewing'
            ? IconWaiting
            : status === 'executable' || status === 'success'
              ? IconSuccess
              : IconFailed
        }
        inheritViewBox
      />
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
    </Box>
  );
}

export function MultisigStatus({ transaction, onClick }: { transaction: Transaction; onClick: () => void }) {
  const { meta } = useAddressMeta(transaction.address);
  const approvals = useMemo(() => {
    return transaction.children.filter((item) => item.status === TransactionStatus.Success).length;
  }, [transaction.children]);

  return (
    <Box sx={{ flex: '1' }}>
      <Button
        onClick={onClick}
        size='small'
        startIcon={<SvgIcon component={IconMember} inheritViewBox />}
        variant='outlined'
      >
        {approvals}/{meta.threshold}
      </Button>
    </Box>
  );
}

export function Status({ transaction }: { transaction: Transaction }) {
  const status = transaction.status;

  return (
    <Box
      sx={{
        wordBreak: 'break-word',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        whiteSpace: 'nowrap',
        color:
          status < TransactionStatus.Success
            ? 'warning.main'
            : status === TransactionStatus.Success
              ? 'success.main'
              : 'error.main'
      }}
    >
      <SvgIcon
        color='inherit'
        component={
          status < TransactionStatus.Success
            ? IconWaiting
            : status === TransactionStatus.Success
              ? IconSuccess
              : status === TransactionStatus.Failed
                ? IconFailed
                : status === TransactionStatus.Cancelled
                  ? IconCancel
                  : IconFailed
        }
        inheritViewBox
      />
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
    </Box>
  );
}
