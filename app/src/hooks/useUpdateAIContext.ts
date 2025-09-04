// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { dapps } from '@/config';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, useAIContext, useFunctionCall } from '@mimir-wallet/ai-assistant';
import { addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

import { useDapps } from './useDapp';
import { useMimirLayout } from './useMimirLayout';

export function useUpdateAIContext() {
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { networks } = useNetworks();
  const { metas, isLocalAccount, accounts, addresses, current } = useAccount();
  const { chainSS58 } = useApi();
  const { isFavorite } = useDapps();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
            network: meta.network
          };
        })
        .filter((item) => !!item)
    });
  }, [accounts, addresses, chainSS58, isLocalAccount, metas]);

  useEffect(() => {
    useAIContext.setState({
      internalDapps: dapps
        .filter((item) => item.url.startsWith('mimir://app'))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          supportedChains: Array.isArray(item.supportedChains) ? item.supportedChains : 'All',
          isFavorite: isFavorite(item.id),
          website: item.website
        }))
    });

    useAIContext.setState({
      internalDapps: dapps
        .filter((item) => item.url.startsWith('https://'))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          supportedChains: Array.isArray(item.supportedChains) ? item.supportedChains : 'All',
          isFavorite: isFavorite(item.id),
          website: item.website
        }))
    });
  }, [isFavorite]);

  useEffect(() => {
    const currentAccount = (() => {
      if (current) {
        const hex = addressToHex(current);
        const meta = metas[hex];

        if (meta) {
          return {
            address: encodeAddress(current, chainSS58),
            isPure: !!meta.isPure,
            network: meta.network,
            isMultisig: !!meta.isMultisig,
            delegatees: meta.delegatees || [],
            members: meta.isMultisig ? meta.who : [],
            threshold: meta.isMultisig ? meta.threshold : undefined
          };
        }

        return null;
      }

      return null;
    })();

    useAIContext.setState({
      state: {
        ...(currentAccount ? currentAccount : {}),
        currentPath: pathname
      }
    });
  });

  const functionHandlers: Record<string, FunctionCallHandler> = {
    // Standard server tool: createMultisig
    navigateToDapp: async (event) => {
      const dapp = dapps.find((item) => item.id === event.arguments.id);

      if (dapp) {
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
          const _url = event.arguments.network ? dapp.urlSearch?.(event.arguments.network) || dapp.url : dapp.url;

          navigate(`/explorer/${encodeURIComponent(_url.toString())}`);
        }

        return {
          id: event.id,
          success: true,
          result: `Navigate to ${dapp.name}`
        };
      } else {
        return {
          id: event.id,
          success: false,
          result: 'Not support dapp'
        };
      }
    }
  };

  // Register function call handlers
  useFunctionCall(functionHandlers);
}
