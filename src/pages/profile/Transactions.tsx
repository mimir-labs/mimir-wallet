// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { Empty } from '@mimir-wallet/components';
import { useAddressMeta, useDapp } from '@mimir-wallet/hooks';
import { SelectAccountCtx } from '@mimir-wallet/hooks/ctx/SelectedAccount';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { Box, Chip, Paper, SvgIcon, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { extraTransaction } from '../transactions/util';

function Row({ isStart, transaction }: { transaction: Transaction; isStart: boolean }) {
  const { meta } = useAddressMeta(transaction.sender);
  const [approvals] = useMemo((): [number, Transaction[]] => extraTransaction(meta, transaction), [meta, transaction]);
  const destTx = transaction.top || transaction;
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
      <Chip color='primary' label={`${approvals}/${meta.threshold}`} size='small' />
    </Box>
  );
}

function Transactions() {
  const { transactions } = useContext(SelectAccountCtx);
  const pendingTransactions = useMemo(() => {
    return transactions
      .sort((l, r) => (r.initTransaction.height || 0) - (l.initTransaction.height || 0))
      .filter((item) => {
        return item.status < CalldataStatus.Success;
      });
  }, [transactions]);

  return (
    <Paper
      sx={{
        height: '220px',
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
