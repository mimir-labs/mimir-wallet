// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem } from './types';

import { Dialog, DialogContent, DialogTitle } from '@mimir-wallet/ui';
import React, { useCallback, useState } from 'react';

import TokenAmountSelector from './TokenAmountSelector';
import TokenAmountTrigger from './TokenAmountTrigger';
import { useInputTokenAmountContext } from './useInputTokenAmountContext';
import { itemToValue } from './utils';

/**
 * InputTokenAmount component props (UI-only)
 *
 * All data is fetched from InputTokenAmountContext.
 * This component is purely for display and UI interaction.
 */
export interface InputTokenAmountProps {
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
  /** Placeholder for amount input */
  amountPlaceholder?: string;
  /** Whether to show Max button (default: true) */
  showMaxButton?: boolean;
  /** Maximum networks to show before "More..." button (default: 5) */
  maxVisibleNetworks?: number;
  /** Error state */
  error?: Error | null;
}

/**
 * Combined token selector and amount input component
 *
 * Must be used within InputTokenAmountProvider.
 * All state and data are managed by the provider.
 *
 * @example
 * ```tsx
 * <InputTokenAmountProvider>
 *   <InputTokenAmount label="Transfer" />
 * </InputTokenAmountProvider>
 * ```
 */
function InputTokenAmount({
  label,
  helper,
  disabled,
  className,
  searchPlaceholder,
  amountPlaceholder,
  showMaxButton = true,
  maxVisibleNetworks = 5,
  error,
}: InputTokenAmountProps) {
  // Get all data and setters from context
  const {
    value,
    amount,
    isAmountValid,
    token,
    isTokenLoading,
    items,
    networks,
    isLoading,
    setAmount,
    setValue,
    setMax,
    activeNetworkFilter,
    setActiveNetworkFilter,
  } = useInputTokenAmountContext();

  // Dialog state (local UI state)
  const [isOpen, setIsOpen] = useState(false);

  // Handle token selection from dialog
  const handleTokenSelect = useCallback(
    (item: TokenNetworkItem) => {
      setValue(itemToValue(item));
    },
    [setValue],
  );

  // Handle amount input change
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount],
  );

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    setMax();
  }, [setMax]);

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
      className={`input-token-amount w-full data-[disabled=true]:pointer-events-none ${className || ''}`}
    >
      <TokenAmountTrigger
        selectedItem={token}
        isTokenLoading={isTokenLoading}
        amount={amount}
        isAmountValid={isAmountValid}
        onAmountChange={handleAmountChange}
        onOpen={handleOpen}
        isOpen={isOpen}
        disabled={disabled}
        amountPlaceholder={amountPlaceholder}
        showMaxButton={showMaxButton}
        onMaxClick={handleMaxClick}
        error={error}
        label={label}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0">
          <DialogTitle className="sr-only">Select Token</DialogTitle>
          <TokenAmountSelector
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

export default React.memo(InputTokenAmount);
