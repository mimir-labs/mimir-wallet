// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { SpRuntimeDispatchError } from '@polkadot/types/lookup';

export class TxDispatchError extends Error {}
export class TxModuleError extends TxDispatchError {
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

// @internal assetDispatchError
// @description Parse dispatch error
export function assetDispatchError(api: ApiPromise, dispatch: DispatchError | SpRuntimeDispatchError): Error {
  if (dispatch.isModule) {
    const error = api.registry.findMetaError(dispatch.asModule);

    return new TxModuleError(`Cause by ${error.section}.${error.method}`, error.section, error.method, error.docs);
  }

  if (dispatch.isToken) {
    return new TxDispatchError(`Token Error: ${dispatch.asToken.type}`);
  }

  if (dispatch.isArithmetic) {
    return new TxDispatchError(`Arithmetic Error: ${dispatch.asArithmetic.type}`);
  }

  if (dispatch.isTransactional) {
    return new TxDispatchError(`Transactional Error: ${dispatch.asTransactional.type}`);
  }

  return new TxDispatchError(`Dispatch Error: ${dispatch.type}`);
}
