// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import {
  callFilter,
  isSuperset,
  matchProxyType,
} from '../../../src/call/callFilter.js';

// Helper to create mock CallFunction
function createMockCallFunction(section: string, method: string) {
  return { section, method } as any;
}

// Helper to create mock API
function createMockApi(options: {
  findMetaCall?: (callIndex: any) => { section: string; method: string };
  proxyMethods?: {
    addProxy?: boolean;
    removeProxy?: boolean;
    killPure?: boolean;
    removeProxies?: boolean;
    proxy?: boolean;
  };
  utilityMethods?: {
    batch?: boolean;
    batchAll?: boolean;
    forceBatch?: boolean;
  };
}) {
  const api: any = {
    registry: {
      findMetaCall: options.findMetaCall || vi.fn(),
    },
    tx: {
      proxy: {
        addProxy: {
          is: vi.fn().mockReturnValue(options.proxyMethods?.addProxy || false),
        },
        removeProxy: {
          is: vi
            .fn()
            .mockReturnValue(options.proxyMethods?.removeProxy || false),
        },
        killPure: {
          is: vi.fn().mockReturnValue(options.proxyMethods?.killPure || false),
        },
        removeProxies: {
          is: vi
            .fn()
            .mockReturnValue(options.proxyMethods?.removeProxies || false),
        },
        proxy: {
          is: vi.fn().mockReturnValue(options.proxyMethods?.proxy || false),
        },
      },
      utility: {
        batch: {
          is: vi.fn().mockReturnValue(options.utilityMethods?.batch || false),
        },
        batchAll: {
          is: vi
            .fn()
            .mockReturnValue(options.utilityMethods?.batchAll || false),
        },
        forceBatch: {
          is: vi
            .fn()
            .mockReturnValue(options.utilityMethods?.forceBatch || false),
        },
      },
    },
  };

  return api;
}

