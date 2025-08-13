// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference lib="webworker" />

import type { NotificationMessage } from '@/hooks/useNotifications';
import type { HexString } from '@polkadot/util/types';

declare const self: ServiceWorkerGlobalScope;

// Interfaces for push notification data
interface PushNotificationData {
  title?: string;
  body?: string;
  tag?: string;
  timestamp?: number;
  // New: direct notification message data
  notification?: NotificationMessage;
}

// Utility functions for notification formatting (aligned with NotificationButton.tsx)
function formatAddress(address: HexString): string {
  // In service worker, we show full address for clarity
  return address;
}

function getNotificationMessage(notification: NotificationMessage): string {
  const txRef = `${notification.section}.${notification.method} #${notification.transactionId}`;

  const notificationType =
    notification.status === 'success' || notification.status === 'failed'
      ? 'transaction_executed'
      : notification.notificationType;

  // For transaction_executed, use status to determine the message
  if (notificationType === 'transaction_executed') {
    if (notification.status === 'success') {
      return `${txRef} has been executed successfully.`;
    } else if (notification.status === 'failed') {
      return `${txRef} execution failed.`;
    } else {
      return `${txRef} is being executed.`;
    }
  }

  // For other notification types
  switch (notificationType) {
    case 'transaction_created':
      return `${txRef} is waiting for your approval.`;

    case 'transaction_approved':
      // In service worker, show full address instead of formatted name
      return `${txRef} has been approved by ${formatAddress(notification.signer)}.`;

    default:
      return `${txRef} status update.`;
  }
}

function getNotificationTitle(notification: NotificationMessage): string {
  // Use address as title for identification
  return `Mimir Wallet - ${formatAddress(notification.address)}`;
}

export function pushSw() {
  // Handle push notifications
  self.addEventListener('push', (event) => {
    console.debug('[SW] Push event received:', event);
    // App is not focused, show notification
    const data: PushNotificationData = event.data?.json() || {};

    (async () => {
      try {
        // Check if any app window is focused
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });

        const isAppFocused = windowClients.some((client) => client.visibilityState === 'visible' && client.focused);

        if (isAppFocused) {
          console.debug('[SW] App is focused, skipping notification display');
          // You could send a message to the client instead to update UI directly
          const focusedClient = windowClients.find((client) => client.visibilityState === 'visible' && client.focused);

          if (focusedClient) {
            focusedClient.postMessage({
              type: 'PUSH_NOTIFICATION',
              data: data
            });
          }

          return self.registration.showNotification('', { silent: true });
        }

        console.debug('[SW] Push notification data:', data);

        let title: string;
        let body: string;
        const notificationData = data.notification;

        // Handle structured notification data
        if (data.notification) {
          const notification = data.notification;

          title = getNotificationTitle(notification);
          body = getNotificationMessage(notification);
        } else {
          // Fallback to legacy format
          title = data.title || 'Mimir Wallet';
          body = data.body || 'You have a new notification';
        }

        const options = {
          body,
          icon: '/icons/icon@192.png',
          badge: '/icons/icon@64.png',
          vibrate: [200, 100, 200],
          data: notificationData,
          requireInteraction: true, // Keep notification until user interacts
          tag: data.tag || `mimir-tx-${notificationData?.transactionId || Date.now()}`,
          timestamp: data.timestamp || Date.now(),
          actions: [
            {
              action: 'view',
              title: 'View Transaction'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        };

        return self.registration.showNotification(title, options);
      } catch (error) {
        console.error('[SW] Error processing push notification:', error);

        // Show generic notification if data parsing fails
        const genericOptions = {
          body: 'You have a new notification',
          icon: '/icons/icon@192.png',
          badge: '/icons/icon@64.png',
          tag: 'mimir-generic',
          actions: [
            {
              action: 'view',
              title: 'Open App'
            }
          ]
        };

        return self.registration.showNotification('Mimir Wallet', genericOptions);
      }
    })();
  });

  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click event:', event);

    event.notification.close();

    const { action } = event;
    const data: NotificationMessage = event.notification.data;

    if (action === 'dismiss') {
      // Just close the notification, no further action needed
      return;
    }

    // Handle view action or notification body click
    if (action === 'view' || !action) {
      let urlToOpen: string = '';

      // Determine URL based on notification data
      if (data?.address && data?.transactionId) {
        // Navigate to the specific address transactions page with transaction filter
        urlToOpen = `/transactions/${data.transactionId}?address=${data.address}`;
      }

      try {
        // If no existing window/tab, open a new one
        if (self.clients.openWindow && urlToOpen) {
          self.clients.openWindow(urlToOpen);
        }
      } catch (error) {
        console.error('[SW] Error handling notification click:', error);

        // Fallback: try to open the app root
        if (self.clients.openWindow && urlToOpen) {
          self.clients.openWindow(urlToOpen);
        }
      }
    }
  });
}
