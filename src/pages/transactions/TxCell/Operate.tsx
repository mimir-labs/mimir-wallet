// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimirdev/hooks/ctx/types';

import { Alert, Box, Button } from '@mui/material';
import React, { useCallback } from 'react';

import { ReactComponent as IconWaitingFill } from '@mimirdev/assets/svg/icon-waiting-fill.svg';
import { useApi, useTxQueue } from '@mimirdev/hooks';
import { CalldataStatus, type Transaction } from '@mimirdev/hooks/types';

import { useApproveFiltered } from '../useApproveFiltered';
import { useCancelFiltered } from '../useCancelFiltered';

function Operate({ transaction }: { transaction: Transaction }) {
  const destTx = transaction.top || transaction;
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const [approveFiltered, canApprove] = useApproveFiltered(transaction);
  const [cancelFiltered, canCancel] = useCancelFiltered(api, transaction);

  const handleApprove = useCallback(
    (filtered: Filtered) => {
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: transaction.top?.call,
        destSender: transaction.top?.sender,
        accountId: transaction.sender,
        isApprove: true,
        transaction: destTx
      });
    },
    [addQueue, api, transaction, destTx]
  );

  const handleCancel = useCallback(
    (filtered: Filtered) => {
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        destCall: transaction.top?.call,
        destSender: transaction.top?.sender,
        accountId: transaction.sender,
        isCancelled: true,
        transaction: destTx
      });
    },
    [addQueue, api, destTx, transaction]
  );

  return (
    transaction.status < CalldataStatus.Success &&
    (transaction.top && transaction.top.status > CalldataStatus.Pending ? (
      <Box>
        {cancelFiltered && canCancel && (
          <Button onClick={() => handleCancel(cancelFiltered)} variant='outlined'>
            Fund
          </Button>
        )}
      </Box>
    ) : (
      <>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {approveFiltered && canApprove && (
            <Button onClick={() => handleApprove(approveFiltered)} variant='outlined'>
              Approve
            </Button>
          )}
          {cancelFiltered && canCancel && (
            <Button onClick={() => handleCancel(cancelFiltered)} variant='outlined'>
              Cancel
            </Button>
          )}
        </Box>
        {!canApprove && (
          <Alert icon={<IconWaitingFill />} severity='warning'>
            Waiting for other {"members's"} approvement
          </Alert>
        )}
      </>
    ))
  );
}

export default React.memo(Operate);
