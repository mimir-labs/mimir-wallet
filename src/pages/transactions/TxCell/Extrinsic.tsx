// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimirdev/hooks/ctx/types';

import { Alert, alpha, Box, Button, Chip, Divider, Stack, SvgIcon, Typography } from '@mui/material';
import moment from 'moment';
import React, { useCallback } from 'react';

import { ReactComponent as ArrowDown } from '@mimirdev/assets/svg/ArrowDown.svg';
import { ReactComponent as IconWaitingFill } from '@mimirdev/assets/svg/icon-waiting-fill.svg';
import { AddressRow } from '@mimirdev/components';
import { useApi, useBlockTime, useToggle, useTxQueue } from '@mimirdev/hooks';
import { CalldataStatus, Transaction } from '@mimirdev/hooks/types';
import { Call } from '@mimirdev/params';
import Item from '@mimirdev/params/Param/Item';

import { useApproveFiltered } from '../useApproveFiltered';
import { useCancelFiltered } from '../useCancelFiltered';
import CallDetail from './CallDetail';

function Extrinsic({ transaction }: { transaction: Transaction }) {
  const destTx = transaction.top || transaction;
  const { api } = useApi();
  const [detailOpen, toggleDetailOpen] = useToggle();
  const { addQueue } = useTxQueue();
  const status = transaction.status;
  const [approveFiltered, canApprove] = useApproveFiltered(transaction);
  const [cancelFiltered, canCancel] = useCancelFiltered(api, transaction);
  const time = useBlockTime(transaction.initTransaction.height);

  const handleApprove = useCallback(
    (filtered: Filtered) => {
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        targetCall: transaction.top?.call,
        targetSender: transaction.top?.sender,
        accountId: transaction.sender,
        isApprove: true
      });
    },
    [addQueue, api, transaction]
  );

  const handleCancel = useCallback(
    (filtered: Filtered) => {
      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        targetCall: transaction.top?.call,
        targetSender: transaction.top?.sender,
        accountId: transaction.sender,
        isCancelled: true
      });
    },
    [addQueue, api, transaction]
  );

  return (
    <Stack flex='1' spacing={1}>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: status < CalldataStatus.Success ? 'warning.main' : status === CalldataStatus.Success ? 'success.main' : 'error.main' }} />
          <Typography color='primary.main' fontWeight={700} variant='h4'>
            No {destTx.uuid.slice(0, 8).toUpperCase()}
          </Typography>
          <Chip color='secondary' label={destTx.action} variant='filled' />
        </Stack>
        <Typography>{time ? moment(time).format() : null}</Typography>
      </Stack>
      <Divider />
      <Stack spacing={1} sx={{ lineHeight: 1.5 }}>
        {destTx !== transaction && (
          <Item content={<AddressRow defaultName={destTx.sender} shorten={false} size='small' value={destTx.sender} withAddress={false} withCopy withName />} name='From' type='tx' />
        )}
        <Call api={api} call={destTx.call} type='tx' />
      </Stack>
      {detailOpen ? (
        <CallDetail call={transaction.call} depositor={transaction.initTransaction.sender} />
      ) : (
        <Button
          color='secondary'
          endIcon={<SvgIcon component={ArrowDown} inheritViewBox sx={{ fontSize: '0.6rem !important' }} />}
          fullWidth
          onClick={toggleDetailOpen}
          sx={({ palette }) => ({ opacity: 0.9, color: alpha(palette.secondary.contrastText, 0.5) })}
          variant='contained'
        >
          Detail
        </Button>
      )}
      {transaction.status < CalldataStatus.Success &&
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
        ))}
    </Stack>
  );
}

export default React.memo(Extrinsic);
