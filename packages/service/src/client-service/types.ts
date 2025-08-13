// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type HexString = `0x${string}`;

// Web Push related types
export interface WebPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface WebPushSubscriptionData {
  endpoint: string;
  keys: WebPushSubscriptionKeys;
}

export interface WebPushSubscription {
  id: number;
  isActive: boolean;
  createdAt: string;
  lastSuccess: string | null;
  failureCount: number;
  deviceIdentifier: string;
}

// API Request types
export interface WebPushSubscribeRequest {
  address: string;
  subscription: WebPushSubscriptionData;
  userAgent: string;
}

export interface WebPushUnsubscribeRequest {
  address: string;
  endpoint: string;
}

export interface WebPushCheckDeviceRequest {
  address: string;
  deviceIdentifier: string;
}

// API Response types
export interface WebPushVapidKeyResponse {
  publicKey: string;
}

export interface WebPushEnabledResponse {
  enabled: boolean;
}

export interface WebPushSubscribeResponse {
  success: boolean;
  subscriptionId: number;
}

export interface WebPushUnsubscribeResponse {
  success: boolean;
}

export interface WebPushSubscriptionsResponse {
  subscriptions: WebPushSubscription[];
}

export interface WebPushCheckDeviceResponse {
  isSubscribed: boolean;
  subscription?: {
    id: number;
    isActive: boolean;
    createdAt: string;
    lastSuccess: string | null;
    failureCount: number;
  };
}
