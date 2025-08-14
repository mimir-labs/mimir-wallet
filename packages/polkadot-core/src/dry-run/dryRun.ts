// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Result } from '@polkadot/types';
import type { XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError } from '@polkadot/types/lookup';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { DryRunResult } from './types.js';

// Constants for configuration
const DRY_RUN_API_PARAM_COUNT = 2;
const DRY_RUN_API_DEFAULT_VERSION = 4;

// Type definitions for the dry run API calls
interface DryRunOrigin {
  system: {
    Signed: string;
  };
}

import { isHex, isU8a } from '@polkadot/util';

import { assetDispatchError } from '../dispatch-error.js';
import { buildRemoteProxy } from '../remoteProxy.js';
import { parseBalancesChange } from './parse-balances-change.js';

/**
 * Logs debug information with structured format
 * @param label - The label for the debug output
 * @param data - The data to log
 * @param level - Log level (debug, info, warn, error)
 */
function logDebugInfo(label: string, data: unknown, level: 'debug' | 'info' | 'warn' | 'error' = 'debug'): void {
  const timestamp = new Date().toISOString();

  switch (level) {
    case 'error':
      console.error(`[DRY-RUN ERROR] ${timestamp}:`, label, data);
      break;
    case 'warn':
      console.warn(`[DRY-RUN WARN] ${timestamp}:`, label, data);
      break;
    case 'info':
      console.info(`[DRY-RUN INFO] ${timestamp}:`, label, data);
      break;
    default:
      console.log(`[DRY-RUN DEBUG] ${timestamp}:`, label, data);
  }
}

/**
 * Logs performance metrics for operations
 * @param operation - The operation name
 * @param startTime - Start time in milliseconds
 * @param additionalData - Additional context data
 */
function logPerformanceMetrics(operation: string, startTime: number, additionalData?: Record<string, unknown>): void {
  const duration = Date.now() - startTime;

  logDebugInfo(
    'Performance Metrics',
    {
      operation,
      duration: `${duration}ms`,
      ...additionalData
    },
    'info'
  );
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

  logDebugInfo('API Call Configuration', {
    paramCount,
    expectedParams: DRY_RUN_API_PARAM_COUNT,
    useDefaultVersion: paramCount !== DRY_RUN_API_PARAM_COUNT,
    defaultVersion: DRY_RUN_API_DEFAULT_VERSION
  });

  try {
    if (paramCount === DRY_RUN_API_PARAM_COUNT) {
      logDebugInfo('Executing dry run with 2 parameters', {
        hasOrigin: !!origin,
        hasCall: !!processedCall
      });

      return await dryRunApi(origin, processedCall);
    }

    logDebugInfo('Executing dry run with version parameter', {
      hasOrigin: !!origin,
      hasCall: !!processedCall,
      version: DRY_RUN_API_DEFAULT_VERSION
    });

    return await dryRunApi(origin, processedCall, DRY_RUN_API_DEFAULT_VERSION);
  } catch (error) {
    logDebugInfo(
      'Dry Run API Call Failed',
      {
        error: error instanceof Error ? error.message : String(error),
        paramCount,
        apiMethod: dryRunApi.meta?.name?.toString()
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

  // Log function entry with key parameters
  logDebugInfo(
    'Dry Run Started',
    {
      chain: api.runtimeChain.toString(),
      address,
      callType: isU8a(call) ? 'Uint8Array' : isHex(call) ? 'HexString' : 'IMethod'
    },
    'info'
  );

  // Validate dry run API availability
  if (!api.call.dryRunApi?.dryRunCall) {
    const errorMsg = `Dry run API is not supported on chain ${api.runtimeChain.toString()}`;

    logDebugInfo(
      'API Validation Failed',
      {
        chain: api.runtimeChain.toString(),
        error: errorMsg,
        apiMethods: Object.keys(api.call.dryRunApi || {})
      },
      'error'
    );
    throw new Error(errorMsg);
  }

  logDebugInfo(
    'API Validation Passed',
    {
      chain: api.runtimeChain.toString(),
      apiVersion: api.runtimeVersion.specVersion.toString()
    },
    'info'
  );

  const origin: DryRunOrigin = {
    system: {
      Signed: address
    }
  };

  logDebugInfo(
    'Processing Call',
    {
      address,
      originType: 'Signed'
    },
    'info'
  );

  try {
    const processedCall = await buildRemoteProxy(
      api,
      isU8a(call) || isHex(call) ? api.createType('Call', call) : call,
      address
    );

    // Handle the API call with proper typing
    const dryRunApi = api.call.dryRunApi.dryRunCall;

    const result = await executeDryRunCall(dryRunApi, origin, processedCall);

    // Log execution results
    logDebugInfo(
      'Dry Run Execution Completed',
      {
        success: result.isOk,
        resultType: result.isOk ? 'Success' : 'Error'
      },
      result.isOk ? 'info' : 'warn'
    );

    // Log detailed result for debugging
    logDebugInfo('Dry Run Result Details', result.toHuman());

    const processedResult = processDryRunResult(api, result);

    // Log performance metrics
    logPerformanceMetrics('dryRun', startTime, {
      success: processedResult.success,
      chain: api.runtimeChain.toString(),
      address
    });

    logDebugInfo(
      'Dry Run Completed',
      {
        success: processedResult.success,
        hasError: !processedResult.success
      },
      'info'
    );

    return processedResult;
  } catch (error) {
    logDebugInfo(
      'Dry Run Failed',
      {
        error: error instanceof Error ? error.message : String(error),
        address,
        chain: api.runtimeChain.toString()
      },
      'error'
    );

    logPerformanceMetrics('dryRun', startTime, {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

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
  logDebugInfo('Processing Dry Run Result', {
    isOk: result.isOk,
    chain: api.runtimeChain.toString()
  });

  if (!result.isOk) {
    const err = result.asErr;
    const errorMsg = `Dry run failed with error: ${err.type}`;

    logDebugInfo(
      'Dry Run Result Error',
      {
        errorType: err.type,
        errorDetails: err.toHuman(),
        chain: api.runtimeChain.toString()
      },
      'error'
    );

    return {
      success: false,
      error: new Error(errorMsg)
    };
  }

  const ok = result.asOk;
  const executionResult = ok.executionResult;

  logDebugInfo('Extracting Result Data', {
    hasEvents: ok.emittedEvents.length > 0,
    eventCount: ok.emittedEvents.length,
    hasLocalXcm: !ok.localXcm.isNone,
    forwardedXcmCount: ok.forwardedXcms.length,
    executionOk: executionResult.isOk
  });

  const commonData = {
    rawEvents: ok.emittedEvents.toHuman(),
    localXcm: ok.localXcm,
    forwardedXcms: ok.forwardedXcms
  };

  if (executionResult.isOk) {
    const balancesChanges = parseBalancesChange(ok.emittedEvents, api.genesisHash.toHex());

    logDebugInfo(
      'Dry Run Success',
      {
        eventCount: ok.emittedEvents.length,
        balanceChangesCount: balancesChanges.length,
        hasLocalXcm: !ok.localXcm.isNone,
        forwardedXcmCount: ok.forwardedXcms.length
      },
      'info'
    );

    return {
      success: true,
      ...commonData,
      balancesChanges
    };
  }

  const err = executionResult.asErr;
  const dispatchError = assetDispatchError(api, err.error);

  logDebugInfo(
    'Execution Error',
    {
      errorType: err.error.type,
      dispatchError: dispatchError.message,
      eventCount: ok.emittedEvents.length
    },
    'warn'
  );

  return {
    success: false,
    ...commonData,
    error: dispatchError
  };
}
