// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  addressEq,
  addressToHex,
  evm2Ss58,
  isEthAddress,
  isPolkadotAddress,
  isPolkadotEvmAddress,
  isValidAddress,
  sub2Eth,
  zeroAddress,
} from '../../../src/utils/utils.js';

// Test addresses
const ALICE_SS58 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const BOB_SS58 = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
const ALICE_HEX =
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';
const BOB_HEX =
  '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48';

// EVM addresses
const VALID_ETH_ADDRESS = '0x1234567890123456789012345678901234567890';
const VALID_ETH_ADDRESS_CHECKSUMMED =
  '0x1234567890123456789012345678901234567890';

describe('utils', () => {
  describe('zeroAddress', () => {
    it('should be a valid 32-byte hex address', () => {
      expect(zeroAddress).toMatch(/^0x[0]{64}$/);
    });
  });

  describe('addressToHex', () => {
    it('should convert SS58 address to hex', () => {
      const hex = addressToHex(ALICE_SS58);

      expect(hex).toBe(ALICE_HEX);
    });

    it('should return same result for repeated calls (cache hit)', () => {
      const hex1 = addressToHex(ALICE_SS58);
      const hex2 = addressToHex(ALICE_SS58);

      expect(hex1).toBe(hex2);
    });

    it('should handle hex input directly', () => {
      const hex = addressToHex(ALICE_HEX);

      expect(hex).toBe(ALICE_HEX);
    });

    it('should convert different addresses correctly', () => {
      expect(addressToHex(BOB_SS58)).toBe(BOB_HEX);
    });
  });

  describe('addressEq', () => {
    it('should return true for identical SS58 addresses', () => {
      expect(addressEq(ALICE_SS58, ALICE_SS58)).toBe(true);
    });

    it('should return true for SS58 and hex of same address', () => {
      expect(addressEq(ALICE_SS58, ALICE_HEX)).toBe(true);
    });

    it('should return false for different addresses', () => {
      expect(addressEq(ALICE_SS58, BOB_SS58)).toBe(false);
    });

    it('should return false when first argument is null', () => {
      expect(addressEq(null, ALICE_SS58)).toBe(false);
    });

    it('should return false when second argument is null', () => {
      expect(addressEq(ALICE_SS58, null)).toBe(false);
    });

    it('should return false when both arguments are null', () => {
      expect(addressEq(null, null)).toBe(false);
    });

    it('should return false when first argument is undefined', () => {
      expect(addressEq(undefined, ALICE_SS58)).toBe(false);
    });

    it('should return false for invalid addresses', () => {
      expect(addressEq('invalid', ALICE_SS58)).toBe(false);
    });
  });

  describe('isPolkadotAddress', () => {
    it('should return true for valid SS58 address', () => {
      expect(isPolkadotAddress(ALICE_SS58)).toBe(true);
    });

    it('should return true for valid 32-byte hex address', () => {
      expect(isPolkadotAddress(ALICE_HEX)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(isPolkadotAddress('invalid')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPolkadotAddress(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPolkadotAddress(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPolkadotAddress('')).toBe(false);
    });

    it('should return false for short hex (not 32 bytes)', () => {
      expect(isPolkadotAddress('0x1234')).toBe(false);
    });

    it('should return false for Ethereum address', () => {
      expect(isPolkadotAddress(VALID_ETH_ADDRESS)).toBe(false);
    });
  });

  describe('isPolkadotEvmAddress', () => {
    it('should return false for regular Polkadot address', () => {
      expect(isPolkadotEvmAddress(ALICE_SS58)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPolkadotEvmAddress(null)).toBe(false);
    });

    it('should return true for EVM-mapped Polkadot address', () => {
      // Create an EVM-mapped address using evm2Ss58
      const evmMappedAddress = evm2Ss58(VALID_ETH_ADDRESS, 42);

      expect(isPolkadotEvmAddress(evmMappedAddress)).toBe(true);
    });
  });

  describe('isEthAddress', () => {
    it('should return true for valid Ethereum address', () => {
      expect(isEthAddress(VALID_ETH_ADDRESS)).toBe(true);
    });

    it('should return true for checksummed Ethereum address', () => {
      expect(isEthAddress(VALID_ETH_ADDRESS_CHECKSUMMED)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(isEthAddress('invalid')).toBe(false);
    });

    it('should return false for Polkadot address', () => {
      expect(isEthAddress(ALICE_SS58)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isEthAddress(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isEthAddress(undefined)).toBe(false);
    });

    it('should return false for short hex', () => {
      expect(isEthAddress('0x1234')).toBe(false);
    });
  });

  describe('evm2Ss58', () => {
    it('should convert EVM address to SS58 format', () => {
      const ss58 = evm2Ss58(VALID_ETH_ADDRESS, 42);

      expect(ss58).toBeTruthy();
      expect(isPolkadotAddress(ss58)).toBe(true);
    });

    it('should produce different results for different ss58Format', () => {
      const ss58Format0 = evm2Ss58(VALID_ETH_ADDRESS, 0);
      const ss58Format42 = evm2Ss58(VALID_ETH_ADDRESS, 42);

      expect(ss58Format0).not.toBe(ss58Format42);
    });

    it('should return empty string for null input', () => {
      expect(evm2Ss58(null, 42)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(evm2Ss58(undefined, 42)).toBe('');
    });

    it('should throw error for invalid EVM address', () => {
      expect(() => evm2Ss58('invalid', 42)).toThrow('Invalid EVM address');
    });

    it('should throw error for Polkadot address input', () => {
      expect(() => evm2Ss58(ALICE_SS58, 42)).toThrow('Invalid EVM address');
    });

    it('should create address that isPolkadotEvmAddress returns true for', () => {
      const ss58 = evm2Ss58(VALID_ETH_ADDRESS, 42);

      expect(isPolkadotEvmAddress(ss58)).toBe(true);
    });
  });

  describe('sub2Eth', () => {
    it('should convert EVM-mapped Polkadot address back to Ethereum address', () => {
      const ss58 = evm2Ss58(VALID_ETH_ADDRESS, 42);
      const ethAddress = sub2Eth(ss58);

      expect(ethAddress.toLowerCase()).toBe(VALID_ETH_ADDRESS.toLowerCase());
    });

    it('should convert regular Polkadot address to derived Ethereum address', () => {
      const ethAddress = sub2Eth(ALICE_SS58);

      expect(ethAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      // Regular address uses keccak256 hash, so it won't match the original
      expect(ethAddress.toLowerCase()).not.toBe(
        VALID_ETH_ADDRESS.toLowerCase(),
      );
    });

    it('should produce consistent results for same input', () => {
      const eth1 = sub2Eth(ALICE_SS58);
      const eth2 = sub2Eth(ALICE_SS58);

      expect(eth1).toBe(eth2);
    });
  });

  describe('isValidAddress', () => {
    it('should return true for valid Polkadot address when polkavm is false', () => {
      expect(isValidAddress(ALICE_SS58, false)).toBe(true);
    });

    it('should return true for valid Polkadot address when polkavm is true', () => {
      expect(isValidAddress(ALICE_SS58, true)).toBe(true);
    });

    it('should return false for Ethereum address when polkavm is false', () => {
      expect(isValidAddress(VALID_ETH_ADDRESS, false)).toBe(false);
    });

    it('should return true for Ethereum address when polkavm is true', () => {
      expect(isValidAddress(VALID_ETH_ADDRESS, true)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(isValidAddress('invalid', false)).toBe(false);
      expect(isValidAddress('invalid', true)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidAddress(undefined, false)).toBe(false);
    });

    it('should default polkavm to false', () => {
      expect(isValidAddress(VALID_ETH_ADDRESS)).toBe(false);
      expect(isValidAddress(ALICE_SS58)).toBe(true);
    });
  });
});
