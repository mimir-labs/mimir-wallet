// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useWebPush } from '@/hooks/useWebPush';
import { useCallback } from 'react';

import { Alert, AlertDescription, Button, Card, Spinner, Switch } from '@mimir-wallet/ui';

interface WebPushNotificationSettingProps {
  address: HexString;
}

function WebPushNotificationSetting({ address }: WebPushNotificationSettingProps) {
  const webPush = useWebPush(address);

  // Handle enabling/disabling notifications
  const handleToggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        if (!webPush.permission.isGranted) {
          await webPush.permission.requestPermission();
        }

        if (webPush.permission.isGranted && !webPush.subscription.isSubscribed) {
          await webPush.subscription.subscribe();
        }
      } else {
        await webPush.subscription.unsubscribe();
      }
    },
    [webPush]
  );

  const isNotificationEnabled = webPush.subscription.isSubscribed;

  if (!webPush.permission.isSupported) {
    return (
      <div>
        <h6 className='text-foreground/50 mb-2.5 text-sm'>Push Notifications</h6>
        <Card className='gap-2.5 p-4 sm:p-5'>
          <Alert>
            <AlertDescription>
              Web Push notifications are not supported in your browser. Please use a modern browser like Chrome,
              Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h6 className='text-foreground/50 mb-2.5 text-sm'>Push Notifications</h6>
      <Card className='gap-2.5 p-4 sm:p-5'>
        <div className='flex items-center justify-between'>
          <b>Push Notification</b>
          <Switch
            size='sm'
            isSelected={isNotificationEnabled}
            onValueChange={handleToggleNotifications}
            isDisabled={webPush.subscription.isSubscribing || webPush.subscription.isUnsubscribing}
          />
        </div>

        <p className='text-foreground/50 text-xs'>
          Enable push notifications for this Account in your browser. You will receive all transaction notifications
          across all supported chains.
        </p>

        {/* Permission Status */}
        {webPush.permission.isDenied && (
          <Alert variant='destructive' className='mt-2'>
            <AlertDescription className='text-xs'>
              Notifications are blocked. Please enable them in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {webPush.permission.isDefault && (
          <Button
            size='sm'
            variant='ghost'
            onClick={webPush.permission.requestPermission}
            disabled={webPush.permission.isRequestingPermission}
            className='mt-2'
          >
            {webPush.permission.isRequestingPermission ? <Spinner size='sm' /> : 'Grant Permission'}
          </Button>
        )}
      </Card>

      {/* Error Display */}
      {webPush.error && (
        <Alert variant='destructive' className='mt-2.5'>
          <AlertDescription>{webPush.error.message || 'An error occurred with push notifications'}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default WebPushNotificationSetting;
