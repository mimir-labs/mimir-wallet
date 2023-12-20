// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { ReactComponent as IconInfoFill } from '@mimir-wallet/assets/svg/icon-info-fill.svg';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { Box, Button, Divider, SvgIcon } from '@mui/material';
import React, { useCallback } from 'react';

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
            Unlock
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
