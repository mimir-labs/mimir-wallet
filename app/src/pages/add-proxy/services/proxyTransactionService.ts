// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ProxyArgs } from '../types';

/**
 * Service for building proxy-related transactions
 * Provides unified transaction construction for both desktop and mobile
 */
export class ProxyTransactionService {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  /**
   * Build transaction for creating a pure proxy
   */
  buildCreatePureProxyTransaction(config: {
    proxyType: string;
    delay: number;
    index?: number;
  }): SubmittableExtrinsic<'promise'> {
    const { proxyType, delay, index = 0 } = config;

    return this.api.tx.proxy.createPure(proxyType as any, delay, index);
  }

  /**
   * Build transaction for adding a single proxy
   */
  buildAddProxyTransaction(proxyArgs: ProxyArgs): SubmittableExtrinsic<'promise'> {
    const { delegate, proxyType, delay } = proxyArgs;

    return this.api.tx.proxy.addProxy(delegate, proxyType as any, delay);
  }

  /**
   * Build batch transaction for adding multiple proxies
   */
  buildBatchProxyTransaction(proxyArgsList: ProxyArgs[]): SubmittableExtrinsic<'promise'> {
    if (proxyArgsList.length === 0) {
      throw new Error('Proxy arguments list cannot be empty');
    }

    if (proxyArgsList.length === 1) {
      return this.buildAddProxyTransaction(proxyArgsList[0]);
    }

    const transactions = proxyArgsList.map((args) =>
      this.api.tx.proxy.addProxy(args.delegate, args.proxyType as any, args.delay)
    );

    return this.api.tx.utility.batchAll(transactions);
  }

  /**
   * Build transaction for removing a proxy
   */
  buildRemoveProxyTransaction(proxyArgs: ProxyArgs): SubmittableExtrinsic<'promise'> {
    const { delegate, proxyType, delay } = proxyArgs;

    return this.api.tx.proxy.removeProxy(delegate, proxyType as any, delay);
  }

  /**
   * Get the method call for transaction queue
   */
  getTransactionMethod(transaction: SubmittableExtrinsic<'promise'>) {
    return transaction.method;
  }

  /**
   * Validate proxy arguments before transaction creation
   */
  validateProxyArgs(proxyArgs: ProxyArgs): { isValid: boolean; error?: string } {
    const { delegate, proxyType, delay } = proxyArgs;

    if (!delegate) {
      return { isValid: false, error: 'Delegate address is required' };
    }

    if (!proxyType) {
      return { isValid: false, error: 'Proxy type is required' };
    }

    if (delay < 0) {
      return { isValid: false, error: 'Delay cannot be negative' };
    }

    return { isValid: true };
  }

  /**
   * Validate multiple proxy arguments
   */
  validateBatchProxyArgs(proxyArgsList: ProxyArgs[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (proxyArgsList.length === 0) {
      errors.push('At least one proxy configuration is required');
    }

    for (let i = 0; i < proxyArgsList.length; i++) {
      const validation = this.validateProxyArgs(proxyArgsList[i]);

      if (!validation.isValid) {
        errors.push(`Proxy ${i + 1}: ${validation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Factory function to create ProxyTransactionService instance
 */
export function createProxyTransactionService(api: ApiPromise): ProxyTransactionService {
  return new ProxyTransactionService(api);
}

/**
 * Utility functions for common transaction operations
 */
export const proxyTransactionUtils = {
  /**
   * Extract transaction parameters from API call
   */
  extractTransactionParams(transaction: SubmittableExtrinsic<'promise'>) {
    return {
      method: transaction.method,
      hash: transaction.hash.toHex(),
      length: transaction.encodedLength
    };
  },

  /**
   * Calculate estimated transaction fee
   */
  async calculateTransactionFee(transaction: SubmittableExtrinsic<'promise'>, senderAddress: string): Promise<string> {
    try {
      const info = await transaction.paymentInfo(senderAddress);

      return info.partialFee.toString();
    } catch (error) {
      console.warn('Failed to calculate transaction fee:', error);

      return '0';
    }
  }
};