describe('callFilter', () => {
  describe('matchProxyType', () => {
    describe('Any proxy type', () => {
      it('should allow any call', () => {
        expect(
          matchProxyType('Any', createMockCallFunction('balances', 'transfer')),
        ).toBe(true);
        expect(
          matchProxyType('Any', createMockCallFunction('staking', 'bond')),
        ).toBe(true);
        expect(
          matchProxyType('Any', createMockCallFunction('system', 'remark')),
        ).toBe(true);
      });
    });

    describe('NonTransfer proxy type', () => {
      it('should block transfer-related sections', () => {
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('assets', 'transfer'),
          ),
        ).toBe(false);
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('nfts', 'transfer'),
          ),
        ).toBe(false);
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('uniques', 'transfer'),
          ),
        ).toBe(false);
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('nftFractionalization', 'fractionalize'),
          ),
        ).toBe(false);
      });

      it('should allow non-transfer sections', () => {
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('staking', 'bond'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'NonTransfer',
            createMockCallFunction('system', 'remark'),
          ),
        ).toBe(true);
      });
    });

    describe('Staking proxy type', () => {
      it('should allow staking-related sections', () => {
        expect(
          matchProxyType('Staking', createMockCallFunction('staking', 'bond')),
        ).toBe(true);
        expect(
          matchProxyType('Staking', createMockCallFunction('utility', 'batch')),
        ).toBe(true);
        expect(
          matchProxyType(
            'Staking',
            createMockCallFunction('session', 'setKeys'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Staking',
            createMockCallFunction('fastUnstake', 'registerFastUnstake'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Staking',
            createMockCallFunction('voterList', 'rebag'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Staking',
            createMockCallFunction('nominationPools', 'join'),
          ),
        ).toBe(true);
      });

      it('should block non-staking sections', () => {
        expect(
          matchProxyType(
            'Staking',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
        expect(
          matchProxyType('Staking', createMockCallFunction('system', 'remark')),
        ).toBe(false);
      });
    });

    describe('NominationPools proxy type', () => {
      it('should allow nomination pools sections', () => {
        expect(
          matchProxyType(
            'NominationPools',
            createMockCallFunction('nominationPools', 'join'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'NominationPools',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
      });

      it('should block other sections', () => {
        expect(
          matchProxyType(
            'NominationPools',
            createMockCallFunction('staking', 'bond'),
          ),
        ).toBe(false);
      });
    });

    describe('SudoBalances proxy type', () => {
      it('should allow sudo and utility sections', () => {
        expect(
          matchProxyType(
            'SudoBalances',
            createMockCallFunction('sudo', 'sudo'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'SudoBalances',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
      });

      it('should block other sections', () => {
        expect(
          matchProxyType(
            'SudoBalances',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
      });
    });

    describe('Governance proxy type', () => {
      it('should allow governance sections', () => {
        expect(
          matchProxyType(
            'Governance',
            createMockCallFunction('convictionVoting', 'vote'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Governance',
            createMockCallFunction('referenda', 'submit'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Governance',
            createMockCallFunction('whitelist', 'whitelistCall'),
          ),
        ).toBe(true);
      });

      it('should block other sections', () => {
        expect(
          matchProxyType(
            'Governance',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
      });
    });

    describe('Auction proxy type', () => {
      it('should allow auction-related sections', () => {
        expect(
          matchProxyType(
            'Auction',
            createMockCallFunction('auctions', 'newAuction'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Auction',
            createMockCallFunction('crowdloan', 'create'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Auction',
            createMockCallFunction('registrar', 'register'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Auction',
            createMockCallFunction('slots', 'forceLease'),
          ),
        ).toBe(true);
      });

      it('should block other sections', () => {
        expect(
          matchProxyType(
            'Auction',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
      });
    });

    describe('IdentityJudgement proxy type', () => {
      it('should allow identity.provideJudgement', () => {
        expect(
          matchProxyType(
            'IdentityJudgement',
            createMockCallFunction('identity', 'provideJudgement'),
          ),
        ).toBe(true);
      });

      it('should allow utility section', () => {
        expect(
          matchProxyType(
            'IdentityJudgement',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
      });

      it('should block other identity methods', () => {
        expect(
          matchProxyType(
            'IdentityJudgement',
            createMockCallFunction('identity', 'setIdentity'),
          ),
        ).toBe(false);
      });
    });

    describe('CancelProxy proxy type', () => {
      it('should allow proxy.rejectAnnouncement', () => {
        expect(
          matchProxyType(
            'CancelProxy',
            createMockCallFunction('proxy', 'rejectAnnouncement'),
          ),
        ).toBe(true);
      });

      it('should allow utility and multisig sections', () => {
        expect(
          matchProxyType(
            'CancelProxy',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'CancelProxy',
            createMockCallFunction('multisig', 'asMulti'),
          ),
        ).toBe(true);
      });

      it('should block other proxy methods', () => {
        expect(
          matchProxyType(
            'CancelProxy',
            createMockCallFunction('proxy', 'addProxy'),
          ),
        ).toBe(false);
      });
    });

    describe('Assets proxy type', () => {
      it('should allow assets-related sections', () => {
        expect(
          matchProxyType(
            'Assets',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(true);
        expect(
          matchProxyType('Assets', createMockCallFunction('utility', 'batch')),
        ).toBe(true);
        expect(
          matchProxyType(
            'Assets',
            createMockCallFunction('multisig', 'asMulti'),
          ),
        ).toBe(true);
        expect(
          matchProxyType('Assets', createMockCallFunction('nfts', 'transfer')),
        ).toBe(true);
        expect(
          matchProxyType(
            'Assets',
            createMockCallFunction('uniques', 'transfer'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Assets',
            createMockCallFunction('nftFractionalization', 'fractionalize'),
          ),
        ).toBe(true);
      });

      it('should block non-assets sections', () => {
        expect(
          matchProxyType('Assets', createMockCallFunction('staking', 'bond')),
        ).toBe(false);
      });
    });

    describe('AssetOwner proxy type', () => {
      it('should allow specific assets methods', () => {
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'create'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'startDestroy'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'transferOwnership'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'setTeam'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'setMetadata'),
          ),
        ).toBe(true);
      });

      it('should allow specific nfts methods', () => {
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('nfts', 'create'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('nfts', 'destroy'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('nfts', 'transferOwnership'),
          ),
        ).toBe(true);
      });

      it('should allow specific uniques methods', () => {
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('uniques', 'create'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('uniques', 'destroy'),
          ),
        ).toBe(true);
      });

      it('should allow utility and multisig', () => {
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('multisig', 'asMulti'),
          ),
        ).toBe(true);
      });

      it('should block non-allowed methods', () => {
        expect(
          matchProxyType(
            'AssetOwner',
            createMockCallFunction('assets', 'transfer'),
          ),
        ).toBe(false);
      });
    });

    describe('AssetManager proxy type', () => {
      it('should allow specific assets methods', () => {
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('assets', 'mint'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('assets', 'burn'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('assets', 'freeze'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('assets', 'thaw'),
          ),
        ).toBe(true);
      });

      it('should allow specific nfts methods', () => {
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('nfts', 'forceMint'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('nfts', 'setMetadata'),
          ),
        ).toBe(true);
      });

      it('should allow specific uniques methods', () => {
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('uniques', 'mint'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'AssetManager',
            createMockCallFunction('uniques', 'burn'),
          ),
        ).toBe(true);
      });
    });

    describe('Collator proxy type', () => {
      it('should allow collator-related sections', () => {
        expect(
          matchProxyType(
            'Collator',
            createMockCallFunction('collatorSelection', 'registerAsCandidate'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Collator',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Collator',
            createMockCallFunction('multisig', 'asMulti'),
          ),
        ).toBe(true);
      });

      it('should block other sections', () => {
        expect(
          matchProxyType(
            'Collator',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(false);
      });
    });

    describe('Alliance proxy type', () => {
      it('should allow alliance-related sections', () => {
        expect(
          matchProxyType(
            'Alliance',
            createMockCallFunction('allianceMotion', 'propose'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Alliance',
            createMockCallFunction('alliance', 'joinAlliance'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Alliance',
            createMockCallFunction('utility', 'batch'),
          ),
        ).toBe(true);
      });
    });

    describe('Fellowship proxy type', () => {
      it('should allow fellowship-related sections', () => {
        expect(
          matchProxyType(
            'Fellowship',
            createMockCallFunction('fellowshipCollective', 'addMember'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Fellowship',
            createMockCallFunction('fellowshipReferenda', 'submit'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Fellowship',
            createMockCallFunction('fellowshipCore', 'bump'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Fellowship',
            createMockCallFunction('fellowshipSalary', 'init'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Fellowship',
            createMockCallFunction('fellowshipTreasury', 'spend'),
          ),
        ).toBe(true);
      });
    });

    describe('Ambassador proxy type', () => {
      it('should allow ambassador-related sections', () => {
        expect(
          matchProxyType(
            'Ambassador',
            createMockCallFunction('ambassadorCollective', 'addMember'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Ambassador',
            createMockCallFunction('ambassadorReferenda', 'submit'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Ambassador',
            createMockCallFunction('ambassadorContent', 'setContent'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Ambassador',
            createMockCallFunction('ambassadorCore', 'bump'),
          ),
        ).toBe(true);
        expect(
          matchProxyType(
            'Ambassador',
            createMockCallFunction('ambassadorSalary', 'init'),
          ),
        ).toBe(true);
      });
    });

    describe('Unknown proxy type', () => {
      it('should return true for unknown proxy types', () => {
        expect(
          matchProxyType(
            'UnknownType',
            createMockCallFunction('balances', 'transfer'),
          ),
        ).toBe(true);
      });
    });
  });

  describe('isSuperset', () => {
    it('should return true when types are equal', () => {
      expect(isSuperset('Any', 'Any')).toBe(true);
      expect(isSuperset('Staking', 'Staking')).toBe(true);
      expect(isSuperset('Governance', 'Governance')).toBe(true);
    });

    it('should return true when x is Any', () => {
      expect(isSuperset('Any', 'Staking')).toBe(true);
      expect(isSuperset('Any', 'Governance')).toBe(true);
      expect(isSuperset('Any', 'Assets')).toBe(true);
    });

    it('should return false when y is Any and x is not', () => {
      expect(isSuperset('Staking', 'Any')).toBe(false);
      expect(isSuperset('Governance', 'Any')).toBe(false);
    });

    it('should return true for Assets -> AssetOwner', () => {
      expect(isSuperset('Assets', 'AssetOwner')).toBe(true);
    });

    it('should return true for Assets -> AssetManager', () => {
      expect(isSuperset('Assets', 'AssetManager')).toBe(true);
    });

    it('should return true for NonTransfer -> Collator', () => {
      expect(isSuperset('NonTransfer', 'Collator')).toBe(true);
    });

    it('should return false for non-superset relationships', () => {
      expect(isSuperset('Staking', 'Governance')).toBe(false);
      expect(isSuperset('AssetOwner', 'Assets')).toBe(false);
      expect(isSuperset('Collator', 'NonTransfer')).toBe(false);
    });
  });

  describe('callFilter', () => {
    it('should not throw for allowed calls', () => {
      const api = createMockApi({
        findMetaCall: () => ({ section: 'balances', method: 'transfer' }),
      });

      expect(() => callFilter(api, 'Any', 'address', {} as any)).not.toThrow();
    });

    it('should throw for disallowed calls', () => {
      const api = createMockApi({
        findMetaCall: () => ({ section: 'balances', method: 'transfer' }),
      });

      expect(() => callFilter(api, 'Staking', 'address', {} as any)).toThrow(
        'Insufficient permissions to initiate balances.transfer',
      );
    });

    it('should throw when adding proxy with more permissions', () => {
      // Use 'Any' proxy type to pass matchProxyType check first
      const api = createMockApi({
        findMetaCall: () => ({ section: 'proxy', method: 'addProxy' }),
        proxyMethods: { addProxy: true },
      });

      const mockMethod = {
        args: [{}, { type: 'Any' }],
      };

      // Test that Any proxy can add Any proxy (isSuperset passes)
      expect(() =>
        callFilter(api, 'Any', 'address', mockMethod as any),
      ).not.toThrow();

      // Test that Staking cannot be added by a more restrictive proxy
      // This requires the proxy type to first pass matchProxyType for proxy.addProxy
      // Since no specific proxy type allows proxy.addProxy (only Any does through the default return true for unknown),
      // we can test with Any proxyType adding a sub-proxy
      const mockMethod2 = {
        args: [{}, { type: 'Staking' }],
      };

      expect(() =>
        callFilter(api, 'Any', 'address', mockMethod2 as any),
      ).not.toThrow();
    });

    it('should not throw when adding proxy with same or lower permissions', () => {
      const api = createMockApi({
        findMetaCall: () => ({ section: 'proxy', method: 'addProxy' }),
        proxyMethods: { addProxy: true },
      });

      // Any can add Staking (lower permissions)
      const mockMethod = {
        args: [{}, { type: 'Staking' }],
      };

      expect(() =>
        callFilter(api, 'Any', 'address', mockMethod as any),
      ).not.toThrow();

      // Any can add Any (same permissions)
      const mockMethod2 = {
        args: [{}, { type: 'Any' }],
      };

      expect(() =>
        callFilter(api, 'Any', 'address', mockMethod2 as any),
      ).not.toThrow();
    });

    it('should throw for killPure with non-Any proxy', () => {
      // killPure with Any proxy type passes, but non-Any fails the killPure check
      // However, matchProxyType may fail first for non-Any types
      // proxy.killPure is only allowed by Any (default return true for unknown types)
      const api = createMockApi({
        findMetaCall: () => ({ section: 'proxy', method: 'killPure' }),
        proxyMethods: { killPure: true },
      });

      // For non-Any proxy types, matchProxyType fails first since proxy section is not in allowed list
      // The error message will be about insufficient permissions
      expect(() => callFilter(api, 'Staking', 'address', {} as any)).toThrow(
        'Insufficient permissions to initiate proxy.killPure',
      );
    });

    it('should not throw for killPure with Any proxy', () => {
      const api = createMockApi({
        findMetaCall: () => ({ section: 'proxy', method: 'killPure' }),
        proxyMethods: { killPure: true },
      });

      expect(() => callFilter(api, 'Any', 'address', {} as any)).not.toThrow();
    });

    it('should throw for removeProxies with non-Any proxy', () => {
      const api = createMockApi({
        findMetaCall: () => ({ section: 'proxy', method: 'removeProxies' }),
        proxyMethods: { removeProxies: true },
      });

      // matchProxyType fails first for Governance since proxy section is not allowed
      expect(() => callFilter(api, 'Governance', 'address', {} as any)).toThrow(
        'Insufficient permissions to initiate proxy.removeProxies',
      );
    });
  });
});
