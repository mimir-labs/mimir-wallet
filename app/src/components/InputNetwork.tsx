// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Endpoint, useChains } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Badge,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@mimir-wallet/ui';
import { Globe } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { useToggle } from 'react-use';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useMigrationNetworks } from '@/features/assethub-migration/useMigrationStatus';
import { useElementWidth } from '@/hooks/useElementWidth';
import { useRecentNetworks } from '@/hooks/useRecentNetworks';

interface Props {
  showAllNetworks?: boolean;
  supportedNetworks?: string[];
  /** Networks to exclude from the list */
  excludeNetworks?: string[];
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
  /** Variant style - default shows label outside, inline-label shows label inside */
  variant?: 'default' | 'inline-label';
  /** Content alignment for inline-label variant */
  align?: 'start' | 'end';
  /** Only show networks that support XCM (have paraspellChain defined) */
  xcmOnly?: boolean;
}

type Options = Endpoint & {
  endContent?: React.ReactNode;
};

function NetworkItem({
  item,
  onSelect,
  isMigrationCompleted,
  endContent,
}: {
  item: Endpoint;
  onSelect: () => void;
  isMigrationCompleted: boolean;
  endContent?: React.ReactNode;
}) {
  return (
    <li
      onClick={onSelect}
      className={cn(
        'text-foreground transition-background hover:bg-secondary flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5',
      )}
    >
      <Avatar
        alt={item.name}
        src={item.icon}
        style={{ width: 20, height: 20, background: 'transparent' }}
      ></Avatar>
      <div className="flex-1">{item.name}</div>
      <div className="flex items-center gap-2">
        {endContent}
        {isMigrationCompleted && <Badge variant="secondary">Migrated</Badge>}
      </div>
    </li>
  );
}

