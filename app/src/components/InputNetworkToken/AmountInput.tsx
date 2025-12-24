// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TLocation, XcmFeeAsset } from '@mimir-wallet/polkadot-core';

import { isAssetXcEqual } from '@mimir-wallet/polkadot-core';
import { Button, cn } from '@mimir-wallet/ui';
import React, { useCallback } from 'react';

import { formatUnits } from '@/utils';

/**
 * Fee asset information for max calculation
 * Re-export XcmFeeAsset as FeeAsset for convenience
 */
export type FeeAsset = XcmFeeAsset;

/**
 * Token data required for AmountInput
 * This is a minimal interface that only contains what AmountInput needs
 */
export interface AmountInputToken {
  /** Transferrable balance */
  transferrable: bigint;
  /** Token decimals for formatting */
  decimals: number;
  /** Token symbol for fee asset comparison */
  symbol: string;
  /** Existential deposit (optional, for keepAlive calculation) */
  existentialDeposit?: string | bigint;
  /** Whether this is a native token (affects keepAlive calculation) */
  isNative?: boolean;
  /** Asset location for precise XCM asset comparison (accepts any location-like object) */
  location?: any;
}

export interface AmountInputProps {
  /** Current amount value */
  amount: string;
  /** Whether the amount is valid */
  isAmountValid: boolean;
  /** Callback when amount changes */
  setAmount: (amount: string) => void;
  /** Token data for max calculation */
  token?: AmountInputToken;
  /** Whether to keep sender alive (affects max calculation) */
  keepAlive?: boolean;
  /** Input placeholder text */
  placeholder?: string;
  /** Additional CSS class */
  className?: string;
  /**
   * Display variant:
   * - inline: No border, used inside InputNetworkToken as children
   * - standalone: With border and label, used as separate row
   */
  variant?: 'inline' | 'standalone';
  /** Label text (only for standalone variant) */
  label?: React.ReactNode;
  /** Extra content to display on the right side of label (only for standalone variant) */
  labelExtra?: React.ReactNode;
  /**
   * Optional fees to deduct when calculating max amount.
   * Each fee is only deducted if its symbol matches the transfer token.
   * Used for cross-chain transfers where fees need to be reserved.
   */
  feesToDeduct?: {
    originFee?: FeeAsset;
    destFee?: FeeAsset;
  };
  /**
   * Whether the Max button should be disabled.
   * Used when required data is not available (e.g., no destination chain selected, fees not loaded).
   */
  maxDisabled?: boolean;
}

/**
 * Reusable amount input component for token transfers
 *
 * @example Inline usage (inside InputNetworkToken)
 * ```tsx
 * <InputNetworkToken label="Transfer">
 *   <AmountInput variant="inline" ... />
 * </InputNetworkToken>
 * ```
 *
 * @example Standalone usage (separate row)
 * ```tsx
 * <AmountInput variant="standalone" label="Amount" ... />
 * ```
 */
function AmountInput({
  amount,
  isAmountValid,
  setAmount,
  token,
  keepAlive = false,
  placeholder = '0.0',
  className,
  variant = 'inline',
  label,
  labelExtra,
  feesToDeduct,
  maxDisabled,
}: AmountInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount],
  );

  const handleMax = useCallback(() => {
    if (!token) return;

    const existentialDeposit = token.existentialDeposit
      ? BigInt(token.existentialDeposit)
      : 0n;

    let maxTransferable = token.transferrable;

    // 1. Subtract existential deposit if keepAlive is enabled for native token
    if (keepAlive && token.isNative && maxTransferable > existentialDeposit) {
      maxTransferable = maxTransferable - existentialDeposit;
    }

    // Build transfer asset info for precise comparison (TAssetInfo structure)
    const transferAsset = {
      symbol: token.symbol,
      decimals: token.decimals,
      isNative: token.isNative,
      location: (token.location ?? undefined) as TLocation | undefined,
    };

    // 2. Subtract origin fee (only if fee asset matches transfer token using isAssetXcEqual)
    if (feesToDeduct?.originFee) {
      if (isAssetXcEqual(transferAsset, feesToDeduct.originFee)) {
        const originFeeAmount = BigInt(feesToDeduct.originFee.fee);

        maxTransferable =
          maxTransferable > originFeeAmount
            ? maxTransferable - originFeeAmount
            : 0n;
      }
    }

    const formatted = formatUnits(maxTransferable, token.decimals);

    setAmount(formatted);
  }, [token, keepAlive, feesToDeduct, setAmount]);

  const hasToken = !!token;
  const isStandalone = variant === 'standalone';

  const inputContent = (
    <>
      <input
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={handleChange}
        disabled={!hasToken}
        placeholder={placeholder}
        className={cn(
          'text-foreground placeholder:text-foreground/50 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none disabled:cursor-not-allowed',
          isStandalone ? 'text-left' : 'text-right',
        )}
      />
      <Button
        size="sm"
        variant="bordered"
        onClick={handleMax}
        disabled={!hasToken || maxDisabled}
        className="border-primary text-primary h-[23px] shrink-0 rounded-[5px] px-2.5 py-1"
      >
        Max
      </Button>
    </>
  );

  // Inline variant - no border, used inside InputNetworkToken
  // stopPropagation prevents triggering parent container's onClick (token selector)
  if (!isStandalone) {
    return (
      <div
        data-error={!isAmountValid}
        onClick={(e) => e.stopPropagation()}
        className={cn('flex flex-1 min-w-0 items-center gap-2.5', className)}
      >
        {inputContent}
      </div>
    );
  }

  // Standalone variant - with border and label, used as separate row
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || labelExtra) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-foreground text-sm font-bold">{label}</span>
          )}
          {labelExtra}
        </div>
      )}
      <div
        data-error={!isAmountValid}
        className="border-border hover:border-primary data-[error=true]:border-danger rounded-[10px] border p-2.5 transition-all hover:bg-primary-50 flex items-center gap-2.5"
      >
        {inputContent}
      </div>
    </div>
  );
}

export default React.memo(AmountInput);
