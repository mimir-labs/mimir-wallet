// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Failed from '@/assets/images/failed.svg';
import LogoCircle from '@/assets/svg/logo-circle.svg';
import TemplateIcon from '@/assets/svg/template.svg';

import { allEndpoints } from '@mimir-wallet/polkadot-core';

export interface CustomDappOption {
  id: string;
  icon?: string;
  name: string;
  description: string;
  url: string;
}

export interface DappOption<
  SupportedChains extends true | string[] = true | string[],
  urlSearch extends (network: string) => URL = (network: string) => URL
> {
  // (1 - 500) is internal app
  // (500 - 999) is internal feature
  // (1000 - ...) is external app
  id: number | string;
  icon: string;
  name: string;
  description: string;
  url: string;
  supportedChains: SupportedChains;
  destChain?: Record<string, string>;
  tags?: string[];
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  matrix?: string;
  isDrawer?: boolean;
  Component?: () => Promise<React.ComponentType>; // only for mimir://dapp/*
  urlSearch?: urlSearch;
}

export const PolkadotJsApp: DappOption<true, (network: string) => URL> = {
  id: 1000,
  icon: '/dapp-icons/apps.svg',
  name: 'Apps',
  description: "Transactions can be constructed according to users' needs",
  url: 'https://apps.mimir.global/',
  supportedChains: true as const,
  tags: ['Wallet', 'Tool'],
  website: 'https://polkadot.js.org/',
  github: 'https://github.com/polkadot-js',
  urlSearch(network: string) {
    const wsUrl = allEndpoints.find((item) => item.key === network)?.wsUrl;

    if (!wsUrl) {
      return new URL(this.url);
    }

    return new URL(`${this.url}?rpc=${encodeURIComponent(Object.values(wsUrl)[0])}`);
  }
};

export const DotConsoleApp: DappOption<string[], (network: string) => URL> = {
  id: 1010,
  icon: '/dapp-icons/dot-console.svg',
  name: 'ĐÓTConsole',
  description: 'Substrate development console.',
  url: 'https://dotconsole.app',
  supportedChains: [
    'polkadot',
    'assethub-polkadot',
    'coretime-polkadot',
    'collectives-polkadot',
    'people-polkadot',
    'hydration',
    'kusama',
    'assethub-kusama',
    'people-kusama',
    'paseo',
    'assethub-paseo',
    'assethub-westend'
  ],
  tags: ['Utility', 'Tool'],
  website: 'https://dotconsole.app/',
  github: 'https://github.com/tien/dot-console',
  urlSearch(network: string) {
    const chain = {
      polkadot: 'polkadot',
      'assethub-polkadot': 'polkadot-asset-hub',
      'coretime-polkadot': 'polkadot-coretime',
      'collectives-polkadot': 'polkadot-collectives',
      'people-polkadot': 'polkadot-people',
      hydration: 'hydration',
      kusama: 'kusama',
      'assethub-kusama': 'kusama-asset-hub',
      'people-kusama': 'kusama-people',
      paseo: 'paseo',
      'assethub-paseo': 'paseo-asset-hub',
      'assethub-westend': 'westend-asset-hub'
    }[network];

    if (!chain) {
      return new URL(this.url);
    }

    return new URL(`${this.url}?chain=${chain}`);
  }
};

