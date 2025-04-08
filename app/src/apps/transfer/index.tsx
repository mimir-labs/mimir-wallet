// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useState } from 'react';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';

import Transfer from './Transfer';

function PageTransfer() {
  const selected = useSelectedAccount();
  const [fromParam] = useQueryParam<string>('from');
  const [assetId] = useQueryParam<string>('assetId');
  const [assetNetwork] = useQueryParam<string>('asset_network');
  const { allApis } = useApi();

  const [sending, setSending] = useState<string>(fromParam || selected || '');
  const { meta } = useAddressMeta(sending);

  let forceNetwork: string | undefined;

  if (meta.isPure) {
    forceNetwork = Object.values(allApis).find((item) => item.genesisHash === meta.pureCreatedAt)?.network;
  }

  return (
    <SubApiRoot defaultNetwork={assetNetwork} forceNetwork={forceNetwork}>
      <Transfer isPure={!!meta.isPure} sending={sending} setSending={setSending} defaultAssetId={assetId} />
    </SubApiRoot>
  );
}

export default PageTransfer;
