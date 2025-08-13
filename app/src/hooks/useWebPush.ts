// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WebPushSubscription } from '@mimir-wallet/service';

import {
  generateDeviceIdentifier,
  getBrowserInfo,
  getCurrentPushSubscription,
  subscribeToPush,
  subscriptionToJson,
  unsubscribeFromPush
} from '@/utils/webPushUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { service } from '@mimir-wallet/service';

import { useWebPushPermission } from './useWebPushPermission';

export interface WebPushState {
  // Permission management
  permission: {
    status: NotificationPermission;
    isSupported: boolean;
    isGranted: boolean;
    isDenied: boolean;
    isDefault: boolean;
    requestPermission: () => Promise<NotificationPermission>;
    isRequestingPermission: boolean;
  };

  // Subscription management
  subscription: {
    isSubscribed: boolean;
    subscriptions: WebPushSubscription[];
    isLoading: boolean;
    isSubscribing: boolean;
    isUnsubscribing: boolean;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    refetchSubscriptions: () => void;
  };

  // Overall state
  isEnabled: boolean;
  isReady: boolean;
  error: Error | null;
}

/**
 * Query key factory for web push subscriptions
 */
const createSubscriptionsQueryKey = (address: string) => ['webPushSubscriptions', address];

/**
 * Main hook for managing Web Push notifications
 * Simplified version focusing on subscription management and testing
 */
export function useWebPush(address: string): WebPushState {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  // Use permission hook
  const permissionState = useWebPushPermission();

  // Fetch VAPID public key
  useEffect(() => {
    let isMounted = true;

    const fetchVapidKey = async () => {
      try {
        const response = await service.webPush.getVapidPublicKey();

        if (isMounted) {
          setVapidPublicKey(response.publicKey);
        }
      } catch (error) {
        console.error('Failed to fetch VAPID public key:', error);

        if (isMounted) {
          setError(error as Error);
        }
      }
    };

    if (address && permissionState.isGranted && !vapidPublicKey) {
      fetchVapidKey();
    }

    return () => {
      isMounted = false;
    };
  }, [address, permissionState.isGranted, vapidPublicKey]);

  // Query for fetching subscriptions
  const {
    data: subscriptionsData = [],
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions
  } = useQuery({
    queryKey: createSubscriptionsQueryKey(address),
    queryFn: async () => {
      const response = await service.webPush.getSubscriptions(address);

      return response.subscriptions;
    },
    enabled: !!address && permissionState.isGranted,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  });

  // Check if currently subscribed using device identifier
  const [isClientSubscribed, setIsClientSubscribed] = useState(false);
  const [currentDeviceIdentifier, setCurrentDeviceIdentifier] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSubscription = async () => {
      try {
        const subscription = await getCurrentPushSubscription();

        if (isMounted) {
          setIsClientSubscribed(subscription !== null);
          setCurrentDeviceIdentifier(subscription ? generateDeviceIdentifier(subscription.endpoint) : null);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    if (permissionState.isGranted) {
      checkSubscription();
    }

    return () => {
      isMounted = false;
    };
  }, [permissionState.isGranted]);

  // Query for checking device subscription status using device identifier
  const { data: deviceSubscriptionData, isLoading: isLoadingDeviceCheck } = useQuery({
    queryKey: ['webPushDeviceCheck', address, currentDeviceIdentifier],
    queryFn: async () => {
      if (!currentDeviceIdentifier) {
        return { isSubscribed: false };
      }

      return await service.webPush.checkDeviceSubscription({
        address,
        deviceIdentifier: currentDeviceIdentifier
      });
    },
    enabled: !!address && !!currentDeviceIdentifier && permissionState.isGranted,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      // Subscribe to push notifications in browser
      const subscription = await subscribeToPush(vapidPublicKey);

      if (!subscription) {
        throw new Error('Failed to create push subscription');
      }

      // Send subscription to server
      const browserInfo = getBrowserInfo();

      await service.webPush.subscribe({
        address,
        subscription: subscriptionToJson(subscription),
        userAgent: browserInfo.userAgent
      });

      return subscription;
    },
    onSuccess: (subscription) => {
      // Update local subscription state
      setIsClientSubscribed(true);
      setCurrentDeviceIdentifier(generateDeviceIdentifier(subscription.endpoint));
      // Invalidate queries to get updated server data
      queryClient.invalidateQueries({ queryKey: createSubscriptionsQueryKey(address) });
      queryClient.invalidateQueries({ queryKey: ['webPushDeviceCheck', address] });
      setError(null);
    },
    onError: (error) => {
      console.error('Failed to subscribe to push notifications:', error);
      setError(error as Error);
    }
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      // Get current subscription to send endpoint to server
      const subscription = await getCurrentPushSubscription();

      // Unsubscribe from browser
      await unsubscribeFromPush();

      // Notify server if we had a subscription
      if (subscription) {
        await service.webPush.unsubscribe({
          address,
          endpoint: subscription.endpoint
        });
      }
    },
    onSuccess: () => {
      // Update local subscription state
      setIsClientSubscribed(false);
      setCurrentDeviceIdentifier(null);
      // Invalidate queries to get updated server data
      queryClient.invalidateQueries({ queryKey: createSubscriptionsQueryKey(address) });
      queryClient.invalidateQueries({ queryKey: ['webPushDeviceCheck', address] });
      setError(null);
    },
    onError: (error) => {
      console.error('Failed to unsubscribe from push notifications:', error);
      setError(error as Error);
    }
  });

  // Main functions
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!address) {
      throw new Error('Address is required');
    }

    if (!permissionState.isGranted) {
      // Try to request permission first
      const permission = await permissionState.requestPermission();

      if (permission !== 'granted') {
        return false;
      }
    }

    try {
      await subscribeMutation.mutateAsync();

      return true;
    } catch (error) {
      console.error('Subscribe failed:', error);

      return false;
    }
  }, [address, permissionState, subscribeMutation]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      await unsubscribeMutation.mutateAsync();

      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);

      return false;
    }
  }, [unsubscribeMutation]);

  // Derived states
  // Check if we're truly subscribed by verifying:
  // 1. We have a local browser subscription
  // 2. The device is registered on the server using device identifier
  // 3. The server subscription is active
  const isSubscribed =
    isClientSubscribed &&
    currentDeviceIdentifier !== null &&
    deviceSubscriptionData?.isSubscribed === true &&
    deviceSubscriptionData?.subscription?.isActive === true;

  const isEnabled = permissionState.isGranted && isSubscribed;
  const isReady = permissionState.isSupported && !!vapidPublicKey && !isLoadingSubscriptions && !isLoadingDeviceCheck;

  return {
    permission: {
      status: permissionState.permission,
      isSupported: permissionState.isSupported,
      isGranted: permissionState.isGranted,
      isDenied: permissionState.isDenied,
      isDefault: permissionState.isDefault,
      requestPermission: permissionState.requestPermission,
      isRequestingPermission: permissionState.isRequestingPermission
    },
    subscription: {
      isSubscribed,
      subscriptions: subscriptionsData,
      isLoading: isLoadingSubscriptions,
      isSubscribing: subscribeMutation.isPending,
      isUnsubscribing: unsubscribeMutation.isPending,
      subscribe,
      unsubscribe,
      refetchSubscriptions
    },
    isEnabled,
    isReady,
    error
  };
}
