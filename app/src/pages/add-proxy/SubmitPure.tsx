// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TxButton } from '@/components';
import { service } from '@/utils';
import { u8aToHex } from '@polkadot/util';
import React from 'react';

import { decodeAddress, useApi } from '@mimir-wallet/polkadot-core';

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

  return (
    <TxButton
      fullWidth
      color='primary'
      isDisabled={!(proxy && name)}
      accountId={proxy}
      website='mimir://internal/create-pure'
      getCall={() => {
        const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

        return api.tx.proxy.createPure(proxyType as any, delay, 0).method;
      }}
      beforeSend={
        proxy
          ? async (extrinsic) => {
              await service.prepareMultisig(u8aToHex(decodeAddress(proxy)), extrinsic.hash.toHex(), name);
            }
          : undefined
      }
    >
      Submit
    </TxButton>
  );
}

export default React.memo(SubmitPure);
