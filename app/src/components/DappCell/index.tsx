// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import IconMatrix from '@/assets/images/matrix.svg?react';
import IconDiscord from '@/assets/svg/icon-discord.svg?react';
import IconGithub from '@/assets/svg/icon-github.svg?react';
import IconStar from '@/assets/svg/icon-star.svg?react';
import IconWebsite from '@/assets/svg/icon-website.svg?react';
import IconX from '@/assets/svg/icon-x.svg?react';
import { useToggle } from '@/hooks/useToggle';
import React, { createElement, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  Link,
  Tooltip,
  useInteractOutside,
  usePress
} from '@mimir-wallet/ui';

import SupportedChains from './SupportedChains';

interface Props extends DappOption {
  addFavorite: (id: number | string) => void;
  removeFavorite: (id: number | string) => void;
  isFavorite: (id: number | string) => boolean;
}

function DappCell({ addFavorite, isFavorite, removeFavorite, ...dapp }: Props) {
  const { network } = useApi();
  const navigate = useNavigate();
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

  const [isFocus, setFocus] = useState(false);

  const openDapp = () => {
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
  };

  const ref = useRef<HTMLDivElement>(null);

  useInteractOutside({
    ref,
    onInteractOutside: () => {
      setFocus(false);
    }
  });

  const { pressProps } = usePress({
    onPress: () => {
      if (isFocus) {
        openDapp();
      } else {
        setFocus(true);
      }
    }
  });

  return (
    <div ref={ref}>
      {dapp.isDrawer && (
        <Drawer hideCloseButton placement='right' radius='none' isOpen={isDrawerOpen} onClose={toggleDrawerOpen}>
          <DrawerContent className='w-auto max-w-full py-5'>
            <DrawerBody>{element}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <div
        data-focus={isFocus}
        className='rounded-large bg-content1 border-secondary shadow-medium relative aspect-square cursor-pointer border-1 p-5 transition-transform duration-300 data-[focus=true]:scale-x-[-1]'
        {...pressProps}
      >
        <Tooltip content={_isFavorite ? 'Unpin' : 'Pin'}>
          <Button
            data-focus={isFocus}
            isIconOnly
            color='primary'
            onPress={toggleFavorite}
            className='bg-primary/10 absolute top-2.5 right-2.5 z-10 data-[focus=true]:right-auto data-[focus=true]:left-2.5'
          >
            <IconStar className='text-primary' style={{ opacity: _isFavorite ? 1 : 0.2 }} />
          </Button>
        </Tooltip>

        {isFocus ? (
          <div
            data-focus={isFocus}
            className='flex h-full flex-col items-center justify-center gap-5 data-[focus=true]:scale-x-[-1]'
          >
            <div className='flex items-center gap-2.5'>
              {dapp.website && (
                <Button isIconOnly color='secondary' as={Link} href={dapp.website} size='sm' target='_blank'>
                  <IconWebsite className='h-4 w-4' />
                </Button>
              )}
              {dapp.github && (
                <Button isIconOnly color='secondary' as={Link} href={dapp.github} size='sm' target='_blank'>
                  <IconGithub className='h-4 w-4' />
                </Button>
              )}
              {dapp.discord && (
                <Button isIconOnly color='secondary' as={Link} href={dapp.discord} size='sm' target='_blank'>
                  <IconDiscord className='h-4 w-4' />
                </Button>
              )}
              {dapp.twitter && (
                <Button isIconOnly color='secondary' as={Link} href={dapp.twitter} size='sm' target='_blank'>
                  <IconX className='h-4 w-4' />
                </Button>
              )}
              {dapp.matrix && (
                <Button isIconOnly color='secondary' as={Link} href={dapp.matrix} size='sm' target='_blank'>
                  <IconMatrix className='h-4 w-4' />
                </Button>
              )}
            </div>

            <p className='text-center'>{dapp.description}</p>

            <Button size='lg' fullWidth className='w-[90%]' onPress={openDapp}>
              Open Dapp
            </Button>
          </div>
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-5'>
            <img src={dapp.icon} className='h-[64px] w-[64px] bg-transparent' />
            <h3 className='text-center text-2xl font-bold'>{dapp.name}</h3>

            {dapp.tags && dapp.tags.length > 0 && (
              <div className='flex items-center gap-2.5'>
                {dapp.tags.map((tag, index) => (
                  <Button color='secondary' key={index} size='sm'>
                    {tag}
                  </Button>
                ))}
              </div>
            )}

            <div className='text-tiny flex items-center justify-between gap-2'>
              <span className='text-foreground/50'>Supported on</span> <SupportedChains app={dapp} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(DappCell);
