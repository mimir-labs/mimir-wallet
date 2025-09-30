// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { SessionTypes } from '@walletconnect/types';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { useTxQueue } from '@/hooks/useTxQueue';
import { getSdkError } from '@walletconnect/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

import { SESSION_ADD_EVENT } from './constants';
import { WalletConnectContext } from './context';
import { getActiveSessions, init, sendSessionError, sendSessionResponse, web3Wallet } from './wallet-connect';

function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setReady] = useState(false);
  const [isError, setError] = useState(false);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [sessionProposal, setSessionProposal] = useState<Web3WalletTypes.SessionProposal>();
  const { current } = useAccount();
  const [, , , , promise] = useQueryAccountOmniChain(current);
  const handlerRef = useRef<(event: Web3WalletTypes.SessionRequest) => void>();
  const { networks, mode, enableNetwork } = useNetworks();
  const { genesisHash, network: currentNetwork, chainSS58 } = useApi();
  const { addQueue } = useTxQueue();

  handlerRef.current = async (event) => {
    const { id, topic, params } = event;
    const session = getActiveSessions().find((s) => s.topic === topic);

    switch (params.request.method) {
      case 'polkadot_signTransaction': {
        const payload: SignerPayloadJSON = params.request.params.transactionPayload;

        console.log('transactionPayload', payload);

        try {
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

          if (mode === 'omni') enableNetwork(network);

          addQueue({
            call: payload.method,
            accountId: encodeAddress(payload.address, chainSS58),
            network,
            // onlySign: true,
            website: session?.peer.metadata.url,
            iconUrl: session?.peer.metadata.icons?.[0],
            appName: session?.peer.metadata.name,
            alert: (
              <span className='font-normal'>
                When using WalletConnect, the app may show a failed message, but the transaction might still succeed.
                Please check the result in Mimir’s <b>Pending page</b> for accuracy.
              </span>
            ),
            onSignature: (signer, signature, signedTransaction, payload) => {
              sendSessionResponse(topic, {
                jsonrpc: '2.0',
                id,
                result: {
                  id,
                  signature,
                  signer,
                  payload,
                  ...(signedTransaction ? { signedTransaction } : {})
                }
              });
            },
            onResults: (data) => {
              sendSessionError(topic, {
                jsonrpc: '2.0',
                id,
                error: {
                  code: 9999,
                  message: 'Transaction sent in mimir, please check the transaction in the mimir wallet',
                  data: data.txHash.toHex()
                }
              });
            },
            onReject: () =>
              sendSessionError(topic, {
                jsonrpc: '2.0',
                id,
                error: getSdkError('USER_REJECTED_METHODS')
              })
          });
        } catch {
          return sendSessionError(topic, {
            jsonrpc: '2.0',
            id,
            error: getSdkError('UNAUTHORIZED_METHOD')
          });
        }

        break;
      }

      default:
        return sendSessionError(topic, {
          jsonrpc: '2.0',
          id,
          error: getSdkError('UNAUTHORIZED_METHOD')
        });
    }
  };

  useEffect(() => {
    init()
      .then(() => {
        setReady(true);
        web3Wallet.on('session_proposal', setSessionProposal);
        web3Wallet.on('session_request', (event) => {
          handlerRef.current?.(event);
          setSessions(getActiveSessions());
        });
        web3Wallet.on(SESSION_ADD_EVENT, () => {
          setSessions(getActiveSessions());
          setSessionProposal(undefined);
        });
        web3Wallet.on('session_delete', () => {
          setSessions(getActiveSessions());
          setSessionProposal(undefined);
        });
        web3Wallet.on('session_request_expire', () => {
          setSessions(getActiveSessions());
        });
        setSessions(getActiveSessions());
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  const deleteProposal = useCallback(() => {
    setSessionProposal(undefined);
  }, []);

  const state = useMemo(
    () => ({
      web3Wallet,
      isReady,
      isError,
      sessions,
      sessionProposal,
      deleteProposal
    }),
    [deleteProposal, isError, isReady, sessionProposal, sessions]
  );

  return <WalletConnectContext.Provider value={state}>{children}</WalletConnectContext.Provider>;
}

export default WalletConnectProvider;
