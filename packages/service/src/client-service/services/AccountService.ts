// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.js';

import { BaseService } from './BaseService.js';

export class AccountService extends BaseService {
  public getDetails(chain: string, address: string) {
    return this.get(`chains/${chain}/${address}/details`);
  }

  public getOmniChainDetails(address: string) {
    return this.get(`omni-chain/${address}/details`);
  }

  public updateAccountName(chain: string, address: string, name: string) {
    return this.patch(`chains/${chain}/${address}/update-name`, { name });
  }

  public ownedBy(chain: string, addresses: string[]) {
    return this.get(`chains/${chain}/owned-by`, { addresses: addresses.join(',') });
  }

  public omniChainOwnedBy(addresses: string[]) {
    return this.get(`omni-chain/owned-by`, { addresses: addresses.join(',') });
  }

  public addProposer(
    chain: string,
    address: string,
    proposer: string,
    signature: string,
    signer: string,
    time: string
  ) {
    return this.post(`chains/${chain}/${address}/add-proposer`, { proposer, signature, signer, time });
  }

  public removeProposer(
    chain: string,
    address: string,
    proposer: string,
    signature: string,
    signer: string,
    time: string
  ) {
    return this.put(`chains/${chain}/${address}/remove-proposer`, { proposer, signature, signer, time });
  }

  public utm(
    chain: string,
    address: HexString,
    utm: {
      utm_source: string;
      utm_medium?: string | null;
      utm_campaign?: string | null;
    }
  ) {
    return this.post(`chains/${chain}/${address}/utm`, utm);
  }

  public getMultiChainStats(addressHex: string) {
    return this.get(`stats/${addressHex}`);
  }

  public getChainStats(chain: string, addressHex: string) {
    return this.get(`chains/${chain}/${addressHex}/stats`);
  }
}
