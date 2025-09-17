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
        const { address, isPure, isMultisig, network } = state.currentAccount;
        const accountType = isPure ? 'pure proxy account' : isMultisig ? 'multisig account' : 'eoa account';
        const networkInfo = network ? ` (network: ${network || 'all'})` : '';

        currentAccountInfo = `我当前的地址:${address}, ${accountType}, ${networkInfo}`;
      } else {
        currentAccountInfo = ``;
      }

      // Format current page state
      const stateInfo = state
        ? `<当前页面路径>${state.currentPath || '未知'}</当前页面路径>
<当前选择的SS58 格式>${state.chainSS58 !== undefined ? state.chainSS58 : '未设置'}</当前选择的SS58 格式>`
        : '暂无状态信息';

      // Format network information
      const networkInfo =
        supportedNetworks && supportedNetworks.length > 0
          ? `<网络列表>
${supportedNetworks
  .map(
    (network) =>
      `<网络>
    <key>${network.key}</key>
    <name>${network.name}</name>
    <genesisHash>${network.genesisHash}</genesisHash>
    <isEnabled>${network.isEnabled}</isEnabled>
    <ss58Format>${network.ss58Format}</ss58Format>
  </网络>`
  )
  .join('\n')}
</网络列表>`
          : '<网络列表>暂无网络信息</网络列表>';

      return `${currentAccountInfo}
<当前状态>
${stateInfo}
${networkInfo}
</当前状态>
`;
    }
  };
});
