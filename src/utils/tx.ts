// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import type { Callback, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { web3FromSource } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { assert } from '@polkadot/util';
import { addressEq } from '@polkadot/util-crypto';

import { AccountSigner, api } from '@mimirdev/api';

type Options = {
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
  onHash?: (hash: HexString) => void;
  onStatus?: Callback<ISubmittableResult>;
  checkProxy?: boolean;
};

export class TxDispatchError extends Error {}
export class TxModuleError extends Error {
  public section: string;
  public method: string;
  public docs: string[];

  constructor(message: string, section: string, method: string, docs: string[]) {
    super(message);
    this.section = section;
    this.method = method;
    this.docs = docs;
  }

  public get shortMessage(): string {
    return `${this.section}.${this.method}: ${this.docs.join('\n')}`;
  }
}

function _assetDispatchError(dispatch: DispatchError | SpRuntimeDispatchError): Error {
  if (dispatch.isModule) {
    const error = api.registry.findMetaError(dispatch.asModule);

    return new TxModuleError(`Cause by ${error.section}.${error.method}: ${error.docs.join('\n')}`, error.section, error.method, error.docs);
  } else if (dispatch.isToken) {
    return new TxDispatchError(`Token Error: ${dispatch.asToken.type}`);
  } else if (dispatch.isArithmetic) {
    return new TxDispatchError(`Arithmetic Error: ${dispatch.asArithmetic.type}`);
  } else if (dispatch.isTransactional) {
    return new TxDispatchError(`Transactional Error: ${dispatch.asTransactional.type}`);
  } else {
    return new TxDispatchError(`Dispatch Error: ${dispatch.type}`);
  }
}

async function extractParams(api: ApiPromise, address: string): Promise<Partial<SignerOptions>> {
  const pair = keyring.getPair(address);
  const {
    meta: { isInjected, source }
  } = pair;

  if (isInjected) {
    const injected = await web3FromSource(source as string);

    assert(injected, `Unable to find a signer for ${address}`);

    return { signer: injected.signer };
  }

  assert(addressEq(address, pair.address), `Unable to retrieve keypair for ${address}`);

  return { signer: new AccountSigner(api.registry, pair) };
}

export function checkSubmittableResult(result: ISubmittableResult, checkProxy = false) {
  if (result.isError) {
    if (result.dispatchError) {
      throw _assetDispatchError(result.dispatchError);
    }

    if (result.internalError) {
      throw result.internalError;
    }
  }

  if (checkProxy) {
    for (const { event } of result.events) {
      if (!api.events.proxy.ProxyExecuted.is(event)) continue;

      if (event.data.result.isErr) {
        throw _assetDispatchError(event.data.result.asErr);
      }
    }
  }

  return result;
}

export async function signAndSend(extrinsic: SubmittableExtrinsic<'promise'>, signer: string, { beforeSend, checkProxy = false, onHash, onStatus }: Options = {}): Promise<ISubmittableResult> {
  onHash?.(extrinsic.hash.toHex());

  await extrinsic.signAsync(signer, await extractParams(api, signer));

  const result = await api.call.blockBuilder.applyExtrinsic(extrinsic);

  if (result.isErr) {
    if (result.asErr.isInvalid) {
      throw new Error(`Invalid Transaction: ${result.asErr.asInvalid.type}`);
    } else {
      throw new Error(`Unknown Error: ${result.asErr.asUnknown.type}`);
    }
  } else if (result.asOk.isErr) {
    throw _assetDispatchError(result.asOk.asErr);
  } else {
    await beforeSend?.(extrinsic);

    return new Promise((resolve, reject) => {
      const unsubPromise = extrinsic.send((result) => {
        onStatus?.(result);

        if (result.isInBlock) {
          try {
            resolve(checkSubmittableResult(result, checkProxy));
            unsubPromise.then((unsub) => unsub());
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
}
