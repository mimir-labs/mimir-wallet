// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseService } from './BaseService.js';

export class AssetService extends BaseService {
  public getAllAssets(chain: string) {
    return this.get(`chains/${chain}/all-assets`);
  }

  public getAssetsByAddress(chain: string, addressHex: string) {
    return this.get(`chains/${chain}/balances/${addressHex}`);
  }

  public getAssetsAll() {
    return this.get(`assets/all`);
  }

  public getAssetsByAddressAll(addressHex: string) {
    return this.get(`balances/all/${addressHex}`);
  }

  public getTokenInfo(chain: string) {
    return this.get(`chains/${chain}/token`);
  }

  public getTokenInfoAll() {
    return this.get(`token/all`);
  }

  public forceUpdateAssetsByAddressAll(addressHex: string) {
    return this.post(`balances/all/${addressHex}/update`);
  }
}
