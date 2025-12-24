// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NetworkTokenSelectorProps, TokenNetworkItem } from './types';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import {
  Avatar,
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  Skeleton,
} from '@mimir-wallet/ui';
import React, { useMemo, useState } from 'react';

import NetworkFilterTabs from './NetworkFilterTabs';
import TokenNetworkItemDisplay from './TokenNetworkItem';
import {
  filterByNetwork,
  filterBySearch,
  isTokenNetworkValueEqual,
} from './utils';

import IconClose from '@/assets/svg/icon-close.svg?react';

/**
 * Network list item component for full network selection view
 */
function NetworkListItem({
  network,
  isSelected,
  onSelect,
}: {
  network: Endpoint;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <li
      onClick={onSelect}
      data-selected={isSelected}
      className="hover:bg-secondary data-[selected=true]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-[10px] p-2.5 transition-colors"
    >
      <Avatar
        alt={network.name}
        fallback={network.name?.slice(0, 1) || '?'}
        src={network.icon}
        style={{ width: 24, height: 24 }}
      />
      <span className="text-foreground text-sm font-medium">
        {network.name}
      </span>
    </li>
  );
}

/**
 * Selector dialog content for InputNetworkToken
 * Contains search, network filter tabs, and token list
 * Can switch to full network list view when "More" is clicked
 */
function NetworkTokenSelector({
  items,
  selectedValue,
  onSelect,
  searchPlaceholder = 'Search source token',
  networks,
  activeNetworkFilter,
  onNetworkFilterChange,
  maxVisibleNetworks,
  isLoading,
  onClose,
}: NetworkTokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllNetworks, setShowAllNetworks] = useState(false);

  // Filter items by search and network
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply network filter
    result = filterByNetwork(result, activeNetworkFilter);

    // Apply search filter
    result = filterBySearch(result, searchQuery);

    return result;
  }, [items, activeNetworkFilter, searchQuery]);

  const handleSelect = (item: TokenNetworkItem) => {
    setSearchQuery('');
    onSelect(item);
    onClose();
  };

  // Handle network selection from full list view
  const handleNetworkSelect = (networkKey: string) => {
    setSearchQuery('');
    onNetworkFilterChange(networkKey);
    setShowAllNetworks(false);
  };

  // Filter networks by search query (for network list view)
  const filteredNetworks = useMemo(() => {
    if (!searchQuery.trim()) return networks;

    const query = searchQuery.toLowerCase();

    return networks.filter((network) =>
      network.name.toLowerCase().includes(query),
    );
  }, [networks, searchQuery]);

  // Show all networks view
  if (showAllNetworks) {
    return (
      <Command
        shouldFilter={false}
        className="flex h-full flex-col gap-[15px] py-[15px]"
      >
        {/* Search input with close button */}
        <div className="flex items-center gap-2 px-[15px]">
          <div className="flex-1">
            <CommandInput
              placeholder="Search chain"
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-[34px] rounded-[10px]"
            />
          </div>
          <Button
            isIconOnly
            radius="md"
            variant="light"
            className="text-muted-foreground"
            onClick={() => setShowAllNetworks(false)}
          >
            <IconClose className="size-4" />
          </Button>
        </div>

        {/* Network list */}
        <CommandList className="flex-1 max-h-[50dvh] min-h-[50dvh]">
          {filteredNetworks.length === 0 ? (
            <CommandEmpty className="text-foreground/50 py-6 text-center text-sm">
              No networks found
            </CommandEmpty>
          ) : (
            <ul className="space-y-1 px-[15px]">
              {filteredNetworks.map((network) => (
                <NetworkListItem
                  key={network.key}
                  network={network}
                  isSelected={activeNetworkFilter === network.key}
                  onSelect={() => handleNetworkSelect(network.key)}
                />
              ))}
            </ul>
          )}
        </CommandList>
      </Command>
    );
  }

  // Default token list view
  return (
    <Command
      shouldFilter={false}
      className="flex h-full flex-col gap-[15px] py-[15px]"
    >
      {/* Search input */}
      <div className="px-[15px]">
        <CommandInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="h-[34px] rounded-[10px]"
        />
      </div>

      {/* Network filter tabs */}
      <NetworkFilterTabs
        networks={networks}
        activeFilter={activeNetworkFilter}
        onChange={onNetworkFilterChange}
        maxVisible={maxVisibleNetworks}
        onShowMore={() => setShowAllNetworks(true)}
      />

      {/* Token list - progressive loading */}
      <CommandList className="flex-1 max-h-[50dvh] min-h-[50dvh]">
        {/* Show empty state only when fully loaded and no items */}
        {!isLoading && filteredItems.length === 0 ? (
          <CommandEmpty className="text-foreground/50 py-6 text-center text-sm">
            No tokens found
          </CommandEmpty>
        ) : (
          <>
            {/* Token list */}
            {filteredItems.length > 0 && (
              <ul className="space-y-1 px-[15px]">
                {filteredItems.map((item) => {
                  const isSelected = isTokenNetworkValueEqual(selectedValue, {
                    network: item.network.key,
                    identifier: item.token.isNative ? 'native' : item.token.key,
                  });

                  return (
                    <TokenNetworkItemDisplay
                      key={item.key}
                      item={item}
                      isSelected={isSelected}
                      onSelect={() => handleSelect(item)}
                    />
                  );
                })}
              </ul>
            )}

            {/* Skeleton loading indicator at bottom when still loading */}
            {isLoading && (
              <Skeleton className="h-8 w-auto rounded-[10px] mx-[15px]" />
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
}

export default React.memo(NetworkTokenSelector);
