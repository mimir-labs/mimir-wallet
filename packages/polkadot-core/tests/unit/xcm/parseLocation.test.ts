// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  parseAccountFromLocation,
  parseJunctions,
  parseLocationChain,
  XcmNetworkNotSupportError
} from '../../../src/xcm/parseLocation.js';

// Mock junction types
function createMockJunction(type: string, value: any) {
  const junction: any = {
    isHere: false,
    isX1: false,
    isX2: false,
    isX3: false,
    isX4: false,
    isX5: false,
    isX6: false,
    isX7: false,
    isX8: false,
    isParachain: false,
    isAccountId32: false,
    isPalletInstance: false,
    isGeneralIndex: false,
    isGeneralKey: false
  };

  if (type === 'Here') {
    junction.isHere = true;
  } else if (type.startsWith('X')) {
    const key = `is${type}` as keyof typeof junction;
    const asKey = `as${type}` as keyof typeof junction;

    junction[key] = true;
    junction[asKey] = value;
  }

  return junction;
}

// Mock XCM versioned location
function createMockVersionedLocation(version: 'V3' | 'V4' | 'V5', parents: number, interior: any) {
  const location: any = {
    isV3: false,
    isV4: false,
    isV5: false
  };

  const versionKey = `is${version}` as keyof typeof location;
  const asVersionKey = `as${version}` as keyof typeof location;

  location[versionKey] = true;
  location[asVersionKey] = {
    parents: { toNumber: () => parents },
    interior
  };

  return location;
}

// Mock interior junction items
function createMockInteriorJunction(type: string, value: any) {
  const junction: any = {
    isParachain: false,
    isAccountId32: false,
    isPalletInstance: false,
    isGeneralIndex: false,
    isGeneralKey: false
  };

  if (type === 'Parachain') {
    junction.isParachain = true;
    junction.asParachain = { toNumber: () => value };
  } else if (type === 'AccountId32') {
    junction.isAccountId32 = true;
    junction.asAccountId32 = { id: { toString: () => value } };
  } else if (type === 'PalletInstance') {
    junction.isPalletInstance = true;
    junction.asPalletInstance = { toNumber: () => value };
  } else if (type === 'GeneralIndex') {
    junction.isGeneralIndex = true;
    junction.asGeneralIndex = { toString: () => value };
  } else if (type === 'GeneralKey') {
    junction.isGeneralKey = true;
    junction.asGeneralKey = {
      data: { toHex: () => value },
      toHuman: () => ({ data: value })
    };
  }

  return junction;
}

describe('parseLocation', () => {
  describe('XcmNetworkNotSupportError', () => {
    it('should create error with paraId', () => {
      const error = new XcmNetworkNotSupportError(1000);

      expect(error.paraId).toBe(1000);
      expect(error.message).toBe('Network not supported(ParachainID:1000)');
    });

    it('should be instance of Error', () => {
      const error = new XcmNetworkNotSupportError(2000);

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('parseJunctions', () => {
    it('should return empty array for Here junction', () => {
      const junction = createMockJunction('Here', null);
      const result = parseJunctions(junction);

      expect(result).toEqual([]);
    });

    it('should parse X1 junction with single value', () => {
      const innerJunction = createMockInteriorJunction('Parachain', 1000);
      const junction = createMockJunction('X1', innerJunction);
      const result = parseJunctions(junction);

      expect(result).toHaveLength(1);
    });

    it('should parse X1 junction with array value', () => {
      const innerJunction = createMockInteriorJunction('Parachain', 1000);
      const junction = createMockJunction('X1', [innerJunction]);
      const result = parseJunctions(junction);

      expect(result).toHaveLength(1);
    });

    it('should parse X2 junction with two values', () => {
      const parachainJunction = createMockInteriorJunction('Parachain', 1000);
      const accountJunction = createMockInteriorJunction(
        'AccountId32',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      );
      const junction = createMockJunction('X2', [parachainJunction, accountJunction]);
      const result = parseJunctions(junction);

      expect(result).toHaveLength(2);
    });

    it('should throw error for invalid junction', () => {
      const invalidJunction = {
        isHere: false,
        isX1: false,
        isX2: false,
        isX3: false,
        isX4: false,
        isX5: false,
        isX6: false,
        isX7: false,
        isX8: false
      };

      expect(() => parseJunctions(invalidJunction as any)).toThrow('Cannot parse junctions');
    });
  });

  describe('parseLocationChain', () => {
    it('should parse V3 location', () => {
      const interior = createMockJunction('Here', null);
      const location = createMockVersionedLocation('V3', 0, interior);
      const result = parseLocationChain(location);

      expect(result.parents).toBe(0);
      expect(result.interiors).toEqual([]);
    });

    it('should parse V4 location', () => {
      const interior = createMockJunction('Here', null);
      const location = createMockVersionedLocation('V4', 1, interior);
      const result = parseLocationChain(location);

      expect(result.parents).toBe(1);
    });

    it('should parse V5 location', () => {
      const interior = createMockJunction('Here', null);
      const location = createMockVersionedLocation('V5', 2, interior);
      const result = parseLocationChain(location);

      expect(result.parents).toBe(2);
    });

    it('should parse location with X1 interior', () => {
      const innerJunction = createMockInteriorJunction('Parachain', 1000);
      const interior = createMockJunction('X1', [innerJunction]);
      const location = createMockVersionedLocation('V3', 1, interior);
      const result = parseLocationChain(location);

      expect(result.parents).toBe(1);
      expect(result.interiors).toHaveLength(1);
    });

    it('should throw error for unsupported version', () => {
      const location = {
        isV3: false,
        isV4: false,
        isV5: false,
        isV1: true,
        asV1: {}
      };

      expect(() => parseLocationChain(location as any)).toThrow('Unknown version for XcmVersionedLocation');
    });
  });

  describe('parseAccountFromLocation', () => {
    it('should return null for empty interiors', () => {
      const interior = createMockJunction('Here', null);
      const location = createMockVersionedLocation('V3', 0, interior);
      const result = parseAccountFromLocation(location);

      expect(result).toBeNull();
    });

    it('should extract AccountId32 from location', () => {
      const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const accountJunction = createMockInteriorJunction('AccountId32', accountAddress);
      const interior = createMockJunction('X1', [accountJunction]);
      const location = createMockVersionedLocation('V3', 0, interior);
      const result = parseAccountFromLocation(location);

      expect(result).toBe(accountAddress);
    });

    it('should return null if last junction is not AccountId32', () => {
      const parachainJunction = createMockInteriorJunction('Parachain', 1000);
      const interior = createMockJunction('X1', [parachainJunction]);
      const location = createMockVersionedLocation('V3', 0, interior);
      const result = parseAccountFromLocation(location);

      expect(result).toBeNull();
    });

    it('should get AccountId32 from last position in X2', () => {
      const parachainJunction = createMockInteriorJunction('Parachain', 1000);
      const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const accountJunction = createMockInteriorJunction('AccountId32', accountAddress);
      const interior = createMockJunction('X2', [parachainJunction, accountJunction]);
      const location = createMockVersionedLocation('V3', 1, interior);
      const result = parseAccountFromLocation(location);

      expect(result).toBe(accountAddress);
    });
  });
});
