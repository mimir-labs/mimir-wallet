// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  WebPushCheckDeviceRequest,
  WebPushCheckDeviceResponse,
  WebPushEnabledResponse,
  WebPushSubscribeRequest,
  WebPushSubscribeResponse,
  WebPushSubscriptionsResponse,
  WebPushUnsubscribeRequest,
  WebPushUnsubscribeResponse,
  WebPushVapidKeyResponse
} from '../types.js';
import type { BaseServiceOptions } from './BaseService.js';

import { BaseService } from './BaseService.js';

/**
 * Service for managing web push notifications
 * Provides methods for subscription management and testing
 */
export class WebPushService extends BaseService {
  constructor(clientGateway: string, options: BaseServiceOptions = {}) {
    super(clientGateway, options);
  }

  /**
   * Get VAPID public key for push subscription
   */
  async getVapidPublicKey(): Promise<WebPushVapidKeyResponse> {
    return this.get<WebPushVapidKeyResponse>('/web-push/vapid-public-key');
  }

  /**
   * Check if web push is enabled on the server
   */
  async checkWebPushEnabled(): Promise<WebPushEnabledResponse> {
    return this.get<WebPushEnabledResponse>('/web-push/enabled');
  }

  /**
   * Subscribe to web push notifications
   */
  async subscribe(request: WebPushSubscribeRequest): Promise<WebPushSubscribeResponse> {
    return this.post<WebPushSubscribeResponse>('/web-push/subscribe', request);
  }

  /**
   * Unsubscribe from web push notifications
   */
  async unsubscribe(request: WebPushUnsubscribeRequest): Promise<WebPushUnsubscribeResponse> {
    return this.delete<WebPushUnsubscribeResponse>('/web-push/unsubscribe', request);
  }

  /**
   * Get user's web push subscriptions
   */
  async getSubscriptions(address: string): Promise<WebPushSubscriptionsResponse> {
    return this.get<WebPushSubscriptionsResponse>('/web-push/subscriptions', { address });
  }

  /**
   * Check if current device is subscribed using device identifier
   */
  async checkDeviceSubscription(request: WebPushCheckDeviceRequest): Promise<WebPushCheckDeviceResponse> {
    return this.post<WebPushCheckDeviceResponse>('/web-push/check-device-subscription', request);
  }
}