function OmniChainInputNetwork({
  showAllNetworks,
  supportedNetworks,
  excludeNetworks,
  isIconOnly,
  radius = 'md',
  disabled,
  className,
  contentClassName,
  placeholder,
  label,
  helper,
  network,
  setNetwork,
  endContent,
  variant = 'default',
  align = 'start',
  xcmOnly = false,
}: Props) {
  const { chains: networks } = useChains();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(wrapperRef, 200);
  const { recentNetworks, addRecent } = useRecentNetworks();

  const [isOpen, toggleOpen] = useToggle(false);

  // Filter and sort networks based on supportedNetworks or showAllNetworks/enabled
  const options = useMemo(() => {
    const filtered = networks
      .filter((item) => {
        // Base condition: only show enabled networks unless showAllNetworks is true
        if (!showAllNetworks && !item.enabled) {
          return false;
        }

        // If xcmOnly is enabled, filter by paraspellChain existence
        if (xcmOnly && !item.paraspellChain) {
          return false;
        }

        // Exclude networks in excludeNetworks list
        if (excludeNetworks && excludeNetworks.includes(item.key)) {
          return false;
        }

        // If supportedNetworks is specified, only show networks in the list
        if (supportedNetworks) {
          return supportedNetworks.includes(item.key);
        }

        return true;
      })
      .map((item) => ({
        ...item,
        endContent: endContent?.[item.key] || endContent?.[item.genesisHash],
      }));

    // Sort by recent networks
    const priorityMap = new Map<string, number>();

    recentNetworks.forEach((key, index) => {
      priorityMap.set(key, index);
    });

    return [...filtered].sort((a, b) => {
      const aPriority = priorityMap.get(a.key) ?? Infinity;
      const bPriority = priorityMap.get(b.key) ?? Infinity;

      return aPriority - bPriority;
    });
  }, [
    networks,
    supportedNetworks,
    excludeNetworks,
    showAllNetworks,
    endContent,
    recentNetworks,
    xcmOnly,
  ]);

  const { data: migrationNetworks } = useMigrationNetworks();
  const completedMigrationNetworks = migrationNetworks
    ?.filter((item) => item.status === 'completed')
    .map((item) => item.chain);

  // For selected chain display, look in all networks (not filtered options)
  const chain: Options | undefined = networks
    .map((item) => ({
      ...item,
      endContent: endContent?.[item.key] || endContent?.[item.genesisHash],
    }))
    .find((item) => item.key === network);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const isInlineLabel = variant === 'inline-label';
  const isEndAlign = align === 'end';
  const iconSize = isInlineLabel ? 30 : 20;

  const arrowElement = (
    <ArrowDown
      data-open={isOpen}
      className={cn(
        'cursor-pointer transition-transform duration-150 data-[open=true]:rotate-180 shrink-0',
      )}
      style={{ color: 'inherit' }}
      onClick={(e) => {
        e.stopPropagation();
        isOpen ? handleClose() : handleOpen();
      }}
    />
  );

  const element = chain ? (
    <div
      data-disabled={disabled}
      className={cn(
        'data-[disabled=true]:text-foreground/50 w-full flex items-center gap-2.5',
        isInlineLabel && isEndAlign && 'justify-end',
      )}
    >
      <Avatar
        alt={chain.name}
        src={chain.icon}
        style={{ width: iconSize, height: iconSize, background: 'transparent' }}
      ></Avatar>
      <div className={!isEndAlign && !isInlineLabel ? 'flex-1' : ''}>
        {isIconOnly ? null : (
          <>
            <p className="font-bold text-sm">{chain.name}</p>
            {chain.endContent}
          </>
        )}
      </div>
      {arrowElement}
    </div>
  ) : (
    // Fallback when no network is selected
    <div
      className={cn(
        'w-full flex items-center gap-2.5',
        isInlineLabel && isEndAlign && 'justify-end',
      )}
    >
      {/* Placeholder icon to maintain consistent height */}
      <div
        className="rounded-full bg-muted flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <Globe size={iconSize * 0.6} className="text-muted-foreground" />
      </div>
      <div className={!isEndAlign && !isInlineLabel ? 'flex-1' : ''}>
        <span className="text-muted-foreground text-sm">
          {placeholder || 'Select network'}
        </span>
      </div>
      {arrowElement}
    </div>
  );

  return (
    <div
      data-disabled={disabled}
      className={cn([
        'input-network-wrapper w-full data-[disabled=true]:pointer-events-none',
        !isInlineLabel && 'space-y-2',
        className || '',
      ])}
    >
      {/* Only show label outside for default variant */}
      {!isInlineLabel && label && (
        <div className="text-sm font-bold">{label}</div>
      )}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className={cn([
              'group border-border hover:border-primary hover:bg-primary-50 relative inline-flex w-full cursor-pointer border shadow-none transition-all duration-150! motion-reduce:transition-none',
              // Height and layout based on variant
              isInlineLabel
                ? 'flex-col items-stretch justify-center gap-[5px] p-2.5'
                : 'h-11 min-h-11 flex-col items-start justify-center gap-0 px-2 py-2',
              // Border radius
              radius === 'full'
                ? 'rounded-full'
                : radius === 'lg'
                  ? 'rounded-[20px]'
                  : radius === 'md'
                    ? 'rounded-[10px]'
                    : radius === 'sm'
                      ? 'rounded-[5px]'
                      : 'rounded-none',
              contentClassName || '',
            ])}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
          >
            {/* Inline label for inline-label variant */}
            {isInlineLabel && label && (
              <span
                className={cn(
                  'text-xs text-muted-foreground',
                  isEndAlign && 'text-right',
                )}
              >
                {label}
              </span>
            )}

            {element}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align={isEndAlign ? 'end' : 'start'}
          style={{ width: popoverWidth, minWidth: 280 }}
          className="border-divider border p-[5px]"
        >
          {options.length > 0 ? (
            <div
              autoFocus
              className={cn('text-foreground max-h-[250px] overflow-y-auto')}
            >
              <ul className={cn('flex list-none flex-col')}>
                {options.map((item) => {
                  const isMigrationCompleted =
                    !!completedMigrationNetworks?.includes(item.key);

                  return (
                    <NetworkItem
                      key={item.key}
                      item={item}
                      onSelect={() => {
                        setNetwork(item.key);
                        addRecent(item.key);
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
            <div className="text-foreground/50 text-center">no networks</div>
          )}
        </PopoverContent>
      </Popover>

      {helper && <div className="text-foreground/50 text-xs">{helper}</div>}
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
