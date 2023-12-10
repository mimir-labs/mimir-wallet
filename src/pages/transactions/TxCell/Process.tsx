// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { ReactComponent as ArrowDown } from '@mimirdev/assets/svg/ArrowDown.svg';
import { ReactComponent as IconAddFill } from '@mimirdev/assets/svg/icon-add-fill.svg';
import { ReactComponent as IconBack } from '@mimirdev/assets/svg/icon-back.svg';
import { ReactComponent as IconFailedFill } from '@mimirdev/assets/svg/icon-failed-fill.svg';
import { ReactComponent as IconInfoFill } from '@mimirdev/assets/svg/icon-info-fill.svg';
import { ReactComponent as IconSuccessFill } from '@mimirdev/assets/svg/icon-success-fill.svg';
import { ReactComponent as IconWaitingFill } from '@mimirdev/assets/svg/icon-waiting-fill.svg';
import { useAddressMeta } from '@mimirdev/hooks';
import { CalldataStatus, type Transaction } from '@mimirdev/hooks/types';

import OverviewDialog from '../OverviewDialog';
import { extraTransaction } from '../util';
import Operate from './Operate';
import TxProcess from './TxProcess';

interface Props {
  transaction: Transaction;
  cancelTx?: Transaction;
  processOpen: boolean;
  toggleProcessOpen: () => void;
}

function ProcessTitle({ approvals, length, threshold }: { length: number; approvals: number; threshold: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
      <Typography sx={{ color: 'primary.main' }} variant='h6'>
        Process
      </Typography>
      <Box component='span'>
        {approvals}/{threshold} in {length}
      </Box>
    </Box>
  );
}

function ProcessInfo({ approvals, threshold }: { approvals: number; threshold: number }) {
  return (
    <Box sx={{ marginTop: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {Array.from({ length: threshold || 0 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            bgcolor: 'primary.main',
            height: 6,
            borderRadius: '3px',
            flex: '1',
            opacity: index < approvals ? 1 : 0.1
          }}
        />
      ))}
    </Box>
  );
}

function ProcessItem({
  Icon,
  children,
  hasSub,
  iconColor,
  label,
  open,
  toggleOpen
}: {
  open?: boolean;
  toggleOpen?: () => void;
  hasSub?: boolean;
  children?: React.ReactNode;
  label: React.ReactNode;
  Icon: React.ComponentType;
  iconColor: string;
}) {
  return (
    <Box>
      <Box onClick={children ? toggleOpen : undefined} sx={{ cursor: children ? 'pointer' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <SvgIcon component={Icon} inheritViewBox sx={{ color: iconColor, fontSize: '1rem' }} />
        <Typography sx={{ fontWeight: 700, flex: '1' }}>{label}</Typography>
        {children && (
          <SvgIcon
            component={ArrowDown}
            inheritViewBox
            sx={{ transition: 'transform 0.2s', transformOrigin: 'center', transform: open ? 'rotateZ(180deg)' : 'rotateZ(0deg)', fontSize: '0.6rem', color: 'primary.main' }}
          />
        )}
      </Box>
      {hasSub && (
        <Box sx={{ display: 'flex', alignItems: 'stretch', marginTop: 1, minHeight: 20 }}>
          <Box sx={{ width: 2, bgcolor: 'primary.main', opacity: 0.2, marginX: '7px' }} />
          {open && children && <Box sx={{ flex: '1', marginLeft: 2, paddingY: 0.5 }}>{children}</Box>}
        </Box>
      )}
    </Box>
  );
}

function CancellingLabel({ tx }: { tx: Transaction }) {
  const { meta } = useAddressMeta(tx.sender);

  const approvals = useMemo(() => (meta.isFlexible ? tx.children[0] : tx).children.filter((item) => item.status === CalldataStatus.Success).length, [meta.isFlexible, tx]);

  return `Cancelling(${approvals}/${meta.threshold})`;
}

function Process({ cancelTx, processOpen, toggleProcessOpen, transaction }: Props) {
  const { meta } = useAddressMeta(transaction.sender);
  const [approvals, txs] = useMemo((): [number, Transaction[]] => extraTransaction(meta, transaction), [meta, transaction]);

  return (
    <Stack bgcolor='secondary.main' component={Paper} minWidth={280} padding={2} spacing={1} variant='elevation'>
      <ProcessTitle approvals={approvals} length={meta.who?.length || 0} threshold={meta.threshold || 0} />
      <ProcessInfo approvals={approvals} threshold={meta.threshold || 0} />
      <Divider />
      <ProcessItem Icon={IconAddFill} hasSub iconColor='primary.main' label='Created' />
      <ProcessItem Icon={IconInfoFill} hasSub iconColor='primary.main' label='Confirmations' open={processOpen} toggleOpen={toggleProcessOpen}>
        <Stack spacing={1}>
          {txs.map((tx, index) => (
            <TxProcess key={index} tx={tx} />
          ))}
          <OverviewDialog tx={transaction} />
        </Stack>
      </ProcessItem>
      {cancelTx ? (
        <ProcessItem Icon={IconWaitingFill} iconColor='warning.main' label={<CancellingLabel tx={cancelTx} />} />
      ) : (
        <ProcessItem
          Icon={
            transaction.status === CalldataStatus.Success
              ? IconSuccessFill
              : transaction.status === CalldataStatus.Failed
              ? IconFailedFill
              : transaction.status === CalldataStatus.Cancelled
              ? IconBack
              : transaction.status === CalldataStatus.MemberChanged
              ? IconFailedFill
              : IconWaitingFill
          }
          iconColor={
            transaction.status === CalldataStatus.Success
              ? 'success.main'
              : transaction.status === CalldataStatus.Failed
              ? 'error.main'
              : transaction.status === CalldataStatus.Cancelled
              ? 'warning.main'
              : transaction.status === CalldataStatus.MemberChanged
              ? 'error.main'
              : 'warning.main'
          }
          label={
            transaction.status === CalldataStatus.Success
              ? 'Executed'
              : transaction.status === CalldataStatus.Failed
              ? 'Failed'
              : transaction.status === CalldataStatus.Cancelled
              ? 'Cancelled'
              : transaction.status === CalldataStatus.MemberChanged
              ? 'MemberChanged'
              : 'Waiting'
          }
        />
      )}
      <Operate transaction={transaction} />
    </Stack>
  );
}

export default React.memo(Process);
