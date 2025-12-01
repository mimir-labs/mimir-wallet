// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager, decodeAddress, useNetwork } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { u8aToHex } from '@polkadot/util';
import React from 'react';

import { TxButton } from '@/components';

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
  const { network } = useNetwork();

  return (
    <TxButton
      fullWidth
      color='primary'
      disabled={!(proxy && name)}
      accountId={proxy}
      website='mimir://internal/create-pure'
      getCall={async () => {
        const api = await ApiManager.getInstance().getApi(network);

        if (!api) {
          throw new Error('API not ready');
        }

        const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

        return api.tx.proxy.createPure(proxyType as any, delay, 0).method;
      }}
      beforeSend={
        proxy
          ? async (extrinsic) => {
              await service.multisig.prepareMultisig(
                network,
                u8aToHex(decodeAddress(proxy)),
                extrinsic.hash.toHex(),
                name
              );
            }
          : undefined
      }
    >
      Confirm
    </TxButton>
  );
}

export default React.memo(SubmitPure);
