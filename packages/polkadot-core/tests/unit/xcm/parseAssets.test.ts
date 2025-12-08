// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SupportXcmChainConfig } from '../../../src/xcm/types.js';

import { describe, expect, it } from 'vitest';

import { parseAssets } from '../../../src/xcm/parseAssets.js';

// Mock chain config
const mockInitialChain: SupportXcmChainConfig = {
  isSupport: true,
  key: 'polkadot',
  name: 'Polkadot',
  icon: 'polkadot.svg',
  tokenIcon: 'dot.svg',
  genesisHash:
    '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  wsUrl: { Parity: 'wss://rpc.polkadot.io' },
};

// Helper to create mock location
function createMockLocation(
  parents: number,
  interiorType: string,
  interiorValue?: any,
) {
  const interior: any = {
    isHere: interiorType === 'Here',
    isX1: interiorType === 'X1',
    isX2: interiorType === 'X2',
  };

  if (interiorType === 'Here') {
    // No additional setup needed
  } else if (interiorType === 'X1') {
    interior.asX1 = [interiorValue];
  } else if (interiorType === 'X2') {
    interior.asX2 = interiorValue;
  }

  return {
    parents: { toNumber: () => parents },
    interior,
  };
}

// Helper to create mock V3 asset
function createMockV3Asset(
  isConcrete: boolean,
  isFungible: boolean,
  amount: string,
  location: any,
) {
  return {
    id: {
      isConcrete,
      asConcrete: location,
    },
    fun: {
      isFungible,
      asFungible: { toString: () => amount },
    },
  };
}

// Helper to create mock V4/V5 asset
function createMockV4V5Asset(
  isFungible: boolean,
  amount: string,
  location: any,
) {
  return {
    id: location,
    fun: {
      isFungible,
      asFungible: { toString: () => amount },
    },
  };
}

// Helper to create mock versioned assets
function createMockVersionedAssets(
  version: 'V3' | 'V4' | 'V5',
  assets: any[] | any,
) {
  return {
    isV3: version === 'V3',
    isV4: version === 'V4',
    isV5: version === 'V5',
    asV3: version === 'V3' ? assets : undefined,
    asV4: version === 'V4' ? assets : undefined,
    asV5: version === 'V5' ? assets : undefined,
    toHuman: () => ({ type: version, value: assets }),
  };
}

describe('parseAssets', () => {
  describe('V3 assets', () => {
    it('should parse V3 array of concrete fungible assets', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV3Asset(true, true, '1000000000000', location);
      const versionedAssets = createMockVersionedAssets('V3', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('1000000000000');
      expect(results[0].isNative).toBe(true);
    });

    it('should parse V3 single concrete fungible asset', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV3Asset(true, true, '5000000000', location);
      const versionedAssets = createMockVersionedAssets('V3', asset);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('5000000000');
    });

    it('should filter out non-concrete V3 assets', () => {
      const location = createMockLocation(0, 'Here');
      const concreteAsset = createMockV3Asset(true, true, '1000', location);
      const nonConcreteAsset = createMockV3Asset(false, true, '2000', location);
      const versionedAssets = createMockVersionedAssets('V3', [
        concreteAsset,
        nonConcreteAsset,
      ]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('1000');
    });

    it('should handle non-fungible V3 assets with amount 0', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV3Asset(true, false, '0', location);
      const versionedAssets = createMockVersionedAssets('V3', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('0');
    });

    it('should return empty array for non-concrete single V3 asset', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV3Asset(false, true, '1000', location);
      const versionedAssets = createMockVersionedAssets('V3', asset);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(0);
    });
  });

  describe('V4 assets', () => {
    it('should parse V4 array of assets', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(true, '2000000000000', location);
      const versionedAssets = createMockVersionedAssets('V4', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('2000000000000');
    });

    it('should parse V4 single asset', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(true, '3000000000000', location);
      const versionedAssets = createMockVersionedAssets('V4', asset);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('3000000000000');
    });

    it('should handle non-fungible V4 assets', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(false, '0', location);
      const versionedAssets = createMockVersionedAssets('V4', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('0');
    });
  });

  describe('V5 assets', () => {
    it('should parse V5 array of assets', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(true, '4000000000000', location);
      const versionedAssets = createMockVersionedAssets('V5', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('4000000000000');
    });

    it('should parse V5 single asset', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(true, '5000000000000', location);
      const versionedAssets = createMockVersionedAssets('V5', asset);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe('5000000000000');
    });
  });

  describe('Asset identification', () => {
    it('should identify native asset when no generalIndex or generalKey', () => {
      const location = createMockLocation(0, 'Here');
      const asset = createMockV4V5Asset(true, '1000', location);
      const versionedAssets = createMockVersionedAssets('V4', [asset]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results[0].isNative).toBe(true);
      expect(results[0].assetId).toBeNull();
      expect(results[0].assetKey).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw for unsupported version', () => {
      const unsupportedAssets = {
        isV3: false,
        isV4: false,
        isV5: false,
        isV2: true,
        asV2: [],
        toHuman: () => ({ type: 'V2' }),
      };

      expect(() =>
        parseAssets(unsupportedAssets as any, mockInitialChain),
      ).toThrow(/Unsupport XcmVersionedAssets version/);
    });

    it('should silently skip assets that fail to parse location', () => {
      // Create an asset with a location that will cause loopLocation to throw
      const badLocation = createMockLocation(5, 'Here'); // parents > 1 will cause error
      const asset = createMockV4V5Asset(true, '1000', badLocation);
      const versionedAssets = createMockVersionedAssets('V4', [asset]);

      // Should not throw, just return empty results
      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(0);
    });
  });

  describe('Multiple assets', () => {
    it('should parse multiple V4 assets', () => {
      const location1 = createMockLocation(0, 'Here');
      const location2 = createMockLocation(0, 'Here');
      const asset1 = createMockV4V5Asset(true, '1000', location1);
      const asset2 = createMockV4V5Asset(true, '2000', location2);
      const versionedAssets = createMockVersionedAssets('V4', [asset1, asset2]);

      const results = parseAssets(versionedAssets as any, mockInitialChain);

      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe('1000');
      expect(results[1].amount).toBe('2000');
    });
  });
});
