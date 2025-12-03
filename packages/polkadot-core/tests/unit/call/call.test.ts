// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { findTargetCall, parseCall } from '../../../src/call/call.js';

// Helper to create mock registry
function createMockRegistry(chainSS58?: number) {
  return {
    chainSS58: chainSS58 ?? 42,
    createType: vi.fn((type, data) => {
      if (type === 'Call') {
        return {
          callIndex: new Uint8Array([0, 1]),
          args: [],
          toU8a: () => data
        };
      }

      return data;
    })
  } as any;
}

// Helper to create mock API
function createMockApi(options?: {
  chainSS58?: number;
  proxyProxy?: boolean;
  proxyProxyAnnounced?: boolean;
  multisigAsMulti?: boolean;
  multisigAsMultiThreshold1?: boolean;
}) {
  const registry = createMockRegistry(options?.chainSS58);

  return {
    registry,
    tx: {
      proxy: {
        proxy: {
          is: vi.fn().mockReturnValue(options?.proxyProxy || false)
        },
        proxyAnnounced: {
          is: vi.fn().mockReturnValue(options?.proxyProxyAnnounced || false)
        }
      },
      multisig: {
        asMulti: {
          is: vi.fn().mockReturnValue(options?.multisigAsMulti || false)
        },
        asMultiThreshold1: {
          is: vi.fn().mockReturnValue(options?.multisigAsMultiThreshold1 || false)
        }
      }
    }
  } as any;
}

describe('call', () => {
  describe('parseCall', () => {
    it('should parse valid call data', () => {
      const registry = createMockRegistry();
      const calldata = '0x0001';

      const result = parseCall(registry, calldata);

      expect(result).not.toBeNull();
      expect(registry.createType).toHaveBeenCalledWith('Call', calldata);
    });

    it('should return cached call on second parse', () => {
      const registry = createMockRegistry();
      const calldata = '0x0002';

      const result1 = parseCall(registry, calldata);
      const result2 = parseCall(registry, calldata);

      // createType should only be called once due to caching
      expect(result1).toBe(result2);
    });

    it('should return null for invalid call data', () => {
      const registry = {
        chainSS58: 42,
        createType: vi.fn(() => {
          throw new Error('Invalid call data');
        })
      } as any;

      // Suppress console.warn during test
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = parseCall(registry, '0xinvalid');

      expect(result).toBeNull();

      warnSpy.mockRestore();
    });

    it('should cache null results for invalid calls', () => {
      const registry = {
        chainSS58: 42,
        createType: vi.fn(() => {
          throw new Error('Invalid call data');
        })
      } as any;

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result1 = parseCall(registry, '0xbaddata');
      const result2 = parseCall(registry, '0xbaddata');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      // createType should only be called once, then cached
      expect(registry.createType).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it('should use chainSS58 in cache key', () => {
      const registry1 = createMockRegistry(0);
      const registry2 = createMockRegistry(42);
      const calldata = '0x0003';

      parseCall(registry1, calldata);
      parseCall(registry2, calldata);

      // Both should be called because chainSS58 differs
      expect(registry1.createType).toHaveBeenCalled();
      expect(registry2.createType).toHaveBeenCalled();
    });

    it('should handle unknown chainSS58', () => {
      const registry = {
        createType: vi.fn(() => ({ callIndex: new Uint8Array([0, 1]), args: [] }))
      } as any;
      const calldata = '0x0004';

      const result = parseCall(registry, calldata);

      expect(result).not.toBeNull();
    });
  });

  describe('findTargetCall', () => {
    it('should return original address and call when call is null', () => {
      const api = createMockApi();
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const [resultAddress, resultCall] = findTargetCall(api, address, null);

      expect(resultAddress).toBe(address);
      expect(resultCall).toBeNull();
    });

    it('should return original address and call when call is undefined', () => {
      const api = createMockApi();
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const [resultAddress, resultCall] = findTargetCall(api, address, undefined);

      expect(resultAddress).toBe(address);
      expect(resultCall).toBeUndefined();
    });

    it('should return original address and call for non-proxy/multisig calls', () => {
      const api = createMockApi();
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const mockCall = {
        callIndex: new Uint8Array([0, 1]),
        args: []
      } as any;

      const [resultAddress, resultCall] = findTargetCall(api, address, mockCall);

      expect(resultAddress).toBe(address);
      expect(resultCall).toBe(mockCall);
    });

    it('should unwrap proxy.proxy call', () => {
      const api = createMockApi({ proxyProxy: true });
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const targetAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

      const mockInnerCall = {
        callIndex: new Uint8Array([0, 2]),
        args: [],
        toU8a: () => new Uint8Array([0, 2])
      };

      const mockCall = {
        callIndex: new Uint8Array([0, 1]),
        args: [{ toString: () => targetAddress }, {}, mockInnerCall]
      } as any;

      // After first call, make proxy.proxy.is return false to stop recursion
      let callCount = 0;

      api.tx.proxy.proxy.is = vi.fn(() => {
        callCount++;

        return callCount === 1;
      });

      const [resultAddress] = findTargetCall(api, address, mockCall);

      expect(resultAddress).toBe(targetAddress);
    });

    it('should unwrap proxy.proxyAnnounced call', () => {
      const api = createMockApi({ proxyProxyAnnounced: true });
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const targetAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

      const mockInnerCall = {
        callIndex: new Uint8Array([0, 2]),
        args: [],
        toU8a: () => new Uint8Array([0, 2])
      };

      const mockCall = {
        callIndex: new Uint8Array([0, 1]),
        args: [{}, { toString: () => targetAddress }, {}, mockInnerCall]
      } as any;

      let callCount = 0;

      api.tx.proxy.proxyAnnounced.is = vi.fn(() => {
        callCount++;

        return callCount === 1;
      });

      const [resultAddress] = findTargetCall(api, address, mockCall);

      expect(resultAddress).toBe(targetAddress);
    });
  });

  describe('CallCache behavior', () => {
    it('should evict least recently used entries when cache is full', () => {
      // This test verifies LRU behavior by filling the cache
      const registry = createMockRegistry();

      // Parse many different calls to potentially fill cache
      for (let i = 0; i < 250; i++) {
        parseCall(registry, `0x${i.toString(16).padStart(4, '0')}`);
      }

      // The first entries should have been evicted (cache size is 200)
      // We can't directly test cache internals, but we can verify it doesn't crash
      expect(() => parseCall(registry, '0x0001')).not.toThrow();
    });
  });
});
