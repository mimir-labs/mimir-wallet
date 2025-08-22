// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { BaseService } from './BaseService.js';

/**
 * Base asset information shared across all asset types
 */
interface BaseAssetInfo {
  /** Asset display name */
  readonly name: string;
  /** Asset symbol (e.g., DOT, KSM) */
  readonly symbol: string;
  /** Number of decimal places for the asset */
  readonly decimals: number;
  /** Minimum balance required to keep account alive */
  readonly existentialDeposit: string;
  /** Whether asset can pay for transaction fees */
  readonly isSufficient?: boolean;
}

/**
 * Native chain asset (e.g., DOT on Polkadot, KSM on Kusama)
 */
export interface NativeAssetInfo extends BaseAssetInfo {
  readonly isNative: true;
  readonly assetId?: never;
  readonly key?: never;
  readonly isForeignAsset?: never;
}

/**
 * Local asset on the chain (non-native but issued on this chain)
 */
export interface AssetInfo extends BaseAssetInfo {
  readonly assetId?: string;
  /** Encoded key for decoding events, transfers and balance queries */
  readonly key: HexString;
  readonly isNative?: never;
  readonly isForeignAsset?: never;
}

/**
 * Foreign asset from another chain (e.g., DOT on Acala)
 */
export interface ForeignAssetInfo extends BaseAssetInfo {
  readonly isForeignAsset: true;
  /** Encoded key for decoding events, transfers and balance queries */
  readonly key: HexString;
  readonly assetId?: string;
  readonly isNative?: never;
}

/**
 * Union type for all possible asset information types
 */
export type AnyAssetInfo = NativeAssetInfo | AssetInfo | ForeignAssetInfo;

/**
 * Enhanced XCM asset information with price and logo data
 * Intersects the base AnyAssetInfo with admin-configured metadata
 */
export interface EnhancedAssetInfo {
  /** USD price of the asset */
  price?: number;

  /** 24-hour price change percentage */
  priceChange?: number;

  /** Logo URI for the asset */
  logoUri?: string;

  /** CoinGecko ID used for price fetching (for reference) */
  coingeckoId?: string;

  /** Timestamp when price data was last updated */
  priceUpdatedAt?: number;
}

/**
 * Complete enhanced asset type combining base asset info with enhancements
 */
export type CompleteEnhancedAssetInfo = AnyAssetInfo & EnhancedAssetInfo;

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

  public getXcmAsset(chain: string, identifier: 'native' | HexString | string): Promise<CompleteEnhancedAssetInfo> {
    return this.get(`chains/${chain}/xcm-assets/${identifier}`);
  }
}
