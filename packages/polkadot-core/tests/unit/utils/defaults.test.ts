// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  CURRENT_NETWORK_KEY,
  decodeAddress,
  DEFAULT_AUX,
  DEFAULE_SS58_CHAIN_KEY,
  encodeAddress,
  NETWORK_RPC_PREFIX
} from '../../../src/utils/defaults.js';

// Test addresses
const ALICE_SS58_FORMAT_42 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const ALICE_HEX = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';

describe('defaults', () => {
  describe('constants', () => {
    it('should export NETWORK_RPC_PREFIX', () => {
      expect(NETWORK_RPC_PREFIX).toBe('network_rpc:');
    });

    it('should export CURRENT_NETWORK_KEY', () => {
      expect(CURRENT_NETWORK_KEY).toBe('current_network');
    });

    it('should export DEFAULE_SS58_CHAIN_KEY', () => {
      expect(DEFAULE_SS58_CHAIN_KEY).toBe('default_ss58_chain');
    });

    it('should export DEFAULT_AUX array with 9 items', () => {
      expect(DEFAULT_AUX).toHaveLength(9);
      expect(DEFAULT_AUX).toEqual(['Aux1', 'Aux2', 'Aux3', 'Aux4', 'Aux5', 'Aux6', 'Aux7', 'Aux8', 'Aux9']);
    });
  });

  describe('encodeAddress', () => {
    it('should encode hex to SS58 with format 42', () => {
      const encoded = encodeAddress(ALICE_HEX, 42);

      expect(encoded).toBe(ALICE_SS58_FORMAT_42);
    });

    it('should encode Uint8Array to SS58', () => {
      const bytes = new Uint8Array(32);

      bytes.fill(0xd4, 0, 1);
      const encoded = encodeAddress(bytes, 42);

      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });

    it('should return empty string for null input', () => {
      expect(encodeAddress(null, 42)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(encodeAddress(undefined, 42)).toBe('');
    });

    it('should produce different results for different ss58Format', () => {
      const format0 = encodeAddress(ALICE_HEX, 0);
      const format42 = encodeAddress(ALICE_HEX, 42);

      expect(format0).not.toBe(format42);
    });
  });

  describe('decodeAddress', () => {
    it('should decode SS58 address to Uint8Array', () => {
      const decoded = decodeAddress(ALICE_SS58_FORMAT_42);

      expect(decoded).toBeInstanceOf(Uint8Array);
      expect(decoded.length).toBe(32);
    });

    it('should decode to correct bytes', () => {
      const decoded = decodeAddress(ALICE_SS58_FORMAT_42);

      // First byte should be 0xd4
      expect(decoded[0]).toBe(0xd4);
    });

    it('should throw for invalid address', () => {
      expect(() => decodeAddress('invalid')).toThrow();
    });
  });

  describe('encode/decode roundtrip', () => {
    it('should maintain consistency through encode-decode cycle', () => {
      const original = ALICE_SS58_FORMAT_42;
      const decoded = decodeAddress(original);
      const reencoded = encodeAddress(decoded, 42);

      expect(reencoded).toBe(original);
    });

    it('should handle different formats correctly', () => {
      const decoded = decodeAddress(ALICE_SS58_FORMAT_42);
      const reencodedFormat0 = encodeAddress(decoded, 0);
      const reencodedFormat42 = encodeAddress(decoded, 42);

      // Decode both and verify they represent the same bytes
      const decodedFormat0 = decodeAddress(reencodedFormat0);
      const decodedFormat42 = decodeAddress(reencodedFormat42);

      expect(Array.from(decodedFormat0)).toEqual(Array.from(decodedFormat42));
    });
  });
});
