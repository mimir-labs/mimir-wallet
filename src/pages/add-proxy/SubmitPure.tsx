// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import React from 'react';

import { decodeAddress } from '@mimir-wallet/api';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { service } from '@mimir-wallet/utils';

function SubmitPure({
  proxy,
  name,
  reviewWindow,
  custom,
  proxyType
}: {
  proxy?: string;
  name: string;
  reviewWindow: number;
  custom: string;
  proxyType: string;
}) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();

  return (
    <Button
      fullWidth
      disabled={!proxy || !name}
      onClick={() => {
        if (!proxy) {
          return;
        }

        const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

        addQueue({
          call: api.tx.proxy.createPure(proxyType as any, delay, 0).method,
          accountId: proxy,
          website: 'mimir://internal/create-pure',
          beforeSend: async (extrinsic) => {
            await service.prepareMultisig(u8aToHex(decodeAddress(proxy)), extrinsic.hash.toHex(), name);
          }
        });
      }}
    >
      Submit
    </Button>
  );
}

export default React.memo(SubmitPure);
