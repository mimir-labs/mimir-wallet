// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { chainLinks } from '@/api/chain-links';
import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconDapp from '@/assets/svg/icon-dapp.svg?react';
import IconHome from '@/assets/svg/icon-home.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconQr from '@/assets/svg/icon-qr.svg?react';
import IconSetting from '@/assets/svg/icon-set.svg?react';
import IconTransaction from '@/assets/svg/icon-transaction.svg?react';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import {
  AccountMenu,
  AddressCell,
  CopyButton,
  CreateMultisigDialog,
  FormatBalance,
  QrcodeAddress,
  WalletIcon
} from '@/components';
import { findToken, walletConfig } from '@/config';
import { useApi } from '@/hooks/useApi';
import { useNativeBalances } from '@/hooks/useBalances';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useToggle } from '@/hooks/useToggle';
import { useWallet } from '@/wallet/useWallet';
import {
  Avatar,
  Box,
  Divider,
  Grid2 as Grid,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Tooltip } from '@mimir-wallet/ui';

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
      data-active={!!matched}
      as={Link}
      fullWidth
      onPress={onClick}
      size='lg'
      radius='md'
      startContent={<Icon className='w-5 h-5' />}
      className='h-[50px] justify-start px-[15px] py-[20px] text-foreground/50 hover:bg-secondary hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary'
      to={to}
      variant='light'
    >
      <p
        data-active={!!matched}
        className='text-medium font-semibold text-foreground/50 data-[active=true]:text-foreground'
      >
        {label}
      </p>
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
  const { closeSidebar } = useMimirLayout();
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
            <div className='flex items-center'>
              <Tooltip content='QR Code' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  variant='light'
                  onPress={toggleQrOpen}
                  size='sm'
                >
                  <IconQr className='w-4 h-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Copy' closeDelay={0}>
                <CopyButton color='primary' value={selected} className='opacity-100' />
              </Tooltip>
              <Tooltip content='Explorer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  as='a'
                  variant='light'
                  href={chainLinks.accountExplorerLink(selected)}
                  size='sm'
                  target='_blank'
                >
                  <IconLink className='w-4 h-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Transfer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  variant='light'
                  as={Link}
                  size='sm'
                  to={`/transfer?from=${selected}`}
                >
                  <IconTransfer className='w-4 h-4' />
                </Button>
              </Tooltip>
            </div>
          </Paper>
        ) : (
          <Button
            size='lg'
            fullWidth
            radius='md'
            color='primary'
            className='h-[48px]'
            onPress={toggleCreateMultisigOpen}
          >
            Create Multisig
          </Button>
        )
      ) : (
        <Button
          onPress={() => {
            openWallet();
            closeSidebar();
          }}
          size='lg'
          fullWidth
          radius='md'
          color='primary'
          className='h-[48px]'
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
  const { closeSidebar } = useMimirLayout();
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
              !(
                (id === 'nova'
                  ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet
                  : wallets[id]) && connectedWallets.includes(id)
              )
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
  const { isApiReady } = useApi();
  const { closeSidebar, openSidebar, sidebarOpen } = useMimirLayout();
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const element = (
    <Stack gap={{ sm: 2.5, xs: 2 }}>
      {pathname !== '/welcome' && isApiReady && <TopContent />}

      <NavLink Icon={IconHome} label='Home' onClick={closeSidebar} to='/' />
      <NavLink Icon={IconDapp} label='Apps' onClick={closeSidebar} to='/dapp' />
      <NavLink Icon={IconTransaction} label='Transactions' onClick={closeSidebar} to='/transactions' />
      <NavLink Icon={IconAddressBook} label='Address Book' onClick={closeSidebar} to='/address-book' />
      <NavLink Icon={IconSetting} label='Setting' onClick={closeSidebar} to='/setting' />
    </Stack>
  );

  return (
    <>
      {downMd || !withSideBar ? (
        <Drawer
          size='xs'
          radius='lg'
          hideCloseButton={!downMd}
          placement={downMd ? 'right' : 'left'}
          onClose={closeSidebar}
          isOpen={sidebarOpen}
        >
          <DrawerContent className='max-w-[280px]'>
            <DrawerHeader className='md:hidden'>
              <h3>Menu</h3>
            </DrawerHeader>
            <DrawerBody className='scrollbar-hide py-4 px-4'>{element}</DrawerBody>
            <DrawerFooter className='px-4'>
              <WalletContent />
            </DrawerFooter>
          </DrawerContent>
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
            marginLeft: isOpen ? 0 : '-222px',
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'margin-left 0.15s ease-in-out'
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', paddingX: 1.5, paddingY: 2 }}>{element}</Box>
          <Box sx={{ paddingX: 2, paddingY: 1 }}>
            <WalletContent />
          </Box>

          {/* for pc and has sidebar */}
          {!downMd && withSideBar && (
            <ToggleSidebar
              style={{
                position: 'absolute',
                top: 0,
                right: isOpen ? 0 : -14,
                margin: '0',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'right 0.15s ease-in-out, transform 0.15s ease-in-out'
              }}
              onClick={() => setIsOpen((open) => !open)}
            />
          )}
        </Box>
      )}

      {/* for pc and no sidebar */}
      {!(downMd || withSideBar || sidebarOpen) && <ToggleSidebar onClick={openSidebar} />}
    </>
  );
}

export default SideBar;
