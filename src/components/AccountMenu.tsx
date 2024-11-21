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
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconAddFill from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import IconExtension from '@mimir-wallet/assets/svg/icon-extension.svg?react';
import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import IconUnion from '@mimir-wallet/assets/svg/icon-union.svg?react';
import IconUser from '@mimir-wallet/assets/svg/icon-user.svg?react';
import IconWatch from '@mimir-wallet/assets/svg/icon-watch.svg?react';
import { findToken } from '@mimir-wallet/config';
import { useAccount, useApi, useGroupAccounts, useNativeBalances, useWallet } from '@mimir-wallet/hooks';

import AddressCell from './AddressCell';
import CreateMultisigDialog from './CreateMultisigDialog';
import FormatBalance from './FormatBalance';
import Input from './Input';

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
  watchlist,
  selected,
  isHide,
  value
}: {
  onClose?: () => void;
  selected?: boolean;
  value?: string;
  watchlist?: boolean;
  isHide?: boolean;
  onSelect?: (address: string) => void;
}) {
  const { genesisHash } = useApi();
  const { accountSource } = useWallet();
  const { isLocalAccount, deleteAddress, showAccount, hideAccount } = useAccount();
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
        {value && isLocalAccount(value) && (
          <>
            {!accountSource(value) && (
              <MenuItem
                disableRipple
                onClick={() => {
                  isHide ? showAccount(value) : hideAccount(value);
                }}
              >
                {isHide ? 'Show' : 'Hide'}
              </MenuItem>
            )}
            <MenuItem component={Link} disableRipple onClick={onClose} to={`/account-setting?address=${value}`}>
              Setting
            </MenuItem>
          </>
        )}

        {value && watchlist && (
          <MenuItem disableRipple onClick={() => deleteAddress(value)}>
            Delete
          </MenuItem>
        )}
      </Menu>
      <ListItem sx={{ paddingX: { sm: 1, xs: 0.5 } }}>
        <ListItemButton
          disableTouchRipple
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingX: { sm: 1, xs: 0.5 },
            paddingY: 0.5,
            border: '1px solid',
            borderColor: 'secondary.main',
            borderRadius: 1,
            bgcolor: selected ? 'secondary.main' : undefined
          }}
        >
          <AddressCell shorten showType value={value} withCopy withAddressBook />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
            <FormatBalance value={balances?.total} />
            <Avatar alt='Token' src={icon} sx={{ width: 16, height: 16 }} />
          </Box>
          {value && (isLocalAccount(value) || watchlist) && (
            <IconButton color='inherit' onClick={handleMore} sx={{ padding: { sm: 1, xs: 0.4 } }}>
              <SvgIcon component={IconMore} inheritViewBox />
            </IconButton>
          )}
        </ListItemButton>
      </ListItem>
    </>
  );
}

function Search({ onChange, value }: { value: string; onChange: (value: string) => void }) {
  return (
    <Box>
      <Input
        endAdornment={<SvgIcon component={IconSearch} inheritViewBox sx={{ color: 'text.disabled' }} />}
        onChange={onChange}
        placeholder='Search'
        value={value}
      />
    </Box>
  );
}

function CreateMultisig({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const [open, toggleOpen] = useToggle(false);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <>
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
                anchorOrigin={{ vertical: 'top', horizontal: downSm ? 'right' : 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: popupState.anchorEl?.clientWidth,
                      transform: downSm
                        ? 'translateY(-10px) translateX(6px) !important'
                        : 'translateY(-10px) translateX(-6px) !important',
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
                    toggleOpen(true);
                    popupState.close();
                  }}
                >
                  Create Multisig
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate(`/add-proxy`);
                    popupState.close();
                    onClose?.();
                  }}
                >
                  Add Proxy
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/create-pure');
                    popupState.close();
                    onClose?.();
                  }}
                >
                  Create Pure Proxy
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      </Box>

      <CreateMultisigDialog
        open={open}
        onClose={() => {
          toggleOpen(false);
          onClose?.();
        }}
      />
    </>
  );
}

