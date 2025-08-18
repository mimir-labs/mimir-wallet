// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { IMethod, Registry } from '@polkadot/types/types';

import { createKeyMulti } from '@polkadot/util-crypto';

import { encodeAddress } from './defaults.js';

// LRU cache for parsed calls to avoid repeated parsing
class CallCache {
  private cache = new Map<string, Call | null>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): Call | null | undefined {
    const value = this.cache.get(key);

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(key: string, value: Call | null): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value;

      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const callCache = new CallCache(200); // Cache up to 200 parsed calls

export function parseCall(registry: Registry, calldata: string): Call | null {
  const chainSS58 = String(((registry as any).chainSS58 as string) || 'unknown');
  const cacheKey = `${chainSS58}-${calldata}`;

  const cachedCall = callCache.get(cacheKey);

  if (cachedCall !== undefined) {
    return cachedCall;
  }

  try {
    const call = registry.createType('Call', calldata);

    callCache.set(cacheKey, call);

    return call;
  } catch (error) {
    console.warn('Failed to parse call data:', error);
    callCache.set(cacheKey, null);

    return null;
  }
}

export function findTargetCall(
  api: ApiPromise,
  address: string,
  call?: IMethod | null
): [string, IMethod | null | undefined] {
  if (!call) {
    return [address, call];
  }

  if (api.tx.proxy?.proxy.is(call)) {
    return findTargetCall(api, call.args[0].toString(), api.registry.createType('Call', call.args[2].toU8a()));
  }

  if (api.tx.proxy?.proxyAnnounced.is(call)) {
    return findTargetCall(api, call.args[1].toString(), api.registry.createType('Call', call.args[3].toU8a()));
  }

  // if (api.tx.proxy?.announce.is(call)) {
  //   return findTargetCall(api, call.args[0].toString(), null);
  // }

  if (api.tx.multisig.asMulti.is(call)) {
    return findTargetCall(
      api,
      encodeAddress(
        createKeyMulti(call.args[1].map((item) => item.toString()).concat(address), call.args[0]),
        api.registry.chainSS58!
      ),
      api.registry.createType('Call', call.args[3].toU8a())
    );
  }

  if (api.tx.multisig.asMultiThreshold1.is(call)) {
    return findTargetCall(
      api,
      encodeAddress(
        createKeyMulti(call.args[0].map((item) => item.toString()).concat(address), 1),
        api.registry.chainSS58!
      ),
      api.registry.createType('Call', call.args[1].toU8a())
    );
  }

  // if (api.tx.multisig.approveAsMulti.is(call)) {
  //   return findTargetCall(api, encodeAddress(createKeyMulti(call.args[1], call.args[0])), null);
  // }

  return [address, call];
}
