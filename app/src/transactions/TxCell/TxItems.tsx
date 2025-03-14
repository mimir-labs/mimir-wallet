// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { AppName } from '@/components';
import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@/hooks/types';
import { useApi } from '@/hooks/useApi';
import { useToggle } from '@/hooks/useToggle';
import { CallDisplayDetail, CallDisplaySection } from '@/params';
import { formatAgo } from '@/utils';
import { Box, Button, Grid2 as Grid, IconButton, Stack, SvgIcon } from '@mui/material';
import React, { useMemo } from 'react';

import { Link } from '@mimir-wallet/ui';

import Progress from '../Progress';
import { AnnouncementStatus, MultisigStatus, Status } from '../Status';
import Extrinsic from './Extrinsic';
import OverviewDialog from './OverviewDialog';

function AppCell({ transaction }: { transaction: Transaction }) {
  return <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />;
}

function ActionTextCell({ section, method }: { section?: string; method?: string }) {
  return <CallDisplaySection section={section} method={method} />;
}

function ActionDisplayCell({ api, call }: { api: ApiPromise; call?: IMethod | null }) {
  return <CallDisplayDetail registry={api.registry} call={call} />;
}

function TimeCell({ time }: { time?: number }) {
  const now = Date.now();

  time ||= now;

  return now - Number(time) < 1000 ? 'Now' : `${formatAgo(Number(time))} ago`;
}

function ActionsCell({ withDetails, detailOpen }: { withDetails?: boolean; detailOpen: boolean }) {
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
      {withDetails ? (
        <IconButton color='primary'>
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
      ) : (
        <Button component={Link} href='/transactions' variant='text'>
          View More
        </Button>
      )}
    </Box>
  );
}

function TxItems({
  withDetails = true,
  defaultOpen,
  account,
  transaction
}: {
  withDetails?: boolean;
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
      return api.registry.createTypeUnsafe('Call', [transaction.call]) as IMethod;
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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            paddingX: { xs: 1, sm: 1.5, md: 2 },
            fontWeight: 600,
            '.MuiGrid2-root': {
              display: 'flex',
              alignItems: 'center',
              height: 40
            }
          }}
          columns={{ lg: 15, md: 12, sm: 10 }}
          spacing={1}
          onClick={toggleDetailOpen}
        >
          <Grid size={2}>
            <AppCell transaction={transaction} />
          </Grid>
          <Grid size={5}>
            <ActionTextCell section={transaction.section} method={transaction.method} />
          </Grid>
          <Grid sx={{ display: { lg: 'flex !important', xs: 'none !important' } }} size={3}>
            <ActionDisplayCell api={api} call={call} />
          </Grid>
          <Grid sx={{ display: { md: 'flex !important', xs: 'none !important' } }} size={2}>
            <TimeCell
              time={transaction.status < TransactionStatus.Success ? transaction.createdAt : transaction.updatedAt}
            />
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
            <ActionsCell withDetails={withDetails} detailOpen={detailOpen} />
          </Grid>
        </Grid>
        {withDetails && detailOpen && (
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
            <Extrinsic defaultOpen={detailOpen} transaction={transaction} call={call} />
            <Progress openOverview={toggleOverviewOpen} account={account} transaction={transaction} />
          </Box>
        )}
      </Stack>
      <OverviewDialog account={account} transaction={transaction} onClose={toggleOverviewOpen} open={overviewOpen} />
    </>
  );
}

export default React.memo(TxItems);
