// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProxyTransaction, Transaction } from '@mimir-wallet/hooks/types';

import { alpha, Box, Button, Divider, Paper, Stack, type StackProps, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressCell } from '@mimir-wallet/components';
import { useBlockInterval, useFilterPaths } from '@mimir-wallet/hooks';
import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq, autoFormatTimeStr } from '@mimir-wallet/utils';

import Approve from './buttons/Approve';
import Cancel from './buttons/Cancel';
import Deny from './buttons/Deny';
import ExecuteAnnounce from './buttons/ExecuteAnnounce';
import Remove from './buttons/Remove';
import ViewPending from './buttons/ViewPending';
import { useAnnouncementProgress } from './hooks/useAnnouncementProgress';
import { approvalCounts } from './utils';

interface Props extends StackProps {
  account: AccountData;
  transaction: Transaction;
  openOverview?: () => void;
}

function ProgressItem({
  account,
  transaction,
  address
}: {
  account?: AccountData;
  transaction?: Transaction;
  address: string;
}) {
  const [counts, threshold] = useMemo(
    () => (account && transaction ? approvalCounts(account, transaction) : [0, 1]),
    [account, transaction]
  );

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        padding: 0.5,
        width: '100%',
        bgcolor: 'secondary.main'
      }}
      variant='elevation'
    >
      <AddressCell showType withCopy withAddressBook shorten value={address} />
      <Box
        sx={({ palette }) => ({
          overflow: 'hidden',
          borderRadius: '1px',
          position: 'relative',
          marginX: 3.5,
          height: '2px',
          bgcolor: alpha(palette.primary.main, 0.1)
        })}
      >
        <Box
          sx={{
            borderRadius: '1px',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            bgcolor: 'primary.main',
            width: `${(counts / threshold) * 100}%`
          }}
        />
      </Box>
    </Paper>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', minHeight: 20 }}>
      <Box sx={{ flex: '1', paddingY: 0.5 }}>
        <Stack spacing={1}>{children}</Stack>
      </Box>
    </Box>
  );
}

function MultisigContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: Transaction;
  button?: React.ReactNode;
}) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, flex: '1' }}>Confirmations</Typography>
        {button}
      </Box>

      <Content>
        {transaction.children.map((tx, index) => (
          <ProgressItem
            key={index}
            account={
              account.type === 'multisig'
                ? account.members.find((item) => addressEq(item.address, tx.address))
                : undefined
            }
            transaction={tx}
            address={tx.address}
          />
        ))}
      </Content>
    </>
  );
}

function ProxyContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: Transaction;
  button?: React.ReactNode;
}) {
  if (account.type === 'pure' && account.delegatees.length === 1 && account.delegatees[0].type === 'multisig') {
    const multisigAccount = account.delegatees[0];
    const multisigTransaction = transaction.children.find(
      (item) => item.type === TransactionType.Multisig && addressEq(item.address, multisigAccount.address)
    );

    if (multisigTransaction) {
      return <MultisigContent account={multisigAccount} transaction={multisigTransaction} button={button} />;
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, flex: '1' }}>Proxy</Typography>
        {button}
      </Box>

      <Content>
        {transaction.children.length > 0 ? (
          transaction.children.map((tx, index) => (
            <ProgressItem
              key={index}
              account={account.delegatees.find((item) => addressEq(item.address, tx.address))}
              transaction={tx}
              address={tx.address}
            />
          ))
        ) : transaction.delegate ? (
          <ProgressItem address={transaction.delegate} />
        ) : null}
      </Content>
    </>
  );
}

function AnnounceContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: ProxyTransaction;
  button?: React.ReactNode;
}) {
  const [startBlock, currentBlock, endBlock] = useAnnouncementProgress(transaction, account);
  const blockInterval = useBlockInterval().toNumber();

  const leftTime = currentBlock >= endBlock ? 0 : ((endBlock - currentBlock) * blockInterval) / 1000;

  const leftTimeFormat = useMemo(() => autoFormatTimeStr(leftTime * 1000), [leftTime]);

  const element =
    transaction.status === TransactionStatus.Pending ? (
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, flex: '1' }}>Review Time</Typography>
        </Box>
        <Box
          sx={({ palette }) => ({
            overflow: 'hidden',
            borderRadius: '2px',
            position: 'relative',
            marginX: 3.5,
            height: '4px',
            bgcolor: alpha(palette.primary.main, 0.1)
          })}
        >
          <Box
            sx={{
              borderRadius: '2px',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              bgcolor: 'primary.main',
              width: `${(currentBlock > endBlock ? 1 : (currentBlock - startBlock) / (endBlock - startBlock)) * 100}%`
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ flex: '1' }}>{currentBlock >= endBlock ? 'Review finished' : 'Under Reviewing'}</Typography>
          {leftTimeFormat ? `${leftTimeFormat} left` : ''}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, flex: '1' }}>Proxy</Typography>
          {button}
        </Box>
      </Stack>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, flex: '1' }}>Proxy</Typography>
        {button}
      </Box>
    );

  return (
    <>
      {element}

      <Content>
        {transaction.children.length > 0 ? (
          transaction.children.map((tx, index) => (
            <ProgressItem
              key={index}
              account={account.delegatees.find((item) => addressEq(item.address, tx.address))}
              transaction={tx}
              address={tx.address}
            />
          ))
        ) : transaction.delegate ? (
          <ProgressItem address={transaction.delegate} />
        ) : null}
      </Content>
    </>
  );
}

function Progress({ account, transaction, openOverview, ...props }: Props) {
  const filterPaths = useFilterPaths(account, transaction);

  return (
    <Stack
      bgcolor='secondary.main'
      component={Paper}
      minWidth={280}
      padding={2}
      spacing={1}
      variant='elevation'
      {...props}
    >
      <Typography sx={{ fontWeight: 700, color: 'primary.main' }} variant='h6'>
        Progress
      </Typography>
      <Divider />

      {transaction.type === TransactionType.Multisig ? (
        <MultisigContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onClick={openOverview} size='small' sx={{ alignSelf: 'start' }} variant='text'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : transaction.type === TransactionType.Proxy ? (
        <ProxyContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onClick={openOverview} size='small' sx={{ alignSelf: 'start' }} variant='text'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : transaction.type === TransactionType.Announce ? (
        <AnnounceContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onClick={openOverview} size='small' sx={{ alignSelf: 'start' }} variant='text'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : null}

      <Divider />

      {transaction.status < TransactionStatus.Success && (
        <Stack spacing={1}>
          <Approve account={account} transaction={transaction} filterPaths={filterPaths} />
          <ExecuteAnnounce account={account} transaction={transaction} />
          <ViewPending transaction={transaction} filterPaths={filterPaths} />
          <Cancel account={account} transaction={transaction} />
          <Remove transaction={transaction} />
          <Deny transaction={transaction} />
        </Stack>
      )}
    </Stack>
  );
}

export default React.memo(Progress);
