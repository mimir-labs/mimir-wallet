// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconDapp from '@/assets/svg/icon-dapp.svg?react';
import IconHome from '@/assets/svg/icon-home.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconQr from '@/assets/svg/icon-qr.svg?react';
import IconSetting from '@/assets/svg/icon-set.svg?react';
import IconTransaction from '@/assets/svg/icon-transaction.svg?react';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import { AccountMenu, AddressCell, CopyAddress, WalletIcon } from '@/components';
import { walletConfig } from '@/config';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useQrAddress } from '@/hooks/useQrAddress';
import { useMultiChainTransactionCounts } from '@/hooks/useTransactions';
import { formatDisplay } from '@/utils';
import { useWallet } from '@/wallet/useWallet';
import { useMemo, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Link,
  Tooltip
} from '@mimir-wallet/ui';

import ToggleSidebar from './ToggleSidebar';

function NavLink({
  Icon,
  label,
  onClick,
  to,
  extraNavs = [],
  endContent
}: {
  to: string;
  extraNavs?: string[];
  Icon: React.ComponentType<any>;
  label: React.ReactNode;
  endContent?: React.ReactNode;
  onClick: () => void;
}) {
  const location = useLocation();

  const matched = useMemo(
    () =>
      !!matchPath(to, location.pathname) || extraNavs.map((nav) => !!matchPath(nav, location.pathname)).some(Boolean),
    [extraNavs, location.pathname, to]
  );

  return (
    <Button
      data-active={matched}
      as={Link}
      fullWidth
      onPress={onClick}
      size='lg'
      radius='md'
      startContent={<Icon className='h-5 w-5' />}
      className='text-foreground/50 hover:bg-secondary hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary h-[50px] items-center justify-start gap-x-2.5 px-[15px] py-[20px]'
      href={matched ? undefined : to}
      variant='light'
    >
      <p
        data-active={matched}
        className='text-medium text-foreground/50 data-[active=true]:text-foreground font-semibold'
      >
        {label}
      </p>
      {endContent}
    </Button>
  );
}

function TopContent() {
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { connectedWallets, openWallet } = useWallet();
  const [totalUsd] = useBalanceTotalUsd(selected);
  const formatUsd = formatDisplay(totalUsd.toString());
  const { closeSidebar } = useMimirLayout();
  const isConnected = Object.keys(connectedWallets).length > 0;
  const upMd = useMediaQuery('md');
  const { open: openQr } = useQrAddress();
  const { open: openExplorer } = useAddressExplorer();

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
          <div className='border-secondary rounded-medium border-1'>
            <div
              className='rounded-tl-medium rounded-tr-medium hover:bg-secondary transition-background flex w-full cursor-pointer items-center gap-2.5 bg-transparent p-2.5'
              onClick={handleAccountOpen}
            >
              <AddressCell value={selected} addressCopyDisabled />
              <ArrowRight className='text-primary' />
            </div>

            <Divider className='mx-2.5 w-auto' />

            <p className='text-tiny text-foreground/65 p-2.5'>
              $ {formatUsd[0]}
              {formatUsd[1] ? `.${formatUsd[1]}` : ''}
              {formatUsd[2] || ''}
            </p>

            <Divider className='mx-2.5 w-auto' />

            <div className='flex items-center p-2.5'>
              <Tooltip content='QR Code' closeDelay={0}>
                <Button
                  isIconOnly
                  className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
                  color='primary'
                  variant='light'
                  onPress={() => openQr(selected)}
                  size='sm'
                >
                  <IconQr className='h-4 w-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Copy' closeDelay={0}>
                <CopyAddress address={selected} color='primary' className='opacity-100' />
              </Tooltip>
              <Tooltip content='Explorer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
                  color='primary'
                  variant='light'
                  size='sm'
                  onPress={() => openExplorer(selected)}
                >
                  <IconLink className='h-4 w-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Transfer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
                  color='primary'
                  variant='light'
                  as={Link}
                  size='sm'
                  href={`/transfer?from=${selected}`}
                >
                  <IconTransfer className='h-4 w-4' />
                </Button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <Button
            as={Link}
            size='lg'
            fullWidth
            radius='md'
            color='primary'
            className='h-[48px]'
            href='/create-multisig'
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

      <AccountMenu anchor={upMd ? 'left' : 'right'} onClose={handleAccountClose} open={!!anchorEl} />
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
    <div
      className='bg-content1 border-t-secondary grid w-full cursor-pointer grid-cols-5 gap-2.5 border-t-1 pt-2.5'
      onClick={() => {
        openWallet();
        closeSidebar();
      }}
    >
      {sortedWalletConfig.map(([id]) => (
        <div className='col-span-1' key={id}>
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
            style={{ width: 20, height: 20 }}
          />
        </div>
      ))}
    </div>
  );
}

