// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconDownload from '@/assets/svg/icon-download.svg?react';
import { toastError, toastSuccess } from '@/components/utils';
import { parse } from 'papaparse';
import { useRef } from 'react';

import { isPolkadotAddress } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

function Import() {
  const { addAddress } = useAccount();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const csvData = e.target?.result;

      if (typeof csvData === 'string') {
        parse(csvData, {
          complete: (results) => {
            if (results.errors.length > 0) {
              toastError(`Import failed: ${results.errors?.[0]?.message || 'Unknown error'}`);

              return;
            }

            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];

            const parsedData = rows
              .map((row) => {
                const item: Record<string, string> = {};

                headers.forEach((header, index) => {
                  item[header] = row[index];
                });

                if (item.address && item.name && isPolkadotAddress(item.address)) {
                  return [item.address, item.name];
                }

                return null;
              })
              .filter((item): item is [string, string, string] => item !== null);

            for (const [address, name] of parsedData) {
              addAddress(address, name);
            }

            toastSuccess('Import successful');
          },
          error: (error: Error) => {
            toastError(`Import failed: ${error?.message || 'Unknown error'}`);
          },
          header: false,
          skipEmptyLines: true
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <Button color='primary' variant='ghost' startContent={<IconDownload />} onPress={handleButtonClick}>
      Import
      <input type='file' accept='.csv' hidden onChange={handleImport} ref={fileInputRef} />
    </Button>
  );
}

export default Import;
