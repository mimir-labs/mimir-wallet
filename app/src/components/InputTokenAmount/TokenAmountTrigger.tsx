// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenAmountTriggerProps, TokenNetworkItem } from './types';

import { Avatar, Button, Spinner } from '@mimir-wallet/ui';
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
        <div className="flex items-center gap-2.5">
          <span className="text-foreground text-sm font-bold">
            {token.symbol}
          </span>
          <ArrowDown
            data-open={isOpen}
            className="size-4 transition-transform data-[open=true]:rotate-180"
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
 * Trigger component for InputTokenAmount
 * Shows selected token info + amount input in collapsed state
 */
function TokenAmountTrigger({
  selectedItem,
  isTokenLoading = false,
  amount,
  isAmountValid,
  onAmountChange,
  onOpen,
  isOpen,
  disabled,
  amountPlaceholder = '0.0',
  showMaxButton = true,
  onMaxClick,
  error,
  label,
}: TokenAmountTriggerProps) {
  // Check if we have a token selected (for disabling amount input)
  const hasToken = !!selectedItem;

  return (
    <div className="space-y-[5px]">
      {/* Label */}
      {label && (
        <div className="text-foreground text-sm font-bold">{label}</div>
      )}

      {/* Main input container */}
      <div
        data-disabled={disabled}
        data-error={!!error || !isAmountValid}
        className="border-divider hover:border-primary data-[error=true]:border-danger flex h-[54px] items-center gap-2.5 rounded-[10px] border p-2 transition-all hover:bg-secondary data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      >
        {/* Token selector trigger */}
        <button
          type="button"
          onClick={onOpen}
          disabled={disabled}
          className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg py-2 transition-colors"
        >
          {renderTokenSelectorContent(selectedItem, isTokenLoading, isOpen)}
        </button>

        {/* Amount input - flex grow to fill remaining space */}
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={onAmountChange}
          disabled={disabled || !hasToken}
          placeholder={amountPlaceholder}
          className="text-foreground placeholder:text-foreground/50 min-w-0 flex-1 bg-transparent text-right text-sm font-bold outline-none disabled:cursor-not-allowed"
        />

        {/* Max button */}
        {showMaxButton && onMaxClick && (
          <Button
            size="sm"
            variant="bordered"
            onClick={onMaxClick}
            disabled={disabled || !hasToken}
            className="border-primary text-primary h-[23px] shrink-0 rounded-[5px] px-2.5 py-1"
          >
            Max
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && <div className="text-danger text-xs">{error.message}</div>}
    </div>
  );
}

export default React.memo(TokenAmountTrigger);
