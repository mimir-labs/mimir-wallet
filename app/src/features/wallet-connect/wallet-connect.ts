// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { JsonRpcError, JsonRpcResponse } from '@walletconnect/jsonrpc-utils';
import type { SessionTypes } from '@walletconnect/types';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';
import type Web3WalletType from '@walletconnect/web3wallet';

import { LS_NAMESPACE, WALLET_CONNECT_PROJECT_ID } from '@/constants';
import { assert } from '@polkadot/util';
import { Core } from '@walletconnect/core';
import { getSdkError } from '@walletconnect/utils';
import { Web3Wallet } from '@walletconnect/web3wallet';

import { allEndpoints } from '@mimir-wallet/polkadot-core';

import { MIMIR_WALLET_METADATA, PolkadotMethods, SESSION_ADD_EVENT, SESSION_REJECT_EVENT } from './constants';
import { getPolkadotChain, POLKADOT_NAMESPACE } from './utils';

export let web3Wallet: Web3WalletType;

function assertWeb3Wallet() {
  assert(web3Wallet, 'WalletConnect not initialized');
}

// @internal only call once when app is initialize
export async function init(): Promise<Web3WalletType> {
  if (web3Wallet) return web3Wallet;

  const core = new Core({
    projectId: WALLET_CONNECT_PROJECT_ID,
    logger: import.meta.env.PROD ? undefined : 'debug',
    customStoragePrefix: LS_NAMESPACE
  });

  const instance = await Web3Wallet.init({
    core,
    metadata: MIMIR_WALLET_METADATA
  });

  web3Wallet ||= instance;

  return web3Wallet;
}

export async function connect(uri: string) {
  assertWeb3Wallet();

  init();

  return web3Wallet.core.pairing.pair({ uri });
}

export async function approveSession(proposal: Web3WalletTypes.SessionProposal, account: AccountData) {
  console.log('approveSession', proposal);
  assertWeb3Wallet();

  const requiredChains = proposal.params.requiredNamespaces?.[POLKADOT_NAMESPACE]?.chains || [];
  const optionalChains = proposal.params.optionalNamespaces?.[POLKADOT_NAMESPACE]?.chains || [];
  const mimirChains = allEndpoints.map((endpoint) => getPolkadotChain(endpoint.genesisHash));
  const chains = Array.from(new Set([...requiredChains, ...optionalChains, ...mimirChains]));

  // Approve the session proposal
  const session = await web3Wallet.approveSession({
    id: proposal.id,
    namespaces: {
      [POLKADOT_NAMESPACE]: {
        accounts: chains.map((chain) => {
          return `${chain}:${account.address}`;
        }),
        methods: proposal.params.requiredNamespaces?.[POLKADOT_NAMESPACE]?.methods || Object.values(PolkadotMethods),
        events: proposal.params.requiredNamespaces?.[POLKADOT_NAMESPACE]?.events || []
      }
    }
  });

  // Workaround: WalletConnect doesn't have a session_add event
  web3Wallet.events.emit(SESSION_ADD_EVENT, session);
}

export async function rejectSession(proposal: Web3WalletTypes.SessionProposal) {
  assertWeb3Wallet();

  await web3Wallet.rejectSession({
    id: proposal.id,
    reason: getSdkError('USER_REJECTED')
  });

  // Workaround: WalletConnect doesn't have a session_reject event
  web3Wallet.events.emit(SESSION_REJECT_EVENT, proposal);
}

export async function disconnectSession(session: SessionTypes.Struct) {
  assertWeb3Wallet();

  await web3Wallet.disconnectSession({
    topic: session.topic,
    reason: getSdkError('USER_DISCONNECTED')
  });

  web3Wallet.events.emit('session_delete', session);
}

export function getActiveSessions(): SessionTypes.Struct[] {
  const sessionsMap = web3Wallet?.getActiveSessions() || {};

  return Object.values(sessionsMap);
}

export async function sendSessionResponse(topic: string, response: JsonRpcResponse<unknown>) {
  assertWeb3Wallet();

  return web3Wallet.respondSessionRequest({ topic, response });
}

export async function sendSessionError(topic: string, response: JsonRpcError) {
  assertWeb3Wallet();

  return web3Wallet.respondSessionRequest({ topic, response });
}
