// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Web Push utilities for handling browser notification features
 */

import { keccakAsHex } from '@polkadot/util-crypto';

/**
 * Check if Web Push is supported in the current browser
 */
export function isWebPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype
  );
}

/**
 * Check if the browser supports notification permissions
 */
export function isNotificationPermissionSupported(): boolean {
  return 'Notification' in window && 'permission' in Notification;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationPermissionSupported()) {
    return 'denied';
  }

  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationPermissionSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();

    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);

    return 'denied';
  }
}

/**
 * Convert VAPID public key from base64url to Uint8Array
 * This is required for push subscription
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get the active service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Error getting service worker registration:', error);

    return null;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await getServiceWorkerRegistration();

    if (!registration) {
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);

    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  try {
    const registration = await getServiceWorkerRegistration();

    if (!registration) {
      throw new Error('Service worker not available');
    }

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      return existingSubscription;
    }

    // Create new subscription
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);

    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getCurrentPushSubscription();

    if (!subscription) {
      return true; // Already unsubscribed
    }

    const success = await subscription.unsubscribe();

    return success;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);

    return false;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
  try {
    const subscription = await getCurrentPushSubscription();

    return subscription !== null;
  } catch (error) {
    console.error('Error checking push subscription status:', error);

    return false;
  }
}

/**
 * Convert push subscription to JSON format for API requests
 */
export function subscriptionToJson(subscription: PushSubscription): {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
} {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: arrayBufferToBase64(subscription.getKey('auth')!)
    }
  };
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

/**
 * Generate a unique notification tag based on transaction data
 */
export function generateNotificationTag(transactionId?: number, type?: string): string {
  const timestamp = Date.now();

  if (transactionId) {
    return `mimir-tx-${transactionId}-${timestamp}`;
  }

  if (type) {
    return `mimir-${type}-${timestamp}`;
  }

  return `mimir-notification-${timestamp}`;
}

/**
 * Detect browser type for analytics or specific handling
 */
export function getBrowserInfo(): {
  name: string;
  version: string;
  userAgent: string;
} {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/([0-9.]+)/);

    if (match) version = match[1];
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/([0-9.]+)/);

    if (match) version = match[1];
  } else if (userAgent.includes('Safari')) {
    name = 'Safari';
    const match = userAgent.match(/Safari\/([0-9.]+)/);

    if (match) version = match[1];
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    const match = userAgent.match(/Edge\/([0-9.]+)/);

    if (match) version = match[1];
  }

  return {
    name,
    version,
    userAgent
  };
}

/**
 * Generate device identifier using Keccak256 hash of endpoint
 * This matches the backend implementation for device identification
 */
export function generateDeviceIdentifier(endpoint: string): string {
  return keccakAsHex(endpoint);
}
