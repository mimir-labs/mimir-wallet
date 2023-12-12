// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, SvgIcon, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as IconAddOutlined } from '@mimirdev/assets/svg/icon-add-outlined.svg';
import { ReactComponent as IconDelete } from '@mimirdev/assets/svg/icon-delete.svg';
import { useGroupAccounts, useSelectedAccountCallback } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

import AddressCell from './AddressCell';

interface Props {
  open: boolean;
  onClose?: () => void;
}

function AccountCell({ handleClose, value }: { value: string; handleClose?: () => void }) {
  const selectAccount = useSelectedAccountCallback();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      selectAccount(value);
      handleClose?.();
    },
    [handleClose, selectAccount, value]
  );

  return (
    <ListItem>
      <ListItemButton
        disableTouchRipple
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingX: 1,
          paddingY: 0.5,
          border: '1px solid',
          borderColor: 'secondary.main',
          borderRadius: 1
        }}
      >
        <AddressCell shorten showType size='small' value={value} withCopy />
        <IconButton onClick={(e) => e.stopPropagation()} size='small' sx={{ color: 'grey.300', ':hover': { color: 'error.main' } }}>
          <SvgIcon component={IconDelete} inheritViewBox />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}

function CreateMultisig() {
  const navigate = useNavigate();

  return (
    <ListItem>
      <ListItemButton
        onClick={() => navigate('/create-multisig')}
        sx={{
          paddingX: 1,
          paddingY: 0.5,
          border: '1px solid',
          borderColor: 'secondary.main',
          borderRadius: 1
        }}
      >
        <ListItemIcon>
          <SvgIcon color='primary' component={IconAddOutlined} inheritViewBox sx={{ fontSize: '2rem !important' }} />
        </ListItemIcon>
        Create/Recover Multisig
      </ListItemButton>
    </ListItem>
  );
}

function AccountMenu({ onClose, open }: Props) {
  const grouped = useGroupAccounts();

  return (
    <Drawer onClose={onClose} open={open}>
      <List sx={{ width: 280, padding: 1 }}>
        <Typography>Multisig Wallet</Typography>
        {grouped.multisig
          .filter((item) => {
            const meta = getAddressMeta(item);

            return !meta.isHidden && meta.isValid;
          })
          .map((account) => (
            <AccountCell handleClose={onClose} key={`multisig-${account}`} value={account} />
          ))}
        <CreateMultisig />
        <Divider sx={{ marginY: 1 }} />
        <Typography>Extension Wallet</Typography>
        {grouped.injected.map((account) => (
          <AccountCell handleClose={onClose} key={`extension-${account}`} value={account} />
        ))}
        {grouped.accounts.length > 0 && (
          <>
            <Divider sx={{ marginY: 1 }} />
            <Typography>Local Wallet</Typography>
            {grouped.accounts.map((account) => (
              <AccountCell handleClose={onClose} key={`local-${account}`} value={account} />
            ))}
          </>
        )}
        {grouped.testing.length > 0 && (
          <>
            <Divider sx={{ marginY: 1 }} />
            <Typography>Testing Wallet</Typography>
            {grouped.testing.map((account) => (
              <AccountCell handleClose={onClose} key={`testing-${account}`} value={account} />
            ))}
          </>
        )}
      </List>
    </Drawer>
  );
}

export default React.memo(AccountMenu);
