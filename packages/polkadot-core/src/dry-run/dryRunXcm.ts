// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { XcmVersionedLocation, XcmVersionedXcm } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { SupportXcmChainConfig } from '../xcm/types.js';
import type { DryRunResult } from './types.js';

import { ApiPromise } from '@polkadot/api';
import { assertReturn } from '@polkadot/util';

import { allEndpoints } from '../config.js';
import { assetXcmV5TraitsError } from '../dispatch-error.js';
import { createApi } from '../initialize.js';
import { findDestChain } from '../xcm/parseLocation.js';
import { parseBalancesChange } from './parse-balances-change.js';

/**
 * Logs XCM operations with simplified format
 * @param operation - The operation being performed
 * @param data - Additional data to log
 * @param level - Log level
 */
function logXcmOperation(
  operation: string,
  data: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  switch (level) {
    case 'error':
      console.error('[XCM-DRY-RUN]', operation, data);
      break;
    case 'warn':
      console.warn('[XCM-DRY-RUN]', operation, data);
      break;
    default:
      console.info('[XCM-DRY-RUN]', operation, data);
  }
}

/**
 * Performs dry run execution for XCM (Cross-Chain Message) transactions
 * @param api - The Polkadot API instance
 * @param forwardedXcms - Array of XCM messages to execute
 * @returns Promise resolving to array of dry run results
 * @throws Error if chain is not supported or XCM dry run is not available
 */
export async function dryRunWithXcm(
  api: ApiPromise,
  forwardedXcms: Vec<ITuple<[XcmVersionedLocation, Vec<XcmVersionedXcm>]>>
): Promise<DryRunResult[]> {
  const startTime = Date.now();

  logXcmOperation('Started', {
    chain: api.genesisHash.toHex(),
    messageCount: forwardedXcms.length
  });

  const initialChain = assertReturn(
    allEndpoints.find((item) => item.genesisHash === api.genesisHash.toHex()),
    `Unsupported chain with genesisHash: ${api.genesisHash.toHex()}`
  );

  logXcmOperation('Initial Chain', {
    chain: initialChain.key,
    paraId: initialChain.paraId
  });

  let originParents = 0;
  let originInterior: Record<string, any>;
  const xcmDryRunResult: DryRunResult[] = [];
  const openApis: ApiPromise[] = [];

  for (let i = 0; i < forwardedXcms.length; i++) {
    const xcm = forwardedXcms[i];

    logXcmOperation('Processing Message', {
      index: i + 1,
      total: forwardedXcms.length
    });

    try {
      const { chainApi, originInfo } = await processXcmLocation(xcm[0], { isSupport: true, ...initialChain }, openApis);

      originParents = originInfo.parents;
      originInterior = originInfo.interior;

      logXcmOperation('Location Processed', {
        index: i + 1,
        targetChain: chainApi.runtimeChain.toString()
      });

      const xcmResults = await executeXcmMessages(chainApi, xcm[1], originParents, originInterior);

      logXcmOperation('Messages Executed', {
        index: i + 1,
        results: xcmResults.length,
        success: xcmResults.filter((r) => r.success).length
      });

      xcmDryRunResult.push(...xcmResults);
    } catch (error) {
      logXcmOperation(
        'Processing Error',
        {
          index: i + 1,
          error: error instanceof Error ? error.message : String(error)
        },
        'error'
      );
      xcmDryRunResult.push(createErrorResult(error, 'XCM processing failed'));
    }
  }

  // Clean up all API connections
  logXcmOperation('Cleanup', {
    connections: openApis.length,
    duration: `${Date.now() - startTime}ms`
  });

  await Promise.allSettled(
    openApis.map(async (apiInstance) => {
      try {
        await apiInstance.disconnect();
      } catch {
        // Ignore disconnect errors as they don't affect the results
      }
    })
  );

  logXcmOperation('Completed', {
    results: xcmDryRunResult.length,
    success: xcmDryRunResult.filter((r) => r.success).length,
    duration: `${Date.now() - startTime}ms`
  });

  return xcmDryRunResult;
}

/**
 * Processes XCM location to determine target chain and origin information
 * @param location - The XCM versioned location
 * @param initialChain - The starting chain configuration
 * @param openApis - Array to track opened API connections
 * @returns Object containing the target chain API and origin information
 */
