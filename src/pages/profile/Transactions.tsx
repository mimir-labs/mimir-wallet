// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { Box, Chip, Paper, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { AppName, Empty } from '@mimir-wallet/components';
import { useAddressMeta, usePendingTransactions } from '@mimir-wallet/hooks';

function Row({ isStart, transaction }: { transaction: Transaction; isStart: boolean }) {
  const { meta } = useAddressMeta(transaction.address);

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
      <AppName
        iconSize={16}
        website={transaction.website}
        appName={transaction.appName}
        iconUrl={transaction.iconUrl}
      />
      <Typography sx={{ width: 120 }}>No.{transaction.id}</Typography>
      <Typography sx={{ flex: '1' }}>
        {transaction.section}.{transaction.method}
      </Typography>
      <Chip color='primary' label={`${1}/${meta?.threshold}`} size='small' />
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
            <Row isStart={index === 0} key={item.id} transaction={item} />
          ))}
        </Box>
      ) : (
        <Empty height={210} label='No Pending Transactions' />
      )}
    </Paper>
  );
}

export default React.memo(Transactions);
