// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtDef } from '@polkadot/types/extrinsic/signedExtensions/types';

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
