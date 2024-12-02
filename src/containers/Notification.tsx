// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge, Button, IconButton, Link as MuiLink, Popover, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import IconNotification from '@mimir-wallet/assets/svg/icon-notification.svg?react';
import { AddressName, Empty } from '@mimir-wallet/components';
import { useGroupAccounts, useMessages, useSelectedAccountCallback, useWallet } from '@mimir-wallet/hooks';
import { type ExecuteTxMessage, type PushMessageData, TransactionStatus } from '@mimir-wallet/hooks/types';
import { addressToHex, formatAgo, service } from '@mimir-wallet/utils';

function sortAddress(addresses: string[]) {
  return addresses.map((item) => addressToHex(item)).sort((l, r) => (l > r ? 1 : -1));
}

function Notification() {
  const selectAccount = useSelectedAccountCallback();
  const { isWalletReady } = useWallet();
  const { injected } = useGroupAccounts();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const addresses = useMemo(() => (isWalletReady ? sortAddress(injected) : []), [injected, isWalletReady]);
  const [messages, isRead, read] = useMessages(addresses);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    read();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const now = Date.now();

  function TxLink({ uuid }: { uuid: string }) {
    return <MuiLink>No.{uuid.slice(0, 8).toUpperCase()}</MuiLink>;
  }

  function Item({ message: { blockTime, raw, sender, type } }: { message: PushMessageData }) {
    return (
      <Stack
        component={Link}
        onClick={(e) => {
          e.preventDefault();
          handleClose();
          service
            .getStatus(raw.uuid)
            .then(({ status }) => {
              selectAccount(sender);
              navigate({
                pathname: '/transactions',
                search: status >= TransactionStatus.Success ? 'status=history' : ''
              });
            })
            .catch(() => {
              selectAccount(sender);
              navigate({
                pathname: '/transactions'
              });
            });
        }}
        spacing={0.5}
        sx={{ textDecoration: 'none', color: 'inherit', bgcolor: 'secondary.main', borderRadius: 1, padding: 1 }}
        to='/transactions'
      >
        <Typography color='text.secondary'>
          {now - Number(blockTime) < 1000 ? 'Now' : `${formatAgo(blockTime)} ago`}
        </Typography>
        <Typography>
          {type === 'initial' ? (
            <>
              Transaction <TxLink uuid={raw.uuid} /> is waiting for your approval.
            </>
          ) : type === 'approve' ? (
            <>
              <b>
                <AddressName value={(raw as any).approver} />
              </b>{' '}
              has approved your transaction <TxLink uuid={raw.uuid} />.
            </>
          ) : type === 'execute' ? (
            (raw as ExecuteTxMessage).status === TransactionStatus.Failed ? (
              <>
                Transaction <TxLink uuid={raw.uuid} /> failed to be executed.
              </>
            ) : (
              <>
                Transaction <TxLink uuid={raw.uuid} /> has been executed.
              </>
            )
          ) : type === 'cancel' ? (
            <>
              Transaction <TxLink uuid={raw.uuid} /> has been cancelled by{' '}
              <b>
                <AddressName value={(raw as any).canceller} />
              </b>
            </>
          ) : (
            'Unknown'
          )}
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Badge color='error' invisible={isRead} variant='dot'>
        <IconButton
          color='primary'
          onClick={handleClick}
          sx={{ borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}
        >
          <SvgIcon component={IconNotification} inheritViewBox />
        </IconButton>
      </Badge>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        onClose={handleClose}
        open={open}
        slotProps={{ paper: { sx: { padding: 1.5, width: 340, maxHeight: '50vh', overflowY: 'auto' } } }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Stack spacing={1}>
          {messages.length ? (
            messages.map((message) => <Item key={message.id} message={message} />)
          ) : (
            <Empty height={240} label='No messages here.' />
          )}
          <Button component={Link} fullWidth to='/transactions' variant='outlined'>
            View All Transactions
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

export default React.memo(Notification);
