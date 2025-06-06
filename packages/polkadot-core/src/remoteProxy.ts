// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { GenericExtrinsic } from '@polkadot/types';
import { blake2AsU8a, encodeMultiAddress } from '@polkadot/util-crypto';

import { allEndpoints, remoteProxyRelations } from './config.js';
import { createApi } from './initialize.js';
import { useAllApis } from './useApiStore.js';

function hasRemoteProxy(api: ApiPromise, tx: IMethod) {
  if (!api.tx.remoteProxyRelayChain) {
    return false;
  }

  let method = tx instanceof GenericExtrinsic ? tx.method : tx;

  while (true) {
    if (api.tx.remoteProxyRelayChain?.remoteProxyWithRegisteredProof?.is(method)) {
      method = api.createType('Call', method.args[2].toU8a());

      return true;
    } else if (api.tx.multisig?.asMulti?.is(method)) {
      const methodU8a = method.args[3].toU8a();

      method = api.createType('Call', methodU8a);
    } else if (api.tx.multisig?.asMultiThreshold1?.is(method)) {
      const methodU8a = method.args[1].toU8a();

      method = api.createType('Call', methodU8a);
    } else if (api.tx.proxy?.proxy?.is(method)) {
      method = api.createType('Call', method.args[2].toU8a());
    } else {
      break;
    }
  }

  return false;
}

// return the u8a of the call, not the extrinsic
export async function buildRemoteProxy(api: ApiPromise, tx: IMethod, address: string): Promise<Uint8Array> {
  if (!hasRemoteProxy(api, tx)) {
    return tx instanceof GenericExtrinsic ? tx.method.toU8a() : tx.toU8a();
  }

  const proxyAddresses: string[] = [];

  let method = tx instanceof GenericExtrinsic ? tx.method : tx;

  while (true) {
    if (api.tx.remoteProxyRelayChain?.remoteProxyWithRegisteredProof?.is(method)) {
      proxyAddresses.push(method.args[0].toString());
      address = method.args[0].toString();
      method = api.createType('Call', method.args[2].toU8a());
    } else if (api.tx.multisig?.asMulti?.is(method)) {
      const threshold = method.args[0].toNumber();
      const multisigAddress = encodeMultiAddress(
        method.args[1].map((item) => item.toString()).concat(address),
        threshold
      );
      const methodU8a = method.args[3].toU8a();
      const info = await api.query.multisig.multisigs(multisigAddress, blake2AsU8a(methodU8a));

      if (!info.isSome || info.unwrap().approvals.length < threshold - 1) {
        break;
      }

      address = multisigAddress;
      method = api.createType('Call', methodU8a);
    } else if (api.tx.multisig?.asMultiThreshold1?.is(method)) {
      const threshold = 1;
      const multisigAddress = encodeMultiAddress(
        method.args[0].map((item) => item.toString()).concat(address),
        threshold
      );
      const methodU8a = method.args[1].toU8a();

      address = multisigAddress;
      method = api.createType('Call', methodU8a);
    } else if (api.tx.proxy?.proxy?.is(method)) {
      address = method.args[0].toString();
      method = api.createType('Call', method.args[2].toU8a());
    } else {
      break;
    }
  }

  if (proxyAddresses.length === 0) {
    console.log(tx, tx instanceof GenericExtrinsic);

    return tx instanceof GenericExtrinsic ? tx.method.toU8a() : tx.toU8a();
  }

  const genesisHash = api.genesisHash.toHex();
  const remoteGenesisHash = Object.entries(remoteProxyRelations).find(([, value]) => value === genesisHash)?.[0];

  let remoteApi = Object.values(useAllApis.getState().chains).find(
    (chain) => chain.genesisHash === remoteGenesisHash
  )?.api;

  if (!remoteApi) {
    const chain = allEndpoints.find((chain) => chain.genesisHash === remoteGenesisHash);

    if (!chain) {
      throw new Error('Remote chain not support');
    }

    [remoteApi] = await createApi(Object.values(chain.wsUrl), chain.name, chain.httpUrl);
  }

  const blockToRoot = JSON.parse((await api.query.remoteProxyRelayChain.blockToRoot()) as any);
  // Get the latest block for which AH knows the storage root.
  const proofBlock = blockToRoot[blockToRoot.length - 1][0];
  const proofBlockHash = await remoteApi.rpc.chain.getBlockHash(proofBlock);

  const batchTxs: IMethod[] = [];

  for (const proxyAddress of proxyAddresses) {
    const proxyDefinitionKey = remoteApi.query.proxy.proxies.key(proxyAddress);
    const proof = await remoteApi.rpc.state.getReadProof([proxyDefinitionKey], proofBlockHash);

    batchTxs.unshift(
      api.tx.remoteProxyRelayChain.registerRemoteProxyProof({ RelayChain: { proof: proof.proof, block: proofBlock } })
        .method
    );
  }

  return api.tx.utility.batchAll(batchTxs.concat(tx instanceof GenericExtrinsic ? tx.method : tx)).method.toU8a();
}
