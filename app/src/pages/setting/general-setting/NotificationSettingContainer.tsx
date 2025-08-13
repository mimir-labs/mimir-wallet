// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import EmailNotificationSetting from './EmailNotificationSetting';
import WebPushNotificationSetting from './WebPushNotificationSetting';

interface NotificationSettingContainerProps {
  address: HexString;
}

function NotificationSettingContainer({ address }: NotificationSettingContainerProps) {
  return (
    <div className='flex flex-col gap-5'>
      {/* Web Push Notifications */}
      <WebPushNotificationSetting address={address} />

      {/* Email Notifications */}
      <EmailNotificationSetting address={address} />
    </div>
  );
}

export default NotificationSettingContainer;
