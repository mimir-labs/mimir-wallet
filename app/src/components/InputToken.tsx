// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from '@/apps/transfer/types';
import type { AccountAssetInfo } from '@/hooks/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useAssetBalances, useNativeBalances } from '@/hooks/useBalances';
import { useInput } from '@/hooks/useInput';
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
  placeholder?: string;
  label?: string;
  defaultAssetId?: string;
  helper?: React.ReactNode;
  address?: string;
  onChange: (value: TransferToken) => void;
}

function InputToken({
  radius = 'md',
  isIconOnly = false,
  network,
  disabled,
  className,
  label,
  placeholder = 'Select Token',
  helper,
  address,
  defaultAssetId,
  onChange
}: Props) {
  const [nativeBalances] = useNativeBalances(address);
  const [assets] = useAssetBalances(network, address);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useInput('');
  const [isOpen, toggleOpen] = useToggle(false);
  const [isFocused, setIsFocused] = useState(false);
  const [assetId, setAssetId] = useState<string>(defaultAssetId || 'native');

  const options = useMemo((): AccountAssetInfo[] => {
    const _options: AccountAssetInfo[] = nativeBalances ? [nativeBalances] : [];

    for (const item of assets) {
      _options.push(item);
    }

    return _options.filter((item) =>
      inputValue
        ? item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.symbol.toLowerCase().includes(inputValue.toLowerCase())
        : true
    );
  }, [nativeBalances, assets, inputValue]);

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
    return options.find((item) => item.assetId === assetId);
  }, [options, assetId]);

  useEffect(() => {
    if (token) {
      onChange(token);
    } else if (options.length > 0) {
      onChange(options[0]);
      setAssetId((assetId) => {
        return assetId || options[0].assetId;
      });
    }
  }, [onChange, token, options]);

  const element =
    !options || options.length === 0 ? (
      <div data-disabled={disabled} className='flex items-center gap-2.5 data-[disabled=true]:text-foreground/50'>
        <Spinner size='sm' />
        {isIconOnly || isOpen ? null : <p className='text-foreground/50'>Fetching Assets...</p>}
      </div>
    ) : token ? (
      <div data-disabled={disabled} className='flex items-center gap-2.5 data-[disabled=true]:text-foreground/50'>
        <Avatar
          alt={token.name}
          fallback={
            <div className='bg-divider-300 w-[20px] h-[20px] flex items-center justify-center rounded-full text-content1 font-bold text-medium'>
              {token.symbol.slice(0, 1)}
            </div>
          }
          src={token.icon}
          style={{ width: 20, height: 20 }}
        >
          {token.symbol}
        </Avatar>
        {isIconOnly || (isOpen && isFocused) ? null : (
          <p>
            {token.name}&nbsp;<span className='text-foreground/50'>({token.symbol})</span>
          </p>
        )}
      </div>
    ) : null;

  const popoverContent = isOpen ? (
    <FreeSoloPopover
      isOpen
      disableDialogFocus
      onClose={handleClose}
      ref={popoverRef}
      triggerRef={wrapperRef}
      placement='bottom-start'
      style={{ width: wrapperRef.current?.clientWidth }}
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no networks' className='max-h-[250px] overflow-y-auto text-foreground'>
        {options.map(({ icon, name, symbol, assetId, transferrable, decimals }) => (
          <ListboxItem
            key={assetId}
            onPress={() => {
              handleClose();
              setAssetId(assetId);
              setInputValue('');
            }}
            className='h-10 text-foreground data-[hover=true]:text-foreground'
            startContent={
              <Avatar
                alt={name}
                fallback={
                  <div className='bg-divider-300 w-[20px] h-[20px] flex items-center justify-center rounded-full text-content1 font-bold text-medium'>
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
        {label && <div className='font-bold text-small'>{label}</div>}

        <div
          ref={wrapperRef}
          className={twMerge([
            'group relative w-full inline-flex tap-highlight-transparent px-2 min-h-11 flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-11 py-2 shadow-none border-1 border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent',
            radius === 'full'
              ? 'rounded-full'
              : radius === 'lg'
                ? 'rounded-large'
                : radius === 'md'
                  ? 'rounded-medium'
                  : radius === 'sm'
                    ? 'rounded-small'
                    : 'rounded-none'
          ])}
        >
          {element}
          <input
            ref={inputRef}
            className='absolute top-0 right-0 bottom-0 left-0 outline-none border-none pl-9 bg-transparent'
            style={{ opacity: isFocused && isOpen ? 1 : 0 }}
            value={inputValue}
            placeholder={placeholder}
            onChange={setInputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onClick={handleOpen}
          />

          <ArrowDown
            data-open={isOpen}
            className='cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 data-[open=true]:rotate-180 transition-transform duration-150'
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
