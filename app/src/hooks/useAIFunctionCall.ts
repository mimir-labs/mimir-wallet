// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useEffect } from 'react';
import { parsePath, useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, functionCallManager, useAIContext } from '@mimir-wallet/ai-assistant';
import {
  addressEq,
  addressToHex,
  encodeAddress,
  isValidAddress,
  useApi,
  useNetworks
} from '@mimir-wallet/polkadot-core';

// Types for function call arguments
interface AddressArguments {
  address: string;
}

interface AccountsArguments {
  accounts: string[];
}

// Helper function to create success response
function createSuccessResponse(id: string, result: any) {
  return functionCallManager.respondToFunctionCall({
    id,
    success: true,
    result
  });
}

// Helper function to create error response
function createErrorResponse(id: string, error: string) {
  return functionCallManager.respondToFunctionCall({
    id,
    success: false,
    error
  });
}

// Helper function to validate single address
function validateAddress(id: string, address: string) {
  if (!address || !isValidAddress(address)) {
    return createErrorResponse(id, `Invalid address format: ${address || 'empty address'}`);
  }

  return null;
}

// Helper function to validate multiple addresses
function validateAddresses(id: string, addresses: string[]) {
  const validAddresses = addresses.filter((addr) => isValidAddress(addr));
  const invalidAddresses = addresses.filter((addr) => !isValidAddress(addr));

  if (validAddresses.length === 0) {
    return createErrorResponse(id, `Invalid address format: ${invalidAddresses.join(', ')}`);
  }

  return validAddresses;
}

function useNavigateCall() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name === 'navigate') {
        const { path, query, params } = event.arguments as {
          path: string;
          query?: Record<string, string>;
          params?: Record<string, string>;
        };

        let finalPath = path;

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            finalPath = finalPath.replace(`:${key}`, value);
          });
        }

        const url = parsePath(finalPath);

        if (query) {
          url.search = `?${Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`;
        }

        // Execute navigation for regular routes and mark as AI navigation
        navigate(url);

        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: true,
          result: {
            message: `已完成页面跳转，页面状态可能会变化，需要注意时效性`
          }
        });
      }
    };

    return functionCallManager.onFunctionCall(handler);
  }, [navigate]);
}

export function useSearchAddressBookCall() {
  const { chainSS58 } = useApi();
  const { metas, isLocalAccount, accounts } = useAccount();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'searchAddressBook') return;

      try {
        const { query, limit = 10 } = event.arguments as { query: string; limit?: number };
        const { addresses } = useAIContext.getState();

        // Get fresh accounts and addresses data for comprehensive search
        // This includes both user accounts and external addresses from address book
        const allAddressData = (accounts as { address: string }[])
          .concat(addresses)
          .map((item) => {
            const meta = metas[addressToHex(item.address)];

            if (!meta) return null;

            return {
              name: meta.name || '',
              address: encodeAddress(item.address, chainSS58),
              hasPermission: isLocalAccount(item.address),
              isMultisig: !!meta.isMultisig,
              isPure: !!meta.isPure,
              network: meta.pureCreatedAt
            };
          })
          .filter((item) => !!item);

        // Use fresh data for real-time search, fallback to cached addresses if needed
        const searchData = allAddressData.length > 0 ? allAddressData : addresses;

        // Validate input
        if (!query || query.trim().length === 0) {
          return functionCallManager.respondToFunctionCall({
            id: event.id,
            success: false,
            error: 'Search query cannot be empty'
          });
        }

        // Limit bounds checking
        const searchLimit = Math.min(Math.max(limit, 1), 50);

        // Check if query is a valid address format (basic validation)
        const isAddressQuery = isValidAddress(query);

        // Simplified search algorithm with only exact matching
        interface SearchResult {
          name: string;
          address: string;
          hasPermission: boolean;
          isMultisig: boolean;
          isPure: boolean;
          network?: string;
          type: string;
          matchType: 'address_exact' | 'name_exact';
        }

        const results: SearchResult[] = [];

        searchData.forEach((addr) => {
          const name = (addr.name || '').toLowerCase();
          const address = addr.address.toLowerCase();
          const type = addr.isPure ? '纯代理账户' : addr.isMultisig ? '多重签名账户' : '普通账户';

          let matchType: 'address_exact' | 'name_exact' | null = null;

          // Strategy 1: Exact address match (only if query looks like an address)
          if (isAddressQuery && addressEq(address, query)) {
            matchType = 'address_exact';
          }

          const searchQuery = query.trim().toLowerCase();

          // Strategy 2: Exact name match
          if (name === searchQuery) {
            matchType = 'name_exact';
          }

          // Add result if exact match found
          if (matchType) {
            results.push({
              name: addr.name || '未命名',
              address: addr.address,
              hasPermission: addr.hasPermission,
              isMultisig: addr.isMultisig,
              isPure: addr.isPure,
              network: addr.network,
              type,
              matchType
            });
          }
        });

        // Sort by match type (address matches first, then name matches) and limit results
        const sortedResults = results
          .sort((a, b) => {
            // Prioritize address exact matches over name exact matches
            if (a.matchType === 'address_exact' && b.matchType === 'name_exact') return -1;
            if (a.matchType === 'name_exact' && b.matchType === 'address_exact') return 1;

            return 0; // Same priority within same match type
          })
          .slice(0, searchLimit);

        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: true,
          result: {
            query: query,
            results: sortedResults,
            totalFound: sortedResults.length,
            searchLimit: searchLimit
          }
        });
      } catch (error) {
        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Search operation failed'
        });
      }
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

