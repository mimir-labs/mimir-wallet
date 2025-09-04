// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, useAIContext, useFunctionCall } from '@mimir-wallet/ai-assistant';
import { encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

import { useDapps } from './useDapp';
import { useMimirLayout } from './useMimirLayout';

export function useUpdateAIContext() {
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { networks } = useNetworks();
  const { metas, isLocalAccount } = useAccount();
  const { chainSS58 } = useApi();
  const { dapps, isFavorite } = useDapps();
  const navigate = useNavigate();

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
      addresses: Object.entries(metas).map(([key, item]) => ({
        name: item.name || '',
        address: encodeAddress(key, chainSS58),
        hasPermission: isLocalAccount(key),
        isMultisig: !!item.isMultisig,
        isPure: !!item.isPure,
        network: item.network
      }))
    });
  }, [chainSS58, isLocalAccount, metas]);

  useEffect(() => {
    useAIContext.setState({
      dapps: dapps.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        supportedChains: Array.isArray(item.supportedChains) ? item.supportedChains : 'All',
        isFavorite: isFavorite(item.id),
        website: item.website
      }))
    });
  }, [dapps, isFavorite]);

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
