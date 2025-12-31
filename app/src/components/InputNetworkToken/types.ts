// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AccountEnhancedAssetBalance,
  Endpoint,
} from '@mimir-wallet/polkadot-core';

/**
 * Token + Network combination identifier for selection
 */
export interface TokenNetworkValue {
  /** Network key (e.g., 'polkadot', 'assethub-polkadot') */
  network: string;
  /** Token identifier ('native' for native token, or asset key) */
  identifier: string;
}

/**
 * Aggregated token data with network info for display in the selector list
 */
export interface TokenNetworkItem {
  /** Network configuration */
  network: Endpoint;
  /** Token balance and metadata */
  token: AccountEnhancedAssetBalance;
  /** USD value of the transferrable balance */
  usdValue: number;
  /** Unique key for list rendering */
  key: string;
}

/**
 * NetworkTokenTrigger component props
 */
export interface NetworkTokenTriggerProps {
  /** Selected token data from context */
  selectedItem?: TokenNetworkItem;
  /** Whether token data is loading (from context) */
  isTokenLoading?: boolean;
  /** Click handler to open selector */
  onOpen: () => void;
  /** Whether popover is open */
  isOpen: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label */
  label?: React.ReactNode;
  /** Variant style - default shows label outside, inline-label shows label inside border */
  variant?: 'default' | 'inline-label';
  /** Content alignment for inline-label variant */
  align?: 'start' | 'end';
  /** Children slot - rendered inside border container (for amount input in default variant) */
  children?: React.ReactNode;
}

/**
 * NetworkTokenSelector component props
 */
export interface NetworkTokenSelectorProps {
  /** All available token+network items */
  items: TokenNetworkItem[];
  /** Currently selected value */
  selectedValue?: TokenNetworkValue;
  /** Item selection handler */
  onSelect: (item: TokenNetworkItem) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Available networks for filter */
  networks: Endpoint[];
  /** Currently active network filter (null = "All") */
  activeNetworkFilter: string | null;
  /** Network filter change handler */
  onNetworkFilterChange: (network: string | null) => void;
  /** Max visible networks in filter */
  maxVisibleNetworks: number;
  /** Loading state */
  isLoading: boolean;
  /** Close handler */
  onClose: () => void;
}

/**
 * NetworkFilterTabs component props
 */
export interface NetworkFilterTabsProps {
  /** Available networks */
  networks: Endpoint[];
  /** Active filter (null = All) */
  activeFilter: string | null;
  /** Filter change handler */
  onChange: (network: string | null) => void;
  /** Max visible before "More..." */
  maxVisible: number;
  /** Callback when "More" button is clicked (to show all networks view) */
  onShowMore?: () => void;
}

/**
 * TokenNetworkItem display component props
 */
export interface TokenNetworkItemDisplayProps {
  /** Item data */
  item: TokenNetworkItem;
  /** Whether this item is selected */
  isSelected: boolean;
  /** Click handler */
  onSelect: () => void;
}

/**
 * Return type for useTokenNetworkData hook
 */
export interface TokenNetworkDataResult {
  /** All token+network items */
  items: TokenNetworkItem[];
  /** Unique networks from items */
  networks: Endpoint[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether initial data has been fetched */
  isFetched: boolean;
}
