// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@mimir-wallet/utils';

import { ReactComponent as IconAddFill } from '@mimir-wallet/assets/svg/icon-add-fill.svg';
import { ReactComponent as IconMore } from '@mimir-wallet/assets/svg/icon-more.svg';
import { ReactComponent as IconSearch } from '@mimir-wallet/assets/svg/icon-search.svg';
import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { useGroupAccounts, useSelectedAccount, useSelectedAccountCallback, useToggle } from '@mimir-wallet/hooks';
import { Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemButton, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import { addressEq } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import store from 'store';

import AddressCell from './AddressCell';
import Input from './Input';
import SwitchAccountDialog from './SwitchAccountDialog';

interface Props {
  open: boolean;
  anchor?: 'left' | 'right';
  onClose?: () => void;
}

function filterAddress(keywords: string, selected?: string) {
  return (address: string, meta: AddressMeta): boolean =>
    (keywords ? address.toLowerCase().includes(keywords.toLowerCase()) || (meta.name ? meta.name.toLowerCase().includes(keywords.toLowerCase()) : false) : true) &&
    (selected ? !addressEq(address, selected) : true);
}

function AccountCell({ onClose, onSelect, selected, value }: { onClose?: () => void; selected?: boolean; value?: string; onSelect?: (address: string) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMore = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      value && onSelect?.(value);
    },
    [onSelect, value]
  );

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        onClose={handleClose}
        open={open}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem component={Link} disableRipple onClick={onClose} to={`/account-setting/${value}`}>
          Setting
        </MenuItem>
      </Menu>
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
            borderRadius: 1,
            bgcolor: selected ? 'secondary.main' : undefined
          }}
        >
          <AddressCell shorten showType size='small' value={value} withCopy />
          <IconButton color='inherit' onClick={handleMore} size='small'>
            <SvgIcon component={IconMore} inheritViewBox />
          </IconButton>
        </ListItemButton>
      </ListItem>
    </>
  );
}

function Search({ onChange, value }: { value: string; onChange: (value: string) => void }) {
  return (
    <Box sx={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 'auto', padding: 1, bgcolor: 'background.default' }}>
      <Input endAdornment={<SvgIcon component={IconSearch} inheritViewBox sx={{ color: 'text.disabled' }} />} onChange={onChange} placeholder='Search' value={value} />
    </Box>
  );
}

function CreateMultisig() {
  return (
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 'auto', padding: 1, bgcolor: 'background.default' }}>
      <Button
        component={Link}
        fullWidth
        startIcon={<SvgIcon component={IconAddFill} inheritViewBox sx={{ fontSize: '2rem !important' }} />}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', borderRadius: 1 }}
        to='/create-multisig'
      >
        Create/Recover Multisig
      </Button>
    </Box>
  );
}

function AccountMenu({ anchor = 'left', onClose, open }: Props) {
  const [keywords, setKeywords] = useState('');
  const [address, setAddress] = useState<string>('');
  const [switchOpen, toggleOpen] = useToggle();
  const selected = useSelectedAccount();
  const selectAccount = useSelectedAccountCallback();
  const grouped = useGroupAccounts(useMemo(() => filterAddress(keywords, selected), [keywords, selected]));

  const onSelect = useCallback(
    (address: string) => {
      if (selected === address) return;

      if (store.get(SWITCH_ACCOUNT_REMIND_KEY)) {
        selectAccount(address);
        onClose?.();
      } else {
        setAddress(address);
        toggleOpen();
      }
    },
    [onClose, selectAccount, selected, toggleOpen]
  );

  return (
    <>
      <SwitchAccountDialog address={address} onClose={toggleOpen} onSelect={onClose} open={switchOpen} />
      <Drawer
        PaperProps={{
          sx: { top: '56px', boxShadow: 'none', height: 'calc(100vh - 56px)' }
        }}
        anchor={anchor}
        onClose={onClose}
        open={open}
        slotProps={{ backdrop: { sx: { top: '56px' } } }}
        variant='temporary'
      >
        <Search onChange={setKeywords} value={keywords} />
        <Box sx={{ height: '100%', padding: 1, paddingY: 6, overflowY: 'auto' }}>
          <List sx={{ width: 280 }}>
            <Typography>Current Wallet</Typography>
            <AccountCell key={`current-account-${selected}`} onClose={onClose} selected value={selected} />
            <Divider sx={{ marginY: 1 }} />
            <Typography>Multisig Wallet</Typography>
            {grouped.multisig.map((account) => (
              <AccountCell key={`multisig-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
            ))}
            <Divider sx={{ marginY: 1 }} />
            <Typography>Extension Wallet</Typography>
            {grouped.injected.map((account) => (
              <AccountCell key={`extension-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
            ))}
            {grouped.accounts.length > 0 && (
              <>
                <Divider sx={{ marginY: 1 }} />
                <Typography>Local Wallet</Typography>
                {grouped.accounts.map((account) => (
                  <AccountCell key={`local-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
                ))}
              </>
            )}
            {grouped.testing.length > 0 && (
              <>
                <Divider sx={{ marginY: 1 }} />
                <Typography>Testing Wallet</Typography>
                {grouped.testing.map((account) => (
                  <AccountCell key={`testing-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
                ))}
              </>
            )}
          </List>
        </Box>
        <CreateMultisig />
      </Drawer>
    </>
  );
}

export default React.memo(AccountMenu);
