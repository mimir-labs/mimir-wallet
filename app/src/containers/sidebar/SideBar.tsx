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
      startContent={<Icon className='w-5 h-5' />}
      className='h-[50px] justify-start gap-x-2.5 items-center px-[15px] py-[20px] text-foreground/50 hover:bg-secondary hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary'
      href={matched ? undefined : to}
      variant='light'
    >
      <p
        data-active={matched}
        className='text-medium font-semibold text-foreground/50 data-[active=true]:text-foreground'
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
          <div className='border-1 border-secondary rounded-medium'>
            <div
              className='flex items-center gap-2.5 p-2.5  cursor-pointer w-full rounded-tl-medium rounded-tr-medium bg-transparent hover:bg-secondary transition-background'
              onClick={handleAccountOpen}
            >
              <AddressCell value={selected} addressCopyDisabled />
              <ArrowRight className='text-primary' />
            </div>

            <Divider />

            <p className='p-2.5 text-tiny text-foreground/65'>
              $ {formatUsd[0]}
              {formatUsd[1] ? `.${formatUsd[1]}` : ''}
              {formatUsd[2] || ''}
            </p>

            <Divider />

            <div className='flex items-center p-2.5'>
              <Tooltip content='QR Code' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  variant='light'
                  onPress={() => openQr(selected)}
                  size='sm'
                >
                  <IconQr className='w-4 h-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Copy' closeDelay={0}>
                <CopyAddress address={selected} color='primary' className='opacity-100' />
              </Tooltip>
              <Tooltip content='Explorer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  variant='light'
                  size='sm'
                  onPress={() => openExplorer(selected)}
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
                  href={`/transfer?from=${selected}`}
                >
                  <IconTransfer className='w-4 h-4' />
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
      className='grid grid-cols-5 gap-2.5 cursor-pointer w-full pt-2.5 bg-content1 border-t-1 border-t-secondary'
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
            <div className='flex justify-center items-center font-semibold text-small text-danger-foreground bg-danger aspect-1/1 w-5 leading-[1] rounded-full'>
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
            <DrawerBody className='scrollbar-hide py-4 px-4'>{element}</DrawerBody>
            <DrawerFooter className='px-4 pt-0'>
              <WalletContent />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          data-open={isOpen}
          className='z-[1] sticky flex-none flex flex-col w-[222px] -ml-[222px] data-[open=true]:ml-0 bg-content1 border-r-1 border-r-secondary transition-[margin-left] duration-150 ease-in-out'
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
