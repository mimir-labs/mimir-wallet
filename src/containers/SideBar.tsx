// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

import { useSelectedAccount } from '@mimir-wallet/accounts/useSelectedAccount';
import { chainLinks } from '@mimir-wallet/api/chain-links';
import ArrowRight from '@mimir-wallet/assets/svg/ArrowRight.svg?react';
import IconAddressBook from '@mimir-wallet/assets/svg/icon-address-book.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
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
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useNativeBalances } from '@mimir-wallet/hooks/useBalances';
import { useToggle } from '@mimir-wallet/hooks/useToggle';
import { useWallet } from '@mimir-wallet/wallet/useWallet';

import { BaseContainerCtx } from './context';
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

function TopContent() {
  const { api } = useApi();
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [qrOpen, toggleQrOpen] = useToggle();
  const [createMultisigOpen, toggleCreateMultisigOpen] = useToggle();
  const { connectedWallets, openWallet } = useWallet();
  const token = useMemo(() => findToken(api.genesisHash.toHex()), [api]);
  const [allBalances, isFetched] = useNativeBalances(selected);
  const { closeSidebar } = useContext(BaseContainerCtx);
  const isConnected = Object.keys(connectedWallets).length > 0;
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
    closeSidebar();
  };

  return (
    <>
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
            {isFetched ? (
              <Stack alignItems='center' direction='row' spacing={0.5}>
                <Avatar alt={api.runtimeChain.toString()} src={token.Icon} sx={{ width: 14, height: 14 }} />
                <Typography color='text.secondary' fontSize={12}>
                  <FormatBalance value={allBalances?.total} />
                </Typography>
              </Stack>
            ) : (
              <Skeleton variant='text' width={50} height={14} />
            )}
            <Divider sx={{ marginY: 1 }} />
            <Tooltip title='QR Code'>
              <IconButton color='primary' onClick={toggleQrOpen} size='small'>
                <SvgIcon component={IconQr} inheritViewBox />
              </IconButton>
            </Tooltip>
            <Tooltip title='Copy'>
              <CopyButton color='primary' value={selected} />
            </Tooltip>
            <Tooltip title='Explorer'>
              <IconButton
                color='primary'
                component='a'
                href={chainLinks.accountExplorerLink(selected)}
                size='small'
                target='_blank'
              >
                <SvgIcon component={IconLink} inheritViewBox />
              </IconButton>
            </Tooltip>
            <Tooltip title='Transfer'>
              <IconButton color='primary' component={Link} size='small' to={`/transfer?from=${selected}`}>
                <SvgIcon component={IconTransfer} inheritViewBox />
              </IconButton>
            </Tooltip>
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

      <QrcodeAddress onClose={toggleQrOpen} open={qrOpen} value={selected} />
      <AccountMenu anchor={downMd ? 'right' : 'left'} onClose={handleAccountClose} open={!!anchorEl} />
      <CreateMultisigDialog open={createMultisigOpen} onClose={toggleCreateMultisigOpen} />
    </>
  );
}

function WalletContent() {
  const { closeSidebar } = useContext(BaseContainerCtx);
  const { connectedWallets, openWallet, wallets } = useWallet();

  // Sort walletConfig: connected first, unconnected second, not installed last
  const sortedWalletConfig = useMemo(() => {
    return Object.entries(walletConfig).sort(([id], [id2]) => {
      const isInstalled =
        id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id];
      const isInstalled2 =
        id2 === 'nova' ? wallets[walletConfig[id2].key] && window?.walletExtension?.isNovaWallet : wallets[id2];

      const left = connectedWallets.includes(id) ? 2 : isInstalled ? 1 : isInstalled2 ? 0 : -1;
      const right = connectedWallets.includes(id2) ? 2 : isInstalled2 ? 1 : isInstalled ? 0 : -1;

      return right - left;
    });
  }, [wallets, connectedWallets]);

  return (
    <Grid
      container
      sx={{
        cursor: 'pointer',
        bottom: { md: 0, xs: 0 },
        width: '100%',
        bgcolor: 'background.paper'
      }}
      spacing={1}
      columns={5}
      onClick={() => {
        openWallet();
        closeSidebar();
      }}
    >
      {sortedWalletConfig.map(([id]) => (
        <Grid size={1} key={id}>
          <WalletIcon
            disabled={
              !(id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id]) ||
              !connectedWallets.includes(id)
            }
            id={id}
            key={id}
            sx={{ width: 20, height: 20 }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function SideBar({ offsetTop = 0, withSideBar }: { offsetTop?: number; withSideBar: boolean }) {
  const { closeSidebar, sidebarOpen } = useContext(BaseContainerCtx);
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));
  const { pathname } = useLocation();

  const element = (
    <Stack gap={{ sm: 2.5, xs: 2 }}>
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
        <IconButton onClick={closeSidebar} color='inherit'>
          <SvgIcon component={IconClose} inheritViewBox fontSize='large' />
        </IconButton>
      </Box>

      {pathname !== '/welcome' && <TopContent />}

      <NavLink Icon={IconHome} label='Home' onClick={closeSidebar} to='/' />
      <NavLink Icon={IconDapp} label='Apps' onClick={closeSidebar} to='/dapp' />
      <NavLink Icon={IconTransaction} label='Transactions' onClick={closeSidebar} to='/transactions' />
      <NavLink Icon={IconAddressBook} label='Address Book' onClick={closeSidebar} to='/address-book' />
    </Stack>
  );

  return (
    <>
      {downMd || !withSideBar ? (
        <Drawer
          PaperProps={{
            sx: {
              width: 280,
              paddingX: 1.5,
              paddingY: 2,
              borderTopRightRadius: { md: 20, xs: 0 },
              borderBottomRightRadius: { md: 20, xs: 0 },
              borderTopLeftRadius: { md: 0, xs: 20 },
              borderBottomLeftRadius: { md: 0, xs: 20 }
            }
          }}
          anchor={downMd ? 'right' : 'left'}
          onClose={closeSidebar}
          open={sidebarOpen}
          variant='temporary'
        >
          <Box sx={{ flex: 1, overflowY: 'auto' }}>{element}</Box>
          <Box>
            <WalletContent />
          </Box>
        </Drawer>
      ) : (
        <Box
          sx={{
            position: 'sticky',
            top: offsetTop + 56,
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            width: 222,
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`,
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', paddingX: 1.5, paddingY: 2 }}>{element}</Box>
          <Box sx={{ paddingX: 2, paddingY: 1 }}>
            <WalletContent />
          </Box>
        </Box>
      )}

      {!withSideBar && !downMd && !sidebarOpen && <ToggleSidebar />}
    </>
  );
}

export default SideBar;
