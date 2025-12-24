// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NetworkTokenTriggerProps, TokenNetworkItem } from './types';

import { Avatar, cn, Spinner } from '@mimir-wallet/ui';
import React from 'react';

import FormatBalance from '../FormatBalance';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';

/**
 * Loading state for token selector
 */
function TokenSelectorLoading() {
  return (
    <>
      <Spinner size="sm" />
      <span className="text-foreground/50 text-sm">Loading...</span>
    </>
  );
}

/**
 * Empty state for token selector (no token selected)
 */
function TokenSelectorEmpty({ isOpen }: { isOpen: boolean }) {
  return (
    <>
      <div className="bg-secondary size-[30px] rounded-full" />
      <span className="text-foreground/50 text-sm">Select token</span>
      <ArrowDown
        data-open={isOpen}
        className="size-2.5 transition-transform data-[open=true]:rotate-180"
      />
    </>
  );
}

/**
 * Display selected token with network badge
 */
function TokenSelectorDisplay({
  item,
  isOpen,
}: {
  item: TokenNetworkItem;
  isOpen: boolean;
}) {
  const { token, network } = item;

  return (
    <>
      {/* Token icon with network badge */}
      <div className="relative">
        <Avatar
          alt={token.name}
          fallback={token.symbol?.slice(0, 1) || '?'}
          src={token.logoUri}
          style={{ width: 30, height: 30 }}
        />
        {network && (
          <div className="absolute -right-1 -bottom-1">
            <Avatar
              alt={network.name}
              fallback={network.name?.slice(0, 1) || '?'}
              src={network.icon}
              style={{ width: 14, height: 14 }}
              className="border-background border"
            />
          </div>
        )}
      </div>
      {/* Token info */}
      <div className="flex flex-col items-start gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-bold">
            {token.symbol}
          </span>
          <ArrowDown
            data-open={isOpen}
            className="size-5 -translate-y-px transition-transform data-[open=true]:rotate-180"
          />
        </div>
        <span className="text-foreground/50 text-[10px]">
          Available{' '}
          <FormatBalance
            value={token.transferrable}
            format={[token.decimals, '']}
          />
        </span>
      </div>
    </>
  );
}

/**
 * Render token selector button content based on state
 */
function renderTokenSelectorContent(
  selectedItem: TokenNetworkItem | undefined,
  isTokenLoading: boolean,
  isOpen: boolean,
) {
  // Loading state
  if (isTokenLoading) {
    return <TokenSelectorLoading />;
  }

  // Token selected - show display
  if (selectedItem) {
    return <TokenSelectorDisplay item={selectedItem} isOpen={isOpen} />;
  }

  // No token selected - show empty state
  return <TokenSelectorEmpty isOpen={isOpen} />;
}

/**
 * Trigger component for InputNetworkToken
 * Shows selected token info (token selector only, no amount input)
 * Children are rendered inside the border container for default variant
 */
function NetworkTokenTrigger({
  selectedItem,
  isTokenLoading = false,
  onOpen,
  isOpen,
  disabled,
  label,
  variant = 'default',
  align = 'start',
  children,
}: NetworkTokenTriggerProps) {
  const isInlineLabel = variant === 'inline-label';
  const isEndAlign = align === 'end';

  const mainContainer = (
    <div
      data-disabled={disabled}
      onClick={!disabled ? onOpen : undefined}
      className={cn(
        'flex-1 border-border hover:border-primary rounded-[10px] border transition-all hover:bg-primary-50 cursor-pointer data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        isInlineLabel
          ? 'flex flex-col items-stretch justify-center gap-[5px] p-2.5'
          : 'flex h-[54px] items-center gap-2.5 p-2',
      )}
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

      {/* Content row */}
      <div
        className={cn(
          'flex flex-1 items-center gap-2.5',
          isInlineLabel && isEndAlign && 'flex-row-reverse',
        )}
      >
        {/* Token selector content */}
        <div className="flex shrink-0 items-center gap-2.5">
          {renderTokenSelectorContent(selectedItem, isTokenLoading, isOpen)}
        </div>

        {children}
      </div>
    </div>
  );

  if (isInlineLabel) {
    return mainContainer;
  }

  return (
    <>
      {/* Label - only show outside for default variant */}
      {!isInlineLabel && label && (
        <div className="text-foreground text-sm font-bold">{label}</div>
      )}

      {mainContainer}
    </>
  );
}

export default React.memo(NetworkTokenTrigger);
