// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { AnimatePresence } from 'framer-motion';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { type Endpoint, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, FreeSoloPopover, Listbox, ListboxItem, Spinner, usePress } from '@mimir-wallet/ui';

interface Props {
  showAllNetworks?: boolean;
  isIconOnly?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  label?: string;
  helper?: React.ReactNode;
  network: string;
  setNetwork: (network: string) => void;
  endContent?: Record<string, React.ReactNode>;
}

type Options = Endpoint & {
  endContent?: React.ReactNode;
};

function OmniChainInputNetwork({
  showAllNetworks,
  isIconOnly,
  radius = 'md',
  disabled,
  className,
  contentClassName,
  label,
  helper,
  network,
  setNetwork,
  endContent
}: Props) {
  const { allApis } = useApi();
  const { networks } = useNetworks();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const options = networks
    .filter((item) => (showAllNetworks ? true : !!allApis[item.key]))
    .map((item) => ({
      ...item,
      endContent: endContent?.[item.key] || endContent?.[item.genesisHash]
    }));

  const chain: Options | undefined = options.find((item) => item.key === network);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const { pressProps } = usePress({
    onPress: isOpen ? handleClose : handleOpen
  });

  const element = chain ? (
    <div data-disabled={disabled} className='flex items-center gap-2.5 data-[disabled=true]:text-foreground/50'>
      <Avatar alt={chain.name} src={chain.icon} style={{ width: 20, height: 20, background: 'transparent' }}></Avatar>
      {isIconOnly ? null : (
        <>
          <p>{chain.name}</p>
          {chain.endContent}
        </>
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
      style={{ minWidth: wrapperRef.current?.clientWidth }}
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no networks' className='max-h-[250px] overflow-y-auto text-foreground'>
        {options.map((item) => {
          const isApiReady = !!allApis[item.key]?.isApiReady;

          return (
            <ListboxItem
              key={item.key}
              onPress={
                (showAllNetworks ? true : isApiReady)
                  ? () => {
                      setNetwork(item.key);
                      handleClose();
                    }
                  : undefined
              }
              className='h-10 text-foreground data-[hover=true]:text-foreground'
              startContent={
                <Avatar
                  alt={item.name}
                  src={item.icon}
                  style={{ width: 20, height: 20, background: 'transparent' }}
                ></Avatar>
              }
              endContent={
                <div className='flex items-center gap-2'>
                  {item.endContent}
                  {showAllNetworks ? null : !isApiReady ? <Spinner size='sm' /> : null}
                </div>
              }
            >
              {item.name}
            </ListboxItem>
          );
        })}
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
            'group cursor-pointer relative w-full inline-flex tap-highlight-transparent px-2 min-h-11 h-11 flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none py-2 shadow-none border-1 border-divider-300 hover:border-primary hover:bg-primary-50',
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
          onClick={handleOpen}
        >
          {element}

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

function InputNetwork(props: Props) {
  const { mode } = useNetworks();

  if (mode === 'omni') {
    return <OmniChainInputNetwork {...props} />;
  }

  return null;
}

export default React.memo(InputNetwork);
