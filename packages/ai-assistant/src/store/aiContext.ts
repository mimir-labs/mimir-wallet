// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

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

interface Feature {
  path: string;
  description: string;
  search: Record<string, string>; // [search] => description
}

interface DappFeature {
  id: string | number;
  subPaths?: Record<string, string>;
  description: string;
  tags?: string[];
}

interface AIContext {
  features: Feature[];
  dappFeatures: DappFeature[];
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
  getStateContext: () => string;
  getUserAddress: () => string | undefined;
}

export const useAIContext = create<AIContext>()((_, get) => {
  return {
    supportedNetworks: [],
    addresses: [],
    features: [],
    dappFeatures: [],
    getStateContext: () => {
      const { state, supportedNetworks } = get();

      // Format current account information
      let currentAccountInfo = '';

      if (state?.currentAccount) {
        const { address, isPure, isMultisig, network, members, delegatees, threshold } = state.currentAccount;
        const accountType = isPure ? 'pure proxy account' : isMultisig ? 'multisig account' : 'eoa account';
        const networkLabel = network ? ` (network: ${network || 'all'})` : '';

        let accountDetails = `My Current address: ${address}, ${accountType}${networkLabel}`;

        // Add multisig details if applicable
        if (isMultisig && members && threshold) {
          accountDetails += `
Multisig Details:
- Members: ${members.length} accounts [${members.join(', ')}]
- Threshold: ${threshold}/${members.length} (requires ${threshold} member signatures to execute transactions)
- Description: This multisig account requires at least ${threshold} out of ${members.length} members to approve transactions`;
        }

        // Add delegatees information if applicable
        if (delegatees && delegatees.length > 0) {
          accountDetails += `
Delegation Details:
- Delegatees: ${delegatees.length} accounts [${delegatees.join(', ')}]
- Description: This account has delegated transaction permissions to the listed accounts`;
        }

        currentAccountInfo = accountDetails;
      } else {
        currentAccountInfo = ``;
      }

      // Format current page state
      const stateInfo = state
        ? `<current-path>${state.currentPath || 'unknown'}</current-path>
<selectedSs58Format>${state.chainSS58 !== undefined ? state.chainSS58 : 'not set'}</selectedSs58Format>`
        : '<stateDetails>No state information available</stateDetails>';

      // Format network information
      const networkSummary =
        supportedNetworks && supportedNetworks.length > 0
          ? `<network-list>
${supportedNetworks
  .map(
    (network) =>
      `<network>
    <key>${network.key}</key>
    <name>${network.name}</name>
    <genesisHash>${network.genesisHash}</genesisHash>
    <isEnabled>${network.isEnabled}</isEnabled>
    <ss58Format>${network.ss58Format}</ss58Format>
  </network>`
  )
  .join('\n')}
</network-list>`
          : '<network-list>No network information available</network-list>';

      return `${currentAccountInfo}
<state>
${stateInfo}
${networkSummary}
</state>
`;
    },
    getUserAddress: () => {
      const { state } = get();

      return state?.currentAccount?.address;
    }
  };
});
