// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { notificationStorage } from '@/utils/notificationStorage';
import { useEffectOnce } from 'react-use';
import { create } from 'zustand';

export type NotificationMessage = {
  address: HexString;
  createdAt: string;
  genesisHash: HexString;
  id: number;
  method: string;
  notificationType: 'transaction_created' | 'transaction_approved' | 'transaction_executed';
  section: string;
  signer: HexString;
  status: 'pending' | 'success' | 'failed';
  transactionId: number;
  triggerAddress: HexString;
  updatedAt: string;
};

interface NotificationStore {
  notifications: NotificationMessage[];
  readNotificationIds: Set<number>;
  // Cached computed values
  _unreadCount: number;
  _lastComputedHash: string;
  put: (notifications: NotificationMessage[]) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  markMultipleAsRead: (notificationIds: number[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isNotificationRead: (notificationId: number) => boolean;
  getUnreadCount: () => number;
  loadReadStatus: () => Promise<void>;
  // Performance optimization methods
  _recomputeCache: () => void;
}

const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  readNotificationIds: new Set(),
  _unreadCount: 0,
  _lastComputedHash: '',

  put: (notifications) =>
    set((state) => {
      // Early return if no new notifications
      if (!notifications.length) {
        return state;
      }

      // Create a map for O(1) lookup, initialized with existing notifications
      const notificationMap = new Map<number, NotificationMessage>();

      // Add existing notifications first (will be overwritten if updated)
      for (const notification of state.notifications) {
        notificationMap.set(notification.id, notification);
      }

      // Add/update with new notifications
      let hasChanges = false;

      for (const notification of notifications) {
        const existing = notificationMap.get(notification.id);

        if (!existing || existing.updatedAt !== notification.updatedAt) {
          hasChanges = true;
        }

        notificationMap.set(notification.id, notification);
      }

      // Only create new array and sort if there are actual changes
      if (!hasChanges && notificationMap.size === state.notifications.length) {
        return state;
      }

      // Convert to array and sort by id (descending)
      const sortedNotifications = Array.from(notificationMap.values()).sort((a, b) => b.id - a.id);

      const newState = { notifications: sortedNotifications };

      // Trigger cache recomputation after state update
      setTimeout(() => get()._recomputeCache(), 0);

      return newState;
    }),

  markAsRead: async (notificationId: number) => {
    // Update local state immediately for instant feedback
    set((state) => ({
      readNotificationIds: new Set([...state.readNotificationIds, notificationId])
    }));

    // Trigger cache recomputation
    setTimeout(() => get()._recomputeCache(), 0);

    // Persist to IndexedDB
    await notificationStorage.markAsRead(notificationId);
  },

  markMultipleAsRead: async (notificationIds: number[]) => {
    // Update local state immediately
    set((state) => ({
      readNotificationIds: new Set([...state.readNotificationIds, ...notificationIds])
    }));

    // Trigger cache recomputation
    setTimeout(() => get()._recomputeCache(), 0);

    // Persist to IndexedDB
    await notificationStorage.markMultipleAsRead(notificationIds);
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const allIds = notifications.map((n) => n.id);

    // Update local state
    set({
      readNotificationIds: new Set(allIds)
    });

    // Trigger cache recomputation
    setTimeout(() => get()._recomputeCache(), 0);

    // Persist to IndexedDB
    await notificationStorage.markMultipleAsRead(allIds);
  },

  isNotificationRead: (notificationId: number) => {
    const { readNotificationIds } = get();

    return readNotificationIds.has(notificationId);
  },

  getUnreadCount: () => {
    const state = get();
    const currentHash = `${state.notifications.length}-${state.readNotificationIds.size}`;

    // Return cached value if no changes detected
    if (state._lastComputedHash === currentHash) {
      return state._unreadCount;
    }

    // Recompute and cache
    const unreadCount = state.notifications.filter((n) => !state.readNotificationIds.has(n.id)).length;

    // Update cache - use set to update state
    set({ _unreadCount: unreadCount, _lastComputedHash: currentHash });

    return unreadCount;
  },

  _recomputeCache: () => {
    const state = get();
    const unreadCount = state.notifications.filter((n) => !state.readNotificationIds.has(n.id)).length;
    const currentHash = `${state.notifications.length}-${state.readNotificationIds.size}`;

    set({ _unreadCount: unreadCount, _lastComputedHash: currentHash });
  },

  loadReadStatus: async () => {
    const readIds = await notificationStorage.getReadNotificationIds();

    set({ readNotificationIds: readIds });
  }
}));

// Export the store for non-React usage (like in event handlers)
export const notificationStore = useNotificationStore;

// Custom hook that includes initialization
export const useNotifications = () => {
  const store = useNotificationStore();

  // Load read status from IndexedDB on mount
  useEffectOnce(() => {
    notificationStore.getState().loadReadStatus();
  });

  return store;
};
