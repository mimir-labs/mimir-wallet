// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const routingContext = [
  {
    path: '/',
    description:
      'Main dashboard displaying account overview, assets info, favorited dapps recent transactions, and quick actions'
  },
  {
    path: '/dapp',
    description: 'DApp browser for interacting with decentralized applications within the wallet'
  },
  {
    path: '/assets',
    description: 'Asset management page for viewing and managing cryptocurrency balances across different chains'
  },
  {
    path: '/transactions',
    description: 'Transaction history and pending transaction management interface'
  },
  {
    path: '/address-book',
    description: 'Contact management for saving frequently used addresses with labels'
  },
  {
    path: '/analytic',
    description: 'Analytics dashboard showing account activity statistics and insights'
  },
  {
    path: '/account-setting',
    description: 'Account-specific settings including members, threshold, and proxy configuration'
  },
  {
    path: '/extrinsic',
    description: 'Submit transaction by calldata'
  },
  {
    path: '/add-proxy',
    description: 'Add a proxy account to perform transactions on behalf of another account'
  },
  {
    path: '/create-multisig',
    description: 'Create a new multi-signature account with multiple members and approval threshold'
  },
  {
    path: '/create-pure',
    description: 'Create a pure proxy account for advanced account management scenarios'
  },
  {
    path: '/setting',
    description: 'General application settings including network, language, and display preferences'
  }
];
