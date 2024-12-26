// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, SvgIcon } from '@mui/material';
import { isAddress } from '@polkadot/util-crypto';
import { parse } from 'papaparse';
import { useRef } from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import IconDownload from '@mimir-wallet/assets/svg/icon-download.svg?react';
import { toastError, toastSuccess } from '@mimir-wallet/components/utils';

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

                if (item.address && item.name && item.network && isAddress(item.address)) {
                  return [item.address, item.name, item.network];
                }

                return null;
              })
              .filter((item): item is [string, string, string] => item !== null);

            parsedData.forEach(([address, name, network]) => {
              addAddress(address, name, network.split(','));
            });
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
    <Button
      color='primary'
      variant='outlined'
      startIcon={<SvgIcon inheritViewBox component={IconDownload} />}
      onClick={handleButtonClick}
    >
      Import
      <input type='file' accept='.csv' hidden onChange={handleImport} ref={fileInputRef} />
    </Button>
  );
}

export default Import;
