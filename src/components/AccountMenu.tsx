// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@mimir-wallet/hooks/types';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Menu,
  MenuItem,
  SvgIcon,
  Typography
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import IconAddFill from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconExtension from '@mimir-wallet/assets/svg/icon-extension.svg?react';
import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import IconUnion from '@mimir-wallet/assets/svg/icon-union.svg?react';
import { findToken } from '@mimir-wallet/config';
import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import {
  useApi,
  useGroupAccounts,
  useNativeBalances,
  useSelectedAccount,
  useSelectedAccountCallback,
  useToggle
} from '@mimir-wallet/hooks';
import { store } from '@mimir-wallet/utils';

import AddressCell from './AddressCell';
import FormatBalance from './FormatBalance';
import Input from './Input';
import SwitchAccountDialog from './SwitchAccountDialog';

interface Props {
  open: boolean;
  anchor?: 'left' | 'right';
  onClose?: () => void;
}

function filterAddress(keywords: string) {
  return (account: AccountData): boolean =>
    keywords
      ? account.address.toLowerCase().includes(keywords.toLowerCase()) ||
        (account.name ? account.name.toLowerCase().includes(keywords.toLowerCase()) : false)
      : true;
}

function AccountCell({
  onClose,
  onSelect,
  selected,
  value
}: {
  onClose?: () => void;
  selected?: boolean;
  value?: string;
  onSelect?: (address: string) => void;
}) {
  const { genesisHash } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const balances = useNativeBalances(value);
  const icon = useMemo(() => findToken(genesisHash).Icon, [genesisHash]);

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
          <AddressCell shorten showType value={value} withCopy />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
            <FormatBalance value={balances?.total} />

            <Avatar alt='Token' src={icon} sx={{ width: 16, height: 16 }} />
          </Box>
          <IconButton color='inherit' onClick={handleMore}>
            <SvgIcon component={IconMore} inheritViewBox />
          </IconButton>
        </ListItemButton>
      </ListItem>
    </>
  );
}

function Search({ onChange, value }: { value: string; onChange: (value: string) => void }) {
  return (
    <Box
      sx={{
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 'auto',
        padding: 1,
        bgcolor: 'background.default'
      }}
    >
      <Input
        endAdornment={<SvgIcon component={IconSearch} inheritViewBox sx={{ color: 'text.disabled' }} />}
        onChange={onChange}
        placeholder='Search'
        value={value}
      />
    </Box>
  );
}

function CreateMultisig() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 'auto',
        padding: 1,
        bgcolor: 'background.default'
      }}
    >
      <PopupState variant='popover'>
        {(popupState) => (
          <>
            <Button
              fullWidth
              startIcon={<SvgIcon component={IconAddFill} inheritViewBox sx={{ fontSize: '2rem !important' }} />}
              sx={{ borderRadius: 1 }}
              {...bindTrigger(popupState)}
            >
              Create New
            </Button>
            <Menu
              {...bindMenu(popupState)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              slotProps={{
                paper: {
                  sx: {
                    width: popupState.anchorEl?.clientWidth,
                    transform: 'translateY(-10px) translateX(-6px) !important',
                    '.MuiMenuItem-root': {
                      display: 'flex',
                      justifyContent: 'center'
                    }
                  }
                }
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate('/create-multisig');
                  popupState.close();
                }}
              >
                Create Multisig
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate(`/add-proxy`);
                  popupState.close();
                }}
              >
                Add Proxy
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate('/create-pure');
                  popupState.close();
                }}
              >
                Create Pure Proxy
              </MenuItem>
            </Menu>
          </>
        )}
      </PopupState>
    </Box>
  );
}

function AccountMenu({ anchor = 'left', onClose, open }: Props) {
  const [keywords, setKeywords] = useState('');
  const [address, setAddress] = useState<string>('');
  const [switchOpen, toggleOpen] = useToggle();
  const selected = useSelectedAccount();
  const selectAccount = useSelectedAccountCallback();
  const grouped = useGroupAccounts(useMemo(() => filterAddress(keywords), [keywords]));

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
          sx: { top: { md: '56px', xs: 0 }, boxShadow: 'none', height: { md: 'calc(100vh - 56px)', xs: '100vh' } }
        }}
        anchor={anchor}
        onClose={onClose}
        open={open}
        slotProps={{ backdrop: { sx: { top: { md: '56px', xs: 0 } } } }}
        variant='temporary'
      >
        <Search onChange={setKeywords} value={keywords} />
        <Box sx={{ height: '100%', padding: 1, paddingY: 6, overflowY: 'auto' }}>
          <List sx={{ width: 370, maxWidth: '90vw' }}>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
              <SvgIcon inheritViewBox component={IconUnion} fontSize='small' />
              Mimir Wallet
            </Typography>
            {grouped.mimir.map((account) => (
              <AccountCell
                key={`multisig-${account}`}
                onClose={onClose}
                onSelect={onSelect}
                value={account}
                selected={account === selected}
              />
            ))}
            <Divider sx={{ marginY: 0.5 }} />

            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
              <SvgIcon inheritViewBox component={IconExtension} fontSize='small' />
              Extension Wallet
            </Typography>
            {grouped.injected.map((account) => (
              <AccountCell key={`extension-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
            ))}
          </List>
        </Box>

        <CreateMultisig />
      </Drawer>
    </>
  );
}

export default React.memo(AccountMenu);
