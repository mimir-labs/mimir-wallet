// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useState } from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import Transfer from './Transfer';

function PageTransfer() {
  const selected = useSelectedAccount();
  const [fromParam] = useQueryParam<string>('from');
  const [assetId] = useQueryParam<string>('assetId');
  const [assetNetwork] = useQueryParam<string>('asset_network');
  const [sending, setSending] = useState<string>(fromParam || selected || '');
  const { meta } = useAddressMeta(sending);
  const supportedNetworks = useAddressSupportedNetworks(sending);
  const [network, setNetwork] = useInputNetwork(
    assetNetwork,
    supportedNetworks?.map((item) => item.key)
  );

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={({ apiState: { chain } }) => (
        <div className='w-[500px] max-w-full mx-auto mt-16 py-10 flex items-center justify-center bg-content1 rounded-large'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <Transfer
        isPure={!!meta.isPure}
        sending={sending}
        setSending={setSending}
        defaultAssetId={assetId}
        network={network}
        setNetwork={setNetwork}
      />
    </SubApiRoot>
  );
}

export default PageTransfer;