async function processXcmLocation(
  location: XcmVersionedLocation,
  initialChain: SupportXcmChainConfig,
  openApis: ApiPromise[]
): Promise<{
  chainApi: ApiPromise;
  originInfo: {
    parents: number;
    interior: Record<string, any>;
  };
}> {
  const { chain, origin } = findDestChain(location, initialChain);

  if (!chain.isSupport) {
    throw new Error(`Chain not supported ${chain}`);
  }

  let chainApi: ApiPromise;
  const exists = openApis.find((item) => item.genesisHash.toHex() === chain.genesisHash);

  if (exists) {
    chainApi = exists;
  } else {
    [chainApi] = await createApi(Object.values(chain.wsUrl), chain.key, chain.httpUrl);
  }

  await chainApi.isReady;

  if (!exists) {
    openApis.push(chainApi);
  }

  if (!chainApi.call.dryRunApi?.dryRunXcm) {
    const errorMsg = `Chain ${chain.name} does not support XCM dry run API`;

    logXcmOperation('API Validation Error', { error: errorMsg }, 'error');
    throw new Error(errorMsg);
  }

  return {
    chainApi,
    originInfo: origin
  };
}

/**
 * Executes XCM messages and returns the results
 * @param chainApi - The chain API to execute on
 * @param messages - Array of XCM messages to execute
 * @param originParents - Number of parent chains
 * @param originInterior - Origin interior configuration
 * @returns Array of dry run results
 */
async function executeXcmMessages(
  chainApi: ApiPromise,
  messages: Vec<XcmVersionedXcm>,
  originParents: number,
  originInterior: Record<string, any>
): Promise<DryRunResult[]> {
  const results: DryRunResult[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    try {
      const result = await chainApi.call.dryRunApi.dryRunXcm(
        {
          V4: {
            parents: originParents,
            interior: originInterior
          }
        },
        message
      );

      if (result.isOk) {
        const ok = result.asOk;
        const executionResult = ok.executionResult;

        if (executionResult.isComplete) {
          const balancesChanges = parseBalancesChange(ok.emittedEvents, chainApi.genesisHash.toHex());

          logXcmOperation('Execution Success', {
            events: ok.emittedEvents.length,
            balanceChanges: balancesChanges.length
          });

          results.push({
            success: true,
            rawEvents: ok.emittedEvents.toHuman(),
            balancesChanges,
            forwardedXcms: ok.forwardedXcms
          });
        } else if (executionResult.isIncomplete) {
          const err = executionResult.asIncomplete;
          const xcmError = assetXcmV5TraitsError(err.error);

          logXcmOperation('Execution Incomplete', { error: xcmError.message }, 'warn');

          results.push({
            success: false,
            rawEvents: ok.emittedEvents.toHuman(),
            error: xcmError,
            forwardedXcms: ok.forwardedXcms
          });
        } else {
          const err = executionResult.asError;
          const xcmError = assetXcmV5TraitsError(err.error);

          logXcmOperation('Execution Error', { error: xcmError.message }, 'error');

          results.push({
            success: false,
            rawEvents: ok.emittedEvents.toHuman(),
            error: xcmError,
            forwardedXcms: ok.forwardedXcms
          });
        }
      } else {
        const err = result.asErr;
        const errorMsg = `XCM dry run failed: ${err.type}`;

        logXcmOperation('Dry Run Failed', { error: errorMsg }, 'error');

        results.push({
          success: false,
          error: new Error(errorMsg)
        });
      }
    } catch (error) {
      logXcmOperation(
        'Message Execution Error',
        {
          error: error instanceof Error ? error.message : String(error)
        },
        'error'
      );

      results.push(createErrorResult(error, 'Unknown error during XCM execution'));
    }
  }

  return results;
}

/**
 * Creates a standardized error result for dry run operations
 * @param error - The error that occurred
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Formatted DryRunResult with error
 */
function createErrorResult(error: unknown, defaultMessage: string): DryRunResult {
  return {
    success: false,
    error: error instanceof Error ? error : new Error(`${defaultMessage}: ${String(error)}`)
  };
}
