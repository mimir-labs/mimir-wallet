// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypes, TransportResponseMessage } from '@polkadot/extension-base/background/types';
import type { Message } from '@polkadot/extension-base/types';

import { MESSAGE_ORIGIN_WALLET } from './defaults';
import { injectExtension } from './inject';
import { enable, handleResponse } from './Injected';

function inject() {
  injectExtension(enable, {
    name: 'mimir',
    version: process.env.VERSION
  });
}

function isValidMessage({ data, source }: Message): boolean {
  const emptyOrMalformed = !data;
  const sentFromParentEl = source === parent;

  return !emptyOrMalformed && sentFromParentEl && data.origin === MESSAGE_ORIGIN_WALLET;
}

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', (message: Message): void => {
  if (isValidMessage(message)) {
    const { data } = message;

    if (data.id) {
      handleResponse(data as TransportResponseMessage<MessageTypes>);
    } else {
      console.error('Missing id for response.');
    }
  }
});

inject();
