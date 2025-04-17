// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import IconStar from '@/assets/svg/icon-star.svg?react';
import { ellipsisLinesMixin } from '@/components/utils';
import { useToggle } from '@/hooks/useToggle';
import React, { createElement, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Drawer, DrawerBody, DrawerContent } from '@mimir-wallet/ui';

import DappDetails from './DappDetails';
import SupportedChains from './SupportedChains';

interface Props {
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  dapp: DappOption;
}

function DappCell({ addFavorite, dapp, isFavorite, removeFavorite }: Props) {
  const { network } = useApi();
  const navigate = useNavigate();
  const [detailsOpen, toggleOpen, setDetailsOpen] = useToggle();
  const [isDrawerOpen, toggleDrawerOpen, setDrawerOpen] = useToggle();
  const [element, setElement] = useState<JSX.Element>();
  const _isFavorite = useMemo(() => isFavorite(dapp.id), [dapp.id, isFavorite]);
  const toggleFavorite = useCallback(() => {
    if (_isFavorite) {
      removeFavorite(dapp.id);
    } else {
      addFavorite(dapp.id);
    }
  }, [_isFavorite, addFavorite, dapp.id, removeFavorite]);

  const openApp = useCallback(() => {
    setDetailsOpen(false);

    if (!dapp.isDrawer) {
      const url = dapp.urlSearch?.(network) || dapp.url;

      navigate(`/explorer/${encodeURIComponent(url.toString())}`);
    } else {
      dapp.Component?.().then((C) => {
        setDrawerOpen(true);
        setElement(
          createElement(C, {
            onClose: () => setDrawerOpen(false)
          } as Record<string, unknown>)
        );
      });
    }
  }, [dapp, network, navigate, setDetailsOpen, setDrawerOpen]);

  return (
    <>
      <DappDetails dapp={dapp} onClose={toggleOpen} open={detailsOpen} onOpen={openApp} />

      {dapp.isDrawer && (
        <Drawer hideCloseButton placement='right' radius='none' isOpen={isDrawerOpen} onClose={toggleDrawerOpen}>
          <DrawerContent className='max-w-full w-auto py-5'>
            <DrawerBody>{element}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <div className='cursor-pointer block p-5 rounded-large bg-content1 shadow-medium' onClick={openApp}>
        <div className='space-y-5'>
          <div>
            <div className='flex justify-between items-center gap-2'>
              <h4 className='flex-1 text-lg font-bold'>{dapp.name}</h4>
              <SupportedChains app={dapp} />
            </div>
            <p
              className='mt-1.5 leading-[14px] h-[42px] text-tiny text-foreground/65 text-ellipsis'
              style={
                {
                  ...ellipsisLinesMixin(3)
                } as any
              }
            >
              {dapp.description}
            </p>
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='flex-1'>
              <Avatar radius='none' src={dapp.icon} className='w-[32px] h-[32px] bg-transparent' />
            </div>
            <Button onPress={toggleOpen} variant='ghost'>
              Details
            </Button>
            <Button isIconOnly color='primary' onPress={toggleFavorite} className='bg-primary/10'>
              <IconStar className='text-primary' style={{ opacity: _isFavorite ? 1 : 0.2 }} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(DappCell);
