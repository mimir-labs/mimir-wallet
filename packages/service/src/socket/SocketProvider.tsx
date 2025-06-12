// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_CLIENT_WS_GATEWAY } from '../config.js';
import { TransactionSocketContext } from './context.js';

interface TransactionSocketProviderProps {
  url?: string;
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
  const subscriptionsRef = useRef<Map<string, Set<(event: unknown) => void>>>(new Map());
  const isConnectingRef = useRef<boolean>(false);

  const updateSocketState = useCallback((updates: Partial<SocketState>) => {
    setSocketState((prev) => ({ ...prev, ...updates }));
  }, []);

  const processAllSubscriptions = useCallback(() => {
    const socket = socketRef.current;

    if (!socket?.connected) return;

    console.log('Processing all subscriptions...', subscriptionsRef.current.size);

    subscriptionsRef.current.forEach((callbacks, address) => {
      socket.emit('subscribe', address);

      const eventName = `tx:${address}`;

      socket.off(eventName);

      socket.on(eventName, (event: unknown) => {
        callbacks.forEach((callback) => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in subscription callback for ${address}:`, error);
          }
        });
      });
    });
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    console.log('Establishing WebSocket connection...');
    isConnectingRef.current = true;

    try {
      const socket = io(url, {
        path: '/transaction-push',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected successfully');
        isConnectingRef.current = false;
        updateSocketState({
          isConnected: true,
          isReconnecting: false,
          error: null
        });
        processAllSubscriptions();
      });

      socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        updateSocketState({ isConnected: false });
      });

      socket.on('reconnect_attempt', (attemptNumber: number) => {
        console.log(`WebSocket reconnecting... (attempt ${attemptNumber})`);
        updateSocketState({ isReconnecting: true });
      });

      socket.on('reconnect', (attemptNumber: number) => {
        console.log(`WebSocket reconnected successfully (after ${attemptNumber} attempts)`);
        updateSocketState({
          isConnected: true,
          isReconnecting: false,
          error: null
        });
        processAllSubscriptions();
      });

      socket.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed after all attempts');
        isConnectingRef.current = false;
        updateSocketState({
          isReconnecting: false,
          error: new Error('Failed to reconnect after multiple attempts')
        });
      });

      socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
        isConnectingRef.current = false;
        updateSocketState({ error });
      });

      socket.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
        updateSocketState({ error });
      });
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      isConnectingRef.current = false;
      updateSocketState({
        error: error instanceof Error ? error : new Error('Unknown connection error')
      });
    }
  }, [url, updateSocketState, processAllSubscriptions]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;

    if (socket) {
      console.log('Disconnecting WebSocket...');
      socket.disconnect();
      socketRef.current = null;
      isConnectingRef.current = false;
      updateSocketState({
        isConnected: false,
        isReconnecting: false,
        error: null
      });
    }
  }, [updateSocketState]);

  const subscribe = useCallback(
    (address: string, callback: (event: unknown) => void) => {
      console.log(`Subscribing to address: ${address}`);

      if (!subscriptionsRef.current.has(address)) {
        subscriptionsRef.current.set(address, new Set());
      }

      subscriptionsRef.current.get(address)?.add(callback);

      const socket = socketRef.current;

      if (socket?.connected) {
        socket.emit('subscribe', address);

        const eventName = `tx:${address}`;

        if (!socket.hasListeners(eventName)) {
          socket.on(eventName, (event: unknown) => {
            const callbacks = subscriptionsRef.current.get(address);

            callbacks?.forEach((cb) => {
              try {
                cb(event);
              } catch (error) {
                console.error(`Error in subscription callback for ${address}:`, error);
              }
            });
          });
        }
      } else {
        console.log(`Socket not connected, queuing subscription for ${address}`);

        if (!isConnectingRef.current) {
          connect();
        }
      }
    },
    [connect]
  );

  const unsubscribe = useCallback((address: string) => {
    console.log(`Unsubscribing from address: ${address}`);

    subscriptionsRef.current.delete(address);

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit('unsubscribe', address);
      socket.off(`tx:${address}`);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      subscriptionsRef.current.clear();
    };
  }, [autoConnect, connect, disconnect]);

  const contextValue = {
    subscribe,
    unsubscribe,
    isConnected: socketState.isConnected,
    isReconnecting: socketState.isReconnecting,
    error: socketState.error
  };

  return <TransactionSocketContext.Provider value={contextValue}>{children}</TransactionSocketContext.Provider>;
};

export default TransactionSocketProvider;
