// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { State } from '@mimir-wallet/communicator/types';

import { type MutableRefObject, useEffect, useRef, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { IframeCommunicator } from '@mimir-wallet/communicator';
import { useAddressMeta, useApi, useSelectedAccount, useTxQueue } from '@mimir-wallet/hooks';

export function useCommunicator(
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
  url: string,
  iconUrl?: string,
  appName?: string
): IframeCommunicator | null {
  const [communicator, setCommunicator] = useState<IframeCommunicator | null>(null);
  const { api, genesisHash } = useApi();
  const { addQueue } = useTxQueue();
  const selected = useSelectedAccount();
  const { meta } = useAddressMeta(selected);

  const state: State = {
    genesisHash,
    extrinsicSign: (payload: SignerPayloadJSON, id: string) => {
      console.log(payload);

      if (payload.genesisHash && payload.genesisHash !== api.genesisHash.toHex()) {
        throw new Error(`Extrinsic genesisHash error, only supported ${api.runtimeChain.toString()}`);
      }

      const call = api.registry.createType('Call', payload.method);

      const website = new URL(url);

      return new Promise((resolve, reject) => {
        addQueue({
          call: api.tx[call.section][call.method](...call.args),
          accountId: encodeAddress(payload.address),
          onlySign: true,
          website: website.origin,
          iconUrl,
          appName,
          onSignature: (signer, signature, tx, payload) => {
            console.log(payload);
            resolve({ id, signature, signer, payload } as any);
          },
          onReject: () => reject(new Error('User reject'))
        });
      });
    },
    getAccounts: () => {
      if (!selected) return [];

      return [
        {
          address: selected,
          name: meta?.name,
          type: (meta?.cryptoType || 'ed25519') as 'ed25519' // for polkadot-api
        }
      ];
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
