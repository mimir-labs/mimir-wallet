// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkValue } from '@/components/InputNetworkToken';

import { cn, Spinner } from '@mimir-wallet/ui';

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
        <Spinner />
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

export interface ToTokenSectionProps {
  address?: string;
  supportedNetworks?: string[];
  value: TokenNetworkValue | undefined;
  onChange: (value: TokenNetworkValue) => void;
  outputAmount?: string;
  outputLoading?: boolean;
}

/**
 * To Token Section Component
 * Uses controlled mode - value and onChange are passed to InputNetworkTokenProvider
 */
function ToTokenSection({
  address,
  supportedNetworks,
  value,
  onChange,
  outputAmount,
  outputLoading,
}: ToTokenSectionProps) {
  return (
    <InputNetworkTokenProvider
      address={address}
      supportedNetworks={supportedNetworks}
      value={value}
      onChange={onChange}
      xcmOnly
      includeAllAssets
      tokenFilter={(item) =>
        (item.token.price && item.token.price > 0) || !!item.token.logoUri
      }
    >
      <InputNetworkToken variant="inline-label" label="To">
        <OutputAmountDisplay
          outputAmount={outputAmount}
          outputLoading={outputLoading}
        />
      </InputNetworkToken>
    </InputNetworkTokenProvider>
  );
}

export default ToTokenSection;
