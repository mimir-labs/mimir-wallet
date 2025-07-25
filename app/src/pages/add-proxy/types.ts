// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type DelayType = 'hour' | 'day' | 'week' | 'custom';

export interface ProxyArgs {
  delegate: string;
  proxyType: string;
  delay: number;
}

/**
 * Pure proxy creation event data
 */
export interface PureCreatedEvent {
  pureAccount: string;
  whoCreated: string;
  proxyType: string;
  disambiguationIndex: number;
}

/**
 * Proxy addition event data
 */
export interface ProxyAddedEvent {
  delegator: string;
  delegate: string;
  proxyType: string;
  delay: number;
}

/**
 * Transaction result with parsed events and context information
 */
export interface TransactionResult {
  /** Whether the transaction is completed (has corresponding events) */
  isCompleted: boolean;
  /** Whether the transaction is pending (no target events found, may need more signatures or processing) */
  isPending: boolean;
  /** Parsed event information */
  events?: {
    pureCreated?: PureCreatedEvent;
    proxyAdded?: ProxyAddedEvent[];
  };
  /** Transaction hash */
  txHash?: string;
  /** Raw transaction result for advanced usage */
  rawResult?: any;
  /** Transaction context information */
  context?: {
    type: 'pure' | 'proxy';
    proxyType: string;
    proxied?: string;
    proxy: string;
    delay?: number;
    pureProxyName?: string;
  };
}
