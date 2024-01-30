// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { ReactComponent as IconInfoFill } from '@mimir-wallet/assets/svg/icon-info-fill.svg';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, SvgIcon } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useApproveFiltered } from '../useApproveFiltered';
import { useCancelFiltered } from '../useCancelFiltered';

function Operate({ transaction }: { transaction: Transaction }) {
  const destTx = transaction.top;
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const [approveFiltered, canApprove] = useApproveFiltered(transaction);
  const [cancelFiltered, canCancel] = useCancelFiltered(api, transaction);
  const [approveLoading, setApproveLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleApprove = useCallback(
    (filtered: Filtered) => {
      setApproveLoading(true);
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: destTx.call,
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
      setCancelLoading(true);
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: destTx.call,
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

  return (
    transaction.status < CalldataStatus.Success &&
    (transaction.top.status > CalldataStatus.Pending ? (
      <Box>
        {cancelFiltered && canCancel && (
          <LoadingButton loading={cancelLoading} onClick={() => handleCancel(cancelFiltered)} variant='outlined'>
            Unlock
          </LoadingButton>
        )}
      </Box>
    ) : (
      <>
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
        {!canApprove && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SvgIcon color='warning' component={IconInfoFill} inheritViewBox />
              Waiting for other {"members's"} approvement
            </Box>
          </>
        )}
      </>
    ))
  );
}

export default React.memo(Operate);
