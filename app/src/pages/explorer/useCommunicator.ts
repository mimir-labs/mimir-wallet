// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { State } from '@/communicator/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { encodeAddress, remoteProxyRelations, useChains, useNetwork, useSs58Format } from '@mimir-wallet/polkadot-core';
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { IframeCommunicator } from '@/communicator';
import { useTxQueue } from '@/hooks/useTxQueue';

export function useCommunicator(
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
  url: string,
  iconUrl?: string,
  appName?: string
): IframeCommunicator | null {
  const [communicator, setCommunicator] = useState<IframeCommunicator | null>(null);
  const { chain, network: currentNetwork } = useNetwork();
  const genesisHash = chain.genesisHash;
  const { ss58: chainSS58 } = useSs58Format();
  const { chains: networks, enableNetwork, mode } = useChains();
  const { addQueue } = useTxQueue();
  const { current } = useAccount();
  const { meta } = useAddressMeta(current);
  const [, , , , promise] = useQueryAccountOmniChain(current);

  const state: State = useMemo(
    () => ({
      genesisHash,
      extrinsicSign: async (payload: SignerPayloadJSON, id: string) => {
        console.log('payload', payload);
        const data = await promise;

        if (data && data.type === 'pure') {
          if (
            payload.genesisHash !== data.network &&
            !Object.values(remoteProxyRelations).includes(payload.genesisHash)
          ) {
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
              resolve({
                id,
                signature,
                signer,
                payload,
                ...(withSignedTransaction ? { signedTransaction } : {})
              } as any);
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
    }),
    [
      genesisHash,
      promise,
      mode,
      networks,
      currentNetwork,
      enableNetwork,
      url,
      chainSS58,
      addQueue,
      iconUrl,
      appName,
      current,
      meta
    ]
  );
  const stateRef = useRef<State>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const communicator: IframeCommunicator | undefined = new IframeCommunicator(iframeRef, stateRef);

    setCommunicator(communicator);
  }, [iframeRef]);

  return communicator;
}
