// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import NotificationSettingContainer from './NotificationSettingContainer';

function NotificationSetting({ address }: { address: HexString }) {
  return <NotificationSettingContainer address={address} />;
}

export default NotificationSetting;
