// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useInput } from '@/hooks/useInput';
import { AnimatePresence } from 'framer-motion';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { type Endpoint, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, FreeSoloPopover, Listbox, ListboxItem, Spinner } from '@mimir-wallet/ui';

interface Props {
  isIconOnly?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  label?: string;
  helper?: React.ReactNode;
  supportedNetworks?: string[];
  network: string;
  setNetwork: (network: string) => void;
}

function OmniChainInputNetwork({
  isIconOnly,
  radius = 'md',
  disabled,
  className,
  contentClassName,
  label,
  placeholder = 'Select Network',
  helper,
  network,
  setNetwork
}: Props) {
  const { allApis } = useApi();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useInput('');
  const [isOpen, toggleOpen] = useToggle(false);
  const options = Object.entries(allApis)
    .map(([network, { chain, isApiReady, genesisHash }]) => ({
      genesisHash,
      network,
      chain,
      isApiReady
    }))
    .filter((item) => (inputValue ? item.chain.name.toLowerCase().includes(inputValue.toLowerCase()) : true));

  const chain: Endpoint | undefined = allApis[network]?.chain;

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const element = chain ? (
    <div data-disabled={disabled} className='flex items-center gap-2.5 data-[disabled=true]:text-foreground/50'>
      <Avatar alt={chain.name} src={chain.icon} style={{ width: 20, height: 20, background: 'transparent' }}></Avatar>
      {isIconOnly || isOpen ? null : <p>{chain.name}</p>}
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
      style={{ minWidth: wrapperRef.current?.clientWidth }}
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no networks' className='max-h-[250px] overflow-y-auto text-foreground'>
        {options.map(({ network, chain, isApiReady }) => (
          <ListboxItem
            key={network}
            onPress={
              isApiReady
                ? () => {
                    setNetwork(network);
                    handleClose();
                    setInputValue('');
                  }
                : undefined
            }
            className='h-10 text-foreground data-[hover=true]:text-foreground'
            startContent={
              <Avatar
                alt={chain.name}
                src={chain.icon}
                style={{ width: 20, height: 20, background: 'transparent' }}
              ></Avatar>
            }
            endContent={!isApiReady ? <Spinner size='sm' /> : null}
          >
            {chain.name}
          </ListboxItem>
        ))}
      </Listbox>
    </FreeSoloPopover>
  ) : null;

  return (
    <>
      <div
        data-disabled={disabled}
        className={twMerge([
          'input-network-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none',
          className || ''
        ])}
      >
        {label && <div className='font-bold text-small'>{label}</div>}

        <div
          ref={wrapperRef}
          className={twMerge([
            'group relative w-full inline-flex tap-highlight-transparent px-2 min-h-11 h-11 flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none py-2 shadow-none border-1 border-divider-300 hover:border-primary hover:bg-primary-50',
            radius === 'full'
              ? 'rounded-full'
              : radius === 'lg'
                ? 'rounded-large'
                : radius === 'md'
                  ? 'rounded-medium'
                  : radius === 'sm'
                    ? 'rounded-small'
                    : 'rounded-none',
            contentClassName || ''
          ])}
        >
          {element}
          {isIconOnly ? (
            <div
              className='cursor-pointer absolute top-0 right-0 bottom-0 left-0 outline-none border-none pl-9 bg-transparent'
              onClick={handleOpen}
            />
          ) : (
            <input
              ref={inputRef}
              className='absolute top-0 right-0 bottom-0 left-0 outline-none border-none pl-9 bg-transparent'
              style={{ opacity: !isOpen ? 0 : 1 }}
              value={inputValue}
              placeholder={placeholder}
              onChange={setInputValue}
              onClick={handleOpen}
            />
          )}

          <ArrowDown
            className='cursor-pointer absolute right-1 top-1/2 -translate-y-1/2'
            style={{ color: 'inherit' }}
            onClick={handleOpen}
          />
        </div>

        {helper && <div className='text-tiny text-foreground/50'>{helper}</div>}
      </div>

      <AnimatePresence>{popoverContent}</AnimatePresence>
    </>
  );
}

function InputNetwork(props: Props) {
  const { mode } = useNetworks();

  if (mode === 'omni') {
    return <OmniChainInputNetwork {...props} />;
  }

  return null;
}

export default React.memo(InputNetwork);
