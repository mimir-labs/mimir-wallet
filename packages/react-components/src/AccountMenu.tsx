// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, IconButton, Menu, MenuItem, MenuList, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { IconAddOutlined, IconDelete } from '@mimirdev/app-config/icons';
import { useGroupAccounts, useSelectedAccountCallback } from '@mimirdev/react-hooks';

import AccountSmall from './AccountSmall';

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
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 1.25, padding: '2px 10px', border: '1px solid', borderColor: 'secondary.main', borderRadius: '10px' }}
    >
      <Box sx={{ width: 'calc(100% - 30px)' }}>
        <AccountSmall value={value} />
      </Box>
      <IconButton onClick={(e) => e.stopPropagation()} size='small' sx={{ color: 'grey.300' }}>
        <IconDelete />
      </IconButton>
    </MenuItem>
  );
}

function CreateMultisig() {
  return (
    <Button
      startIcon={<IconAddOutlined sx={{ fontSize: '2rem !important' }} />}
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
