// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.js';

import { BaseService } from './BaseService.js';

export class ChainService extends BaseService {
  public getMetadata(chain: string): Promise<Record<string, HexString>> {
    return this.get(`chains/${chain}/metadata`);
  }

  public updateCalldata(chain: string, calldata: HexString) {
    return this.post(`chains/${chain}/calldata`, { calldata });
  }

  public getCalldata(chain: string, hash: HexString) {
    return this.get(`chains/${chain}/calldata/${hash}`);
  }

  public safetyCheck(chain: string, method: HexString) {
    return this.post(`chains/${chain}/safety-check`, { method });
  }

  public getMigrationStatus() {
    return this.get(`migration/networks`);
  }
}
