// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { State } from '@mimir-wallet/communicator/types';
import type { MessageTypes, TransportRequestMessage, TransportResponseMessage } from '@polkadot/extension-base/background/types';
import type { Message } from '@polkadot/extension-base/types';
import type { MutableRefObject } from 'react';

import { MESSAGE_ORIGIN_WALLET } from '@mimirdev/inject/defaults';

import { Communicator } from './communicator';

export class IframeCommunicator extends Communicator {
  private iframeRef: MutableRefObject<HTMLIFrameElement | null>;

  constructor(iframeRef: MutableRefObject<HTMLIFrameElement | null>, state: MutableRefObject<State>) {
    super(state);

    this.iframeRef = iframeRef;

    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = (message: Message): void => {
    if (this.iframeRef.current?.contentWindow !== message.source) {
      return;
    }

    const data: TransportRequestMessage<MessageTypes> = message.data as TransportRequestMessage<MessageTypes>;

    this.handle(data)
      .then((response) => {
        this.iframeRef.current?.contentWindow?.postMessage(
          {
            id: data.id,
            origin: MESSAGE_ORIGIN_WALLET,
            response
          } as TransportResponseMessage<MessageTypes>,
          '*'
        );
      })
      .catch((error) => {
        this.iframeRef.current?.contentWindow?.postMessage(
          {
            id: data.id,
            origin: MESSAGE_ORIGIN_WALLET,
            error: error.message || 'Unknown error'
          } as TransportResponseMessage<MessageTypes>,
          '*'
        );
      });
  };
}
