// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, IconButton, Menu, MenuItem, MenuList, SvgIcon, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as IconAddOutlined } from '@mimirdev/assets/svg/icon-add-outlined.svg';
import { ReactComponent as IconDelete } from '@mimirdev/assets/svg/icon-delete.svg';
import { useGroupAccounts, useSelectedAccountCallback } from '@mimirdev/hooks';

import AddressCell from './AddressCell';

interface Props {
  anchorEl: HTMLElement | null;
  handleClose?: () => void;
}

function AccountCell({ handleClose, value }: { value: string; handleClose?: () => void }) {
  const selectAccount = useSelectedAccountCallback();

  const handleClick = useCallback(() => {
    selectAccount(value);
    handleClose?.();
  }, [handleClose, selectAccount, value]);

  return (
    <MenuItem
      disableTouchRipple
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 1.25,
        padding: '2px 10px',
        border: '1px solid',
        borderColor: 'secondary.main'
      }}
    >
      <AddressCell value={value} />
      <IconButton onClick={(e) => e.stopPropagation()} size='small' sx={{ color: 'grey.300', ':hover': { color: 'error.main' } }}>
        <SvgIcon component={IconDelete} inheritViewBox />
      </IconButton>
    </MenuItem>
  );
}

function CreateMultisig() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/create-multisig')}
      startIcon={<SvgIcon component={IconAddOutlined} inheritViewBox sx={{ fontSize: '2rem !important' }} />}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 1.25, padding: '2px 10px' }}
      variant='outlined'
    >
      <Typography sx={{ color: 'text.primary', textAlign: 'left' }}>Create/Recover Multisig</Typography>
    </Button>
  );
}

function AccountMenu({ anchorEl, handleClose }: Props) {
  const open = Boolean(anchorEl);
  const grouped = useGroupAccounts();

  return (
    <Menu PaperProps={{ sx: { width: 212, paddingX: 1.25 } }} anchorEl={anchorEl} autoFocus={false} onClose={handleClose} open={open}>
      <MenuList key='multisig'>
        <Typography>Multisig Wallet</Typography>
        {grouped.multisig.map((account) => (
          <AccountCell handleClose={handleClose} key={`multisig-${account}`} value={account} />
        ))}
        <CreateMultisig />
      </MenuList>
      <MenuList key='extension'>
        <Typography>Extension Wallet</Typography>
        {grouped.injected.map((account) => (
          <AccountCell handleClose={handleClose} key={`extension-${account}`} value={account} />
        ))}
      </MenuList>
      {grouped.accounts.length > 0 && (
        <MenuList key='local'>
          <Typography>Local Wallet</Typography>
          {grouped.accounts.map((account) => (
            <AccountCell handleClose={handleClose} key={`local-${account}`} value={account} />
          ))}
        </MenuList>
      )}
      {grouped.testing.length > 0 && (
        <MenuList key='testing'>
          <Typography>Testing Wallet</Typography>
          {grouped.testing.map((account) => (
            <AccountCell handleClose={handleClose} key={`testing-${account}`} value={account} />
          ))}
        </MenuList>
      )}
    </Menu>
  );
}

export default React.memo(AccountMenu);
