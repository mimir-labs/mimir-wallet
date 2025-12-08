// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { chainLinks } from '../../../src/chains/chain-links.js';

// Test addresses
const ALICE_SS58 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const ALICE_HEX =
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';

// Mock chain configs
const chainWithExplorer = {
  explorerUrl: 'https://polkadot.subscan.io',
  ss58Format: 0,
};

const chainWithStatescan = {
  statescanUrl: 'https://polkadot.statescan.io',
  ss58Format: 0,
};

const chainWithBothUrls = {
  explorerUrl: 'https://polkadot.subscan.io',
  statescanUrl: 'https://polkadot.statescan.io',
  ss58Format: 0,
};

const chainWithNoUrls = {
  ss58Format: 0,
};

const chainWithSs58Format42 = {
  explorerUrl: 'https://substrate.subscan.io',
  ss58Format: 42,
};

describe('chainLinks', () => {
  describe('accountExplorerLink', () => {
    it('should generate explorer URL with valid SS58 address', () => {
      const link = chainLinks.accountExplorerLink(
        chainWithExplorer,
        ALICE_SS58,
      );

      expect(link).toBe(
        'https://polkadot.subscan.io/account/15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
      );
    });

    it('should generate explorer URL with hex address', () => {
      const link = chainLinks.accountExplorerLink(chainWithExplorer, ALICE_HEX);

      expect(link).toBe(
        'https://polkadot.subscan.io/account/15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
      );
    });

    it('should use statescan URL when explorer URL is not available', () => {
      const link = chainLinks.accountExplorerLink(
        chainWithStatescan,
        ALICE_SS58,
      );

      expect(link).toBe(
        'https://polkadot.statescan.io/#/accounts/15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
      );
    });

    it('should prefer explorer URL over statescan URL', () => {
      const link = chainLinks.accountExplorerLink(
        chainWithBothUrls,
        ALICE_SS58,
      );

      expect(link).toBe(
        'https://polkadot.subscan.io/account/15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
      );
    });

    it('should return undefined when no explorer URLs are available', () => {
      const link = chainLinks.accountExplorerLink(chainWithNoUrls, ALICE_SS58);

      expect(link).toBeUndefined();
    });

    it('should return undefined for null address', () => {
      const link = chainLinks.accountExplorerLink(chainWithExplorer, null);

      expect(link).toBeUndefined();
    });

    it('should return undefined for undefined address', () => {
      const link = chainLinks.accountExplorerLink(chainWithExplorer, undefined);

      expect(link).toBeUndefined();
    });

    it('should encode address with correct ss58Format', () => {
      const link = chainLinks.accountExplorerLink(
        chainWithSs58Format42,
        ALICE_HEX,
      );

      // With ss58Format 42, the address should be different from format 0
      expect(link).toContain(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      );
    });

    it('should handle Uint8Array input', () => {
      const bytes = new Uint8Array(32);

      bytes.fill(0xd4, 0, 1);
      const link = chainLinks.accountExplorerLink(chainWithExplorer, bytes);

      expect(link).toBeDefined();
      expect(link).toContain('/account/');
    });
  });

  describe('extrinsicExplorerLink', () => {
    const extrinsicHash =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const blockExtrinsic = '12345-2';

    it('should generate explorer URL for extrinsic hash', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithExplorer,
        extrinsicHash,
      );

      expect(link).toBe(
        `https://polkadot.subscan.io/extrinsic/${extrinsicHash}`,
      );
    });

    it('should generate explorer URL for block-extrinsic format', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithExplorer,
        blockExtrinsic,
      );

      expect(link).toBe(
        `https://polkadot.subscan.io/extrinsic/${blockExtrinsic}`,
      );
    });

    it('should use statescan URL when explorer URL is not available', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithStatescan,
        extrinsicHash,
      );

      expect(link).toBe(
        `https://polkadot.statescan.io/#/extrinsics/${extrinsicHash}`,
      );
    });

    it('should prefer explorer URL over statescan URL', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithBothUrls,
        extrinsicHash,
      );

      expect(link).toBe(
        `https://polkadot.subscan.io/extrinsic/${extrinsicHash}`,
      );
    });

    it('should return undefined when no explorer URLs are available', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithNoUrls as any,
        extrinsicHash,
      );

      expect(link).toBeUndefined();
    });

    it('should handle object with toString method', () => {
      const extrinsicObj = {
        toString: () => '67890-5',
      };
      const link = chainLinks.extrinsicExplorerLink(
        chainWithExplorer,
        extrinsicObj,
      );

      expect(link).toBe('https://polkadot.subscan.io/extrinsic/67890-5');
    });

    it('should handle undefined value', () => {
      const link = chainLinks.extrinsicExplorerLink(
        chainWithExplorer,
        undefined,
      );

      expect(link).toBe('https://polkadot.subscan.io/extrinsic/undefined');
    });
  });
});
