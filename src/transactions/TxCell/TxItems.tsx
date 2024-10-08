// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';
import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { alpha, Box, Button, IconButton, Stack, SvgIcon, Typography, useMediaQuery } from '@mui/material';
import json2mq from 'json2mq';
import React, { useMemo } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconExternalApp from '@mimir-wallet/assets/svg/icon-external-app.svg?react';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconMember from '@mimir-wallet/assets/svg/icon-member-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useAddressMeta, useApi, useBlockTime, useDapp, useToggle } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

import { useApproveFiltered } from '../hooks/useApproveFiltered';
import { useCancelFiltered } from '../hooks/useCancelFiltered';
import { useRelatedTxs } from '../hooks/useRelatedTxs';
import { ActionText } from '../TxDisplay';
import ActionDisplay from '../TxDisplay/ActionDisplay';
import { extraTransaction } from '../util';
import Extrinsic from './Extrinsic';
import Operate from './Operate';
import OverviewDialog from './OverviewDialog';
import Progress from './Progress';

function AppCell({ website }: { website?: string }) {
  const dapp = useDapp(website);

  return (
    <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {dapp ? (
        <Box component='img' src={dapp.icon} sx={{ width: 20, height: 20 }} />
      ) : (
        <Box
          sx={({ palette }) => ({
            width: 20,
            height: 20,
            borderRadius: 1,
            bgcolor: alpha(palette.primary.main, 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })}
        >
          <SvgIcon component={IconExternalApp} fontSize='small' inheritViewBox sx={{ color: 'common.white' }} />
        </Box>
      )}
      <Typography variant='inherit'>{dapp ? dapp.name : 'External'}</Typography>
    </Box>
  );
}

function ActionTextCell({ action }: { action: string }) {
  return (
    <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ActionText action={action} />
    </Box>
  );
}

function ActionDisplayCell({
  api,
  call,
  isSub,
  tx
}: {
  isSub?: boolean;
  api: ApiPromise;
  call: IMethod | null;
  tx: Transaction;
}) {
  return (
    <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ActionDisplay api={api} call={call} isSub={isSub} tx={tx} />
    </Box>
  );
}

function TimeCell({ time }: { time?: number }) {
  const now = Date.now();

  time ||= now;

  return (
    <Box sx={{ flex: '1' }}>
      {now - Number(time) < ONE_MINUTE
        ? 'Now'
        : now - Number(time) < ONE_HOUR * 1000
          ? `${formatAgo(Number(time), 'm')} mins ago`
          : now - Number(time) < ONE_DAY * 1000
            ? `${formatAgo(Number(time), 'H')} hours ago`
            : `${formatAgo(Number(time), 'D')} days ago`}
    </Box>
  );
}

function ProgressCell({
  approvals,
  onClick,
  threshold
}: {
  approvals: number;
  threshold: number;
  onClick: () => void;
}) {
  return (
    <Box sx={{ flex: '1' }}>
      <Button
        onClick={onClick}
        size='small'
        startIcon={<SvgIcon component={IconMember} inheritViewBox />}
        variant='outlined'
      >
        {approvals}/{threshold}
      </Button>
    </Box>
  );
}

function ActionsCell({
  approveFiltered,
  autoWidth,
  canApprove,
  canCancel,
  cancelFiltered,
  detailOpen,
  toggleDetailOpen,
  transaction
}: {
  detailOpen: boolean;
  transaction: Transaction;
  approveFiltered?: Filtered;
  canApprove: boolean;
  cancelFiltered?: Filtered;
  canCancel: boolean;
  autoWidth: boolean;
  toggleDetailOpen: () => void;
}) {
  const { status } = transaction;

  return (
    <Box
      sx={{
        flex: autoWidth ? '0 0 auto' : '0 0 135px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {status > CalldataStatus.Pending ? (
        <Box sx={{ wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SvgIcon
            color={
              status === CalldataStatus.Success
                ? 'success'
                : status === CalldataStatus.Failed
                  ? 'error'
                  : status === CalldataStatus.Cancelled
                    ? 'warning'
                    : 'error'
            }
            component={
              status === CalldataStatus.Success
                ? IconSuccess
                : status === CalldataStatus.Failed
                  ? IconFailed
                  : status === CalldataStatus.Cancelled
                    ? IconCancel
                    : IconFailed
            }
            inheritViewBox
          />
          {status === CalldataStatus.Success
            ? 'Excuted'
            : status === CalldataStatus.Failed
              ? 'Failed'
              : status === CalldataStatus.Cancelled
                ? 'Cancelled'
                : 'Member Changed'}
        </Box>
      ) : (
        <Operate
          approveFiltered={approveFiltered}
          canApprove={canApprove}
          canCancel={canCancel}
          cancelFiltered={cancelFiltered}
          transaction={transaction}
          type='icon'
        />
      )}
      <IconButton color='primary' onClick={toggleDetailOpen}>
        <SvgIcon
          component={ArrowDown}
          inheritViewBox
          sx={{
            transition: 'transform 0.2s',
            transformOrigin: 'center',
            transform: detailOpen ? 'rotateZ(180deg)' : 'rotateZ(0deg)',
            fontSize: '0.6rem',
            color: 'primary.main'
          }}
        />
      </IconButton>
    </Box>
  );
}

function RelatedItem({ tx }: { tx: Transaction }) {
  const destTx = tx.top;
  const { meta: destSenderMeta } = useAddressMeta(destTx.sender);
  const [approvals] = useMemo(
    (): [number, Transaction[]] => (destSenderMeta ? extraTransaction(destSenderMeta, tx) : [0, []]),
    [destSenderMeta, tx]
  );
  const time = useBlockTime(tx.status < CalldataStatus.Success ? tx.initTransaction.height : tx.height);

  return (
    <TxItems
      approvals={approvals}
      defaultOpen={false}
      isSub
      threshold={destSenderMeta?.threshold || 0}
      time={time}
      transaction={tx}
      withApp={false}
    />
  );
}

function TxItems({
  approvals,
  defaultOpen,
  isSub = false,
  threshold,
  time,
  transaction,
  withApp = true
}: {
  defaultOpen?: boolean;
  approvals: number;
  threshold: number;
  transaction: Transaction;
  time?: number;
  withApp?: boolean;
  isSub?: boolean;
}) {
  const { api } = useApi();
  const [detailOpen, toggleDetailOpen] = useToggle(defaultOpen);
  const [overviewOpen, toggleOverviewOpen] = useToggle();
  const [relatedTxs] = useRelatedTxs(transaction);
  const [approveFiltered, canApprove] = useApproveFiltered(transaction);
  const [cancelFiltered, canCancel] = useCancelFiltered(api, transaction);

  const min800 = useMediaQuery(json2mq({ minWidth: 800 }));
  const min700 = useMediaQuery(json2mq({ minWidth: 700 }));
  const min600 = useMediaQuery(json2mq({ minWidth: 600 }));
  const min500 = useMediaQuery(json2mq({ minWidth: 500 }));

  const destTx = transaction.top;

  return (
    <>
      <Stack
        sx={({ palette, shadows }) => ({
          transition: 'all 0.2s',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          marginLeft: `${isSub ? 'calc((100% - 135px - 40px) / 5 - 30px)' : 0} !important`,
          borderColor: detailOpen ? palette.secondary.main : alpha(palette.primary.main, 0),
          boxShadow: detailOpen ? shadows[1] : shadows[0]
        })}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingX: { xs: 1, sm: 1.5, md: 2 },
            paddingY: 1,
            paddingLeft: isSub ? { xs: 2.5, sm: 3.5, md: 5 } : { xs: 1.5, md: 2 },
            gap: { sm: 2, xs: 1 },
            bgcolor: 'secondary.main',
            fontWeight: 600
          }}
        >
          {min600 && withApp && <AppCell website={destTx.initTransaction.website} />}
          <ActionTextCell action={destTx.action} />
          {min700 && <ActionDisplayCell api={api} call={destTx.call} isSub={isSub} tx={destTx} />}
          {min800 && <TimeCell time={time} />}
          {min500 && <ProgressCell approvals={approvals} onClick={toggleOverviewOpen} threshold={threshold} />}
          <ActionsCell
            approveFiltered={approveFiltered}
            autoWidth={!min600}
            canApprove={canApprove}
            canCancel={canCancel}
            cancelFiltered={cancelFiltered}
            detailOpen={detailOpen}
            toggleDetailOpen={toggleDetailOpen}
            transaction={transaction}
          />
        </Box>
        {detailOpen && (
          <Box
            sx={{
              display: 'flex',
              gap: { md: 2, xs: 1.5 },
              padding: { md: 2, xs: 1.5 },
              flexDirection: min700 ? 'row' : 'column'
            }}
          >
            <Extrinsic transaction={transaction} />
            <Progress
              approveFiltered={approveFiltered}
              canApprove={canApprove}
              canCancel={canCancel}
              cancelFiltered={cancelFiltered}
              openOverview={toggleOverviewOpen}
              transaction={transaction}
            />
          </Box>
        )}
      </Stack>
      {relatedTxs.length > 0 && relatedTxs.map((tx) => <RelatedItem key={tx.uuid} tx={tx} />)}
      <OverviewDialog
        approveFiltered={approveFiltered}
        cancelFiltered={cancelFiltered}
        onClose={toggleOverviewOpen}
        open={overviewOpen}
        tx={transaction}
      />
    </>
  );
}

export default React.memo(TxItems);
