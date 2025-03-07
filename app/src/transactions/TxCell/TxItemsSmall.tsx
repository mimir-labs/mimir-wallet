// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import { AppName } from '@/components';
import { CallDisplaySection } from '@/params';
import { Grid2 as Grid, IconButton, SvgIcon } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function AppCell({ transaction }: { transaction: Transaction }) {
  return <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />;
}

function ActionTextCell({ section, method }: { section?: string; method?: string }) {
  return <CallDisplaySection section={section} method={method} />;
}

function ActionsCell() {
  return (
    <IconButton color='primary'>
      <SvgIcon
        component={ArrowRight}
        inheritViewBox
        sx={{
          fontSize: '0.6rem',
          color: 'primary.main'
        }}
      />
    </IconButton>
  );
}

function TxItems({ transaction }: { transaction: Transaction }) {
  const navigate = useNavigate();

  return (
    <Grid
      container
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'secondary.main',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        paddingX: 1,
        fontWeight: 600,
        '.MuiGrid2-root': {
          display: 'flex',
          alignItems: 'center',
          height: 40
        }
      }}
      columns={7}
      spacing={1}
      onClick={() => navigate(`/transactions/${transaction.id}`)}
    >
      <Grid size={3}>
        <AppCell transaction={transaction} />
      </Grid>
      <Grid size={3} sx={{ justifyContent: 'center' }}>
        <ActionTextCell section={transaction.section} method={transaction.method} />
      </Grid>
      <Grid size='grow' sx={{ flexDirection: 'row-reverse' }}>
        <ActionsCell />
      </Grid>
    </Grid>
  );
}

export default React.memo(TxItems);