function useSearchNetworksCall() {
  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'searchNetwork') return;

      try {
        const { query = 'all', limit = 10 } = event.arguments as { query?: string; limit?: number };
        const { supportedNetworks } = useAIContext.getState();

        // Limit bounds checking
        const searchLimit = Math.min(Math.max(limit, 1), 50);
        const searchQuery = query.trim().toLowerCase();

        // Check if query is "all" to return all networks
        const isAllQuery = searchQuery === 'all' || searchQuery === '';

        // Network search algorithm with exact and partial matching
        interface NetworkResult {
          key: string;
          name: string;
          isRelayChain: boolean;
          genesisHash: string;
          ss58Format: number;
          paraId?: number;
          isTestnet: boolean;
          isEnabled: boolean;
          matchType: 'exact' | 'partial';
          score: number;
        }

        const results: NetworkResult[] = [];

        supportedNetworks.forEach((network) => {
          // If query is "all", add all networks
          if (isAllQuery) {
            results.push({
              key: network.key,
              name: network.name,
              isRelayChain: network.isRelayChain,
              genesisHash: network.genesisHash,
              ss58Format: network.ss58Format,
              paraId: network.paraId,
              isTestnet: network.isTestnet,
              isEnabled: network.isEnabled,
              matchType: 'exact' as const,
              score: network.isEnabled ? 100 : 75 // Prioritize enabled networks
            });

            return;
          }

          const name = network.name.toLowerCase();
          const key = network.key.toLowerCase();
          let matchType: 'exact' | 'partial' | null = null;
          let score = 0;

          // Strategy 1: Exact name or key match
          if (name === searchQuery || key === searchQuery) {
            matchType = 'exact';
            score = 100;

            // Boost score for key match as it's more specific
            if (key === searchQuery) {
              score = 110;
            }
          }
          // Strategy 2: Partial name or key match (contains query)
          else if (name.includes(searchQuery) || key.includes(searchQuery)) {
            matchType = 'partial';
            score = 50;

            // Slightly boost score for key partial match
            if (key.includes(searchQuery)) {
              score = 60;
            }
          }

          // Boost score for enabled networks
          if (matchType && network.isEnabled) {
            score += 25;
          }

          // Add result if match found
          if (matchType) {
            results.push({
              key: network.key,
              name: network.name,
              isRelayChain: network.isRelayChain,
              genesisHash: network.genesisHash,
              ss58Format: network.ss58Format,
              paraId: network.paraId,
              isTestnet: network.isTestnet,
              isEnabled: network.isEnabled,
              matchType,
              score
            });
          }
        });

        // Sort by score (descending) and limit results
        const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, searchLimit);

        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: true,
          result: {
            query: query,
            results: sortedResults.map(({ score: _score, ...result }) => result), // eslint-disable-line @typescript-eslint/no-unused-vars
            totalFound: results.length,
            searchLimit: searchLimit,
            message:
              results.length === 0
                ? `未找到匹配 "${query}" 的网络`
                : isAllQuery
                  ? `共有 ${results.length} 个网络${results.length > searchLimit ? ` (显示前 ${searchLimit} 个)` : ''}`
                  : `找到 ${results.length} 个匹配 "${query}" 的网络${results.length > searchLimit ? ` (显示前 ${searchLimit} 个)` : ''}`
          }
        });
      } catch (error) {
        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Network search operation failed'
        });
      }
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

