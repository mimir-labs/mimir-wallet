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

interface ChainConfig {
  key: string;
  name?: string;
  genesisHash?: string;
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
  const initialChain = assertReturn(
    allEndpoints.find((item) => item.genesisHash === api.genesisHash.toHex()),
    `Unsupported chain with genesisHash: ${api.genesisHash.toHex()}`
  );

  let originParents = 0;
  let originInterior: Record<string, any>;
  const xcmDryRunResult: DryRunResult[] = [];
  const openApis: ApiPromise[] = [];

  for (const xcm of forwardedXcms) {
    try {
      const { chainApi, originInfo } = await processXcmLocation(xcm[0], initialChain, openApis);

      originParents = originInfo.parents;
      originInterior = originInfo.interior;

      const xcmResults = await executeXcmMessages(chainApi, xcm[1], originParents, originInterior);

      xcmDryRunResult.push(...xcmResults);
    } catch (error) {
      // Handle location processing or execution errors gracefully
      xcmDryRunResult.push(createErrorResult(error, 'XCM processing failed'));
    }
  }

  // Clean up all API connections
  await Promise.allSettled(
    openApis.map(async (apiInstance) => {
      try {
        await apiInstance.disconnect();
      } catch {
        // Silently handle disconnection errors in cleanup
      }
    })
  );

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
        `Network not supported, current path is (${currentChain.key})`
      );
    } else {
      throw new Error(`Cannot jump to parent(${parents}), current path is ${currentChain.key}`);
    }
  } else {
    throw new Error(`Cannot jump to parents(${parents}): exceeds maximum parent chain jump limit`);
  }

  for (const interior of interiors) {
    if (interior.isParachain) {
      const paraId = interior.asParachain.toNumber();

      originParents++;

      currentChain = assertReturn(
        allEndpoints.find((item) => item.relayChain && item.relayChain === currentChain.key && item.paraId === paraId),
        `Network not supported, current path is ${currentChain.key}, paraId is ${paraId}`
      );
    } else {
      throw new Error(`Cannot jump to path, current path is ${currentChain.key}, interior(${interior.toString()})`);
    }
  }

  const [chainApi] = await createApi(Object.values(currentChain.wsUrl), currentChain.key, currentChain.httpUrl);

  openApis.push(chainApi);

  await chainApi.isReady;

  if (!chainApi.call.dryRunApi?.dryRunXcm) {
    throw new Error(`Chain ${currentChain.name} does not support XCM dry run API`);
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

  for (const message of messages) {
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
          results.push({
            success: true,
            rawEvents: ok.emittedEvents.toHuman(),
            balancesChanges: parseBalancesChange(ok.emittedEvents, chainApi.genesisHash.toHex()),
            forwardedXcms: ok.forwardedXcms
          });
        } else if (executionResult.isIncomplete) {
          const err = executionResult.asIncomplete;

          results.push({
            success: false,
            rawEvents: ok.emittedEvents.toHuman(),
            error: assetXcmV5TraitsError(err.error),
            forwardedXcms: ok.forwardedXcms
          });
        } else {
          const err = executionResult.asError;

          results.push({
            success: false,
            rawEvents: ok.emittedEvents.toHuman(),
            error: assetXcmV5TraitsError(err.error),
            forwardedXcms: ok.forwardedXcms
          });
        }
      } else {
        const err = result.asErr;

        results.push({
          success: false,
          error: new Error(`XCM dry run failed: ${err.type}`)
        });
      }
    } catch (error) {
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
