// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { dapps } from '@/config';
import { extractRoutingContext, routes } from '@/routes';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAIContext } from '@mimir-wallet/ai-assistant';
import { addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

export function useUpdateAIContext() {
  const { networks } = useNetworks();
  const { metas, isLocalAccount, accounts, addresses, current } = useAccount();
  const { chainSS58 } = useApi();
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
}