function useSetSs58ChainCall() {
  const { setSs58Chain } = useApi();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'setSs58Chain') return;
      setSs58Chain(event.arguments.networkKey);

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: `ss58 chain set to ${event.arguments.value}`
      });
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

function useSwitchNetworksCall() {
  const { enableNetwork, disableNetwork } = useNetworks();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'switchNetworks') return;
      const networks = event.arguments.networks as { networkKey: string; isEnabled: boolean }[];

      networks.forEach((item) => {
        if (item.isEnabled) {
          enableNetwork(item.networkKey);
        } else {
          disableNetwork(item.networkKey);
        }
      });

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: `operate successful`
      });
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

// Function call handlers map for better organization
function createFunctionCallHandlers() {
  const handlers = {
    // Simple handlers without validation
    matchDapps: (id: string) => createSuccessResponse(id, 'please select a dapps'),
    getFund: (id: string) => createSuccessResponse(id, 'please select fund option'),
    walletConnect: (id: string) => createSuccessResponse(id, 'please use wallet connect'),
    connectWallet: (id: string) => createSuccessResponse(id, 'please manage wallet connections'),

    // Address validation handlers
    showQRCode: (id: string, { address }: AddressArguments) => {
      const error = validateAddress(id, address);

      if (error) return error;

      return createSuccessResponse(id, {
        message: 'please generate QR code',
        address
      });
    },

    viewOnExplorer: (id: string, { address }: AddressArguments) => {
      const error = validateAddress(id, address);

      if (error) return error;

      return createSuccessResponse(id, {
        message: 'please view on explorer',
        address
      });
    },

    addToWatchlist: (id: string, { address }: { address?: string }) => {
      if (address) {
        const error = validateAddress(id, address);

        if (error) return error;
      }

      return createSuccessResponse(id, {
        message: 'please add to watchlist',
        address
      });
    },

    viewPendingTransaction: (id: string, { address }: AddressArguments) => {
      const error = validateAddress(id, address);

      if (error) return error;

      return createSuccessResponse(id, {
        message: `Loading pending transactions for ${address}`,
        address
      });
    },

    queryAccount: (id: string, { accounts }: AccountsArguments) => {
      const validAddresses = validateAddresses(id, accounts);

      if (typeof validAddresses === 'object' && 'success' in validAddresses) {
        return validAddresses; // Error response
      }

      return createSuccessResponse(id, { accounts: validAddresses });
    }
  };

  return handlers;
}

export function useAIFunctionCall() {
  useNavigateCall();
  useSearchAddressBookCall();
  useSearchNetworksCall();
  useSetSs58ChainCall();
  useSwitchNetworksCall();

  useEffect(() => {
    const handlers = createFunctionCallHandlers();

    const handler: FunctionCallHandler = (event) => {
      const { name, id, arguments: args } = event;

      // Handle function calls using the handlers map
      if (name in handlers) {
        const handlerFn = handlers[name as keyof typeof handlers];

        // Simple handlers (no arguments)
        if (['matchDapps', 'getFund', 'walletConnect', 'connectWallet'].includes(name)) {
          return (handlerFn as (id: string) => any)(id);
        }

        // Handlers with arguments
        return (handlerFn as (id: string, args: any) => any)(id, args);
      }
    };

    return functionCallManager.onFunctionCall(handler);
  }, []);
}
