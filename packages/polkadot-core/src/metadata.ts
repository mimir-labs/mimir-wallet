// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { deleteDB, openDB } from 'idb';

function openMetadataDB() {
  return openDB('chain_metadata_v2', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'network' });
      }

      deleteDB('chain_metadata');
    }
  });
}

export async function getMetadata(network: string) {
  const db = await openMetadataDB();
  const metadata = await db.get('metadata', network);

  db.close();

  if (!metadata) {
    return undefined;
  }

  return { [`${metadata.genesisHash}-${metadata.specVersion}`]: metadata.metadata };
}

export async function saveMetadata(network: string, genesisHash: string, specVersion: string, metadata: string) {
  const db = await openMetadataDB();

  await db.put('metadata', {
    network,
    genesisHash,
    specVersion,
    metadata
  });

  db.close();
}
