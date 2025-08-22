// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  StagingXcmV4Junctions,
  StagingXcmV5Junctions,
  XcmV3Junctions,
  XcmVersionedLocation
} from '@polkadot/types/lookup';
import type { HexString } from '@polkadot/util/types';
import type { Junctions, LocationInfo, SupportXcmChainConfig, XcmChainConfig } from './types.js';

import { allEndpoints } from '../config.js';

const PARENT_CHAIN_JUMP_LIMIT = 1;
const SUPPORTED_XCM_VERSIONS = ['V3', 'V4', 'V5'] as const;

export class XcmNetworkNotSupportError extends Error {
  public paraId: number;

  constructor(paraId: number) {
    super(`Network not supported(ParachainID:${paraId})`);
    this.paraId = paraId;
  }
}

/**
 * Parses XCM junctions from different versions into a unified format
 * @param junctions - The junctions to parse
 * @returns Array of parsed junctions
 * @throws Error if junctions cannot be parsed
 */
export function parseJunctions(junctions: XcmV3Junctions | StagingXcmV4Junctions | StagingXcmV5Junctions): Junctions {
  if (junctions.isHere) {
    return [];
  }

  // Check for X1 through X8 junctions
  const junctionTypes = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8'] as const;

  for (const type of junctionTypes) {
    const isMethodName = `is${type}` as keyof typeof junctions;
    const asMethodName = `as${type}` as keyof typeof junctions;

    if (junctions[isMethodName] && typeof junctions[isMethodName] === 'boolean' && junctions[isMethodName]) {
      const value = junctions[asMethodName];

      if (Array.isArray(value)) {
        return value as Junctions;
      } else {
        return [value] as Junctions;
      }
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
export function parseLocationChain(location: XcmVersionedLocation): LocationInfo {
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

export function loopLocation(
  location: LocationInfo,
  initialChain: SupportXcmChainConfig
): {
  chain: XcmChainConfig;
  beneficiary: string | null;
  palletIndex: number | null;
  generalIndex: string | null;
  generalKey: HexString | null;
  origin: { parents: number; interior: Record<string, any> };
} {
  const { parents, interiors } = location;
  let originParents = 0;
  let originInterior: Record<string, any>;
  let beneficiary: string | null = null;
  let palletIndex: number | null = null;
  let generalIndex: string | null = null;
  let generalKey: HexString | null = null;

  let currentChain: XcmChainConfig = (() => {
    // Handle parent chain navigation
    if (parents === 0) {
      originInterior = { Here: {} };

      return initialChain;
    } else if (parents <= PARENT_CHAIN_JUMP_LIMIT) {
      const relayChain = initialChain.relayChain;

      originInterior = { X1: [{ Parachain: initialChain.paraId }] };

      const findedChain = allEndpoints.find((item) => item.key === relayChain);

      if (findedChain) {
        return { isSupport: true, ...findedChain };
      }

      throw new Error(`Relay Network not supported(ParachainID:${JSON.stringify(initialChain)})`);
    } else {
      const errorMsg = `Cannot jump to parents(${parents}): exceeds maximum parent chain jump limit`;

      throw new Error(errorMsg);
    }
  })();

  for (let i = 0; i < interiors.length; i++) {
    const interior = interiors[i];

    if (interior.isParachain) {
      const paraId = interior.asParachain.toNumber();

      originParents++;

      const findedChain = allEndpoints.find(
        (item) =>
          currentChain.isSupport && item.relayChain && item.relayChain === currentChain.key && item.paraId === paraId
      );

      if (!findedChain) {
        currentChain = { isSupport: false, paraId: paraId };
      } else {
        currentChain = { isSupport: true, ...findedChain };
      }
    } else if (interior.isAccountId32) {
      beneficiary = interior.asAccountId32.id.toString();
    } else if (interior.isPalletInstance) {
      palletIndex = interior.asPalletInstance.toNumber();
    } else if (interior.isGeneralIndex) {
      generalIndex = interior.asGeneralIndex.toString();
    } else if (interior.isGeneralKey) {
      console.log(interior.asGeneralKey.toHuman());
      generalKey = interior.asGeneralKey.data.toHex();
    } else {
      const errorMsg = `Cannot jump to path, current path is ${currentChain}, interior(${interior.toString()})`;

      throw new Error(errorMsg);
    }
  }

  return {
    chain: currentChain,
    beneficiary,
    palletIndex,
    generalIndex,
    generalKey,
    origin: {
      parents: originParents,
      interior: originInterior
    }
  };
}

export function findDestChain(location: XcmVersionedLocation, initialChain: SupportXcmChainConfig) {
  return loopLocation(parseLocationChain(location), initialChain);
}

export function parseAccountFromLocation(location: XcmVersionedLocation): string | null {
  const { interiors } = parseLocationChain(location);

  if (interiors.length === 0) {
    return null;
  }

  if (interiors[interiors.length - 1].isAccountId32) {
    return interiors[interiors.length - 1].asAccountId32.id.toString();
  }

  return null;
}
