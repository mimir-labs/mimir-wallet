// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyAddedEvent, ProxyArgs, PureCreatedEvent, TransactionResult } from '../types';
import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';

import { ApiManager, decodeAddress } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { u8aToHex } from '@polkadot/util';
import { useCallback, useState } from 'react';

import { createProxyTransactionService } from '../services/proxyTransactionService';

import { useTxQueue } from '@/hooks/useTxQueue';

/**
 * Parse PureCreated events from transaction result
 */
function parsePureCreatedEvents(result: ISubmittableResult, api: ApiPromise): PureCreatedEvent | null {
  const events = result.events.filter((item) => api.events.proxy.PureCreated.is(item.event));

  if (events.length === 0) return null;

  const event = events[0].event;

  return {
    pureAccount: event.data[0].toString(),
    whoCreated: event.data[1].toString(),
    proxyType: event.data[2].toString(),
    disambiguationIndex: Number(event.data[3].toString())
  };
}

/**
 * Parse ProxyAdded events from transaction result
 */
function parseProxyAddedEvents(result: ISubmittableResult, api: ApiPromise): ProxyAddedEvent[] {
  const events = result.events.filter((item) => api.events.proxy.ProxyAdded.is(item.event));

  return events.map((item) => ({
    delegator: item.event.data[0].toString(),
    delegate: item.event.data[1].toString(),
    proxyType: item.event.data[2].toString(),
    delay: Number(item.event.data[3].toString())
  }));
}

export interface ProxyTransactionConfig {
  // Common config
  network: string;
  accountId: string;

  // Pure proxy config
  proxyType?: string;
  delay?: number;
  pureName?: string;

  // Regular proxy config
  proxyArgs?: ProxyArgs;

  // Callbacks
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}

export interface TransactionState {
  isLoading: boolean;
  error: Error | null;
  txHash?: string;
}

/**
 * Hook for handling proxy transactions with unified logic
 * Supports both pure proxy creation and regular proxy addition
 */
export function useProxyTransaction(network: string) {
  const { addQueue } = useTxQueue();

  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    error: null
  });

  /**
   * Submit pure proxy creation transaction
   */
  const submitPureProxy = useCallback(
    async (config: ProxyTransactionConfig) => {
      if (!config.proxyType || config.delay === undefined) {
        throw new Error('ProxyType and delay are required for pure proxy creation');
      }

      setState({ isLoading: true, error: null });

      try {
        const api = await ApiManager.getInstance().getApi(network);

        if (!api) {
          throw new Error('API is not ready');
        }

        const transactionService = createProxyTransactionService(api);

        const transaction = transactionService.buildCreatePureProxyTransaction({
          proxyType: config.proxyType,
          delay: config.delay
        });

        const call = transactionService.getTransactionMethod(transaction);

        // Prepare multisig if needed
        const beforeSend = config.pureName
          ? async (extrinsic: SubmittableExtrinsic<'promise'>) => {
              await service.multisig.prepareMultisig(
                config.network,
                u8aToHex(decodeAddress(config.accountId)),
                extrinsic.hash.toHex(),
                config.pureName || 'Pure Proxy'
              );
            }
          : undefined;

        addQueue({
          call,
          accountId: config.accountId,
          website: 'mimir://internal/create-pure',
          network: config.network,
          beforeSend,
          onResults: (result) => {
            setState({ isLoading: false, error: null });

            // Parse events to determine transaction status
            const pureCreated = parsePureCreatedEvents(result, api);
            const transactionResult: TransactionResult = {
              isCompleted: !!pureCreated,
              isPending: !pureCreated,
              events: pureCreated ? { pureCreated } : undefined,
              txHash: result.txHash?.toHex(),
              rawResult: result,
              context: {
                type: 'pure',
                proxyType: config.proxyType!,
                proxy: config.accountId,
                delay: config.delay,
                pureProxyName: config.pureName
              }
            };

            config.onSuccess?.(transactionResult);
          },
          onClose: () => {
            setState({ isLoading: false, error: null });
          },
          onError: (error: unknown) => {
            const err = error as Error;

            setState({ isLoading: false, error: err });
            config.onError?.(err);
          }
        });
      } catch (error) {
        const err = error as Error;

        setState({ isLoading: false, error: err });
        config.onError?.(err);
      }
    },
    [network, addQueue]
  );

  /**
   * Submit regular proxy addition transaction(s)
   */
  const submitProxyAddition = useCallback(
    async (config: ProxyTransactionConfig) => {
      const proxyArgs = config.proxyArgs;

      if (!proxyArgs) {
        throw new Error('ProxyArgs are required for proxy addition');
      }

      setState({ isLoading: true, error: null });

      try {
        const api = await ApiManager.getInstance().getApi(network);

        if (!api) {
          throw new Error('API is not ready');
        }

        const transactionService = createProxyTransactionService(api);

        // Validate all proxy arguments
        const validation = transactionService.validateBatchProxyArgs([proxyArgs]);

        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const transaction = transactionService.buildBatchProxyTransaction([proxyArgs]);
        const call = transactionService.getTransactionMethod(transaction);

        addQueue({
          call,
          accountId: config.accountId,
          website: 'mimir://internal/setup',
          network: config.network,
          onResults: (result) => {
            setState({ isLoading: false, error: null });

            // Parse events to determine transaction status
            const proxyAdded = parseProxyAddedEvents(result, api);
            const transactionResult: TransactionResult = {
              isCompleted: proxyAdded.length > 0,
              isPending: proxyAdded.length === 0,
              events: proxyAdded.length > 0 ? { proxyAdded } : undefined,
              txHash: result.txHash?.toHex(),
              rawResult: result,
              context: {
                type: 'proxy',
                proxyType: proxyArgs.proxyType,
                proxied: config.accountId,
                proxy: proxyArgs.delegate,
                delay: proxyArgs.delay
              }
            };

            config.onSuccess?.(transactionResult);
          },
          onClose: () => {
            setState({ isLoading: false, error: null });
          },
          onError: (error: unknown) => {
            const err = error as Error;

            setState({ isLoading: false, error: err });
            config.onError?.(err);
          }
        });
      } catch (error) {
        const err = error as Error;

        setState({ isLoading: false, error: err });
        config.onError?.(err);
      }
    },
    [network, addQueue]
  );

  return {
    // Transaction submission methods
    submitPureProxy,
    submitProxyAddition,
    isLoading: state.isLoading,
    error: state.error
  };
}
