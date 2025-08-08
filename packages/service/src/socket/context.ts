// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Socket } from 'socket.io-client';

import { createContext } from 'react';

export interface SocketContextValue {
  ack: (event: string, ...args: any[]) => Promise<any>;
  /**
   * Subscribe to room events for a specific topic
   */
  subscribe: (topic: string) => void;
  /**
   * Unsubscribe from room events for a specific topic
   */
  unsubscribe: (topic: string) => void;
  /**
   * Whether the socket is currently connected
   */
  isConnected: boolean;
  /**
   * Whether the socket is currently attempting to reconnect
   */
  isReconnecting: boolean;
  /**
   * Any connection error that occurred
   */
  error: Error | null;
  /**
   * Socket instance
   */
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextValue | null>(null);
