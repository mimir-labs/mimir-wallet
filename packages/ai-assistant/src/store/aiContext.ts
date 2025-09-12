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

interface AIContext {
  features: Feature[];
  dappFeatures: Feature[];
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
  getFeatureContext: () => string;
  getDappFeatureContext: () => string;
  getStateContext: () => string;
}

export const useAIContext = create<AIContext>()((_, get) => {
  return {
    supportedNetworks: [],
    addresses: [],
    features: [],
    dappFeatures: [],
    getFeatureContext: () => {
      const { features } = get();

      // Generate available features list from features
      const featuresDescription = features
        .map((route) => {
          let desc = `- **${route.path}** - ${route.description}`;

          if (route.search && Object.keys(route.search).length > 0) {
            const searchOptions = Object.entries(route.search)
              .map(([key, value]) => `  - search: ${key} (${value})`)
              .join('\n');

            desc += '\n' + searchOptions;
          }

          return desc;
        })
        .join('\n');

      // Combine system prompt with dynamic context
      return `${featuresDescription}`;
    },
    getDappFeatureContext: () => {
      const { dappFeatures } = get();

      // Generate available features list from features
      const featuresDescription = dappFeatures
        .map((route) => {
          let desc = `- **${route.path}** - ${route.description}`;

          if (route.search && Object.keys(route.search).length > 0) {
            const searchOptions = Object.entries(route.search)
              .map(([key, value]) => `  - search: ${key} (${value})`)
              .join('\n');

            desc += '\n' + searchOptions;
          }

          return desc;
        })
        .join('\n');

      // Combine system prompt with dynamic context
      return `${featuresDescription}`;
    },
    getStateContext: () => {
      const { state } = get();

      // Format current account information
      let currentAccountInfo = '';

      if (state?.currentAccount) {
        const { address, isPure, isMultisig, network, delegatees, members, threshold } = state.currentAccount;
        const accountType = isPure ? '纯代理账户' : isMultisig ? '多重签名账户' : '普通账户';
        const networkInfo = network ? ` (网络: ${network})` : '';

        // Format members list if multisig
        const membersList =
          isMultisig && members && members.length > 0
            ? `\n- **多签成员列表** (${members.length}人, 阈值: ${threshold}):\n${members.map((m) => `  - ${m}`).join('\n')}`
            : isMultisig
              ? `\n- **多签成员**: 暂无成员信息 (阈值: ${threshold})`
              : '';

        // Format delegatees list
        const delegateesList =
          delegatees?.length > 0
            ? `\n- **委托人列表** (${delegatees.length}人):\n${delegatees.map((d) => `  - ${d}`).join('\n')}`
            : '';

        currentAccountInfo = `### 当前账户
- **地址**: ${address}
- **类型**: ${accountType}${networkInfo}${membersList}${delegateesList}`;
      } else {
        currentAccountInfo = `### 当前账户
- 未选择账户`;
      }

      // Format current page state
      const stateInfo = state
        ? `<当前页面路径>${state.currentPath || '未知'}</当前页面路径>
<当前选择的SS58 格式>${state.chainSS58 !== undefined ? state.chainSS58 : '未设置'}</当前选择的SS58 格式>`
        : '暂无状态信息';

      return `${currentAccountInfo}
<当前状态>
${stateInfo}
</当前状态>
`;
    }
  };
});