function SideBar({ offsetTop = 0, withSideBar }: { offsetTop?: number; withSideBar: boolean }) {
  const { isApiReady } = useApi();
  const { current } = useAccount();
  const { closeSidebar, openSidebar, sidebarOpen } = useMimirLayout();
  const upMd = useMediaQuery('md');
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [transactionCounts] = useMultiChainTransactionCounts(current);
  const totalCounts = useMemo(
    () =>
      Object.values(transactionCounts || {}).reduce((acc, item) => {
        return acc + item.pending;
      }, 0),
    [transactionCounts]
  );

  const element = (
    <div className='space-y-5 sm:space-y-6'>
      {pathname !== '/welcome' && isApiReady && <TopContent />}

      <NavLink Icon={IconHome} label='Home' onClick={closeSidebar} to='/' />
      <NavLink Icon={IconDapp} label='Apps' onClick={closeSidebar} to='/dapp' />
      <NavLink
        Icon={IconTransaction}
        label='Transactions'
        endContent={
          totalCounts ? (
            <div className='text-small text-danger-foreground bg-danger flex aspect-1/1 w-5 items-center justify-center rounded-full leading-[1] font-semibold'>
              {totalCounts}
            </div>
          ) : null
        }
        onClick={closeSidebar}
        to='/transactions'
      />
      <NavLink Icon={IconAddressBook} label='Address Book' onClick={closeSidebar} to='/address-book' />
      <NavLink
        Icon={IconSetting}
        label='Setting'
        onClick={closeSidebar}
        to='/setting'
        extraNavs={['/account-setting']}
      />
    </div>
  );

  return (
    <>
      {!upMd || !withSideBar ? (
        <Drawer
          size='xs'
          radius='lg'
          hideCloseButton={upMd}
          placement={upMd ? 'left' : 'right'}
          onClose={closeSidebar}
          isOpen={sidebarOpen}
        >
          <DrawerContent className='max-w-[280px]'>
            <DrawerHeader className='md:hidden'>
              <h3>Menu</h3>
            </DrawerHeader>
            <DrawerBody className='scrollbar-hide px-4 py-4'>{element}</DrawerBody>
            <DrawerFooter className='px-4 pt-0'>
              <WalletContent />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          data-open={isOpen}
          className='bg-content1 border-r-secondary sticky z-[1] -ml-[222px] flex w-[222px] flex-none flex-col border-r-1 transition-[margin-left] duration-150 ease-in-out data-[open=true]:ml-0'
          style={{
            top: offsetTop + 56,
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`
          }}
        >
          <div className='flex-1 overflow-y-auto px-4 py-5'>{element}</div>
          <div className='px-5 pb-2.5'>
            <WalletContent />
          </div>

          {/* for pc and has sidebar */}
          {upMd && withSideBar && (
            <ToggleSidebar
              style={{
                zIndex: 1000,
                position: 'absolute',
                right: isOpen ? 0 : -14,
                margin: '0',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'right 0.15s ease-in-out, transform 0.15s ease-in-out'
              }}
              onClick={() => setIsOpen((open) => !open)}
            />
          )}
        </div>
      )}

      {/* for pc and no sidebar */}
      {!(!upMd || withSideBar || sidebarOpen) && <ToggleSidebar onClick={openSidebar} />}
    </>
  );
}

export default SideBar;
