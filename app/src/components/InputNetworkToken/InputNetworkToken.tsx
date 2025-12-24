// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem } from './types';

import { Dialog, DialogContent, DialogTitle } from '@mimir-wallet/ui';
import React, { useCallback, useState } from 'react';

import NetworkTokenSelector from './NetworkTokenSelector';
import NetworkTokenTrigger from './NetworkTokenTrigger';
import { useInputNetworkTokenContext } from './useInputNetworkTokenContext';
import { itemToValue } from './utils';

/**
 * InputNetworkToken component props (UI-only)
 *
 * All data is fetched from InputNetworkTokenContext.
 * This component is purely for display and UI interaction.
 */
export interface InputNetworkTokenProps {
  /** Label text above the component */
  label?: React.ReactNode;
  /** Helper text below the component */
  helper?: React.ReactNode;
  /** Whether to disable the component */
  disabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Maximum networks to show before "More..." button (default: 5) */
  maxVisibleNetworks?: number;
  /** Variant style - default shows label outside, inline-label shows label inside border */
  variant?: 'default' | 'inline-label';
  /** Content alignment for inline-label variant */
  align?: 'start' | 'end';
  /** Children slot - renders after token selector (typically for amount input) */
  children?: React.ReactNode;
}

/**
 * Network token selector component
 *
 * Must be used within InputNetworkTokenProvider.
 * All state and data are managed by the provider.
 * Children are rendered after the token selector (for custom amount input).
 *
 * @example
 * ```tsx
 * <InputNetworkTokenProvider address={current}>
 *   <InputNetworkToken label="Token">
 *     <AmountInput amount={amount} setAmount={setAmount} />
 *   </InputNetworkToken>
 * </InputNetworkTokenProvider>
 * ```
 */
function InputNetworkToken({
  label,
  helper,
  disabled,
  className,
  searchPlaceholder,
  maxVisibleNetworks = 5,
  variant = 'default',
  align = 'start',
  children,
}: InputNetworkTokenProps) {
  // Get all data and setters from context
  const {
    value,
    token,
    isTokenLoading,
    items,
    networks,
    isLoading,
    setValue,
    activeNetworkFilter,
    setActiveNetworkFilter,
  } = useInputNetworkTokenContext();

  // Dialog state (local UI state)
  const [isOpen, setIsOpen] = useState(false);

  // Handle token selection from dialog
  const handleTokenSelect = useCallback(
    (item: TokenNetworkItem) => {
      setValue(itemToValue(item));
    },
    [setValue],
  );

  // Handle dialog open/close
  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div
      data-disabled={disabled}
      className={`input-network-token flex flex-col gap-y-2 w-full data-[disabled=true]:pointer-events-none ${className || ''}`}
    >
      <NetworkTokenTrigger
        selectedItem={token}
        isTokenLoading={isTokenLoading}
        onOpen={handleOpen}
        isOpen={isOpen}
        disabled={disabled}
        label={label}
        variant={variant}
        align={align}
      >
        {/* Children slot - passed to trigger for inline rendering (default variant) */}
        {children}
      </NetworkTokenTrigger>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0">
          <DialogTitle className="sr-only">Select Token</DialogTitle>
          <NetworkTokenSelector
            items={items}
            selectedValue={value}
            onSelect={handleTokenSelect}
            searchPlaceholder={searchPlaceholder}
            networks={networks}
            activeNetworkFilter={activeNetworkFilter}
            onNetworkFilterChange={setActiveNetworkFilter}
            maxVisibleNetworks={maxVisibleNetworks}
            isLoading={isLoading}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      {/* Helper text */}
      {helper && (
        <div className="text-foreground/50 mt-2 text-xs">{helper}</div>
      )}
    </div>
  );
}

export default React.memo(InputNetworkToken);
