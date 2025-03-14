// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from './types.js';

import { fetcher } from '../fetcher.js';
import { jsonHeader } from './defaults.js';

export class ClientService {
  constructor(
    private readonly clientGateway: string,
    private readonly networkService: string
  ) {}

  static create(clientGateway: string, networkService: string) {
    return new ClientService(clientGateway, networkService);
  }

  public getNetworkUrl(path: string) {
    const url = new URL(path, this.networkService);

    return url.toString();
  }

  public getClientUrl(path: string) {
    const url = new URL(path, this.clientGateway);

    return url.toString();
  }

  public getMetadata(): Promise<Record<string, HexString>> {
    return fetcher(this.getNetworkUrl('metadata'), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public createMultisig(who: HexString[], threshold: number, name?: string | null, isValid = true) {
    return fetcher(this.getNetworkUrl('multisig'), {
      method: 'POST',
      body: JSON.stringify({ who, threshold, name, isValid }),
      headers: jsonHeader
    });
  }

  public getFullAccount(address: string) {
    return fetcher(this.getNetworkUrl(`accounts/full/${address}`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public updateCalldata(calldata: HexString) {
    return fetcher(this.getNetworkUrl('calldata'), {
      method: 'POST',
      body: JSON.stringify({ calldata }),
      headers: jsonHeader
    });
  }

  public prepareMultisig(
    creator: HexString,
    extrinsicHash: HexString,
    name: string,
    threshold?: number | null,
    who?: HexString[] | null
  ) {
    return fetcher(this.getNetworkUrl('multisig/prepare'), {
      method: 'POST',
      body: JSON.stringify({ creator, extrinsicHash, who, threshold, name }),
      headers: jsonHeader
    });
  }

  public updatePrepareMultisig(extrinsicHash: HexString, name: string, threshold: number, who: HexString[]) {
    return fetcher(this.getNetworkUrl('multisig/prepare'), {
      method: 'PATCH',
      body: JSON.stringify({ extrinsicHash, who, threshold, name }),
      headers: jsonHeader
    });
  }

  public updateAccountName(address: HexString, name: string) {
    return fetcher(this.getNetworkUrl(`multisig/${address}`), {
      method: 'PATCH',
      body: JSON.stringify({ name }),
      headers: jsonHeader
    });
  }

  public getMultisigs(addresses: string[]) {
    return fetcher(this.getNetworkUrl(`multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public uploadWebsite(
    extrinsicHash: HexString,
    website?: string | null,
    appName?: string | null,
    iconUrl?: string | null,
    note?: string | null,
    relatedBatches?: number[]
  ): Promise<boolean> {
    return fetcher(this.getNetworkUrl('website'), {
      method: 'POST',
      body: JSON.stringify({ extrinsicHash, website, appName, iconUrl, note, relatedBatches }),
      headers: jsonHeader
    });
  }

  public utm(
    address: HexString,
    utm: {
      utm_source: string;
      utm_medium?: string | null;
      utm_campaign?: string | null;
    }
  ) {
    return fetcher(this.getNetworkUrl(`utm/${address}`), {
      method: 'POST',
      body: JSON.stringify(utm),
      headers: jsonHeader
    });
  }

  public safetyCheck(method: HexString) {
    return fetcher(this.getNetworkUrl('safety-check'), {
      method: 'POST',
      body: JSON.stringify({ method }),
      headers: jsonHeader
    });
  }

  public getAccount(address: string) {
    return fetcher(this.getNetworkUrl(`accounts/full/${address}`), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  public addProposer(address: string, proposer: string, signature: string, signer: string, time: string) {
    return fetcher(this.getNetworkUrl(`accounts/${address}/proposer/add`), {
      method: 'POST',
      body: JSON.stringify({ proposer, signature, signer, time }),
      headers: jsonHeader
    });
  }

  public removeProposer(address: string, proposer: string, signature: string, signer: string, time: string) {
    return fetcher(this.getNetworkUrl(`accounts/${address}/proposer/remove`), {
      method: 'PUT',
      body: JSON.stringify({ proposer, signature, signer, time }),
      headers: jsonHeader
    });
  }

  public submitPropose(
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
    return fetcher(this.getNetworkUrl(`tx/propose/${address}`), {
      method: 'POST',
      body: JSON.stringify({ call, signer, signature, time, appName, iconUrl, note, website }),
      headers: jsonHeader
    });
  }

  public removePropose(proposeId: number, signer: string, signature: string, time: string) {
    return fetcher(this.getNetworkUrl(`tx/propose/${proposeId}/remove`), {
      method: 'PUT',
      body: JSON.stringify({ signer, signature, time }),
      headers: jsonHeader
    });
  }

  public restoreBatch(chain: string, address: string) {
    return fetcher(this.getClientUrl(`/v1/chains/${chain}/${address}/transactions/batch`), {
      method: 'GET',
      headers: jsonHeader
    });
  }
}
