// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { Empty } from '@mimir-wallet/components';
import { useAddressMeta, useDapp, usePendingTransactions } from '@mimir-wallet/hooks';
import { extraTransaction } from '@mimir-wallet/transactions';
import { Box, Chip, Paper, SvgIcon, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

function Row({ isStart, transaction }: { transaction: Transaction; isStart: boolean }) {
  const { meta } = useAddressMeta(transaction.sender);
  const [approvals] = useMemo((): [number, Transaction[]] => (meta ? extraTransaction(meta, transaction) : [0, []]), [meta, transaction]);
  const destTx = transaction.top;
  const dapp = useDapp(transaction.initTransaction.website);

  return (
    <Box
      component={Link}
      sx={{
        color: 'text.primary',
        textDecoration: 'none',
        cursor: 'pointer',
        paddingY: 1.5,
        borderTop: isStart ? undefined : '1px solid',
        borderTopColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}
      to='/transactions'
    >
      {dapp ? <Box component='img' src={dapp.icon} width={16} /> : <SvgIcon color='primary' component={IconSend} inheritViewBox />}
      <Typography sx={{ width: 120 }}>No.{destTx.uuid.slice(0, 8).toUpperCase()}</Typography>
      <Typography sx={{ flex: '1' }}>{destTx.action}</Typography>
      <Chip color='primary' label={`${approvals}/${meta?.threshold}`} size='small' />
    </Box>
  );
}

function Transactions({ address }: { address?: string }) {
  const [pendingTransactions] = usePendingTransactions(address);

  return (
    <Paper
      sx={{
        height: pendingTransactions.length > 0 ? { lg: '220px', xs: 'auto' } : 210,
        width: '100%',
        borderRadius: 2,
        paddingX: 1,
        paddingY: 0.5
      }}
    >
      {pendingTransactions.length > 0 ? (
        <Box
          sx={{
            maxHeight: '100%',
            paddingX: 1,
            overflowY: 'auto'
          }}
        >
          {pendingTransactions.map((item, index) => (
            <Row isStart={index === 0} key={item.uuid} transaction={item} />
          ))}
        </Box>
      ) : (
        <Empty height={210} label='No Pending Transactions' />
      )}
    </Paper>
  );
}

export default React.memo(Transactions);
