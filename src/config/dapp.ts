// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface DappOption {
  internal: boolean;
  icon: string;
  name: string;
  description: string;
  url: string;
}

export const dapps: DappOption[] = [
  {
    internal: true,
    icon: '/dapp-icons/transfer.png',
    name: 'Transfer',
    description: 'Transfer',
    url: '/transfer'
  }
];
