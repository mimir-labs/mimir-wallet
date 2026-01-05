// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NetworkFilterTabsProps } from './types';

import { Avatar, cn } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import MoreIcon from '@/assets/svg/icon-more-h.svg?react';

/**
 * Network filter tabs for quick filtering by chain
 * Shows "All" + visible network icons + "More..." button
 */
function NetworkFilterTabs({
  networks,
  activeFilter,
  onChange,
  maxVisible = 5,
  onShowMore,
}: NetworkFilterTabsProps) {
  // Split networks into visible and overflow
  const { visibleNetworks, hasMore } = useMemo(() => {
    if (networks.length <= maxVisible) {
      return { visibleNetworks: networks, hasMore: false };
    }

    return {
      visibleNetworks: networks.slice(0, maxVisible),
      hasMore: true,
    };
  }, [networks, maxVisible]);

  const handleSelect = (networkKey: string | null) => {
    onChange(networkKey);
  };

  const buttonBaseClass =
    'flex h-8 px-2 flex-1 items-center justify-center rounded-[10px] border border-primary/5 transition-colors cursor-pointer';
  const activeClass = 'bg-primary/10 border-primary/20';
  const inactiveClass = 'hover:bg-secondary';

  return (
    <div className="flex w-full items-center gap-[7px] px-[15px]">
      {/* All button */}
      <button
        type="button"
        onClick={() => handleSelect(null)}
        className={cn(
          buttonBaseClass,
          activeFilter === null ? activeClass : inactiveClass,
        )}
      >
        <span className="text-primary text-sm">Connected</span>
      </button>

      {/* Visible network buttons */}
      {visibleNetworks.map((network) => (
        <button
          key={network.key}
          type="button"
          onClick={() => handleSelect(network.key)}
          className={cn(
            buttonBaseClass,
            activeFilter === network.key ? activeClass : inactiveClass,
          )}
        >
          <Avatar
            alt={network.name}
            fallback={network.name?.slice(0, 1) || '?'}
            src={network.icon}
            style={{ width: 22, height: 22 }}
          />
        </button>
      ))}

      {/* More button - triggers full network list view */}
      {hasMore && (
        <button
          type="button"
          onClick={onShowMore}
          className={cn(buttonBaseClass, inactiveClass)}
        >
          <MoreIcon className="text-primary size-3" />
        </button>
      )}
    </div>
  );
}

export default React.memo(NetworkFilterTabs);
