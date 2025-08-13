// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  getNotificationPermission,
  isNotificationPermissionSupported,
  isWebPushSupported,
  requestNotificationPermission
} from '@/utils/webPushUtils';
import { useCallback, useEffect, useState } from 'react';

export interface WebPushPermissionState {
  // Current permission status
  permission: NotificationPermission;
  // Whether Web Push is supported in this browser
  isSupported: boolean;
  // Whether permission API is supported
  isPermissionSupported: boolean;
  // Whether permission is granted
  isGranted: boolean;
  // Whether permission is denied
  isDenied: boolean;
  // Whether permission is default (not yet requested)
  isDefault: boolean;
  // Request permission function
  requestPermission: () => Promise<NotificationPermission>;
  // Refresh permission status
  refreshPermission: () => void;
  // Loading state for permission request
  isRequestingPermission: boolean;
}

/**
 * Hook for managing Web Push notification permissions
 * Handles browser support detection, permission status, and permission requests
 */
export function useWebPushPermission(): WebPushPermissionState {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check browser support
  const isSupported = isWebPushSupported();
  const isPermissionSupported = isNotificationPermissionSupported();

  // Derived states
  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';
  const isDefault = permission === 'default';

  // Refresh current permission status
  const refreshPermission = useCallback(() => {
    if (isPermissionSupported) {
      const currentPermission = getNotificationPermission();

      setPermission(currentPermission);
    }
  }, [isPermissionSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported || !isPermissionSupported) {
      return 'denied';
    }

    if (isRequestingPermission) {
      return permission;
    }

    setIsRequestingPermission(true);

    try {
      const result = await requestNotificationPermission();

      setPermission(result);

      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);

      return 'denied';
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isSupported, isPermissionSupported, isRequestingPermission, permission]);

  // Initialize permission status on mount
  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  // Listen for permission changes (some browsers support this)
  useEffect(() => {
    if (!isPermissionSupported || !navigator.permissions) {
      return;
    }

    let permissionQuery: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      refreshPermission();
    };

    // Try to listen for permission changes
    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((query) => {
        permissionQuery = query;
        query.addEventListener('change', handlePermissionChange);
      })
      .catch((error) => {
        console.log('Permission query not supported:', error);
      });

    return () => {
      if (permissionQuery) {
        permissionQuery.removeEventListener('change', handlePermissionChange);
      }
    };
  }, [isPermissionSupported, refreshPermission]);

  // Listen for visibility changes to refresh permission status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPermission();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshPermission]);

  return {
    permission,
    isSupported,
    isPermissionSupported,
    isGranted,
    isDenied,
    isDefault,
    requestPermission,
    refreshPermission,
    isRequestingPermission
  };
}