export const SubsquareApp: DappOption<string[], (network: string) => URL> = {
  id: 1002,
  icon: '/dapp-icons/subsquare.svg',
  name: 'Subsquare',
  description: 'SubSquare enables community members to propose, discuss and vote on governance proposals.',
  url: 'https://polkadot.subsquare.io/',
  supportedChains: [
    'polkadot',
    'assethub-polkadot',
    'kusama',
    'assethub-kusama',
    'acala',
    'phala',
    'collectives-polkadot',
    'bifrost-polkadot',
    'hydration',
    'bifrost-kusama',
    'karura',
    'assethub-westend',
    'paseo',
    'assethub-paseo',
    'crust',
    'vara',
    'zkverify-testnet'
  ],
  tags: ['Governance'],
  website: 'https://www.subsquare.io/',
  twitter: 'https://twitter.com/OpensquareN',
  github: 'https://github.com/opensquare-network',
  urlSearch(network: string) {
    const url = {
      polkadot: 'https://polkadot.subsquare.io/',
      'assethub-polkadot': 'https://polkadot.subsquare.io/assethub',
      kusama: 'https://kusama.subsquare.io/',
      'assethub-kusama': 'https://kusama.subsquare.io/assethub',
      acala: 'https://acala.subsquare.io/',
      phala: 'https://phala.subsquare.io/',
      'collectives-polkadot': 'https://collectives.subsquare.io/',
      'bifrost-polkadot': 'https://bifrost.subsquare.io/',
      hydration: 'https://hydration.subsquare.io/',
      'bifrost-kusama': 'https://bifrost-kusama.subsquare.io/',
      karura: 'https://karura.subsquare.io/',
      'assethub-westend': 'https://westend.subsquare.io/assethub',
      paseo: 'https://paseo.subsquare.io/',
      'assethub-paseo': 'https://paseo.subsquare.io/assethub',
      crust: 'https://crust.subsquare.io/',
      vara: 'https://vara.subsquare.io/',
      'zkverify-testnet': 'https://zkverify-testnet.subsquare.io/'
    }[network];

    if (!url) {
      return new URL(this.url);
    }

    return new URL(url);
  }
};

export const PolkassemblyApp: DappOption<string[], (network: string) => URL> = {
  id: 1012,
  icon: '/dapp-icons/polkassembly.png',
  name: 'Polkassembly',
  description: 'The premier platform for governance and collaboration in the Polkadot ecosystem.',
  url: 'https://polkadot.polkassembly.io/',
  supportedChains: [
    'polkadot',
    'kusama',
    'acala',
    'phala',
    'collectives-polkadot',
    'hydration',
    'karura',
    'paseo',
    'crust',
    'vara',
    'polimec',
    'pendulum'
  ],
  tags: ['Governance'],
  website: 'https://polkassembly.io/',
  twitter: 'https://x.com/polk_gov',
  github: 'https://github.com/polkassembly/polkassembly',
  urlSearch(network: string) {
    const url = {
      polkadot: 'https://polkadot.polkassembly.io/',
      kusama: 'https://kusama.polkassembly.io/',
      acala: 'https://acala.polkassembly.io/',
      phala: 'https://phala.polkassembly.io/',
      'collectives-polkadot': 'https://collectives.polkassembly.io/',
      hydration: 'https://hydradx.polkassembly.io/',
      karura: 'https://karura.polkassembly.io/',
      paseo: 'https://paseo.polkassembly.io/',
      crust: 'https://crust.polkassembly.io/',
      vara: 'https://vara.polkassembly.io/',
      polimec: 'https://polimec.polkassembly.io/',
      pendulum: 'https://pendulum.polkassembly.io/'
    }[network];

    if (!url) {
      return new URL(this.url);
    }

    return new URL(url);
  }
};

export const StakingApp: DappOption<true | string[], (network: string) => URL> = {
  id: 1004,
  icon: '/dapp-icons/staking.png',
  name: 'Staking',
  description:
    'Polkadot Staking Dashboard is the easiest way to stake DOT, check validator stats, manage your nominations and join nomination pools.',
  url: 'https://staking.mimir.global/',
  supportedChains: ['polkadot', 'kusama'],
  tags: ['Staking'],
  website: 'https://polkadot.cloud',
  github: 'https://github.com/paritytech/polkadot-staking-dashboard'
};

