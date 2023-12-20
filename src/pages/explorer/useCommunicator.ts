// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { State } from '@mimir-wallet/communicator/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { IframeCommunicator } from '@mimir-wallet/communicator';
import { useApi, useSelectedAccount, useTxQueue } from '@mimir-wallet/hooks';
import { service } from '@mimir-wallet/utils';
import keyring from '@polkadot/ui-keyring';
import { type MutableRefObject, useEffect, useRef, useState } from 'react';

export function useCommunicator(iframeRef: MutableRefObject<HTMLIFrameElement | null>, url: string): IframeCommunicator | null {
  const [communicator, setCommunicator] = useState<IframeCommunicator | null>(null);
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const selected = useSelectedAccount();

  const state: State = {
    extrinsicSign: (payload: SignerPayloadJSON, id: string) => {
      const call = api.registry.createType('Call', payload.method);

      const website = new URL(url);

      return new Promise((resolve, reject) => {
        addQueue({
          extrinsic: api.tx[call.section][call.method](...call.args),
          accountId: payload.address,
          onlySign: true,
          website: website.origin,
          onSignature: (signer, signature, tx, payload) => {
            service.uploadWebsite(tx.hash.toHex(), website.origin);
            resolve({ id, signature, signer, payload } as any);
          },
          onReject: () => reject(new Error('User reject'))
        });
      });
    },
    getAccounts: () => {
      if (!selected) return [];

      const meta = keyring.getAccount(selected)?.meta;

      if (meta?.isMultisig) {
        return [
          {
            address: selected,
            genesisHash: meta.genesisHash,
            name: meta.name,
            type: meta.type
          }
        ];
      } else {
        return [];
      }
    }
  };
  const stateRef = useRef<State>(state);

  stateRef.current = state;

  useEffect(() => {
    const communicator: IframeCommunicator | undefined = new IframeCommunicator(iframeRef, stateRef);

    setCommunicator(communicator);
  }, [iframeRef]);

  return communicator;
}
