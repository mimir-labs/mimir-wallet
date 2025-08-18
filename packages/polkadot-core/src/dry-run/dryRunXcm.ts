// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type {
  StagingXcmV4Junction,
  StagingXcmV4Junctions,
  StagingXcmV5Junction,
  StagingXcmV5Junctions,
  XcmV3Junction,
  XcmV3Junctions,
  XcmVersionedLocation,
  XcmVersionedXcm
} from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { DryRunResult } from './types.js';

import { ApiPromise } from '@polkadot/api';
import { assertReturn } from '@polkadot/util';

import { allEndpoints } from '../config.js';
import { assetXcmV5TraitsError } from '../dispatch-error.js';
import { createApi } from '../initialize.js';
import { parseBalancesChange } from './parse-balances-change.js';

type Junctions = XcmV3Junction[] | StagingXcmV4Junction[] | StagingXcmV5Junction[];

// Constants for XCM configuration
const PARENT_CHAIN_JUMP_LIMIT = 1;
const SUPPORTED_XCM_VERSIONS = ['V3', 'V4', 'V5'] as const;

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

interface ChainConfig {
  key: string;
  name?: string;
  genesisHash: string;
  relayChain?: string;
  paraId?: number;
  wsUrl: Record<string, string>;
  httpUrl?: string;
}

interface OriginInfo {
  parents: number;
  interior: Record<string, any>;
}

interface LocationInfo {
  parents: number;
  interiors: Junctions;
}

/**
 * Parses XCM junctions from different versions into a unified format
 * @param junctions - The junctions to parse
 * @returns Array of parsed junctions
 * @throws Error if junctions cannot be parsed
 */
function parseJunctions(junctions: XcmV3Junctions | StagingXcmV4Junctions | StagingXcmV5Junctions): Junctions {
  if (junctions.isHere) {
    return [];
  }

  // Check for X1 through X8 junctions
  const junctionTypes = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8'] as const;

  for (const type of junctionTypes) {
    const isMethodName = `is${type}` as keyof typeof junctions;
    const asMethodName = `as${type}` as keyof typeof junctions;

    if (junctions[isMethodName] && typeof junctions[isMethodName] === 'boolean' && junctions[isMethodName]) {
      return junctions[asMethodName] as Junctions;
    }
  }

  throw new Error('Cannot parse junctions', {
    cause: junctions
  });
}

/**
 * Parses XCM versioned location into chain navigation information
 * @param location - The versioned location to parse
 * @returns Object containing parents count and interior junctions
 * @throws Error if location version is not supported
 */
function parseLocationChain(location: XcmVersionedLocation): LocationInfo {
  // Check supported versions
  for (const version of SUPPORTED_XCM_VERSIONS) {
    const isMethodName = `is${version}` as keyof typeof location;
    const asMethodName = `as${version}` as keyof typeof location;

    if (location[isMethodName] && typeof location[isMethodName] === 'boolean' && location[isMethodName]) {
      const versionedLocation = location[asMethodName] as any;

      return {
        parents: versionedLocation.parents.toNumber(),
        interiors: parseJunctions(versionedLocation.interior)
      };
    }
  }

  throw new Error('Unknown version for XcmVersionedLocation', {
    cause: location
  });
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
      const { chainApi, originInfo } = await processXcmLocation(xcm[0], initialChain, openApis);

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
  initialChain: ChainConfig,
  openApis: ApiPromise[]
): Promise<{ chainApi: ApiPromise; originInfo: OriginInfo }> {
  let currentChain = initialChain;
  let originParents = 0;
  let originInterior: Record<string, any>;

  const { parents, interiors } = parseLocationChain(location);

  // Handle parent chain navigation
  if (parents === 0) {
    originInterior = { Here: {} };
  } else if (parents <= PARENT_CHAIN_JUMP_LIMIT) {
    if (currentChain.relayChain) {
      originInterior = { X1: [{ Parachain: currentChain.paraId }] };

      currentChain = assertReturn(
        allEndpoints.find((item) => item.key === currentChain.relayChain),
        `Relay Network not supported(ParachainID:${currentChain.relayChain})`
      );
    } else {
      const errorMsg = `Cannot jump to parent(${parents}), current path is ${currentChain.key}`;

      logXcmOperation('Navigation Error', { error: errorMsg }, 'error');
      throw new Error(errorMsg);
    }
  } else {
    const errorMsg = `Cannot jump to parents(${parents}): exceeds maximum parent chain jump limit`;

    logXcmOperation('Navigation Error', { error: errorMsg }, 'error');
    throw new Error(errorMsg);
  }

  for (let i = 0; i < interiors.length; i++) {
    const interior = interiors[i];

    if (interior.isParachain) {
      const paraId = interior.asParachain.toNumber();

      originParents++;

      currentChain = assertReturn(
        allEndpoints.find((item) => item.relayChain && item.relayChain === currentChain.key && item.paraId === paraId),
        `Network not supported(ParachainID:${paraId})`
      );
    } else {
      const errorMsg = `Cannot jump to path, current path is ${currentChain.key}, interior(${interior.toString()})`;

      logXcmOperation('Navigation Error', { error: errorMsg }, 'error');
      throw new Error(errorMsg);
    }
  }

  let chainApi: ApiPromise;
  const exists = openApis.find((item) => item.genesisHash.toHex() === currentChain.genesisHash);

  if (exists) {
    chainApi = exists;
  } else {
    [chainApi] = await createApi(Object.values(currentChain.wsUrl), currentChain.key, currentChain.httpUrl);
  }

  await chainApi.isReady;

  if (!exists) {
    openApis.push(chainApi);
  }

  if (!chainApi.call.dryRunApi?.dryRunXcm) {
    const errorMsg = `Chain ${currentChain.name} does not support XCM dry run API`;

    logXcmOperation('API Validation Error', { error: errorMsg }, 'error');
    throw new Error(errorMsg);
  }

  return {
    chainApi,
    originInfo: {
      parents: originParents,
      interior: originInterior
    }
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
