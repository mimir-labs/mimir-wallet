// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from './types.js';

import { fetcher } from '../fetcher.js';
import { jsonHeader } from './defaults.js';

export class ClientService {
  constructor(private readonly clientGateway: string) {}

  static create(clientGateway: string) {
    return new ClientService(clientGateway);
  }

  public getClientUrl(path: string) {
    const url = new URL('/v1/' + (path.startsWith('/') ? path.slice(1) : path), this.clientGateway);

    return url.toString();
  }

  public getMetadata(chain: string): Promise<Record<string, HexString>> {
    return fetcher(this.getClientUrl(`chains/${chain}/metadata`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public createMultisig(chain: string, who: HexString[], threshold: number, name?: string | null) {
    return fetcher(this.getClientUrl(`chains/${chain}/create-multisig`), {
      method: 'POST',
      body: JSON.stringify({ who, threshold, name }),
      headers: jsonHeader
    });
  }

  public getDetails(chain: string, address: string) {
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/details`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public getOmniChainDetails(address: string) {
    return fetcher(this.getClientUrl(`omni-chain/${address}/details`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public updateCalldata(chain: string, calldata: HexString) {
    return fetcher(this.getClientUrl(`chains/${chain}/calldata`), {
      method: 'POST',
      body: JSON.stringify({ calldata }),
      headers: jsonHeader
    });
  }

  public getCalldata(chain: string, hash: HexString) {
    return fetcher(this.getClientUrl(`chains/${chain}/calldata/${hash}`), {
      method: 'GET',
      headers: jsonHeader
    });
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
    return fetcher(this.getClientUrl(`chains/${chain}/prepare-pure`), {
      method: 'POST',
      body: JSON.stringify({ creator, extrinsicHash, who, threshold, name, multisigName }),
      headers: jsonHeader
    });
  }

  public updateAccountName(chain: string, address: HexString, name: string) {
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/update-name`), {
      method: 'PATCH',
      body: JSON.stringify({ name }),
      headers: jsonHeader
    });
  }

  public ownedBy(chain: string, addresses: string[]) {
    return fetcher(this.getClientUrl(`chains/${chain}/owned-by?addresses=${addresses.join(',')}`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public omniChainOwnedBy(addresses: string[]) {
    return fetcher(this.getClientUrl(`omni-chain/owned-by?addresses=${addresses.join(',')}`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public uploadWebsite(
    network: string,
    extrinsicHash: HexString,
    website?: string | null,
    appName?: string | null,
    iconUrl?: string | null,
    note?: string | null,
    relatedBatches?: number[]
  ): Promise<boolean> {
    return fetcher(this.getClientUrl(`chains/${network}/website`), {
      method: 'POST',
      body: JSON.stringify({ extrinsicHash, website, appName, iconUrl, note, relatedBatches }),
      headers: jsonHeader
    });
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
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/utm`), {
      method: 'POST',
      body: JSON.stringify(utm),
      headers: jsonHeader
    });
  }

  public safetyCheck(chain: string, method: HexString) {
    return fetcher(this.getClientUrl(`chains/${chain}/safety-check`), {
      method: 'POST',
      body: JSON.stringify({ method }),
      headers: jsonHeader
    });
  }

  public addProposer(
    chain: string,
    address: string,
    proposer: string,
    signature: string,
    signer: string,
    time: string
  ) {
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/add-proposer`), {
      method: 'POST',
      body: JSON.stringify({ proposer, signature, signer, time }),
      headers: jsonHeader
    });
  }

  public removeProposer(
    chain: string,
    address: string,
    proposer: string,
    signature: string,
    signer: string,
    time: string
  ) {
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/remove-proposer`), {
      method: 'PUT',
      body: JSON.stringify({ proposer, signature, signer, time }),
      headers: jsonHeader
    });
  }

  public submitPropose(
    network: string,
    address: string,
    call: HexString,
    signer: string,
    signature: string,
    time: string,
    appName?: string,
    iconUrl?: string,
    note?: string,
    website?: string
  ) {
    return fetcher(this.getClientUrl(`chains/${network}/${address}/transactions/propose`), {
      method: 'POST',
      body: JSON.stringify({ call, signer, signature, time, appName, iconUrl, note, website }),
      headers: jsonHeader
    });
  }

  public removePropose(network: string, proposeId: number, signer: string, signature: string, time: string) {
    return fetcher(this.getClientUrl(`chains/${network}/transactions/propose/${proposeId}/remove`), {
      method: 'PUT',
      body: JSON.stringify({ signer, signature, time }),
      headers: jsonHeader
    });
  }

  public getAllAssets(network: string) {
    return fetcher(this.getClientUrl(`chains/${network}/all-assets`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public removeBatch(
    chain: string,
    address: string,
    ids: number[],
    signature: string,
    signer: string,
    timestamp: string | number
  ) {
    return fetcher(this.getClientUrl(`chains/${chain}/${address}/transactions/batch/remove`), {
      method: 'POST',
      body: JSON.stringify({ ids, signature, signer, timestamp }),
      headers: jsonHeader
    });
  }
}
