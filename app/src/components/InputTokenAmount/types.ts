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
 * Main InputTokenAmount component props
 *
 * This component uses a CONTROLLED pattern for better predictability in financial apps.
 * The parent component owns the state and receives updates via callbacks.
 *
 * @example
 * ```tsx
 * const [token, setToken] = useState<TokenNetworkValue>();
 * const [amount, setAmount] = useState('');
 *
 * <InputTokenAmount
 *   address={address}
 *   value={token}
 *   onTokenChange={setToken}  // Also called during auto-select
 *   amount={amount}
 *   onAmountChange={(val) => setAmount(val)}
 *   autoSelect  // Auto-select first token when value is undefined
 * />
 * ```
 */
export interface InputTokenAmountProps {
  /** Account address to query balances for */
  address?: string;

  /** Currently selected token+network value (controlled) */
  value?: TokenNetworkValue;

  /** Amount input value (controlled) */
  amount?: string;

  /** Callback when token+network selection changes (also called during auto-select) */
  onTokenChange?: (value: TokenNetworkValue) => void;

  /** Callback when amount changes, returns [value, isValid] */
  onAmountChange?: (amount: string, isValid: boolean) => void;

  /** Supported networks filter - if provided, only show these networks */
  supportedNetworks?: string[];

  /** Maximum networks to show before "More..." button (default: 5) */
  maxVisibleNetworks?: number;

  /** Label text above the component */
  label?: React.ReactNode;

  /** Helper text below the component */
  helper?: React.ReactNode;

  /** Placeholder for search input */
  searchPlaceholder?: string;

  /** Placeholder for amount input */
  amountPlaceholder?: string;

  /** Whether to disable the component */
  disabled?: boolean;

  /** Additional CSS class for the wrapper */
  className?: string;

  /** Whether to include tokens with zero balance (default: false) */
  includeZeroBalance?: boolean;

  /** Minimum amount validation */
  minAmount?: number;

  /** Whether to show Max button (default: true) */
  showMaxButton?: boolean;

  /** Keep alive setting for Max calculation */
  keepAlive?: boolean;

  /** Error state */
  error?: Error | null;
}

/**
 * TokenAmountTrigger component props
 */
export interface TokenAmountTriggerProps {
  /** Selected token data from context */
  selectedItem?: TokenNetworkItem;
  /** Whether token data is loading (from context) */
  isTokenLoading?: boolean;
  /** Current amount value */
  amount: string;
  /** Whether amount is valid */
  isAmountValid: boolean;
  /** Amount change handler */
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Click handler to open selector */
  onOpen: () => void;
  /** Whether popover is open */
  isOpen: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Amount placeholder */
  amountPlaceholder?: string;
  /** Show Max button */
  showMaxButton?: boolean;
  /** Max button click handler */
  onMaxClick?: () => void;
  /** Error state */
  error?: Error | null;
  /** Label */
  label?: React.ReactNode;
}

/**
 * TokenAmountSelector component props
 */
export interface TokenAmountSelectorProps {
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
