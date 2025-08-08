// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_CLIENT_WS_GATEWAY } from '../config.js';
import { SocketContext } from './context.js';

interface SocketProviderProps {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  children: ReactNode;
}

interface SocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
}

const SocketProvider = ({
  url = API_CLIENT_WS_GATEWAY,
  path = '/',
  autoConnect = true,
  children
}: SocketProviderProps) => {
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    error: null
  });

  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  const updateSocketState = useCallback((updates: Partial<SocketState>) => {
    setSocketState((prev) => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    console.log('Establishing WebSocket connection...');
    isConnectingRef.current = true;

    try {
      const socket = io(url, {
        path: path,
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
  }, [url, path, updateSocketState]);

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

  const subscribe = useCallback((topic: string) => {
    console.log(`Subscribing to topic: ${topic}`);

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit('subscribe', topic);
    }
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    console.log(`Unsubscribing from topic: ${topic}`);

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit('unsubscribe', topic);
    }
  }, []);

  const ack = useCallback((event: string, ...args: any[]) => {
    const socket = socketRef.current;

    if (socket?.connect) {
      return socket.emitWithAck(event, ...args);
    }

    throw new Error('Socket is not connect');
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const contextValue = {
    ack,
    subscribe,
    unsubscribe,
    isConnected: socketState.isConnected,
    isReconnecting: socketState.isReconnecting,
    error: socketState.error,
    socket: socketRef.current
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
