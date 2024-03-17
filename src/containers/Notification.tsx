// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconNotification } from '@mimir-wallet/assets/svg/icon-notification.svg';
import { AddressName } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useMessages, useSelectedAccount } from '@mimir-wallet/hooks';
import { CalldataStatus, ExecuteTxMessage, PushMessageData } from '@mimir-wallet/hooks/types';
import { formatAgo, getAddressMeta } from '@mimir-wallet/utils';
import { Badge, Button, IconButton, Link as MuiLink, Popover, Stack, SvgIcon, Typography } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function traverseAccount(address: string, callback: (address: string) => void) {
  const meta = getAddressMeta(address);

  if (!meta.isMultisig) {
    callback(address);
  }

  for (const child of meta.who || []) {
    traverseAccount(child, callback);
  }
}

function getEoaAddresses(address: string) {
  const addresses = new Set<string>();

  traverseAccount(address, (address) => {
    addresses.add(address);
  });

  return Array.from(addresses);
}

function Notification() {
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const addresses = useMemo(() => (selected ? getEoaAddresses(selected).map((item) => u8aToHex(decodeAddress(item))) : []), [selected]);
  const [messages, isRead, read] = useMessages(addresses);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    read();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const now = Date.now();

  const TxLink = ({ uuid }: { uuid: string }) => (
    <MuiLink component={Link} to='/transactions'>
      No.{uuid.slice(0, 8).toUpperCase()}
    </MuiLink>
  );

  const Item = ({ message: { blockTime, raw, type } }: { message: PushMessageData }) => (
    <Stack component={Link} spacing={0.5} sx={{ textDecoration: 'none', color: 'inherit', bgcolor: 'secondary.main', borderRadius: 1, padding: 1 }} to='/transactions'>
      <Typography color='text.secondary'>
        {now - Number(blockTime) > 0 ? (now - Number(blockTime) < ONE_DAY * 1000 ? `${formatAgo(Number(blockTime), 'H')} hours ago` : `${formatAgo(Number(blockTime), 'D')} days ago`) : 'Now'}
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
          (raw as ExecuteTxMessage).status === CalldataStatus.Failed ? (
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

  return (
    <>
      <Badge color='error' invisible={isRead} variant='dot'>
        <IconButton color='primary' onClick={handleClick} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
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
        slotProps={{ paper: { sx: { padding: 1.5, width: 320, maxHeight: '50vh', overflowY: 'auto' } } }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Stack spacing={1}>
          {messages.map((message) => (
            <Item key={message.id} message={message} />
          ))}
          <Button component={Link} fullWidth to='/transactions' variant='outlined'>
            View All Transactions
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

export default React.memo(Notification);
