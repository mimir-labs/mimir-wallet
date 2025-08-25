// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import { Empty } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Tooltip } from '@mimir-wallet/ui';

function DappItem({ removeFavorite, ...dapp }: DappOption & { removeFavorite: (id: string | number) => void }) {
  const { network } = useApi();
  const navigate = useNavigate();
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();

  const openDapp = () => {
    if (dapp.url === 'mimir://app/batch') {
      setRightSidebarTab('batch');
      openRightSidebar();
    } else {
      const url = dapp.urlSearch?.(network) || dapp.url;

      navigate(`/explorer/${encodeURIComponent(url.toString())}`);
    }
  };

  return (
    <>
      <Tooltip content={dapp.name}>
        <Button
          isIconOnly
          radius='md'
          className='relative aspect-square h-auto min-h-0 w-full p-[5px] hover:bg-transparent [&:hover>.close-btn]:block'
          variant='light'
          onClick={openDapp}
        >
          <Avatar
            className='aspect-square'
            radius='full'
            style={{ width: '100%', height: 'auto', background: 'transparent' }}
            src={dapp.icon}
            alt={dapp.name}
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            className='close-btn text-primary absolute top-[2px] right-[2px] z-10 hidden rounded-full opacity-50 transition-opacity hover:opacity-100'
            onClick={(e) => {
              e.stopPropagation();
              removeFavorite(dapp.id);
            }}
          >
            <path
              d='M10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1Z'
              fill='currentColor'
              stroke='white'
              strokeWidth='2'
            />
            <path
              d='M10 8.56143L12.25 6.30158C12.6519 5.8979 13.3017 5.89971 13.7014 6.30562C14.1011 6.71153 14.0993 7.36784 13.6974 7.77151L11.4554 10.0233L13.6509 12.2285C14.0528 12.6322 14.0546 13.2885 13.6549 13.6944L13.6409 13.7084C13.2402 14.1003 12.6007 14.0974 12.2035 13.6984L10 11.4852L7.79649 13.6984C7.39458 14.1021 6.74476 14.1003 6.34506 13.6944C5.94537 13.2885 5.94716 12.6322 6.34907 12.2285L8.54454 10.0233L6.30261 7.77151C5.9007 7.36784 5.89891 6.71153 6.2986 6.30562L6.31264 6.29163C6.71337 5.89972 7.35279 5.90259 7.75003 6.30158L10 8.56143Z'
              fill='white'
            />
          </svg>
        </Button>
      </Tooltip>
    </>
  );
}

function FavoriteDapps() {
  const { dapps, isFavorite, removeFavorite } = useDapps();

  const favoriteDapps = useMemo(() => {
    return dapps.filter((dapp) => isFavorite(dapp.id));
  }, [dapps, isFavorite]);

  if (favoriteDapps.length === 0) {
    return (
      <div className='border-secondary bg-content1 shadow-medium h-auto rounded-[20px] border-1 p-4 sm:p-5 lg:h-[210px]'>
        <Empty variant='favorite-dapps' height='170px' />
      </div>
    );
  }

  return (
    <div className='group'>
      <div className='border-secondary bg-content1 scroll-hover-show shadow-medium h-[210px] overflow-y-auto rounded-[20px] border-1 p-4 sm:p-5'>
        <div className='grid grid-cols-[repeat(auto-fill,_minmax(54px,1fr))] gap-2 lg:gap-3'>
          {favoriteDapps.map((dapp) => (
            <DappItem key={dapp.id} {...dapp} removeFavorite={removeFavorite} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FavoriteDapps);
