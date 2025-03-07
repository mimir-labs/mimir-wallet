// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconDownload from '@/assets/svg/icon-download.svg?react';
import { store } from '@/utils';
import { Button, SvgIcon } from '@mui/material';
import { encodeAddress } from '@polkadot/util-crypto';
import moment from 'moment';
import { unparse } from 'papaparse';

function Export() {
  const handleExport = () => {
    const values: { address: string; name: string; networks: string[] }[] = [];

    store.each((key: string, value) => {
      if (key.startsWith('address:0x')) {
        const v = value as {
          address: string;
          meta: { name: string; watchlist?: boolean; networks?: string[] };
        };

        values.push({
          address: encodeAddress(v.address),
          name: v.meta.name,
          networks: v.meta.networks || []
        });
      }
    });

    const data: string[][] = [
      ['address', 'name', 'network'],
      ...values.map((address) => [address.address, address.name || '', address.networks.join(',')])
    ];
    const csv = unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `mimir-address-book-${moment().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button
      color='primary'
      variant='outlined'
      startIcon={<SvgIcon inheritViewBox sx={{ transform: 'rotate(180deg)' }} component={IconDownload} />}
      onClick={handleExport}
    >
      Export
    </Button>
  );
}

export default Export;
