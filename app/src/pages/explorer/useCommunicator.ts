// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { State } from '@/communicator/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { IframeCommunicator } from '@/communicator';
import { useTxQueue } from '@/hooks/useTxQueue';
import { type MutableRefObject, useEffect, useRef, useState } from 'react';

import { encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

export function useCommunicator(
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
  url: string,
  iconUrl?: string,
  appName?: string
): IframeCommunicator | null {
  const [communicator, setCommunicator] = useState<IframeCommunicator | null>(null);
  const { genesisHash, chainSS58, network: currentNetwork } = useApi();
  const { networks, enableNetwork, mode } = useNetworks();
  const { addQueue } = useTxQueue();
  const { current } = useAccount();
  const { meta } = useAddressMeta(current);
  const [, , , , promise] = useQueryAccountOmniChain(current);

  const state: State = {
    genesisHash,
    extrinsicSign: async (payload: SignerPayloadJSON, id: string) => {
      console.log('payload', payload);
      const data = await promise;

      if (data && data.type === 'pure') {
        if (payload.genesisHash !== data.network) {
          throw new Error(`Network not supported for this account, only ${data.network} is supported`);
        }
      }

      let network: string | undefined;

      if (mode === 'omni') {
        network = networks.find((item) => item.genesisHash === payload.genesisHash)?.key;

        if (!network) {
          throw new Error(`Network not supported`);
        }
      } else {
        if (payload.genesisHash !== genesisHash) {
          throw new Error(`Network not supported`);
        }

        network = currentNetwork;
      }

      return new Promise((resolve, reject) => {
        if (mode === 'omni') enableNetwork(network);

        const website = new URL(url);
        const { withSignedTransaction } = payload;

        addQueue({
          call: payload.method,
          accountId: encodeAddress(payload.address, chainSS58),
          network,
          onlySign: true,
          website: website.origin,
          iconUrl,
          appName,
          onSignature: (signer, signature, signedTransaction, payload) => {
            resolve({ id, signature, signer, payload, ...(withSignedTransaction ? { signedTransaction } : {}) } as any);
          },
          onReject: () => reject(new Error('User reject'))
        });
      });
    },
    getAccounts: () => {
      if (!current) return [];

      return [
        {
          address: current,
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
