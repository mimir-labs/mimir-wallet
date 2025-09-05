// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

import { routingContext } from './routing-context.js';

interface DappInfo {
  id: number | string;
  name: string;
  description: string;
  supportedChains: 'All' | string[];
  isFavorite: boolean;
  website?: string;
}

interface State {
  currentAccount?: {
    address: string;
    isPure: boolean;
    network?: string;
    isMultisig: boolean;
    delegatees: string[];
    members?: string[];
    threshold?: number;
  };
  currentPath?: string;
  chainSS58?: number;
}

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
  state?: State;
  internalDapps: Array<DappInfo>;
  externalDapps: Array<DappInfo>;
  updateContext: (value: string) => () => void;
  getFullContext: () => string;
}

export const useAIContext = create<AIContext>()((set, get) => {
  return {
    context: '',
    supportedNetworks: [],
    addresses: [],
    internalDapps: [],
    externalDapps: [],
    routingContext: JSON.stringify(routingContext),
    updateContext: (value) => {
      set({ context: value });

      return () => set({ context: '' });
    },
    getFullContext: () => {
      const { context, routingContext, supportedNetworks, addresses, internalDapps, externalDapps, state } = get();

      // Combine routing context with any additional context
      return `
# MIMIR WALLET AI ASSISTANT CONTEXT

You are an AI assistant for Mimir Wallet - an enterprise-grade multi-signature wallet for the Polkadot ecosystem. Focus on the current user context and provide precise, actionable assistance.

## CURRENT USER STATE (<global-state>)
**Active session information for immediate context:**
- currentPath: The route path where the user currently is
- chainSS58: Global ss58 format, numberic
- currentAccount.address: The active account's SS58-encoded address
- currentAccount.isPure: Whether this is a pure proxy account (anonymous, no private key)
- currentAccount.network: Genesis hash of the network (only for pure proxy accounts)
- currentAccount.isMultisig: Whether this is a multi-signature account
- currentAccount.delegatees: Array of proxy accounts that can act on behalf of this account
- currentAccount.members: Multisig members array (only if isMultisig=true)
- currentAccount.threshold: Required approvals for multisig transactions (only if isMultisig=true)

## NAVIGATION ROUTES (<App-routing-info>)
**Available application paths and their purposes:**
- path: URL path for navigation (e.g., "/transfer", "/transactions")
- description: Feature functionality at this route

## BLOCKCHAIN NETWORKS (<all-supported-networks>)
**Polkadot ecosystem networks configuration:**
- key: Network identifier for API calls and internal reference
- name: Display name shown to users
- isRelayChain: true = relay chain (Polkadot/Kusama), false = parachain
- genesisHash: Unique blockchain identifier
- ss58Format: Address encoding format (e.g., 0 for Polkadot, 2 for Kusama)
- paraId: Parachain ID number (only for parachains)
- isTestnet: true = test network, false = production network
- isEnabled: Whether this network is active in the wallet

## USER ACCOUNTS (<local-address>)
**All available accounts in the wallet:**
- name: User-defined label for the account
- address: SS58-encoded address string
- hasPermission: Whether permission controls are applied
- isMultisig: Multi-signature account requiring multiple approvals
- isPure: Pure proxy account without private key
- network: Network association (pure proxies only)

## INTERNAL DAPPS (<internal-dapps>) And EXTERNAL DAPPS (<external-dapps>)
- id: Unique identifier
- name: Application name
- description: Feature explanation
- supportedChains: "All" or array of network keys
- isFavorite: User's bookmark status
- website: Official URL (optional)

<App-routing-info>
${routingContext}
</App-routing-info>

<all-supported-networks>
${JSON.stringify(supportedNetworks)}
</all-supported-networks>

<local-address>
${JSON.stringify(addresses)}
</local-address>

<internal-dapps>
${JSON.stringify(internalDapps)}
</internal-dapps>

<external-dapps>
${JSON.stringify(externalDapps)}
</external-dapps>

<global-state>
${JSON.stringify(state || {})}
</global-state>
`.concat(context);
    }
  };
});
