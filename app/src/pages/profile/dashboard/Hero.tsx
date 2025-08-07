// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import SubId from '@/assets/images/subid.svg';
import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconProxy from '@/assets/svg/icon-proxy-fill.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import IconSet from '@/assets/svg/icon-set.svg?react';
import IconWatch from '@/assets/svg/icon-watch.svg?react';
import { Fund } from '@/components';
import { SubsquareApp } from '@/config';
import { ONE_DAY } from '@/constants';
import { formatDisplay } from '@/utils';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';

function SubsquareLink({ network, address }: { network: string; address: string }) {
  const isSupported = SubsquareApp.supportedChains.includes(network);

  if (!isSupported) {
    return null;
  }

  const url = SubsquareApp.urlSearch?.(network) || new URL(SubsquareApp.url);

  url.pathname = `/user/${address}`;

  return (
    <Tooltip content='Subsquare'>
      <Link to={`/explorer/${encodeURIComponent(url.toString())}`}>
        <img style={{ width: 16, height: 16 }} src='/dapp-icons/subsquare.svg' alt='subsquare' />
      </Link>
    </Tooltip>
  );
}

function Hero({ address, totalUsd, changes }: { address: string; totalUsd: string | number; changes: number }) {
  const { network } = useApi();
  const [open, toggleOpen] = useToggle(false);
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [account] = useQueryAccount(address);

  const days = account ? Math.ceil((Date.now() - account.createdAt) / (ONE_DAY * 1000)) : '--';
  const formatUsd = formatDisplay(totalUsd.toString());

  const showAddWatchlistButton = useMemo(
    () => !isLocalAccount(address) && !isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );
  const buttons = (
    <div className='item-center grid w-full grid-cols-2 gap-2 pt-2.5 sm:w-auto md:flex'>
      <Button asChild variant='solid' color='primary' size='md' className='h-[26px]'>
        <Link to={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}>
          Transfer
          <IconSend />
        </Link>
      </Button>
      <Button onClick={toggleOpen} variant='ghost' color='primary' size='md' className='h-[26px]'>
        Fund
        <IconCancel />
      </Button>
      <Button asChild variant='ghost' color='primary' size='md' className='h-[26px]'>
        <Link to='/add-proxy'>
          Proxy
          <IconProxy />
        </Link>
      </Button>
      <Button asChild variant='ghost' color='primary' size='md' className='h-[26px]'>
        <Link to='/extrinsic'>
          Extrinsic
          <IconProxy />
        </Link>
      </Button>
      {showAddWatchlistButton ? (
        <Button
          variant='ghost'
          color='primary'
          size='md'
          className='h-[26px]'
          onClick={() => {
            addAddressBook(address, true);
          }}
        >
          Add To watchlist
          <IconWatch />
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className='border-secondary bg-content1 shadow-medium relative flex h-auto w-full flex-col items-start justify-between gap-[5px] rounded-[20px] border-1 p-4 sm:p-5 md:h-[210px]'>
        <Button
          className='absolute top-4 right-4 flex rotate-0 !transition-transform !duration-300 hover:rotate-180'
          asChild
          isIconOnly
          variant='solid'
          color='secondary'
          size='lg'
        >
          <Link to='/account-setting'>
            <IconSet />
          </Link>
        </Button>

        <h1 className='text-[50px] leading-[1.2]'>
          $ {formatUsd[0]}
          {formatUsd[1] ? `.${formatUsd[1]}` : ''}
          {formatUsd[2] || ''}
        </h1>

        <p className='text-base font-bold'>
          <span
            data-up={changes > 0}
            data-down={changes < 0}
            className='data-[up]:text-success data-[down]:text-danger text-secondary mr-[5px]'
          >
            {changes > 0 ? '+' : ''}
            {(changes * 100).toFixed(2)}%
          </span>
          <span style={{ fontWeight: 400 }}>Last 24 Hours</span>
        </p>

        <span className='text-foreground/50'>Mimir Secured {days} Days</span>

        <div className='flex items-center gap-[5px]'>
          <SubsquareLink network={network} address={address} />
          <Tooltip content='Sub ID'>
            <a href={`https://sub.id/${address}`} target='_blank' rel='noopener noreferrer'>
              <img src={SubId} className='h-4 w-4' />
            </a>
          </Tooltip>
        </div>

        {buttons}
      </div>

      <Fund onClose={() => toggleOpen(false)} open={open} receipt={address} />
    </>
  );
}

export default React.memo(Hero);
