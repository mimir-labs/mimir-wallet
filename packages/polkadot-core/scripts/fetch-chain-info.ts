// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Script to fetch chain information from RPC endpoints and update JSON config files.
 *
 * Usage: npx tsx scripts/fetch-chain-info.ts [--chain <chain-key>]
 *
 * This script connects to each chain's WebSocket endpoint and fetches:
 * - genesisHash
 * - ss58Format
 * - nativeDecimals
 * - nativeToken
 * - supportsDryRun (checks if api.call.dryRunApi exists)
 * - supportsProxy (checks if api.tx.proxy pallet exists)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ApiPromise, WsProvider } from '@polkadot/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ChainConfig {
  key: string;
  name: string;
  wsUrl: Record<string, string>;
  genesisHash?: string;
  ss58Format?: number;
  nativeDecimals?: number;
  nativeToken?: string;
  supportsDryRun?: boolean;
  supportsProxy?: boolean;
  [key: string]: unknown;
}

interface FetchedChainInfo {
  genesisHash: string;
  ss58Format: number;
  nativeDecimals: number;
  nativeToken: string;
  supportsDryRun: boolean;
  supportsProxy: boolean;
}

/**
 * Fetch chain information from RPC endpoint
 */
async function fetchChainInfo(config: ChainConfig): Promise<FetchedChainInfo> {
  const wsUrls = Object.values(config.wsUrl);

  try {
    const api = await ApiPromise.create({ provider: new WsProvider(wsUrls), noInitWarn: true });

    const info: FetchedChainInfo = {
      genesisHash: api.genesisHash.toHex(),
      ss58Format: api.registry.chainSS58 ?? 42,
      nativeDecimals: api.registry.chainDecimals[0] ?? 12,
      nativeToken: api.registry.chainTokens[0] ?? 'UNIT',
      supportsDryRun: typeof api.call.dryRunApi?.dryRunCall === 'function',
      supportsProxy: !!api.tx.proxy
    };

    await api.disconnect();
    console.log(`  ✓ Successfully fetched info for ${config.name}`);

    return info;
  } catch (error) {
    console.warn(`  ✗ Failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  throw new Error(`All endpoints failed for ${config.name}`);
}

/**
 * Compare and show differences between old and new values
 */
function showDiff(chain: ChainConfig, newInfo: FetchedChainInfo): boolean {
  const fields: (keyof FetchedChainInfo)[] = [
    'genesisHash',
    'ss58Format',
    'nativeDecimals',
    'nativeToken',
    'supportsDryRun',
    'supportsProxy'
  ];

  let hasChanges = false;

  for (const field of fields) {
    const oldValue = chain[field];
    const newValue = newInfo[field];

    if (oldValue !== newValue) {
      if (!hasChanges) {
        console.log(`  Changes detected:`);
        hasChanges = true;
      }

      console.log(`    ${field}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    }
  }

  return hasChanges;
}

/**
 * Process a single JSON config file
 */
async function processFile(filePath: string, targetChain?: string): Promise<number> {
  console.log(`\nProcessing ${path.basename(filePath)}...`);

  const chains: ChainConfig[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let updatedCount = 0;

  for (const chain of chains) {
    // Skip if target chain specified and doesn't match
    if (targetChain && chain.key !== targetChain) {
      continue;
    }

    console.log(`\n[${chain.key}] ${chain.name}`);

    try {
      const info = await fetchChainInfo(chain);
      const hasChanges = showDiff(chain, info);

      if (hasChanges) {
        Object.assign(chain, info);
        updatedCount++;
      } else {
        console.log(`  No changes`);
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(chains, null, 2) + '\n');
    console.log(`\n✓ Updated ${updatedCount} chain(s) in ${path.basename(filePath)}`);
  }

  return updatedCount;
}

async function main() {
  const args = process.argv.slice(2);
  let targetChain: string | undefined;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--chain' && args[i + 1]) {
      targetChain = args[i + 1];
      i++;
    }
  }

  console.log('====================================');
  console.log('Chain Info Fetcher');
  console.log('====================================');

  if (targetChain) {
    console.log(`Target chain: ${targetChain}`);
  }

  const chainsDir = path.join(__dirname, '../src/chains');
  const files = ['polkadot.json', 'kusama.json', 'paseo.json', 'westend.json', 'solochain.json'];

  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.join(chainsDir, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`\n⚠ File not found: ${filePath}`);
      continue;
    }

    const updated = await processFile(filePath, targetChain);

    totalUpdated += updated;
  }

  console.log('\n====================================');
  console.log(`Total updated: ${totalUpdated} chain(s)`);
  console.log('====================================');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
