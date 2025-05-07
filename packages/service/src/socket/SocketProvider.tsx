// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_CLIENT_WS_GATEWAY } from '../config.js';
import { TransactionSocketContext } from './context.js';

interface TransactionSocketProviderProps {
  /**
   * WebSocket server URL
   * @default 'wss://mimir-client.mimir.global'
   */
  url?: string;
  /**
   * Whether to automatically connect when the provider is mounted
   * @default true
   */
  autoConnect?: boolean;
  children: ReactNode;
}

interface SocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
}

const TransactionSocketProvider = ({
  url = API_CLIENT_WS_GATEWAY,
  autoConnect = true,
  children
}: TransactionSocketProviderProps) => {
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    error: null
  });
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef<Map<string, Set<(event: unknown) => void>>>(new Map());
  const subscribedAddressesRef = useRef<Set<string>>(new Set());

  const updateSocketState = useCallback((updates: Partial<SocketState>) => {
    setSocketState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resubscribeAll = useCallback(() => {
    if (!socketRef.current?.connected) return;

    subscribedAddressesRef.current.forEach((address) => {
      socketRef.current?.emit('subscribe', address);
    });
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(url, {
      path: '/transaction-push',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      updateSocketState({ isConnected: true, isReconnecting: false, error: null });
      console.log('WebSocket connected');
      resubscribeAll();
    });

    socketRef.current.on('disconnect', () => {
      updateSocketState({ isConnected: false });
      console.log('WebSocket disconnected');
    });

    socketRef.current.on('reconnect_attempt', () => {
      updateSocketState({ isReconnecting: true });
      console.log('WebSocket reconnecting...');
    });

    socketRef.current.on('reconnect_failed', () => {
      updateSocketState({ isReconnecting: false, error: new Error('Failed to reconnect') });
      console.error('WebSocket reconnection failed');
    });

    socketRef.current.on('error', (error: Error) => {
      updateSocketState({ error });
      console.error('WebSocket error:', error);
    });
  }, [url, updateSocketState, resubscribeAll]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      updateSocketState({ isConnected: false, isReconnecting: false, error: null });
    }
  }, [updateSocketState]);

  const subscribe = useCallback(
    (address: string, callback: (event: unknown) => void) => {
      if (!socketRef.current?.connected) {
        console.warn('Socket is not connected. Attempting to connect...');
        connect();
      }

      const eventName = `tx:${address}`;

      // Store callback
      if (!callbacksRef.current.has(address)) {
        callbacksRef.current.set(address, new Set());
      }

      callbacksRef.current.get(address)?.add(callback);

      // Store subscribed address
      subscribedAddressesRef.current.add(address);

      // Subscribe to event
      socketRef.current?.emit('subscribe', address);
      socketRef.current?.on(eventName, (event: unknown) => {
        callbacksRef.current.get(address)?.forEach((cb) => cb(event));
      });
    },
    [connect]
  );

  const unsubscribe = useCallback((address: string) => {
    if (!socketRef.current?.connected) return;

    const eventName = `tx:${address}`;

    // Remove all callbacks for this address
    callbacksRef.current.delete(address);
    subscribedAddressesRef.current.delete(address);

    // Unsubscribe from event
    socketRef.current.emit('unsubscribe', address);
    socketRef.current.off(eventName);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const value = {
    subscribe,
    unsubscribe,
    isConnected: socketState.isConnected,
    isReconnecting: socketState.isReconnecting,
    error: socketState.error
  };

  return <TransactionSocketContext.Provider value={value}>{children}</TransactionSocketContext.Provider>;
};

export default TransactionSocketProvider;
