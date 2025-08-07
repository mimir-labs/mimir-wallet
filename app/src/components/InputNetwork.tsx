// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { type Endpoint, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Popover, PopoverContent, PopoverTrigger, Spinner } from '@mimir-wallet/ui';

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

  const element = chain ? (
    <div data-disabled={disabled} className='data-[disabled=true]:text-foreground/50 flex items-center gap-2.5'>
      <Avatar alt={chain.name} src={chain.icon} style={{ width: 20, height: 20, background: 'transparent' }}></Avatar>
      {isIconOnly ? null : (
        <>
          <p>{chain.name}</p>
          {chain.endContent}
        </>
      )}
    </div>
  ) : null;

  return (
    <div
      data-disabled={disabled}
      className={twMerge([
        'input-network-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none',
        className || ''
      ])}
    >
      {label && <div className='text-sm font-bold'>{label}</div>}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className={twMerge([
              'group tap-highlight-transparent border-divider-300 hover:border-primary hover:bg-primary-50 relative inline-flex h-11 min-h-11 w-full cursor-pointer flex-col items-start justify-center gap-0 border-1 px-2 py-2 shadow-none transition-all !duration-150 motion-reduce:transition-none',
              radius === 'full'
                ? 'rounded-full'
                : radius === 'lg'
                  ? 'rounded-[20px]'
                  : radius === 'md'
                    ? 'rounded-[10px]'
                    : radius === 'sm'
                      ? 'rounded-[5px]'
                      : 'rounded-none',
              contentClassName || ''
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
          style={{ width: wrapperRef.current?.clientWidth, minWidth: 200 }}
          className='border-divider-300 border-1 p-[5px]'
        >
          {options.length > 0 ? (
            <div autoFocus className={clsx('text-foreground max-h-[250px] overflow-y-auto')}>
              <ul className={clsx('flex list-none flex-col')}>
                {options.map((item) => {
                  const isApiReady = !!allApis[item.key]?.isApiReady;

                  return (
                    <li
                      key={item.key}
                      onClick={
                        (showAllNetworks ? true : isApiReady)
                          ? () => {
                              setNetwork(item.key);
                              handleClose();
                            }
                          : undefined
                      }
                      className={clsx(
                        'text-foreground transition-background hover:bg-secondary flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5'
                      )}
                    >
                      <Avatar
                        alt={item.name}
                        src={item.icon}
                        style={{ width: 20, height: 20, background: 'transparent' }}
                      ></Avatar>
                      <div className='flex-1'>{item.name}</div>
                      <div className='flex items-center gap-2'>
                        {item.endContent}
                        {showAllNetworks ? null : !isApiReady ? <Spinner size='sm' /> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className='text-foreground/50 text-center'>no networks</div>
          )}
        </PopoverContent>
      </Popover>

      {helper && <div className='text-foreground/50 text-xs'>{helper}</div>}
    </div>
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
