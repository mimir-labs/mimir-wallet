// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItemDisplayProps } from './types';

import { Avatar } from '@mimir-wallet/ui';
import React from 'react';

import FormatBalance from '../FormatBalance';

import { formatUsdValue } from './utils';

/**
 * Token + Network combo item for the selector list
 * Displays token icon with network badge, names, balance and USD value
 */
function TokenNetworkItemDisplay({
  item,
  isSelected,
  onSelect,
}: TokenNetworkItemDisplayProps) {
  const { network, token, usdValue } = item;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      onClick={onSelect}
      className="hover:bg-secondary data-[selected=true]:bg-primary/5 flex cursor-pointer items-center gap-2.5 rounded-[10px] p-[5px] transition-colors"
    >
      {/* Token icon with network badge overlay */}
      <div className="relative shrink-0">
        <Avatar
          alt={token.name}
          fallback={token.symbol?.slice(0, 1) || '?'}
          src={token.logoUri}
          style={{ width: 32, height: 32 }}
        />
        {/* Network badge - overlaps token icon */}
        <div className="absolute -right-1 -bottom-1">
          <Avatar
            alt={network.name}
            fallback={network.name?.slice(0, 1) || '?'}
            src={network.icon}
            style={{ width: 16, height: 16 }}
            className="border-background border-2"
          />
        </div>
      </div>

      {/* Token and network names */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate text-sm font-medium">
          {token.symbol}
        </span>
        <span className="text-foreground/50 truncate text-xs">
          {network.name}
        </span>
      </div>

      {/* Balance and USD value */}
      <div className="flex shrink-0 flex-col items-end">
        <FormatBalance
          className="text-foreground text-sm"
          value={token.transferrable}
          format={[token.decimals, token.symbol]}
        />
        <span className="text-foreground/50 text-xs">
          {formatUsdValue(usdValue)}
        </span>
      </div>
    </li>
  );
}

export default React.memo(TokenNetworkItemDisplay);
