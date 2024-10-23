// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

import ArrowRight from '@mimir-wallet/assets/svg/ArrowRight.svg?react';
import IconAddressBook from '@mimir-wallet/assets/svg/icon-address-book.svg?react';
import IconDapp from '@mimir-wallet/assets/svg/icon-dapp.svg?react';
import IconHome from '@mimir-wallet/assets/svg/icon-home.svg?react';
import IconLink from '@mimir-wallet/assets/svg/icon-link.svg?react';
import IconQr from '@mimir-wallet/assets/svg/icon-qr.svg?react';
import IconTransaction from '@mimir-wallet/assets/svg/icon-transaction.svg?react';
import IconTransfer from '@mimir-wallet/assets/svg/icon-transfer.svg?react';
import {
  AccountMenu,
  AddressCell,
  CopyButton,
  CreateMultisigDialog,
  FormatBalance,
  QrcodeAddress,
  WalletIcon
} from '@mimir-wallet/components';
import { findToken, walletConfig } from '@mimir-wallet/config';
import { useApi, useCall, useSelectedAccount, useToggle, useWallet } from '@mimir-wallet/hooks';
import { chainLinks } from '@mimir-wallet/utils';

import { BaseContainerCtx } from './BaseContainer';
import ToggleSidebar from './ToggleSidebar';

function NavLink({
  Icon,
  label,
  onClick,
  to
}: {
  to: string;
  Icon: React.ComponentType<any>;
  label: React.ReactNode;
  onClick: () => void;
}) {
  const location = useLocation();

  const matched = useMemo(() => matchPath(to, location.pathname), [location.pathname, to]);

  return (
    <Button
      className={matched ? 'Mui-active' : undefined}
      component={Link}
      fullWidth
      onClick={onClick}
      size='large'
      startIcon={<SvgIcon component={Icon} inheritViewBox sx={{ fontSize: '1.25rem !important', color: 'inherit' }} />}
      sx={{
        justifyContent: 'flex-start',
        marginTop: 2.5,
        padding: '15px 20px',
        color: 'grey.300',
        '> p': {
          color: 'text.secondary'
        },
        ':hover,&.Mui-active': {
          bgcolor: 'secondary.main',
          color: 'primary.main',

          '>p': {
            color: 'text.primary'
          }
        }
      }}
      to={to}
      variant='text'
    >
      <Typography fontSize='1rem' fontWeight={700}>
        {label}
      </Typography>
    </Button>
  );
}

function SideBar({ offsetTop = 0, withSideBar }: { offsetTop?: number; withSideBar: boolean }) {
  const { api } = useApi();
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const token = useMemo(() => findToken(api.genesisHash.toHex()), [api]);
  const [qrOpen, toggleQrOpen] = useToggle();
  const [createMultisigOpen, toggleCreateMultisigOpen] = useToggle();
  const { connectedWallets, openWallet } = useWallet();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [selected]);
  const { closeSidebar, sidebarOpen } = useContext(BaseContainerCtx);
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));
  const isConnected = Object.keys(connectedWallets).length > 0;

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
    closeSidebar();
  };

  const element = (
    <>
      <Box
        sx={{
          zIndex: 10,
          display: { md: 'none', xs: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2
        }}
      >
        <Typography variant='h3'>Menu</Typography>
      </Box>
      {isConnected ? (
        selected ? (
          <Paper sx={{ padding: 1 }} variant='outlined'>
            <Stack
              alignItems='center'
              direction='row'
              onClick={handleAccountOpen}
              spacing={1}
              sx={{ cursor: 'pointer', width: '100%' }}
            >
              <AddressCell value={selected} />
              <SvgIcon color='primary' component={ArrowRight} inheritViewBox />
            </Stack>
            <Divider sx={{ marginY: 1 }} />
            <Stack alignItems='center' direction='row' spacing={0.5}>
              <Avatar alt={api.runtimeChain.toString()} src={token.Icon} sx={{ width: 14, height: 14 }} />
              <Typography color='text.secondary' fontSize={12}>
                <FormatBalance value={allBalances?.freeBalance.add(allBalances.reservedBalance)} />
              </Typography>
            </Stack>
            <Divider sx={{ marginY: 1 }} />
            <IconButton color='primary' onClick={toggleQrOpen} size='small'>
              <SvgIcon component={IconQr} inheritViewBox />
            </IconButton>
            <CopyButton color='primary' value={selected} />
            <IconButton
              color='primary'
              component='a'
              href={chainLinks.accountExplorerLink(selected)}
              size='small'
              target='_blank'
            >
              <SvgIcon component={IconLink} inheritViewBox />
            </IconButton>
            <IconButton color='primary' component={Link} size='small' to={`/transfer?from=${selected}`}>
              <SvgIcon component={IconTransfer} inheritViewBox />
            </IconButton>
          </Paper>
        ) : (
          <Button size='large' fullWidth sx={{ borderRadius: 1, height: 48 }} onClick={toggleCreateMultisigOpen}>
            Create Multisig
          </Button>
        )
      ) : (
        <Button
          onClick={() => {
            openWallet();
            closeSidebar();
          }}
          size='large'
          fullWidth
          sx={{ borderRadius: 1, height: 48 }}
        >
          Connect Wallet
        </Button>
      )}
      <NavLink Icon={IconHome} label='Home' onClick={closeSidebar} to='/' />
      <NavLink Icon={IconDapp} label='Apps' onClick={closeSidebar} to='/dapp' />
      <NavLink Icon={IconTransaction} label='Transactions' onClick={closeSidebar} to='/transactions' />
      <NavLink Icon={IconAddressBook} label='Address Book' onClick={closeSidebar} to='/address-book' />
      <AccountMenu onClose={handleAccountClose} open={!!anchorEl} />
      <Box
        onClick={() => {
          openWallet();
          closeSidebar();
        }}
        sx={{
          cursor: 'pointer',
          position: 'absolute',
          left: 0,
          bottom: { md: 0, xs: 0 },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 2
        }}
      >
        {Object.entries(walletConfig).map(([id]) => (
          <WalletIcon disabled={!connectedWallets.includes(id)} id={id} key={id} sx={{ width: 20, height: 20 }} />
        ))}
      </Box>
    </>
  );

  return (
    <>
      <QrcodeAddress onClose={toggleQrOpen} open={qrOpen} value={selected} />
      {downMd || !withSideBar ? (
        <Drawer
          PaperProps={{
            sx: {
              width: 280,
              paddingX: 1.5,
              paddingY: 2,
              borderTopRightRadius: { md: 0, xs: 20 },
              borderBottomRightRadius: { md: 0, xs: 20 }
            }
          }}
          anchor='left'
          onClose={closeSidebar}
          open={sidebarOpen}
          variant='temporary'
        >
          {element}
        </Drawer>
      ) : (
        <Box
          sx={{
            position: 'sticky',
            top: offsetTop + 56,
            flex: 'none',
            width: 222,
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`,
            paddingX: 1.5,
            paddingY: 2,
            borderTopRightRadius: { md: 0, xs: 20 },
            borderBottomRightRadius: { md: 0, xs: 20 },
            bgcolor: 'background.paper'
          }}
        >
          {element}
        </Box>
      )}

      {!withSideBar && !downMd && !sidebarOpen && <ToggleSidebar />}
      <CreateMultisigDialog open={createMultisigOpen} onClose={toggleCreateMultisigOpen} />
    </>
  );
}

export default SideBar;
