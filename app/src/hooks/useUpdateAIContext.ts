// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { dapps } from '@/config';
import { events } from '@/events';
import { extractRoutingContext, routes } from '@/routes';
import { useWallet } from '@/wallet/useWallet';
import { isAddress } from '@polkadot/util-crypto';
import { useEffect } from 'react';
import { parsePath, useLocation, useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, useAIContext, useFunctionCall } from '@mimir-wallet/ai-assistant';
import { addressEq, addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

import { useAddressExplorer } from './useAddressExplorer';
import { useMimirLayout } from './useMimirLayout';
import { useQrAddress } from './useQrAddress';

export function useUpdateAIContext() {
  const { networks } = useNetworks();
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { metas, isLocalAccount, accounts, addresses, current, addAddressBook } = useAccount();
  const { chainSS58, setSs58Chain } = useApi();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { open: openQr } = useQrAddress();
  const { openWallet } = useWallet();
  const { open: openExplorer } = useAddressExplorer();

  useEffect(() => {
    useAIContext.setState({
      supportedNetworks: networks.map((item) => ({
        key: item.key,
        name: item.name,
        isRelayChain: !!item.isRelayChain,
        genesisHash: item.genesisHash,
        ss58Format: item.ss58Format,
        paraId: item.paraId,
        isTestnet: !!item.isTestnet,
        isEnabled: item.enabled
      }))
    });
  }, [networks]);

  useEffect(() => {
    useAIContext.setState({
      addresses: (accounts as { address: string }[])
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
        .filter((item) => !!item)
    });
  }, [accounts, addresses, chainSS58, isLocalAccount, metas]);

  useEffect(() => {
    const currentAccount = (() => {
      if (current) {
        const hex = addressToHex(current);
        const meta = metas[hex] || {};

        return {
          address: encodeAddress(current, chainSS58),
          isPure: !!meta.isPure,
          network: meta.pureCreatedAt,
          isMultisig: !!meta.isMultisig,
          delegatees: meta.delegatees || [],
          members: meta.isMultisig ? meta.who || [] : [],
          threshold: meta.isMultisig ? meta.threshold : undefined
        };
      }

      return null;
    })();

    useAIContext.setState({
      state: {
        currentAccount: currentAccount ? ({ ...currentAccount } as any) : {},
        currentPath: pathname,
        chainSS58
      }
    });
  }, [chainSS58, current, metas, pathname]);

  // Update routingContext whenever it changes
  useEffect(() => {
    const routeFeatures = extractRoutingContext(routes).map((item) => ({
      path: item.path,
      description: item.description,
      search: item.search
    }));

    const dappFeatures = dapps
      .filter((item) => {
        return item.visible !== false && !item.url.startsWith('mimir://internal');
      })
      .map((item) => ({
        id: item.id,
        subPaths: item.subPaths,
        description: item.description,
        tags: item.tags
      }));

    // Update routingContext in AIContext
    useAIContext.setState({
      features: routeFeatures,
      dappFeatures: dappFeatures
    });
  }, []);

  const functionHandlers: Record<string, FunctionCallHandler> = {
    navigate: async (event) => {
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

      return {
        id: event.id,
        success: true,
        result: {
          message: `已完成页面跳转，页面状态可能会变化，需要注意时效性`
        }
      };
    },

    openDapp: async (event) => {
      const { id, path, params } = event.arguments as {
        id: string;
        path?: string;
        params?: Record<string, string>;
      };

      const dapp = dapps.find((item) => item.id.toString() === id);

      if (!dapp) {
        return {
          id: event.id,
          success: false,
          error: 'Unsupport dapp'
        };
      }

      if (dapp.url === 'mimir://app/batch') {
        setRightSidebarTab('batch');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/template') {
        setRightSidebarTab('template');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/decoder') {
        setRightSidebarTab('decoder');
        openRightSidebar();
      } else {
        const url = new URL(dapp.url);

        if (path) {
          let finalPath = path;

          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              finalPath = finalPath.replace(`:${key}`, value);
            });
          }

          if (dapp.isSubPathHash) {
            url.hash = path;
          } else {
            url.pathname = path;
          }
        }

        navigate(`/explorer/${encodeURIComponent(url.toString())}`);
      }

      return {
        id: event.id,
        success: true,
        result: {
          message: `已打开 dapp ${dapp.name}`
        }
      };
    },

    openModal: async (event) => {
      const { type, address } = event.arguments as {
        type: 'qrcode' | 'walletconnect' | 'connectWallet' | 'fund' | 'explorer' | 'watchlist';
        address?: string;
      };

      if (type === 'fund') {
        navigate(`/explorer/${encodeURIComponent('mimir://app/transfer')}`);

        return {
          id: event.id,
          success: true,
          result: {
            message: '已完成页面跳转'
          }
        };
      }

      if (type === 'qrcode') {
        if (!isAddress(address)) {
          return {
            id: event.id,
            success: false,
            error: 'not valid address'
          };
        }

        openQr(address);

        return {
          id: event.id,
          success: true,
          result: {
            message: `已打开 QR code 弹框`
          }
        };
      }

      if (type === 'walletconnect') {
        events.emit('walletconnect');

        return {
          id: event.id,
          success: true,
          result: {
            message: '已打开 WalletConnect 弹框，仅支持 uri 输入的方式，不支持二维码扫描'
          }
        };
      }

      if (type === 'connectWallet') {
        openWallet();

        return {
          id: event.id,
          success: true,
          result: {
            message: '已打开 Connect Wallet弹框'
          }
        };
      }

      if (type === 'explorer') {
        if (!isAddress(address)) {
          return {
            id: event.id,
            success: false,
            error: 'not valid address'
          };
        }

        openExplorer(address);

        return {
          id: event.id,
          success: true,
          result: {
            message: '已打开区块链浏览器弹框'
          }
        };
      }

      if (type === 'watchlist') {
        if (!isAddress(address)) {
          return {
            id: event.id,
            success: false,
            error: 'not valid address'
          };
        }

        addAddressBook(address, true);

        return {
          id: event.id,
          success: true,
          result: {
            message: '已打开添加进 watchlist 弹框'
          }
        };
      }

      return {
        id: event.id,
        success: false,
        error: `unsupport type(${type})`
      };
    },

    searchAddressBook: async (event) => {
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
          return {
            id: event.id,
            success: false,
            error: 'Search query cannot be empty'
          };
        }

        // Limit bounds checking
        const searchLimit = Math.min(Math.max(limit, 1), 50);

        // Check if query is a valid address format (basic validation)
        const isAddressQuery = isAddress(query);

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

        return {
          id: event.id,
          success: true,
          result: {
            query: query,
            results: sortedResults,
            totalFound: sortedResults.length,
            searchLimit: searchLimit
          }
        };
      } catch (error) {
        return {
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Search operation failed'
        };
      }
    },
    searchNetwork: async (event) => {
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

        return {
          id: event.id,
          success: true,
          result: {
            query: query,
            results: sortedResults.map(({ score, ...result }) => result), // Remove score from final result
            totalFound: results.length,
            searchLimit: searchLimit,
            message:
              results.length === 0
                ? `未找到匹配 "${query}" 的网络`
                : isAllQuery
                  ? `共有 ${results.length} 个网络${results.length > searchLimit ? ` (显示前 ${searchLimit} 个)` : ''}`
                  : `找到 ${results.length} 个匹配 "${query}" 的网络${results.length > searchLimit ? ` (显示前 ${searchLimit} 个)` : ''}`
          }
        };
      } catch (error) {
        return {
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Network search operation failed'
        };
      }
    },
    setSs58Chain: async (event) => {
      setSs58Chain(event.arguments.networkKey);

      return {
        id: event.id,
        success: true,
        result: `ss58 chain set to ${event.arguments.value}`
      };
    }
  };

  // Register function call handlers
  useFunctionCall(functionHandlers);
}
