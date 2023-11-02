// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Events from 'eventemitter3';

type EventTypes = {
  api_changed: (url: string) => void;
  account_meta_changed: (address: string) => void;
};

export const events = new Events<EventTypes>();
