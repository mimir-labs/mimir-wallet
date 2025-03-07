// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { BatchTxItem } from './hooks/types';

import Events from 'eventemitter3';

type EventTypes = {
  api_changed: (url: string) => void;
  account_meta_changed: (address: string) => void;
  favorite_dapp_added: (id: number) => void;
  favorite_dapp_removed: (id: number) => void;
  app_installed: () => void;
  app_updated: () => void;
  batch_tx_added: (value: BatchTxItem[], alert: boolean) => void;
  template_open: () => void;
  template_add: (callData: HexString) => void;
  call_data_view: (callData: HexString) => void;
};

export const events = new Events<EventTypes>();