export const dapps: DappOption<true | string[], (network: string) => URL>[] = [
  {
    id: 1,
    icon: '/dapp-icons/transfer.png',
    name: 'Transfer',
    description: 'Swiftly transfer assets.',
    url: 'mimir://app/transfer',
    supportedChains: true,
    tags: ['Assets'],
    website: 'https://mimir.global',
    twitter: 'https://twitter.com/Mimir_global',
    github: 'https://github.com/mimir-labs',
    Component: () => import('@/apps/transfer').then((res) => res.default)
  },
  {
    id: 2,
    name: 'Batch',
    description: 'Batch multiple actions into one.',
    url: 'mimir://app/batch',
    icon: '/dapp-icons/batch.webp',
    supportedChains: true,
    website: 'https://mimir.global/',
    github: 'https://github.com/mimir-labs/',
    twitter: 'https://x.com/Mimir_global/',
    tags: ['Batch', 'utility'],
    Component: () => import('@/apps/batch').then((res) => res.default),
    isDrawer: true
  },
  {
    id: 3,
    name: 'Multi Transfer',
    description: 'Transfer different tokens to several addresses, developed by Mimir.',
    url: 'mimir://app/multi-transfer',
    icon: '/dapp-icons/multi-transfer.webp',
    supportedChains: true,
    website: 'https://mimir.global/',
    github: 'https://github.com/mimir-labs/',
    twitter: 'https://x.com/Mimir_global/',
    tags: ['Assets', 'Transfer', 'MultiTransfer'],
    Component: () => import('@/apps/multi-transfer').then((res) => res.default)
  },
  {
    id: 500,
    icon: LogoCircle,
    name: 'Setup',
    description: 'setup member of proxy',
    url: 'mimir://internal/setup',
    supportedChains: true
  },
  {
    id: 501,
    icon: LogoCircle,
    name: 'Fund',
    description: 'Fund',
    url: 'mimir://internal/fund',
    supportedChains: true
  },
  {
    id: 502,
    icon: Failed,
    name: 'Cancel',
    description: 'Cancel Tx',
    url: 'mimir://internal/cancel',
    supportedChains: true
  },
  {
    id: 503,
    icon: Failed,
    name: 'Deny Announcement',
    description: 'Deny announcement',
    url: 'mimir://internal/deny-announcement',
    supportedChains: true
  },
  {
    id: 505,
    icon: LogoCircle,
    name: 'Create Pure',
    description: 'Create Pure',
    url: 'mimir://internal/create-pure',
    supportedChains: true
  },
  {
    id: 506,
    icon: LogoCircle,
    name: 'Execute Announcement',
    description: 'Execute Announcement',
    url: 'mimir://internal/execute-announcement',
    supportedChains: true
  },
  {
    id: 507,
    icon: LogoCircle,
    name: 'Remove All Proxies',
    description: 'Remove All Proxies',
    url: 'mimir://internal/remove-proxies',
    supportedChains: true
  },
  {
    id: 507,
    icon: LogoCircle,
    name: 'Remove Account',
    description: 'Remove Account',
    url: 'mimir://internal/remove-account',
    supportedChains: true
  },
  {
    id: 508,
    icon: TemplateIcon,
    name: 'Template',
    description: 'Template',
    url: 'mimir://internal/template',
    supportedChains: true
  },
  {
    id: 509,
    icon: LogoCircle,
    name: 'Create Flexible',
    description: 'Create Flexible',
    url: 'mimir://internal/create-flexible',
    supportedChains: true
  },
  PolkadotJsApp,
  SubsquareApp,
  StakingApp,
  {
    id: 1005,
    icon: '/dapp-icons/bifrost.png',
    name: 'Bifrost App',
    description:
      'The Bifrost App integrates operations such as cross-chain transfers, swaps, and Yield Farming, providing vital liquidity and asset management services for the Polkadot ecosystem. This makes Bifrost an indispensable part of the Polkadot ecosystem.',
    url: 'https://app.bifrost.io/',
    supportedChains: ['polkadot', 'bifrost-polkadot', 'kusama', 'bifrost-kusama', 'assethub-polkadot'],
    tags: ['Defi'],
    website: 'https://bifrost.finance/',
    github: 'https://github.com/bifrost-finance'
  },
  {
    id: 1006,
    icon: '/dapp-icons/crust.webp',
    name: 'Crust Files',
    description:
      "Crust Files is the world's first Web 3.0 personal file storage application, launched by Crust Network. The Crust Files application enables safe storage of your personal files on IPFS, secured by the Crust Network public blockchain.",
    url: 'https://crustfiles.io/',
    supportedChains: ['crust'],
    tags: ['Defi'],
    website: 'https://crust.network/',
    twitter: 'https://x.com/CrustNetwork',
    discord: 'https://discord.gg/prkGRTeMGN',
    github: 'https://github.com/crustio'
  },
  {
    id: 1007,
    icon: '/dapp-icons/avail.png',
    name: 'Avail Staking',
    description:
      'Avail Staking Dashboard is the easiest way to stake AVAIL, check validator stats, manage your nominations and join nomination pools. Stake on Avail (AVAIL).',
    url: 'https://staking.avail.tools/#/overview',
    supportedChains: ['avail', 'avail-turing'],
    tags: ['Staking'],
    website: 'https://www.availproject.org/',
    twitter: 'https://x.com/AvailProject',
    discord: 'https://discord.com/invite/y6fHnxZQX8',
    github: 'https://github.com/availproject'
  },
  {
    id: 1008,
    icon: '/dapp-icons/polkaidentity.svg',
    name: 'Polkaidentity',
    description:
      'PolkaIdentity is a decentralized identity platform on Polkadot that empowers users to securely manage, verify, and share their digital identity across Web3 applications with full control and privacy.',
    url: 'https://app.polkaidentity.com/',
    supportedChains: [
      // polkadot
      'polkadot',
      'assethub-polkadot',
      'coretime-polkadot',
      'collectives-polkadot',
      'people-polkadot',
      // kusama
      'kusama',
      'assethub-kusama',
      'coretime-kusama',
      'people-kusama'
    ],
    tags: ['Identity'],
    matrix: 'https://matrix.to/#/#polkaidentity:matrix.org'
  },
  {
    id: 1009,
    icon: '/dapp-icons/bounty.jpeg',
    name: 'Bounty Manager',
    description: 'The go-to tool for curators to execute their bounty duties and users to explore bounties.',
    url: 'https://bountymanager.io/',
    supportedChains: ['polkadot', 'paseo'],
    tags: ['Bounty', 'Tool'],
    website: 'https://bountymanager.io/',
    github: 'https://github.com/galaniprojects/Polkadot-Bounty-Manager'
  },
  DotConsoleApp,
  {
    id: 1011,
    icon: '/dapp-icons/papi.svg',
    name: 'Bounties',
    description: 'Quickly perform batch management of bounty-related actions — developed by the PAPI team.',
    url: 'https://bounties.usepapi.app/',
    supportedChains: ['polkadot', 'kusama'],
    tags: ['Bounty', 'Tool'],
    website: 'https://bounties.usepapi.app/',
    github: 'https://github.com/polkadot-api/bounties'
  },
  PolkassemblyApp,
  {
    id: 1013,
    icon: '/dapp-icons/regoinx.svg',
    name: 'RegoinX',
    description: 'The primary interface for interacting with Polkadot’s Agile Coretime model.',
    url: 'https://hub.regionx.tech/',
    supportedChains: ['polkadot', 'kusama', 'coretime-polkadot', 'coretime-kusama', 'paseo', 'westend'],
    tags: ['Governance'],
    website: 'https://hub.regionx.tech/',
    twitter: 'https://x.com/RegionXLabs',
    urlSearch(network: string) {
      const url = {
        polkadot: 'https://hub.regionx.tech/?network=polkadot',
        kusama: 'https://hub.regionx.tech/?network=kusama',
        paseo: 'https://hub.regionx.tech/?network=paseo',
        westend: 'https://hub.regionx.tech/?network=westend',
        'coretime-polkadot': 'https://hub.regionx.tech/?network=polkadot',
        'coretime-kusama': 'https://hub.regionx.tech/?network=kusama'
      }[network];

      if (!url) {
        return new URL(this.url);
      }

      return new URL(url);
    }
  }
];
