// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { ExtDef } from '@polkadot/types/extrinsic/signedExtensions/types';
import type { Registry } from '@polkadot/types/types';

import { type Metadata, TypeRegistry } from '@polkadot/types';

export class StoredRegistry extends TypeRegistry {
  public latestMetadata!: Metadata;

  public override setMetadata(
    metadata: Metadata,
    signedExtensions?: string[],
    userExtensions?: ExtDef,
    noInitWarn?: boolean
  ): void {
    this.latestMetadata = metadata;
    super.setMetadata(metadata, signedExtensions, userExtensions, noInitWarn);
  }
}

/**
 * Create a registry for parsing calls at a specific block
 * This function attempts to create a block-specific registry that can properly
 * decode calls that were valid at that historical block height
 */
export async function createBlockRegistry(api: ApiPromise, blockNumber: string | number): Promise<Registry> {
  try {
    // Get the block registry for the specific block
    // This will include the metadata that was active at that block
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const blockRegistry = await api.getBlockRegistry(blockHash);

    return blockRegistry.registry;
  } catch (error) {
    console.warn('Failed to create block registry, falling back to current registry:', error);

    // Fallback to current registry if block-specific registry creation fails
    return api.registry;
  }
}
