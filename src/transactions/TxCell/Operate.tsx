// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { LoadingButton } from '@mui/lab';
import { Box, Divider, IconButton, SvgIcon } from '@mui/material';
import React, { useCallback, useState } from 'react';

import IconRefund from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-outlined.svg?react';
import IconInfoFill from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';

function Operate({
  approveFiltered,
  canApprove,
  canCancel,
  cancelFiltered,
  transaction,
  type = 'normal'
}: {
  approveFiltered?: Filtered;
  canApprove: boolean;
  cancelFiltered?: Filtered;
  canCancel: boolean;
  transaction: Transaction;
  type?: 'icon' | 'normal';
}) {
  const destTx = transaction.top;
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const [approveLoading, setApproveLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleApprove = useCallback(
    (filtered: Filtered) => {
      if (!transaction.call) return;

      setApproveLoading(true);
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: destTx.call || undefined,
        destSender: destTx.sender,
        accountId: transaction.sender,
        isApprove: true,
        transaction: destTx,
        onFinalized: () => setApproveLoading(false),
        onError: () => setApproveLoading(false),
        onReject: () => setApproveLoading(false)
      });
    },
    [addQueue, api, transaction, destTx]
  );

  const handleCancel = useCallback(
    (filtered: Filtered) => {
      if (!transaction.call) return;

      setCancelLoading(true);
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: destTx.call || undefined,
        destSender: destTx.sender,
        accountId: transaction.sender,
        isCancelled: true,
        transaction: destTx,
        onFinalized: () => setCancelLoading(false),
        onError: () => setCancelLoading(false),
        onReject: () => setCancelLoading(false)
      });
    },
    [addQueue, api, destTx, transaction]
  );

  if (type === 'normal') {
    return (
      transaction.status < CalldataStatus.Success &&
      (transaction.top.status > CalldataStatus.Pending ||
      (transaction.action === 'multisig.cancelAsMulti' &&
        transaction.cancelTx?.status &&
        transaction.cancelTx.status > CalldataStatus.Pending) ? (
        <Box>
          {cancelFiltered && canCancel && (
            <LoadingButton loading={cancelLoading} onClick={() => handleCancel(cancelFiltered)} variant='outlined'>
              Unlock
            </LoadingButton>
          )}
        </Box>
      ) : (
        <>
          {!canApprove && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SvgIcon color='warning' component={IconInfoFill} inheritViewBox />
                Waiting for other {`members's`} approvement
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {approveFiltered && canApprove && (
              <LoadingButton loading={approveLoading} onClick={() => handleApprove(approveFiltered)} variant='outlined'>
                Approve
              </LoadingButton>
            )}
            {cancelFiltered && canCancel && (
              <LoadingButton loading={cancelLoading} onClick={() => handleCancel(cancelFiltered)} variant='outlined'>
                Cancel
              </LoadingButton>
            )}
          </Box>
        </>
      ))
    );
  }

  return (
    transaction.status < CalldataStatus.Success &&
    (transaction.top.status > CalldataStatus.Pending ||
    (transaction.action === 'multisig.cancelAsMulti' &&
      transaction.cancelTx?.status &&
      transaction.cancelTx.status > CalldataStatus.Pending) ? (
      <Box>
        {cancelFiltered && canCancel && (
          <IconButton color='warning' disabled={cancelLoading} onClick={() => handleCancel(cancelFiltered)}>
            <SvgIcon component={IconRefund} inheritViewBox />
          </IconButton>
        )}
      </Box>
    ) : (
      <Box sx={{ display: 'flex' }}>
        {approveFiltered && canApprove && (
          <IconButton color='success' disabled={approveLoading} onClick={() => handleApprove(approveFiltered)}>
            <SvgIcon component={IconSuccess} inheritViewBox />
          </IconButton>
        )}
        {cancelFiltered && canCancel && (
          <IconButton color='error' disabled={cancelLoading} onClick={() => handleCancel(cancelFiltered)}>
            <SvgIcon component={IconFailed} inheritViewBox />
          </IconButton>
        )}
      </Box>
    ))
  );
}

export default React.memo(Operate);
