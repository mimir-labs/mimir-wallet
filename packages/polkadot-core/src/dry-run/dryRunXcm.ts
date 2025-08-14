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
 * Logs XCM operations with structured format and timing
 * @param operation - The operation being performed
 * @param data - Additional data to log
 * @param level - Log level
 */
function logXcmOperation(
  operation: string,
  data: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  const timestamp = new Date().toISOString();
  const logPrefix = `[XCM-${level.toUpperCase()}] ${timestamp}:`;

  switch (level) {
    case 'error':
      console.error(logPrefix, operation, data);
      break;
    case 'warn':
      console.warn(logPrefix, operation, data);
      break;
    default:
      console.info(logPrefix, operation, data);
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

  logXcmOperation('XCM Dry Run Started', {
    chainHash: api.genesisHash.toHex(),
    forwardedXcmCount: forwardedXcms.length,
    runtimeVersion: api.runtimeVersion.specVersion.toString()
  });

  const initialChain = assertReturn(
    allEndpoints.find((item) => item.genesisHash === api.genesisHash.toHex()),
    `Unsupported chain with genesisHash: ${api.genesisHash.toHex()}`
  );

  logXcmOperation('Initial Chain Resolved', {
    chainKey: initialChain.key,
    chainName: initialChain.name,
    isParachain: !!initialChain.paraId,
    paraId: initialChain.paraId
  });

  let originParents = 0;
  let originInterior: Record<string, any>;
  const xcmDryRunResult: DryRunResult[] = [];
  const openApis: ApiPromise[] = [];

  for (let i = 0; i < forwardedXcms.length; i++) {
    const xcm = forwardedXcms[i];

    logXcmOperation('Processing XCM Message', {
      messageIndex: i + 1,
      totalMessages: forwardedXcms.length,
      messageCount: xcm[1].length
    });

    try {
      const { chainApi, originInfo } = await processXcmLocation(xcm[0], initialChain, openApis);

      originParents = originInfo.parents;
      originInterior = originInfo.interior;

      logXcmOperation('XCM Location Processed', {
        messageIndex: i + 1,
        targetChain: chainApi.runtimeChain.toString(),
        originParents,
        hasOriginInterior: Object.keys(originInterior).length > 0
      });

      const xcmResults = await executeXcmMessages(chainApi, xcm[1], originParents, originInterior);

      logXcmOperation('XCM Messages Executed', {
        messageIndex: i + 1,
        resultCount: xcmResults.length,
        successCount: xcmResults.filter((r) => r.success).length,
        errorCount: xcmResults.filter((r) => !r.success).length
      });

      xcmDryRunResult.push(...xcmResults);
    } catch (error) {
      logXcmOperation(
        'XCM Processing Error',
        {
          messageIndex: i + 1,
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        },
        'error'
      );

      xcmDryRunResult.push(createErrorResult(error, 'XCM processing failed'));
    }
  }

  // Clean up all API connections
  logXcmOperation('Cleaning up API connections', {
    openApiCount: openApis.length,
    totalProcessingTime: `${Date.now() - startTime}ms`
  });

  const disconnectResults = await Promise.allSettled(
    openApis.map(async (apiInstance) => {
      try {
        await apiInstance.disconnect();

        return { success: true, chain: apiInstance.runtimeChain.toString() };
      } catch (error) {
        return {
          success: false,
          chain: apiInstance.runtimeChain.toString(),
          error: error instanceof Error ? error.message : String(error)
        };
      }
    })
  );

  const successfulDisconnects = disconnectResults.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failedDisconnects = disconnectResults.length - successfulDisconnects;

  logXcmOperation('API Cleanup Completed', {
    totalConnections: openApis.length,
    successfulDisconnects,
    failedDisconnects,
    totalResults: xcmDryRunResult.length,
    successfulResults: xcmDryRunResult.filter((r) => r.success).length,
    totalProcessingTime: `${Date.now() - startTime}ms`
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
  logXcmOperation('Processing XCM Location', {
    initialChain: initialChain.key,
    initialChainName: initialChain.name
  });

  let currentChain = initialChain;
  let originParents = 0;
  let originInterior: Record<string, any>;

  const { parents, interiors } = parseLocationChain(location);

  logXcmOperation('Location Chain Parsed', {
    parents,
    interiorsCount: interiors.length,
    interiorTypes: interiors.map((i) => Object.keys(i).find((key) => i[key as keyof typeof i]))
  });

  // Handle parent chain navigation
  if (parents === 0) {
    originInterior = { Here: {} };
    logXcmOperation('Parent Navigation - Same Chain', {
      currentChain: currentChain.key,
      parents: 0
    });
  } else if (parents <= PARENT_CHAIN_JUMP_LIMIT) {
    if (currentChain.relayChain) {
      originInterior = { X1: [{ Parachain: currentChain.paraId }] };

      logXcmOperation('Parent Navigation - To Relay Chain', {
        fromParachain: currentChain.key,
        paraId: currentChain.paraId,
        toRelayChain: currentChain.relayChain,
        parents
      });

      currentChain = assertReturn(
        allEndpoints.find((item) => item.key === currentChain.relayChain),
        `Network not supported, current path is (${currentChain.key})`
      );
    } else {
      const errorMsg = `Cannot jump to parent(${parents}), current path is ${currentChain.key}`;

      logXcmOperation(
        'Parent Navigation Error - No Relay Chain',
        {
          currentChain: currentChain.key,
          parents,
          error: errorMsg
        },
        'error'
      );
      throw new Error(errorMsg);
    }
  } else {
    const errorMsg = `Cannot jump to parents(${parents}): exceeds maximum parent chain jump limit`;

    logXcmOperation(
      'Parent Navigation Error - Limit Exceeded',
      {
        parents,
        limit: PARENT_CHAIN_JUMP_LIMIT,
        currentChain: currentChain.key,
        error: errorMsg
      },
      'error'
    );
    throw new Error(errorMsg);
  }

  for (let i = 0; i < interiors.length; i++) {
    const interior = interiors[i];

    if (interior.isParachain) {
      const paraId = interior.asParachain.toNumber();

      logXcmOperation('Interior Navigation - To Parachain', {
        step: i + 1,
        totalSteps: interiors.length,
        fromChain: currentChain.key,
        targetParaId: paraId
      });

      originParents++;

      currentChain = assertReturn(
        allEndpoints.find((item) => item.relayChain && item.relayChain === currentChain.key && item.paraId === paraId),
        `Network not supported, current path is ${currentChain.key}, paraId is ${paraId}`
      );

      logXcmOperation('Interior Navigation - Parachain Resolved', {
        step: i + 1,
        resolvedChain: currentChain.key,
        chainName: currentChain.name,
        paraId: currentChain.paraId
      });
    } else {
      const errorMsg = `Cannot jump to path, current path is ${currentChain.key}, interior(${interior.toString()})`;

      logXcmOperation(
        'Interior Navigation Error',
        {
          step: i + 1,
          currentChain: currentChain.key,
          interiorType: Object.keys(interior).find((key) => interior[key as keyof typeof interior]),
          error: errorMsg
        },
        'error'
      );
      throw new Error(errorMsg);
    }
  }

  let chainApi: ApiPromise;
  const exists = openApis.find((item) => item.genesisHash.toHex() === currentChain.genesisHash);

  if (exists) {
    chainApi = exists;
    logXcmOperation('API Connection - Reusing Existing', {
      targetChain: currentChain.key,
      chainName: currentChain.name,
      totalOpenApis: openApis.length
    });
  } else {
    logXcmOperation('API Connection - Creating New', {
      targetChain: currentChain.key,
      chainName: currentChain.name,
      wsUrls: Object.values(currentChain.wsUrl),
      hasHttpUrl: !!currentChain.httpUrl
    });

    [chainApi] = await createApi(Object.values(currentChain.wsUrl), currentChain.key, currentChain.httpUrl);
  }

  await chainApi.isReady;

  if (!exists) {
    openApis.push(chainApi);
  }

  logXcmOperation('API Connection - Ready', {
    targetChain: currentChain.key,
    runtimeVersion: chainApi.runtimeVersion.specVersion.toString(),
    totalOpenApis: openApis.length
  });

  if (!chainApi.call.dryRunApi?.dryRunXcm) {
    const errorMsg = `Chain ${currentChain.name} does not support XCM dry run API`;

    logXcmOperation(
      'API Validation Error - No XCM Support',
      {
        targetChain: currentChain.key,
        chainName: currentChain.name,
        availableApis: Object.keys(chainApi.call.dryRunApi || {}),
        error: errorMsg
      },
      'error'
    );
    throw new Error(errorMsg);
  }

  logXcmOperation('API Validation - XCM Support Confirmed', {
    targetChain: currentChain.key,
    chainName: currentChain.name
  });

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

  logXcmOperation('Executing XCM Messages', {
    chain: chainApi.runtimeChain.toString(),
    messageCount: messages.length,
    originParents,
    originInteriorType: Object.keys(originInterior)[0]
  });

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    logXcmOperation('Processing XCM Message', {
      messageIndex: i + 1,
      totalMessages: messages.length,
      chain: chainApi.runtimeChain.toString()
    });

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

      logXcmOperation('XCM Dry Run Call Completed', {
        messageIndex: i + 1,
        success: result.isOk,
        chain: chainApi.runtimeChain.toString()
      });

      if (result.isOk) {
        const ok = result.asOk;
        const executionResult = ok.executionResult;

        logXcmOperation('XCM Result Analysis', {
          messageIndex: i + 1,
          executionComplete: executionResult.isComplete,
          executionIncomplete: executionResult.isIncomplete,
          executionError: executionResult.isError,
          eventCount: ok.emittedEvents.length,
          forwardedXcmCount: ok.forwardedXcms.length
        });

        if (executionResult.isComplete) {
          const balancesChanges = parseBalancesChange(ok.emittedEvents, chainApi.genesisHash.toHex());

          logXcmOperation('XCM Execution Success', {
            messageIndex: i + 1,
            eventCount: ok.emittedEvents.length,
            balanceChangesCount: balancesChanges.length,
            forwardedXcmCount: ok.forwardedXcms.length
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

          logXcmOperation(
            'XCM Execution Incomplete',
            {
              messageIndex: i + 1,
              error: xcmError.message,
              errorType: err.error.type,
              eventCount: ok.emittedEvents.length
            },
            'warn'
          );

          results.push({
            success: false,
            rawEvents: ok.emittedEvents.toHuman(),
            error: xcmError,
            forwardedXcms: ok.forwardedXcms
          });
        } else {
          const err = executionResult.asError;
          const xcmError = assetXcmV5TraitsError(err.error);

          logXcmOperation(
            'XCM Execution Error',
            {
              messageIndex: i + 1,
              error: xcmError.message,
              errorType: err.error.type,
              eventCount: ok.emittedEvents.length
            },
            'error'
          );

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

        logXcmOperation(
          'XCM Dry Run Failed',
          {
            messageIndex: i + 1,
            errorType: err.type,
            error: errorMsg
          },
          'error'
        );

        results.push({
          success: false,
          error: new Error(errorMsg)
        });
      }
    } catch (error) {
      logXcmOperation(
        'XCM Message Execution Error',
        {
          messageIndex: i + 1,
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        },
        'error'
      );

      results.push(createErrorResult(error, 'Unknown error during XCM execution'));
    }
  }

  logXcmOperation('XCM Messages Execution Completed', {
    totalMessages: messages.length,
    totalResults: results.length,
    successCount: results.filter((r) => r.success).length,
    errorCount: results.filter((r) => !r.success).length,
    chain: chainApi.runtimeChain.toString()
  });

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
