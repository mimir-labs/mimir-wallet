// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { Box, Grid2 as Grid, IconButton, Stack, SvgIcon } from '@mui/material';
import React, { useMemo } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { AppName } from '@mimir-wallet/components';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

import { ActionText } from '../TxDisplay';
import ActionDisplay from '../TxDisplay/ActionDisplay';
import Extrinsic from './Extrinsic';
import OverviewDialog from './OverviewDialog';
import Progress from './Progress';
import { AnnouncementStatus, MultisigStatus, Status } from './Status';

function AppCell({ transaction }: { transaction: Transaction }) {
  return (
    <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
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

function ActionDisplayCell({ api, call }: { api: ApiPromise; call?: IMethod | null }) {
  return (
    <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ActionDisplay api={api} call={call} />
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

function ActionsCell({ detailOpen, toggleDetailOpen }: { detailOpen: boolean; toggleDetailOpen: () => void }) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div />
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

function TxItems({
  defaultOpen,
  account,
  transaction
}: {
  defaultOpen?: boolean;
  account: AccountData;
  transaction: Transaction;
}) {
  const { api } = useApi();
  const [detailOpen, toggleDetailOpen] = useToggle(defaultOpen);
  const [overviewOpen, toggleOverviewOpen] = useToggle();
  const call = useMemo(() => {
    if (!transaction.call) return null;

    try {
      return api.createType('Call', transaction.call);
    } catch {
      return null;
    }
  }, [api, transaction.call]);

  return (
    <>
      <Stack
        sx={() => ({
          transition: 'all 0.2s',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'secondary.main'
        })}
      >
        <Grid
          container
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingX: { xs: 1, sm: 1.5, md: 2 },
            paddingLeft: { xs: 1.5, md: 2 },
            gap: { sm: 2, xs: 1 },
            fontWeight: 600,
            '.MuiGrid2-root': {
              display: 'flex',
              alignItems: 'center',
              height: 40
            }
          }}
          columns={12}
        >
          <Grid size={2}>
            <AppCell transaction={transaction} />
          </Grid>
          <Grid size={2}>
            <ActionTextCell action={`${transaction.section}.${transaction.method}`} />
          </Grid>
          <Grid size={2}>
            <ActionDisplayCell api={api} call={call} />
          </Grid>
          <Grid size={2}>
            <TimeCell time={transaction.createdAt} />
          </Grid>
          <Grid size={2}>
            {transaction.status < TransactionStatus.Success ? (
              transaction.type === TransactionType.Announce ? (
                <AnnouncementStatus transaction={transaction} account={account} />
              ) : transaction.type === TransactionType.Multisig ? (
                <MultisigStatus transaction={transaction} onClick={toggleOverviewOpen} />
              ) : (
                <Status transaction={transaction} />
              )
            ) : (
              <Status transaction={transaction} />
            )}
          </Grid>
          <Grid size='grow'>
            <ActionsCell detailOpen={detailOpen} toggleDetailOpen={toggleDetailOpen} />
          </Grid>
        </Grid>
        {detailOpen && (
          <Box
            sx={{
              display: 'flex',
              gap: { md: 1.5, xs: 1.2 },
              padding: { md: 1.5, xs: 1.2 },
              flexDirection: 'row',
              borderRadius: 1,
              bgcolor: 'white',
              marginLeft: { md: 1.5, xs: 1.2 },
              marginRight: { md: 1.5, xs: 1.2 },
              marginBottom: { md: 1.5, xs: 1.2 }
            }}
          >
            <Extrinsic transaction={transaction} call={call} />
            <Progress openOverview={toggleOverviewOpen} account={account} transaction={transaction} />
          </Box>
        )}
      </Stack>
      <OverviewDialog account={account} transaction={transaction} onClose={toggleOverviewOpen} open={overviewOpen} />
    </>
  );
}

export default React.memo(TxItems);
