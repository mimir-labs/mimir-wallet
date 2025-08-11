// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetInfo } from '@/hooks/types';
import type { MultiTransferData } from './types';

import { isValidNumber } from '@/utils';
import Papa from 'papaparse';

import { isPolkadotAddress } from '@mimir-wallet/polkadot-core';

export function parseCsv(
  file: File,
  onDataParsed: (data: MultiTransferData[], invalidAssets?: string[]) => void,
  availableAssets: AssetInfo[],
  onError?: (error: string) => void
) {
  const reader = new FileReader();

  reader.readAsText(file);
  Papa.parse(file, {
    complete: (results) => {
      if (results.errors.length > 0) {
        onError?.(results.errors[0].message);

        return;
      }

      const headers = results.data[0] as string[];
      const rows = results.data.slice(1) as string[][];

      const parsedData = rows.map((row) => {
        const item: Record<string, string> = {};

        headers.forEach((header, index) => {
          item[header] = row[index];
        });

        if (
          item.address &&
          item.amount &&
          item.assetId &&
          isPolkadotAddress(item.address) &&
          isValidNumber(item.amount)
        ) {
          return [item.address, item.assetId, item.amount];
        }

        return null;
      });

      const validData = parsedData.filter<MultiTransferData>((item): item is MultiTransferData => item !== null);

      // filter out invalid assets and report them
      const invalidAssets = validateAssetIds(validData, availableAssets);
      const filteredData = validData.filter(([, assetId]) => {
        return assetId === 'native' || availableAssets.some((asset) => asset.assetId === assetId);
      });

      onDataParsed(filteredData, invalidAssets);
    },
    error: (error) => {
      onError?.(error.message);
    },
    header: false,
    skipEmptyLines: true
  });
}

export function generateExampleCsv() {
  const data = [
    ['address', 'assetId', 'amount'],
    ['111111111111111111111111111111111HC1', 'native', '0.001'],
    ['111111111111111111111111111111111HC1', '1984', '0.001'],
    ['111111111111111111111111111111111HC1', '1337', '0.001']
  ];

  // Convert array to CSV format
  const csvContent = data.map((row) => row.join(',')).join('\n');

  // Create Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'sample.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate asset IDs against available assets on the network
 * @param data - Parsed multi-transfer data
 * @param availableAssets - Available assets on the current network
 * @returns Array of invalid asset IDs
 */
export function validateAssetIds(data: MultiTransferData[], availableAssets: AssetInfo[]): string[] {
  const invalidAssetIds: string[] = [];
  const validAssetIds = new Set(['native']); // 'native' is always valid

  // Add all available asset IDs to the valid set
  availableAssets.forEach((asset) => {
    validAssetIds.add(asset.assetId);
  });

  // Check each asset ID in the data
  data.forEach(([, assetId]) => {
    if (!validAssetIds.has(assetId) && !invalidAssetIds.includes(assetId)) {
      invalidAssetIds.push(assetId);
    }
  });

  return invalidAssetIds;
}
