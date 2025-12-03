// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Endpoint, useChains, useChainStatus } from '@mimir-wallet/polkadot-core';
import { Avatar, Chip, Popover, PopoverContent, PopoverTrigger, Spinner } from '@mimir-wallet/ui';
import { clsx } from 'clsx';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useMigrationNetworks } from '@/features/assethub-migration/useMigrationStatus';
import { useElementWidth } from '@/hooks/useElementWidth';

interface Props {
  showAllNetworks?: boolean;
  supportedNetworks?: string[];
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

function NetworkItem({
  item,
  onSelect,
  isMigrationCompleted,
  endContent
}: {
  item: Endpoint;
  onSelect: () => void;
  isMigrationCompleted: boolean;
  endContent?: React.ReactNode;
}) {
  const { isApiReady, isApiConnected, apiError } = useChainStatus(item.key);
  const isConnecting = (!isApiReady && !apiError) || !isApiConnected;

  return (
    <li
      onClick={onSelect}
      className={clsx(
        'text-foreground transition-background hover:bg-secondary flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5'
      )}
    >
      <Avatar alt={item.name} src={item.icon} style={{ width: 20, height: 20, background: 'transparent' }}></Avatar>
      <div className='flex-1'>{item.name}</div>
      <div className='flex items-center gap-2'>
        {endContent}
        {isMigrationCompleted && (
          <Chip color='secondary' size='sm'>
            Migrated
          </Chip>
        )}
        {isConnecting && <Spinner size='sm' />}
      </div>
    </li>
  );
}

function OmniChainInputNetwork({
  showAllNetworks,
  supportedNetworks,
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
  const { chains: networks } = useChains();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(wrapperRef, 200);

  const [isOpen, toggleOpen] = useToggle(false);

  // Filter networks based on supportedNetworks or showAllNetworks/enabled
  const options = networks
    .filter((item) => {
      // If supportedNetworks is specified, only show networks in the list
      if (supportedNetworks && supportedNetworks.length > 0) {
        return supportedNetworks.includes(item.key);
      }

      // Otherwise use original logic
      return showAllNetworks || item.enabled;
    })
    .map((item) => ({
      ...item,
      endContent: endContent?.[item.key] || endContent?.[item.genesisHash]
    }));

  const { data: migrationNetworks } = useMigrationNetworks();
  const completedMigrationNetworks = migrationNetworks
    ?.filter((item) => item.status === 'completed')
    .map((item) => item.chain);

  // For selected chain display, look in all networks (not filtered options)
  const chain: Options | undefined = networks
    .map((item) => ({
      ...item,
      endContent: endContent?.[item.key] || endContent?.[item.genesisHash]
    }))
    .find((item) => item.key === network);

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
              'group tap-highlight-transparent border-divider-300 hover:border-primary hover:bg-primary-50 relative inline-flex h-11 min-h-11 w-full cursor-pointer flex-col items-start justify-center gap-0 border-1 px-2 py-2 shadow-none transition-all duration-150! motion-reduce:transition-none',
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
        <PopoverContent style={{ width: popoverWidth, minWidth: 200 }} className='border-divider-300 border-1 p-[5px]'>
          {options.length > 0 ? (
            <div autoFocus className={clsx('text-foreground max-h-[250px] overflow-y-auto')}>
              <ul className={clsx('flex list-none flex-col')}>
                {options.map((item) => {
                  const isMigrationCompleted = !!completedMigrationNetworks?.includes(item.key);

                  return (
                    <NetworkItem
                      key={item.key}
                      item={item}
                      onSelect={() => {
                        setNetwork(item.key);
                        handleClose();
                      }}
                      isMigrationCompleted={isMigrationCompleted}
                      endContent={item.endContent}
                    />
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
  const { mode } = useChains();

  if (mode === 'omni') {
    return <OmniChainInputNetwork {...props} />;
  }

  return null;
}

export default React.memo(InputNetwork);
