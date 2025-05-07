// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContext } from 'react';

export interface TransactionSocketContextValue {
  /**
   * Subscribe to transaction events for a specific address
   */
  subscribe: (address: string, callback: (event: any) => void) => void;
  /**
   * Unsubscribe from transaction events for a specific address
   */
  unsubscribe: (address: string) => void;
  /**
   * Whether the socket is currently connected
   */
  isConnected: boolean;
}
export const TransactionSocketContext = createContext<TransactionSocketContextValue | null>(null);
