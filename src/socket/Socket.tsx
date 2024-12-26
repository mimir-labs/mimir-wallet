// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/config';

import { io, type Socket } from 'socket.io-client';

// Global socket instance for managing WebSocket connections
let socket: Socket;

// Connection state management
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Map to track subscription topics and their listener counts
// Key: topic name, Value: Set of listener callbacks
const subscriptions: Map<string, Set<(data: any) => void>> = new Map();

// Store topics that need to be resubscribed after reconnection
const pendingSubscriptions: Set<string> = new Set();

/**
 * Subscribe to a socket topic and set up a listener for incoming data
 * Manages subscription lifecycle and ensures proper cleanup
 *
 * @param topic - The topic to subscribe to
 * @param listener - Callback function to handle incoming data
 * @returns Cleanup function to unsubscribe and remove listener
 */
export function subscribe(topic: string, listener: (data: any) => void) {
  // Get or create listener set for this topic
  let listeners = subscriptions.get(topic);

  if (!listeners) {
    listeners = new Set();
    subscriptions.set(topic, listeners);
  }

  // Add new listener to the set
  listeners.add(listener);

  // Attach the event listener to the socket
  socket.on(topic, listener);

  // If this is the first listener for this topic, subscribe to it
  if (listeners.size === 1) {
    if (socket.connected) {
      socket.emit('subscribe', [topic]);
    } else {
      // Queue subscription for when connection is established
      pendingSubscriptions.add(topic);
    }
  }

  // Return cleanup function for unsubscribing
  return () => {
    unsubscribe(topic, listener);
  };
}

/**
 * Unsubscribe a specific listener from a socket topic
 * @param topic - The topic to unsubscribe from
 * @param listener - The listener to remove
 */
export function unsubscribe(topic: string, listener: (data: any) => void) {
  const listeners = subscriptions.get(topic);

  if (!listeners) return;

  // Remove specific listener
  listeners.delete(listener);
  socket.off(topic, listener);

  // If no listeners remain, clean up the topic
  if (listeners.size === 0) {
    subscriptions.delete(topic);
    pendingSubscriptions.delete(topic);

    if (socket.connected) {
      socket.emit('unsubscribe', topic);
    }
  }
}

/**
 * Attempt to reconnect to the socket server
 * @param chain - Endpoint configuration
 */
function attemptReconnect(chain: Endpoint) {
  if (isConnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  isConnecting = true;
  reconnectAttempts++;

  setTimeout(() => {
    initializeSocket(chain);
    isConnecting = false;
  }, RECONNECT_INTERVAL);
}

/**
 * Initialize or reinitialize the socket connection
 * Sets up connection handling and automatic reconnection
 *
 * @param chain - Endpoint configuration containing socket URL
 */
export function initializeSocket(chain: Endpoint) {
  // Cleanup existing socket connection if any
  if (socket) {
    disconnect();
  }

  // Create new socket connection with configuration
  socket = io(chain.socketUrl, {
    path: '/ws',
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
    reconnectAttempts = 0;

    // Resubscribe to all active topics after reconnection
    const activeTopics = Array.from(subscriptions.keys());

    if (activeTopics.length && !socket.recovered) {
      socket.emit('subscribe', activeTopics);
    }

    // Handle any pending subscriptions that accumulated while disconnected
    if (pendingSubscriptions.size > 0) {
      socket.emit('subscribe', Array.from(pendingSubscriptions));
      pendingSubscriptions.clear();
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    attemptReconnect(chain);
  });

  // Handle disconnection events
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);

    if (reason === 'io server disconnect') {
      // Server initiated disconnect, attempt to reconnect
      attemptReconnect(chain);
    }
  });

  // Handle general socket errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

/**
 * Get the current connection status
 * @returns boolean indicating if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected || false;
}

/**
 * Force disconnect the socket connection
 */
export function disconnect(): void {
  if (socket) {
    socket.disconnect();
  }

  subscriptions.clear();
  pendingSubscriptions.clear();
  reconnectAttempts = 0;
}
