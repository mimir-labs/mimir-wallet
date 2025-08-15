// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Result } from '@polkadot/types';
import type { XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError } from '@polkadot/types/lookup';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { DryRunResult } from './types.js';

import { isHex, isU8a } from '@polkadot/util';

import { assetDispatchError } from '../dispatch-error.js';
import { buildRemoteProxy } from '../remoteProxy.js';
import { parseBalancesChange } from './parse-balances-change.js';

// Constants for configuration
const DRY_RUN_API_PARAM_COUNT = 2;
const DRY_RUN_API_DEFAULT_VERSION = 4;

// Type definitions for the dry run API calls
interface DryRunOrigin {
  system: {
    Signed: string;
  };
}

/**
 * Logs debug information for dry run operations
 * @param label - The label for the debug output
 * @param data - The data to log
 * @param level - Log level (debug, info, warn, error)
 */
function logDebugInfo(label: string, data: unknown, level: 'debug' | 'info' | 'warn' | 'error' = 'debug'): void {
  switch (level) {
    case 'error':
      console.error('[DRY-RUN]', label, data);
      break;
    case 'warn':
      console.warn('[DRY-RUN]', label, data);
      break;
    case 'info':
      console.info('[DRY-RUN]', label, data);
      break;
    default:
      console.log('[DRY-RUN]', label, data);
  }
}

/**
 * Logs performance metrics for operations
 * @param operation - The operation name
 * @param startTime - Start time in milliseconds
 * @param success - Whether the operation was successful
 */
function logPerformanceMetrics(operation: string, startTime: number, success: boolean): void {
  const duration = Date.now() - startTime;

  logDebugInfo('Performance', { operation, duration: `${duration}ms`, success }, 'info');
}

/**
 * Executes the dry run API call with proper version handling
 * @param dryRunApi - The dry run API method
 * @param origin - The origin for the dry run
 * @param processedCall - The processed call to execute
 * @returns The dry run result
 */
async function executeDryRunCall(
  dryRunApi: any,
  origin: DryRunOrigin,
  processedCall: IMethod | Uint8Array
): Promise<Result<XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError>> {
  const paramCount = dryRunApi.meta.params.length;

  logDebugInfo('API Configuration', { paramCount, expectedParams: DRY_RUN_API_PARAM_COUNT });

  try {
    if (paramCount === DRY_RUN_API_PARAM_COUNT) {
      return await dryRunApi(origin, processedCall);
    }

    return await dryRunApi(origin, processedCall, DRY_RUN_API_DEFAULT_VERSION);
  } catch (error) {
    logDebugInfo(
      'API Call Failed',
      {
        error: error instanceof Error ? error.message : String(error)
      },
      'error'
    );
    throw error;
  }
}

/**
 * Performs a dry run of a transaction call to simulate execution without committing to the blockchain
 * @param api - The Polkadot API instance
 * @param call - The transaction call to simulate
 * @param address - The address to execute the call from
 * @returns Promise resolving to the dry run result
 * @throws Error if dry run is not supported by the runtime
 */
export async function dryRun(
  api: ApiPromise,
  call: IMethod | Uint8Array | HexString,
  address: string
): Promise<DryRunResult> {
  const startTime = Date.now();

  logDebugInfo('Started', { chain: api.runtimeChain.toString(), address }, 'info');

  // Validate dry run API availability
  if (!api.call.dryRunApi?.dryRunCall) {
    const errorMsg = `Dry run API is not supported on chain ${api.runtimeChain.toString()}`;

    logDebugInfo('API Validation Failed', { error: errorMsg }, 'error');
    throw new Error(errorMsg);
  }

  const origin: DryRunOrigin = {
    system: {
      Signed: address
    }
  };

  try {
    const processedCall = await buildRemoteProxy(
      api,
      isU8a(call) || isHex(call) ? api.createType('Call', call) : call,
      address
    );

    // Handle the API call with proper typing
    const dryRunApi = api.call.dryRunApi.dryRunCall;

    const result = await executeDryRunCall(dryRunApi, origin, processedCall);

    logDebugInfo('Execution Completed', { success: result.isOk }, result.isOk ? 'info' : 'warn');

    const processedResult = processDryRunResult(api, result);

    logPerformanceMetrics('dryRun', startTime, processedResult.success);

    return processedResult;
  } catch (error) {
    logDebugInfo(
      'Failed',
      {
        error: error instanceof Error ? error.message : String(error)
      },
      'error'
    );
    logPerformanceMetrics('dryRun', startTime, false);
    throw error;
  }
}

/**
 * Processes the dry run result and returns a standardized format
 * @param api - The Polkadot API instance
 * @param result - The raw dry run result
 * @returns The processed dry run result
 */
function processDryRunResult(
  api: ApiPromise,
  result: Result<XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError>
): DryRunResult {
  if (!result.isOk) {
    const err = result.asErr;
    const errorMsg = `Dry run failed with error: ${err.type}`;

    logDebugInfo('Result Error', { errorType: err.type }, 'error');

    return {
      success: false,
      error: new Error(errorMsg)
    };
  }

  const ok = result.asOk;
  const executionResult = ok.executionResult;

  const commonData = {
    rawEvents: ok.emittedEvents.toHuman(),
    localXcm: ok.localXcm,
    forwardedXcms: ok.forwardedXcms
  };

  if (executionResult.isOk) {
    const balancesChanges = parseBalancesChange(ok.emittedEvents, api.genesisHash.toHex());

    logDebugInfo('Success', { events: ok.emittedEvents.length, balanceChanges: balancesChanges.length }, 'info');

    return {
      success: true,
      ...commonData,
      balancesChanges
    };
  }

  const err = executionResult.asErr;
  const dispatchError = assetDispatchError(api, err.error);

  logDebugInfo('Execution Error', { errorType: err.error.type }, 'warn');

  return {
    success: false,
    ...commonData,
    error: dispatchError
  };
}
