// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

import { routingContext } from './routing-context.js';

interface AIContext {
  context: string;
  routingContext: string;
  supportedNetworks: Array<{
    key: string;
    name: string;
    isRelayChain: boolean;
    genesisHash: string;
    ss58Format: number;
    paraId?: number;
    isTestnet: boolean;
    isEnabled: boolean;
  }>;
  addresses: Array<{
    name: string;
    address: string;
    hasPermission: boolean;
    isMultisig: boolean;
    isPure: boolean;
    network?: string;
  }>;
  dapps: Array<{
    id: number | string;
    name: string;
    description: string;
    supportedChains: 'All' | string[];
    isFavorite: boolean;
    website?: string;
  }>;
  updateContext: (value: string) => () => void;
  getFullContext: () => string;
}

export const useAIContext = create<AIContext>()((set, get) => {
  return {
    context: '',
    supportedNetworks: [],
    addresses: [],
    dapps: [],
    routingContext: JSON.stringify(routingContext),
    updateContext: (value) => {
      set({ context: value });

      return () => set({ context: '' });
    },
    getFullContext: () => {
      const { context, routingContext, supportedNetworks, addresses, dapps } = get();

      // Combine routing context with any additional context
      return `
# Mimir Wallet Context Information

You are an AI assistant for Mimir Wallet, an enterprise-grade multi-signature wallet for the Polkadot ecosystem. Below is the current application context to help you assist users effectively.

## Application Routes (<App-routing-info>)
The following routes are available in the application. Each route represents a specific feature or page:
- path: The URL path for navigation
- description: The functionality and purpose of each route

## Supported Blockchain Networks (<all-supported-networks>)
Mimir Wallet supports multiple Polkadot ecosystem networks with the following properties:
- key: Unique identifier for the network (used internally and in API calls)
- name: Human-readable display name of the network
- isRelayChain: Boolean indicating if this is a relay chain (true) or parachain (false)
- genesisHash: The genesis hash of the blockchain network for identification
- ss58Format: The SS58 address format number used for encoding addresses on this network
- paraId: Parachain ID (only present for parachains, not relay chains)
- isTestnet: Boolean indicating if this is a testnet (true) or mainnet (false)
- isEnabled: Boolean indicating if this network is currently enabled in the wallet

## User Accounts & Addresses (<local-address>)
The user's wallet contains various types of accounts with different capabilities:
- name: Custom label assigned by the user for easy identification
- address: The SS58-encoded address string (formatted according to the network's ss58Format)
- hasPermission: Boolean indicating if this account has permission controls applied
- isMultisig: Boolean indicating if this is a multi-signature account requiring multiple approvals
- isPure: Boolean indicating if this is a pure proxy account (anonymous proxy without private key)
- network: The network this account belongs to (only present for pure proxy accounts)

## Available DApps & Features (<all-dapps>)
Mimir Wallet integrates with various decentralized applications and provides internal features:
- id: Unique identifier (1-500: internal features, 501-999: internal utilities, 1000+: external dapps)
- name: The display name of the application or feature
- description: Brief explanation of what the app/feature does
- supportedChains: Either "All" (supports all networks) or an array of network keys
- isFavorite: Boolean indicating if the user has marked this as a favorite
- website: Optional URL to the dapp's official website

<App-routing-info>
${routingContext}
</App-routing-info>

<all-supported-networks>
${JSON.stringify(supportedNetworks)}
</all-supported-networks>

<local-address>
${JSON.stringify(addresses)}
</local-address>

<all-dapps>
${JSON.stringify(dapps)}
</all-dapps>
`.concat(context);
    }
  };
});
