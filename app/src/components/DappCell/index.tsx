// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import { Badge, Button, Tooltip } from '@mimir-wallet/ui';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import SupportedChains from './SupportedChains';

import { analyticsActions } from '@/analytics';
import IconMatrix from '@/assets/images/matrix.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconDiscord from '@/assets/svg/icon-discord.svg?react';
import IconGithub from '@/assets/svg/icon-github.svg?react';
import IconStar from '@/assets/svg/icon-star.svg?react';
import IconWebsite from '@/assets/svg/icon-website.svg?react';
import IconX from '@/assets/svg/icon-x.svg?react';
import { useOpenDapp } from '@/hooks/useOpenDapp';

interface Props extends DappOption {
  size?: 'sm' | 'md';
  variant?: 'default' | 'mobile';
  addFavorite?: (id: number | string) => void;
  removeFavorite?: (id: number | string) => void;
  isFavorite?: (id: number | string) => boolean;
  onDelete?: (id: number | string) => void;
}

function DappCell({
  addFavorite,
  isFavorite,
  size = 'md',
  variant = 'default',
  removeFavorite,
  onDelete,
  ...dapp
}: Props) {
  const _isFavorite = useMemo(
    () => isFavorite?.(dapp.id),
    [dapp.id, isFavorite],
  );
  const toggleFavorite = useCallback(() => {
    if (_isFavorite) {
      removeFavorite?.(dapp.id);
    } else {
      addFavorite?.(dapp.id);
    }
  }, [_isFavorite, addFavorite, dapp.id, removeFavorite]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(dapp.id);
    },
    [dapp.id, onDelete],
  );

  const [isFocus, setFocus] = useState(false);

  const openDapp = useOpenDapp(dapp);

  // Track apps view when opening dapp
  const handleOpenDapp = useCallback(() => {
    analyticsActions.appsView(dapp.name);
    openDapp();
  }, [dapp.name, openDapp]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const content =
    variant === 'mobile' ? (
      <div
        className="card-root relative flex w-full cursor-pointer items-start gap-5 p-5"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenDapp();
        }}
      >
        <div className="relative h-[50px] w-[50px] shrink-0">
          <img src={dapp.icon} alt={dapp.name} className="h-full w-full" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <h6 className="min-w-0 flex-1 truncate text-base leading-normal font-bold">
              {dapp.name}
            </h6>
            {onDelete ? (
              <Tooltip content="Delete">
                <Button
                  isIconOnly
                  color="danger"
                  onClick={handleDelete}
                  className="bg-danger/10 shrink-0"
                  size="sm"
                >
                  <IconDelete className="text-danger h-4 w-4" />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content={_isFavorite ? 'Unpin' : 'Pin'}>
                <Button
                  isIconOnly
                  color="primary"
                  onClick={toggleFavorite}
                  className="bg-primary/10 shrink-0"
                  size="sm"
                >
                  <IconStar
                    className="text-primary"
                    style={{ opacity: _isFavorite ? 1 : 0.2 }}
                  />
                </Button>
              </Tooltip>
            )}
          </div>

          {dapp.tags && dapp.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {dapp.tags.slice(0, 3).map((tag, index) => (
                <div
                  key={index}
                  className="bg-primary/5 text-primary rounded-full px-2.5 py-1 text-xs font-normal"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-foreground/50">Supported on</span>
            <SupportedChains app={dapp} />
          </div>
        </div>
      </div>
    ) : size === 'sm' ? (
      <div
        className="card-root hover:bg-secondary transition-background relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-[15px] p-5"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenDapp();
        }}
      >
        <img src={dapp.icon} alt={dapp.name} className="h-12 w-12" />

        <h6>{dapp.name}</h6>

        {onDelete ? (
          <Tooltip content="Delete">
            <Button
              isIconOnly
              color="danger"
              onClick={handleDelete}
              className="bg-danger/10 absolute top-2.5 right-2.5 z-10"
            >
              <IconDelete className="text-danger h-4 w-4" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={_isFavorite ? 'Unpin' : 'Pin'}>
            <Button
              isIconOnly
              color="primary"
              onClick={toggleFavorite}
              className="bg-primary/10 absolute top-2.5 right-2.5 z-10"
            >
              <IconStar
                className="text-primary"
                style={{ opacity: _isFavorite ? 1 : 0.2 }}
              />
            </Button>
          </Tooltip>
        )}
      </div>
    ) : (
      <div
        data-focus={isFocus}
        className="card-root relative aspect-square cursor-pointer p-5 transition-transform duration-300 data-[focus=true]:scale-x-[-1]"
        onClick={(e) => {
          e.stopPropagation();

          if (isFocus) {
            handleOpenDapp();
          } else {
            setFocus(true);
          }
        }}
      >
        {onDelete ? (
          <Tooltip content="Delete">
            <Button
              data-focus={isFocus}
              isIconOnly
              color="danger"
              onClick={handleDelete}
              className="bg-danger/10 absolute top-2.5 right-2.5 z-10 data-[focus=true]:right-auto data-[focus=true]:left-2.5"
            >
              <IconDelete className="text-danger h-4 w-4" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={_isFavorite ? 'Unpin' : 'Pin'}>
            <Button
              data-focus={isFocus}
              isIconOnly
              color="primary"
              onClick={toggleFavorite}
              className="bg-primary/10 absolute top-2.5 right-2.5 z-10 data-[focus=true]:right-auto data-[focus=true]:left-2.5"
            >
              <IconStar
                className="text-primary"
                style={{ opacity: _isFavorite ? 1 : 0.2 }}
              />
            </Button>
          </Tooltip>
        )}

        {isFocus ? (
          <div
            data-focus={isFocus}
            className="flex h-full flex-col items-center justify-center gap-5 data-[focus=true]:scale-x-[-1]"
          >
            <div className="flex items-center gap-2.5">
              {dapp.website && (
                <Button isIconOnly color="secondary" asChild size="sm">
                  <a
                    href={dapp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWebsite className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dapp.github && (
                <Button isIconOnly color="secondary" asChild size="sm">
                  <a
                    href={dapp.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconGithub className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dapp.discord && (
                <Button isIconOnly color="secondary" asChild size="sm">
                  <a
                    href={dapp.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconDiscord className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dapp.twitter && (
                <Button isIconOnly color="secondary" asChild size="sm">
                  <a
                    href={dapp.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconX className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dapp.matrix && (
                <Button isIconOnly color="secondary" asChild size="sm">
                  <a
                    href={dapp.matrix}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconMatrix className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            <p className="text-center">{dapp.description}</p>

            <Button
              size="lg"
              fullWidth
              className="w-[90%]"
              onClick={handleOpenDapp}
            >
              Open Dapp
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5">
            <img src={dapp.icon} className="h-16 w-16 bg-transparent" />
            <h3 className="text-center text-2xl font-bold">{dapp.name}</h3>

            {dapp.tags && dapp.tags.length > 0 && (
              <div className="flex items-center gap-2.5">
                {dapp.tags.map((tag, index) => (
                  <Badge variant="secondary" key={index}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-foreground/50">Supported on</span>{' '}
              <SupportedChains app={dapp} />
            </div>
          </div>
        )}
      </div>
    );

  return <div ref={ref}>{content}</div>;
}

export default React.memo(DappCell);
