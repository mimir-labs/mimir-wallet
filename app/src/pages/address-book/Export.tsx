// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconDownload from '@/assets/svg/icon-download.svg?react';
import { encodeAddress } from '@polkadot/util-crypto';
import moment from 'moment';
import { unparse } from 'papaparse';

import { store } from '@mimir-wallet/service';
import { Button } from '@mimir-wallet/ui';

function Export() {
  const handleExport = () => {
    const values: { address: string; name: string }[] = [];

    store.each((key: string, value) => {
      if (key.startsWith('address:0x')) {
        const v = value as {
          address: string;
          meta: { name: string; watchlist?: boolean };
        };

        values.push({
          address: encodeAddress(v.address),
          name: v.meta.name
        });
      }
    });

    const data: string[][] = [['address', 'name'], ...values.map((address) => [address.address, address.name || ''])];
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
    <Button color='primary' variant='ghost' startContent={<IconDownload />} onPress={handleExport}>
      Export
    </Button>
  );
}

export default Export;
