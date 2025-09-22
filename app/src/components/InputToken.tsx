// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountEnhancedAssetBalance } from '@mimir-wallet/polkadot-core';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useChainBalances } from '@/hooks/useChainBalances';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { Avatar, Popover, PopoverContent, PopoverTrigger, Spinner } from '@mimir-wallet/ui';

import FormatBalance from './FormatBalance';

interface Props {
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  isIconOnly?: boolean;
  network: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  label?: string;
  identifier?: string;
  defaultIdentifier?: string;
  helper?: React.ReactNode;
  address?: string;
  onChange: (value: string) => void;
}

function InputToken({
  radius = 'md',
  isIconOnly = false,
  network,
  disabled,
  className,
  placeholder,
  wrapperClassName = '',
  label,
  helper,
  address,
  identifier,
  defaultIdentifier,
  onChange
}: Props) {
  const isControl = useRef(identifier !== undefined);
  const [allBalances, isFetched, isFetching] = useChainBalances(network, address, { alwaysIncludeNative: true });
  const [allAssets] = useChainXcmAsset(network);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const [value, setValue] = useState<string>(identifier || defaultIdentifier || '');
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const options = useMemo((): AccountEnhancedAssetBalance[] => {
    return allBalances || [];
  }, [allBalances]);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const token = useMemo(() => {
    return allAssets?.find((item) => (value === 'native' ? item.isNative : item.key === value));
  }, [allAssets, value]);

  useEffect(() => {
    if (isControl.current) {
      setValue(identifier || '');
    }
  }, [identifier]);

  useEffect(() => {
    onChangeRef.current?.(value);
  }, [value]);

  const element =
    !isFetched && isFetching ? (
      <div data-disabled={disabled} className='data-[disabled=true]:text-foreground/50 flex items-center gap-2.5'>
        <Spinner size='sm' />
        {isIconOnly ? null : <p className='text-foreground/50'>Fetching Assets...</p>}
      </div>
    ) : token ? (
      <div data-disabled={disabled} className='data-[disabled=true]:text-foreground/50 flex items-center gap-2.5'>
        <Avatar
          alt={token.name}
          fallback={
            <div className='bg-divider-300 text-content1 flex h-[20px] w-[20px] items-center justify-center rounded-full text-base font-bold'>
              {token.symbol.slice(0, 1)}
            </div>
          }
          src={token.logoUri}
          style={{ width: 20, height: 20 }}
        >
          {token.symbol}
        </Avatar>
        {isIconOnly ? null : (
          <p>
            {token.name}&nbsp;<span className='text-foreground/50'>({token.symbol})</span>
          </p>
        )}
      </div>
    ) : (
      <span className='text-foreground-500'>{placeholder}</span>
    );

  return (
    <div
      data-disabled={disabled}
      className={'input-token-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none'.concat(
        ` ${className || ''}`
      )}
    >
      {label && <div className='text-sm font-bold'>{label}</div>}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className={twMerge([
              'group tap-highlight-transparent border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative flex h-11 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 border-1 px-2 py-2 shadow-none transition-all !duration-150 data-[focus=true]:bg-transparent motion-reduce:transition-none',
              radius === 'full'
                ? 'rounded-full'
                : radius === 'lg'
                  ? 'rounded-[20px]'
                  : radius === 'md'
                    ? 'rounded-[10px]'
                    : radius === 'sm'
                      ? 'rounded-[5px]'
                      : 'rounded-none',
              wrapperClassName
            ])}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
          >
            {element}

            <ArrowDown
              data-open={isOpen}
              className='absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer transition-transform duration-150 data-[open=true]:rotate-180'
              style={{ color: 'inherit' }}
              onClick={(e) => {
                e.stopPropagation();
                isOpen ? handleClose() : handleOpen();
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          style={{ width: wrapperRef.current?.clientWidth }}
          className='border-divider-300 border-1 p-[5px]'
        >
          {options.length > 0 ? (
            <div className={clsx('text-foreground max-h-[250px] overflow-y-auto')}>
              <ul className={clsx('flex list-none flex-col')}>
                {options.map((item) => {
                  const { logoUri, name, symbol, transferrable, decimals } = item;
                  const identifier = item.isNative ? 'native' : item.key;

                  return (
                    <li
                      key={identifier}
                      onClick={() => {
                        handleClose();
                        setValue(identifier);
                      }}
                      className={clsx(
                        'text-foreground transition-background hover:bg-secondary flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5'
                      )}
                    >
                      <Avatar
                        alt={name}
                        className='shrink-0'
                        fallback={
                          <div className='bg-divider-300 text-content1 flex h-[20px] w-[20px] items-center justify-center rounded-full text-base font-bold'>
                            {symbol.slice(0, 1)}
                          </div>
                        }
                        src={logoUri}
                        style={{ width: 20, height: 20 }}
                      >
                        {symbol}
                      </Avatar>
                      <div className='flex-1'>
                        {name}&nbsp;<span className='text-foreground/50'>({symbol})</span>
                      </div>
                      <div>
                        <FormatBalance value={transferrable} format={[decimals, symbol]} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className='text-foreground/50 text-center'>no tokens</div>
          )}
        </PopoverContent>
      </Popover>

      {helper && <div className='text-foreground/50 text-xs'>{helper}</div>}
    </div>
  );
}

export default React.memo(InputToken);
