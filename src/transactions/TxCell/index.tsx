// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta, useApi, useBlockTime, useToggle } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import moment from 'moment';
import React, { useMemo } from 'react';

import { useApproveFiltered } from '../hooks/useApproveFiltered';
import { useCancelFiltered } from '../hooks/useCancelFiltered';
import { extraTransaction } from '../util';
import OverviewDialog from './OverviewDialog';
import TxItems from './TxItems';

interface Props {
  defaultOpen?: boolean;
  transaction: Transaction;
}

function TxCell({ defaultOpen, transaction }: Props) {
  const destTx = transaction.top;
  const status = transaction.status;
  const { api } = useApi();
  const time = useBlockTime(transaction.status < CalldataStatus.Success ? transaction.initTransaction.height : transaction.height);
  const { meta: destSenderMeta } = useAddressMeta(destTx.sender);
  const [approvals] = useMemo((): [number, Transaction[]] => extraTransaction(destSenderMeta, transaction), [destSenderMeta, transaction]);
  const [approveFiltered, canApprove] = useApproveFiltered(transaction);
  const [cancelFiltered, canCancel] = useCancelFiltered(api, transaction);
  const [overviewOpen, toggleOverviewOpen] = useToggle();

  return (
    <Paper component={Stack} spacing={1.2} sx={{ padding: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: status < CalldataStatus.Success ? 'warning.main' : status === CalldataStatus.Success ? 'success.main' : 'error.main' }} />
          {destTx.isFinalized ? (
            <Typography color='primary.main' fontWeight={700} variant='h4'>
              No {destTx.uuid.slice(0, 8).toUpperCase()}
            </Typography>
          ) : (
            <Typography color='warning.main' fontWeight={700} variant='h4'>
              Waiting finalized
            </Typography>
          )}
        </Stack>
        <Typography>{time ? moment(time).format() : null}</Typography>
      </Box>
      <Divider orientation='horizontal' />
      <TxItems
        approvals={approvals}
        approveFiltered={approveFiltered}
        canApprove={canApprove}
        canCancel={canCancel}
        cancelFiltered={cancelFiltered}
        defaultOpen={defaultOpen}
        openOverview={toggleOverviewOpen}
        threshold={destSenderMeta.threshold || 0}
        time={time}
        transaction={transaction}
      />
      <OverviewDialog approveFiltered={approveFiltered} cancelFiltered={cancelFiltered} onClose={toggleOverviewOpen} open={overviewOpen} tx={transaction} />
    </Paper>
  );
}

export default React.memo(TxCell);
