// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

// Database schema definition
interface NotificationDB extends DBSchema {
  readNotifications: {
    key: number;
    value: {
      notificationId: number;
      readAt: string; // ISO timestamp
    };
  };
}

const DB_NAME = 'MimirNotifications';
const DB_VERSION = 1;
const STORE_NAME = 'readNotifications';
const MAX_RECORDS = 1000; // Maximum number of read records to keep
const CLEANUP_DAYS = 30; // Clean up records older than 30 days

class NotificationStorage {
  private db: IDBPDatabase<NotificationDB> | null = null;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  private readIdsCache: Set<number> | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  // Initialize the database connection
  private async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await openDB<NotificationDB>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            // Create the store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'notificationId' });
            }
          }
        });

        // Perform cleanup on initialization
        await this.cleanup();
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        // Continue without IndexedDB if it fails
        this.db = null;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  // Mark a notification as read
  async markAsRead(notificationId: number): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.put(STORE_NAME, {
        notificationId,
        readAt: new Date().toISOString()
      });

      // Invalidate cache
      this.readIdsCache = null;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark multiple notifications as read with optimized transaction
  async markMultipleAsRead(notificationIds: number[]): Promise<void> {
    if (!notificationIds.length) return;

    await this.init();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const readAt = new Date().toISOString();

      // Use for-of loop for better performance with large arrays
      for (const notificationId of notificationIds) {
        store.put({
          notificationId,
          readAt
        });
      }

      await tx.done;

      // Invalidate cache
      this.readIdsCache = null;
    } catch (error) {
      console.error('Failed to mark multiple notifications as read:', error);
    }
  }

  // Get all read notification IDs
  async getReadNotificationIds(): Promise<Set<number>> {
    await this.init();
    if (!this.db) return new Set();

    try {
      const records = await this.db.getAll(STORE_NAME);

      return new Set(records.map((record) => record.notificationId));
    } catch (error) {
      console.error('Failed to get read notifications:', error);

      return new Set();
    }
  }

  // Check if a notification is read
  async isNotificationRead(notificationId: number): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const record = await this.db.get(STORE_NAME, notificationId);

      return !!record;
    } catch (error) {
      console.error('Failed to check notification read status:', error);

      return false;
    }
  }

  // Clear all read notifications
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.clear(STORE_NAME);

      // Invalidate cache
      this.readIdsCache = null;
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
    }
  }

  // Clean up old records
  private async cleanup(): Promise<void> {
    if (!this.db) return;

    try {
      const records = await this.db.getAll(STORE_NAME);
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - CLEANUP_DAYS * 24 * 60 * 60 * 1000);

      // Remove old records
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const recordsToKeep: typeof records = [];

      for (const record of records) {
        const readAt = new Date(record.readAt);

        if (readAt < cutoffDate) {
          await store.delete(record.notificationId);
        } else {
          recordsToKeep.push(record);
        }
      }

      // If still too many records, keep only the most recent ones
      if (recordsToKeep.length > MAX_RECORDS) {
        const sortedRecords = recordsToKeep.sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
        const recordsToDelete = sortedRecords.slice(MAX_RECORDS);

        for (const record of recordsToDelete) {
          await store.delete(record.notificationId);
        }
      }

      await tx.done;
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }
}

// Export singleton instance
export const notificationStorage = new NotificationStorage();
