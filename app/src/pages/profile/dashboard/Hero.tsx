// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import SubId from '@/assets/images/subid.svg';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconProxy from '@/assets/svg/icon-proxy-fill.svg?react';
import IconQrcode from '@/assets/svg/icon-qr.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import IconSet from '@/assets/svg/icon-set.svg?react';
import { Address, AddressName, CopyAddress, Fund, IdentityIcon } from '@/components';
import { SubsquareApp } from '@/config';
import { ONE_DAY } from '@/constants';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQrAddress } from '@/hooks/useQrAddress';
import { formatDisplay } from '@/utils';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Link, Tooltip } from '@mimir-wallet/ui';

function SubsquareLink({ network, address }: { network: string; address: string }) {
  const isSupported = SubsquareApp.supportedChains.includes(network);

  if (!isSupported) {
    return null;
  }

  const url = SubsquareApp.urlSearch?.(network) || new URL(SubsquareApp.url);

  url.pathname = `/user/${address}`;

  return (
    <Tooltip content='Subsquare' closeDelay={0}>
      <Link href={`/explorer/${encodeURIComponent(url.toString())}`}>
        <img style={{ width: 16, height: 16 }} src='/dapp-icons/subsquare.svg' alt='subsquare' />
      </Link>
    </Tooltip>
  );
}

function Hero({ address, totalUsd, changes }: { address: string; totalUsd: string | number; changes: number }) {
  const { network } = useApi();
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [open, toggleOpen] = useToggle(false);
  const [account] = useQueryAccount(address);
  const upSm = useMediaQuery('sm');
  const { open: openQr } = useQrAddress();
  const { open: openExplorer } = useAddressExplorer();
  const copyAddress = useCopyAddressToClipboard(address);

  const showAddWatchlistButton = useMemo(
    () => !isLocalAccount(address) && !isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );

  const days = account ? Math.ceil((Date.now() - account.createdAt) / (ONE_DAY * 1000)) : '--';
  const formatUsd = formatDisplay(totalUsd.toString());

  const buttons = (
    <div className='w-full sm:w-auto grid md:flex grid-cols-2 item-center gap-2'>
      <Button
        as={Link}
        href={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}
        variant='solid'
        color='primary'
        size='md'
        endContent={<IconSend />}
        className='h-[26px]'
      >
        Transfer
      </Button>
      <Button
        onPress={toggleOpen}
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconCancel />}
        className='h-[26px]'
      >
        Fund
      </Button>
      <Button
        as={Link}
        href='/add-proxy'
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconProxy />}
        className='h-[26px]'
      >
        Proxy
      </Button>
      <Button
        as={Link}
        href='/extrinsic'
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconProxy />}
        className='h-[26px]'
      >
        Extrinsic
      </Button>
    </div>
  );

  return (
    <>
      <div className='w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-5 rounded-large border-1 border-secondary bg-content1 shadow-medium'>
        <div className='flex items-start gap-5'>
          <IdentityIcon value={address} size={upSm ? 80 : 50} />

          <div className='space-y-[5px] sm:space-y-2.5'>
            <div className='flex items-center gap-2.5 font-extrabold text-[26px] sm:text-[30px] leading-[1.1]'>
              <AddressName value={address} />
              {showAddWatchlistButton ? (
                <Tooltip color='foreground' content='Add to watchlist' placement='bottom-start'>
                  <Button isIconOnly size='lg' color='secondary' onPress={() => addAddressBook(address, true)}>
                    <IconAddressBook className='w-[20px] h-[20px]' />
                  </Button>
                </Tooltip>
              ) : null}
              <Tooltip color='foreground' content='Setting' placement='bottom-start'>
                <Button
                  isIconOnly
                  as={Link}
                  size='lg'
                  href={`/account-setting?address=${address}`}
                  color='secondary'
                  className='transition-transform rotate-0 duration-300 hover:rotate-180'
                >
                  <IconSet className='w-[20px] h-[20px]' />
                </Button>
              </Tooltip>
            </div>

            <div
              className='flex items-center gap-1 font-bold text-foreground leading-[1.1]'
              onClick={() => {
                copyAddress();
              }}
            >
              <Address value={address} shorten={!upSm} />
              <CopyAddress address={address} color='primary' className='opacity-50' />
              <Tooltip content='Explorer' closeDelay={0}>
                <Button
                  isIconOnly
                  className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
                  color='primary'
                  variant='light'
                  size='sm'
                  onPress={() => openExplorer(address)}
                >
                  <IconLink className='w-4 h-4 opacity-50' />
                </Button>
              </Tooltip>

              <Button
                isIconOnly
                color='primary'
                size='sm'
                variant='light'
                onPress={() => openQr(address)}
                className='opacity-50 min-w-[26px] w-[26px] h-[26px] text-medium'
              >
                <IconQrcode className='w-[16px] h-[16px]' />
              </Button>
            </div>

            <div className='flex items-center gap-1 text-foreground/50'>
              <span>Mimir Secured {days} Days</span>
              <SubsquareLink network={network} address={address} />
              <Tooltip content='Sub ID' closeDelay={0}>
                <Link href={`https://sub.id/${address}`} isExternal>
                  <img src={SubId} className='w-4 h-4' />
                </Link>
              </Tooltip>
            </div>

            <Divider className='hidden sm:block' style={{ maxWidth: 250, minWidth: 200 }} />

            {upSm && buttons}
          </div>
        </div>

        <div
          className='text-left sm:text-right w-full sm:w-auto p-2.5 sm:p-0 bg-[--self-background] sm:bg-transparent rounded-large'
          style={
            {
              '--self-background': 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
            } as any
          }
        >
          <h1 className='text-[40px] leading-[1]'>
            $ {formatUsd[0]}
            {formatUsd[1] ? `.${formatUsd[1]}` : ''}
            {formatUsd[2] || ''}
          </h1>
          <p className='mt-2.5 font-bold text-medium'>
            <span
              data-up={changes > 0}
              data-down={changes < 0}
              className='mr-[5px] data-[up]:text-success data-[down]:text-danger text-secondary'
            >
              {changes > 0 ? '+' : ''}
              {(changes * 100).toFixed(2)}%
            </span>
            <span style={{ fontWeight: 400 }}>Last 24 Hours</span>
          </p>
        </div>

        {!upSm && buttons}
      </div>

      <Fund onClose={() => toggleOpen(false)} open={open} receipt={address} />
    </>
  );
}

export default React.memo(Hero);
