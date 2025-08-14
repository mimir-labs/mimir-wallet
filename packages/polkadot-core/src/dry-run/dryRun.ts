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
 * Logs debug information in development environment only
 * @param label - The label for the debug output
 * @param data - The data to log
 */
function logDebugInfo(label: string, data: unknown): void {
  console.log(label, data);
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

  if (paramCount === DRY_RUN_API_PARAM_COUNT) {
    return await dryRunApi(origin, processedCall);
  }

  return await dryRunApi(origin, processedCall, DRY_RUN_API_DEFAULT_VERSION);
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
  if (!api.call.dryRunApi?.dryRunCall) {
    throw new Error(`Dry run API is not supported on chain ${api.runtimeChain.toString()}`);
  }

  const origin: DryRunOrigin = {
    system: {
      Signed: address
    }
  };

  const processedCall = await buildRemoteProxy(
    api,
    isU8a(call) || isHex(call) ? api.createType('Call', call) : call,
    address
  );

  // Handle the API call with proper typing
  const dryRunApi = api.call.dryRunApi.dryRunCall;
  const result = await executeDryRunCall(dryRunApi, origin, processedCall);

  // Debug logging for development environment only
  logDebugInfo('dryRun Result', result.toHuman());

  return processDryRunResult(api, result);
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

    return {
      success: false,
      error: new Error(`Dry run failed with error: ${err.type}`)
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
    return {
      success: true,
      ...commonData,
      balancesChanges: parseBalancesChange(ok.emittedEvents, api.genesisHash.toHex())
    };
  }

  const err = executionResult.asErr;

  return {
    success: false,
    ...commonData,
    error: assetDispatchError(api, err.error)
  };
}
