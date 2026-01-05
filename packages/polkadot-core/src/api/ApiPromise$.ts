// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';

export class ApiPromise$ extends ApiPromise {
  get provider() {
    return this._rpcCore.provider;
  }
}
