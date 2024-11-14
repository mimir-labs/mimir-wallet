// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useApi } from '@mimir-wallet/hooks';

interface SocketProps {
  isConnected: boolean;
  socket: Socket;
  subscribe: (topic: string, listener: (data: any) => any) => () => void;
  unsubscribe: (topic: string) => void;
}

export const SocketCtx = React.createContext<SocketProps>({} as unknown as SocketProps);

let socket: Socket;

const subscriptions: Map<string, number> = new Map();

function subscribe(topic: string, listener: (data: any) => void) {
  socket.on(topic, listener);

  const listeners = subscriptions.get(topic) || 0;

  subscriptions.set(topic, listeners + 1);

  if (!listeners) {
    if (socket.connected) {
      socket.emit('subscribe', [topic]);
    }
  }

  return () => {
    socket.off(topic, listener);

    unsubscribe(topic);
  };
}

function unsubscribe(topic: string) {
  const listeners = subscriptions.get(topic) || 0;

  if (listeners - 1 <= 0) {
    subscriptions.delete(topic);

    if (socket.connected) {
      socket.emit('unsubscribe', topic);
    }
  }
}

export function SocketCtxRoot({ children }: { children: React.ReactNode }) {
  const { chain } = useApi();
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }

    socket = io(chain.socketUrl, {
      path: '/ws',
      transports: ['websocket']
    });

    // restore the subscriptions upon reconnection
    socket.on('connect', () => {
      setConnected(true);

      if (subscriptions.size && !socket.recovered) {
        socket.emit('subscribe', Array.from(subscriptions.keys()));
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });
  }, [chain.socketUrl]);

  const state = useMemo(() => ({ isConnected, socket, subscribe, unsubscribe }), [isConnected]);

  return <SocketCtx.Provider value={state}>{children}</SocketCtx.Provider>;
}
