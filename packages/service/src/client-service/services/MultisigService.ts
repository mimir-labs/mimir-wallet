// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.js';

import { BaseService } from './BaseService.js';

export class MultisigService extends BaseService {
  public createMultisig(chain: string, who: HexString[], threshold: number, name?: string | null) {
    return this.post(`chains/${chain}/create-multisig`, { who, threshold, name });
  }

  public prepareMultisig(
    chain: string,
    creator: HexString,
    extrinsicHash: HexString,
    name: string,
    threshold?: number | null,
    who?: HexString[] | null,
    multisigName?: string
  ) {
    return this.post(`chains/${chain}/prepare-pure`, { creator, extrinsicHash, who, threshold, name, multisigName });
  }

  public pendingPrepareMultisig(chain: string, addresses: string[]) {
    return this.get(`chains/${chain}/prepare-pure/pending`, { addresses: addresses.join(',') });
  }
}
