// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountAssetInfo } from '@/hooks/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useAssets, useNativeToken } from '@/hooks/useAssets';
import { useAssetBalances, useNativeBalances } from '@/hooks/useBalances';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { Avatar, FreeSoloPopover, Listbox, ListboxItem, Spinner, usePress } from '@mimir-wallet/ui';

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
  assetId?: string;
  defaultAssetId?: string;
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
  assetId,
  defaultAssetId,
  onChange
}: Props) {
  const isControl = useRef(assetId !== undefined);
  const [nativeBalances] = useNativeBalances(address);
  const [assets, isFetched, isFetching] = useAssetBalances(network, address);
  const [allAssets] = useAssets(network);
  const nativeToken = useNativeToken(network);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const [value, setValue] = useState<string>(assetId || defaultAssetId || '');
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const options = useMemo((): AccountAssetInfo[] => {
    const _options: AccountAssetInfo[] = nativeBalances ? [nativeBalances] : [];

    for (const item of assets) {
      _options.push(item);
    }

    return _options;
  }, [nativeBalances, assets]);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const { pressProps } = usePress({
    onPress: isOpen ? handleClose : handleOpen
  });

  const token = useMemo(() => {
    return value === 'native' ? nativeToken : allAssets?.find((item) => item.assetId === value);
  }, [allAssets, nativeToken, value]);

  useEffect(() => {
    if (isControl.current) {
      setValue(assetId || '');
    }
  }, [assetId]);

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
            <div className='bg-divider-300 text-content1 text-medium flex h-[20px] w-[20px] items-center justify-center rounded-full font-bold'>
              {token.symbol.slice(0, 1)}
            </div>
          }
          src={token.icon}
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

  const popoverContent = isOpen ? (
    <FreeSoloPopover
      isOpen
      disableDialogFocus
      onClose={handleClose}
      ref={popoverRef}
      triggerRef={wrapperRef}
      placement='bottom-start'
      style={{ width: wrapperRef.current?.clientWidth, minWidth: 240 }}
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no tokens' className='text-foreground max-h-[250px] overflow-y-auto'>
        {options.map(({ icon, name, symbol, assetId, transferrable, decimals }) => (
          <ListboxItem
            key={assetId}
            onPress={() => {
              handleClose();
              setValue(assetId);
            }}
            className='text-foreground data-[hover=true]:text-foreground h-10'
            startContent={
              <Avatar
                alt={name}
                fallback={
                  <div className='bg-divider-300 text-content1 text-medium flex h-[20px] w-[20px] items-center justify-center rounded-full font-bold'>
                    {symbol.slice(0, 1)}
                  </div>
                }
                src={icon}
                style={{ width: 20, height: 20 }}
              >
                {symbol}
              </Avatar>
            }
            endContent={<FormatBalance value={transferrable} format={[decimals, symbol]} />}
          >
            {name}&nbsp;<span className='text-foreground/50'>({symbol})</span>
          </ListboxItem>
        ))}
      </Listbox>
    </FreeSoloPopover>
  ) : null;

  return (
    <>
      <div
        data-disabled={disabled}
        className={'input-token-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none'.concat(
          ` ${className || ''}`
        )}
      >
        {label && <div className='text-small font-bold'>{label}</div>}

        <div
          ref={wrapperRef}
          className={twMerge([
            'group tap-highlight-transparent border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative flex h-11 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 border-1 px-2 py-2 shadow-none transition-all !duration-150 data-[focus=true]:bg-transparent motion-reduce:transition-none',
            radius === 'full'
              ? 'rounded-full'
              : radius === 'lg'
                ? 'rounded-large'
                : radius === 'md'
                  ? 'rounded-medium'
                  : radius === 'sm'
                    ? 'rounded-small'
                    : 'rounded-none',
            wrapperClassName
          ])}
          onClick={handleOpen}
        >
          {element}

          <ArrowDown
            data-open={isOpen}
            className='absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer transition-transform duration-150 data-[open=true]:rotate-180'
            style={{ color: 'inherit' }}
            {...pressProps}
          />
        </div>

        {helper && <div className='text-tiny text-foreground/50'>{helper}</div>}
      </div>

      <AnimatePresence>{popoverContent}</AnimatePresence>
    </>
  );
}

export default React.memo(InputToken);
