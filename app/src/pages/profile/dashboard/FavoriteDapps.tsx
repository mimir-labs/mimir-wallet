// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import { Empty } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import React, { createElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, usePress } from '@mimir-wallet/ui';

function DappItem({ removeFavorite, ...dapp }: DappOption & { removeFavorite: (id: string | number) => void }) {
  const { network } = useApi();
  const navigate = useNavigate();
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
  const [element, setElement] = useState<JSX.Element>();
  const { pressProps } = usePress({
    onPress: () => {
      removeFavorite(dapp.id);
    }
  });

  const openDapp = () => {
    if (!dapp.isDrawer) {
      const url = dapp.urlSearch?.(network) || dapp.url;

      navigate(`/explorer/${encodeURIComponent(url.toString())}`);
    } else {
      dapp.Component?.().then((C) => {
        toggleDrawerOpen(true);
        setElement(
          createElement(C, {
            onClose: () => toggleDrawerOpen(false)
          } as Record<string, unknown>)
        );
      });
    }
  };

  return (
    <>
      {dapp.isDrawer && (
        <Drawer hideCloseButton placement='right' radius='none' isOpen={isDrawerOpen} onClose={toggleDrawerOpen}>
          <DrawerContent className='w-auto max-w-full py-5'>
            <DrawerBody>{element}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <Button
        isIconOnly
        radius='md'
        className='relative aspect-square h-auto min-h-0 w-full p-[5px] hover:bg-transparent [&:hover>.close-btn]:block'
        variant='light'
        onPress={openDapp}
      >
        <Avatar
          className='aspect-square'
          radius='full'
          style={{ width: '100%', height: 'auto', background: 'transparent' }}
          src={dapp.icon}
          alt={dapp.name}
        />
        <IconFailed
          className='close-btn absolute top-[2px] right-[2px] z-10 hidden opacity-50 transition-opacity hover:opacity-100'
          {...pressProps}
        />
      </Button>
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
      <div className='rounded-large border-secondary bg-content1 shadow-medium h-auto border-1 p-4 sm:p-5 lg:h-[210px]'>
        <Empty variant='favorite-dapps' height='170px' />
      </div>
    );
  }

  return (
    <div className='group'>
      <div className='rounded-large border-secondary bg-content1 shadow-medium scroll-hover-show h-[210px] overflow-y-auto border-1 p-4 sm:p-5'>
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
