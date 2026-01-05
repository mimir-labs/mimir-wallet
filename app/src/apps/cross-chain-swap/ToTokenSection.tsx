// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkValue } from '@/components/InputNetworkToken';

import { cn } from '@mimir-wallet/ui';
import { useEffect } from 'react';

import FormatBalance from '@/components/FormatBalance';
import {
  InputNetworkToken,
  InputNetworkTokenProvider,
  useInputNetworkTokenContext,
} from '@/components/InputNetworkToken';

/**
 * Output Amount Display Component
 * Shows the estimated output amount (read-only) in the To token section
 */
function OutputAmountDisplay({
  outputAmount,
  outputLoading,
}: {
  outputAmount?: string;
  outputLoading?: boolean;
}) {
  const { token } = useInputNetworkTokenContext();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'ml-auto min-w-0 text-right text-sm font-bold',
        !outputAmount && 'text-foreground/50',
      )}
    >
      {outputLoading ? (
        <span className="animate-dots text-foreground/50">...</span>
      ) : outputAmount && token ? (
        <FormatBalance
          value={outputAmount}
          format={[token.token.decimals, '']}
        />
      ) : (
        '0.0'
      )}
    </div>
  );
}

/**
 * To Token Content Component
 * Uses InputNetworkToken with output amount display as children
 * Syncs context value with external state
 */
function ToTokenContent({
  externalValue,
  onExternalChange,
  outputAmount,
  outputLoading,
}: {
  externalValue: TokenNetworkValue | undefined;
  onExternalChange: (value: TokenNetworkValue) => void;
  outputAmount?: string;
  outputLoading?: boolean;
}) {
  const { value, setValue } = useInputNetworkTokenContext();

  // Sync context value to external when it changes
  useEffect(() => {
    if (value) {
      onExternalChange(value);
    }
  }, [value, onExternalChange]);

  // Sync external value to context on mount (for swap functionality)
  useEffect(() => {
    if (externalValue && !value) {
      setValue(externalValue);
    }
  }, [externalValue, value, setValue]);

  return (
    <InputNetworkToken variant="inline-label" label="To">
      <OutputAmountDisplay
        outputAmount={outputAmount}
        outputLoading={outputLoading}
      />
    </InputNetworkToken>
  );
}

export interface ToTokenSectionProps {
  address?: string;
  supportedNetworks?: string[];
  externalValue: TokenNetworkValue | undefined;
  onExternalChange: (value: TokenNetworkValue) => void;
  outputAmount?: string;
  outputLoading?: boolean;
}

/**
 * To Token Section Component
 * Wraps ToTokenContent in its own InputNetworkTokenProvider
 */
function ToTokenSection({
  address,
  supportedNetworks,
  externalValue,
  onExternalChange,
  outputAmount,
  outputLoading,
}: ToTokenSectionProps) {
  return (
    <InputNetworkTokenProvider
      address={address}
      supportedNetworks={supportedNetworks}
      xcmOnly
    >
      <ToTokenContent
        externalValue={externalValue}
        onExternalChange={onExternalChange}
        outputAmount={outputAmount}
        outputLoading={outputLoading}
      />
    </InputNetworkTokenProvider>
  );
}

export default ToTokenSection;