function AccountMenu({ anchor = 'left', onClose, open }: Props) {
  const [keywords, setKeywords] = useState('');
  const { current, setCurrent, addresses, addAddressBook } = useAccount();
  const grouped = useGroupAccounts(useMemo(() => filterAddress(keywords), [keywords]));

  const onSelect = useCallback(
    (address: string) => {
      if (current === address) return;

      setCurrent(address);

      onClose?.();
    },
    [onClose, current, setCurrent]
  );

  const watchlist = useMemo(() => addresses.filter(({ watchlist }) => !!watchlist), [addresses]);

  return (
    <Drawer
      PaperProps={{
        sx: {
          top: { md: '56px', xs: 0 },
          boxShadow: 'none',
          height: {
            md: 'calc(100vh - 56px)',
            xs: '100vh'
          },
          ...(anchor === 'left'
            ? { borderTopRightRadius: { md: 0, xs: 20 }, borderBottomRightRadius: { md: 0, xs: 20 } }
            : { borderTopLeftRadius: { md: 0, xs: 20 }, borderBottomLeftRadius: { md: 0, xs: 20 } })
        }
      }}
      anchor={anchor}
      onClose={onClose}
      open={open}
      slotProps={{ backdrop: { sx: { top: { md: '56px', xs: 0 } } } }}
      variant='temporary'
    >
      <Box
        sx={{
          zIndex: 10,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 'auto',
          paddingTop: 2,
          paddingBottom: 1,
          paddingX: { sm: 2, xs: 1 },
          bgcolor: 'background.default'
        }}
      >
        <Box
          sx={{
            display: { sm: 'none', xs: 'flex' },
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 1
          }}
        >
          <Typography variant='h3'>Menu</Typography>
          <IconButton onClick={onClose} color='inherit'>
            <SvgIcon component={IconClose} inheritViewBox fontSize='large' />
          </IconButton>
        </Box>
        <Search onChange={setKeywords} value={keywords} />
      </Box>

      <Box
        sx={{
          height: '100%',
          paddingX: { sm: 1, xs: 0.5 },
          paddingBottom: 6,
          paddingTop: { sm: 7, xs: 11 },
          overflowY: 'auto'
        }}
      >
        <List
          component={Stack}
          spacing={{ sm: 1.5, xs: 1 }}
          sx={{ width: { sm: 370, xs: 330 }, maxWidth: '80vw', fontSize: { sm: '0.875rem', xs: '0.75rem' } }}
        >
          {current && (
            <Box>
              <>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
                  <SvgIcon opacity={0.6} inheritViewBox component={IconUser} fontSize='small' />
                  Current Account
                </Typography>

                <AccountCell key={`current-${current}`} onClose={onClose} value={current} selected />
              </>
            </Box>
          )}

          {grouped.mimir.length > 0 && (
            <Box>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
                <SvgIcon opacity={0.6} inheritViewBox component={IconUnion} fontSize='small' />
                Mimir Wallet
              </Typography>
              {grouped.mimir.map((account) => (
                <AccountCell
                  key={`multisig-${account}`}
                  onClose={onClose}
                  onSelect={onSelect}
                  value={account}
                  selected={account === current}
                />
              ))}
            </Box>
          )}
          <Divider sx={{ marginY: 0.5 }} />

          {grouped.injected.length > 0 && (
            <Box>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
                <SvgIcon opacity={0.6} inheritViewBox component={IconExtension} fontSize='small' />
                Extension Wallet
              </Typography>
              {grouped.injected.map((account) => (
                <AccountCell key={`extension-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
              ))}
            </Box>
          )}
          <Divider sx={{ marginY: 0.5 }} />

          <Box>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
              <Box component='span' style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <SvgIcon opacity={0.6} inheritViewBox component={IconWatch} fontSize='small' />
                Watchlist
              </Box>
              <IconButton color='inherit' size='small' onClick={() => addAddressBook(undefined, true)}>
                <SvgIcon component={IconAdd} inheritViewBox />
              </IconButton>
            </Typography>
            {watchlist.map(({ address }) => (
              <AccountCell
                key={`extension-${address}`}
                watchlist
                onClose={onClose}
                onSelect={onSelect}
                value={address}
              />
            ))}
          </Box>

          {grouped.hide.length > 0 && (
            <Box>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: 1 }}>
                Hidden Accounts
              </Typography>
              {grouped.hide.map((account) => (
                <AccountCell
                  isHide
                  key={`hide-account-${account}`}
                  onClose={onClose}
                  onSelect={onSelect}
                  value={account}
                />
              ))}
            </Box>
          )}
          <Divider sx={{ marginY: 0.5 }} />
        </List>
      </Box>

      <CreateMultisig onClose={onClose} />
    </Drawer>
  );
}

export default React.memo(AccountMenu);
