// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { createContext } from 'react';

export interface State {
  showAddressNodeOperations?: boolean;
  account?: AccountData | null;
}

export interface Props extends State {
  showControls?: boolean;
  showMiniMap?: boolean;
}

export type NodeData = {
  isTop?: boolean;
  isLeaf?: boolean;
  account: AccountData;
  type: 'multisig' | 'proxy' | 'unknown';
  delay?: number;
  proxyType?: string;
};

export type EdgeData = {
  color: string;
  tips: { label: string; delay?: number }[];
  isDash?: boolean;
};

export const context = createContext<State>({} as State);
