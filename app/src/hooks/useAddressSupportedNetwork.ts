// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useMemo } from 'react';

import { remoteProxyRelations, useNetworks } from '@mimir-wallet/polkadot-core';

// get supported networks by address, undefined if supported all
export function useAddressSupportedNetworks(address?: string | null) {
  const { networks } = useNetworks();
  const { meta } = useAddressMeta(address);

  const supportedNetwork = useMemo(() => {
    if (meta.isPure) {
      const supported = networks.filter(
        (item) =>
          item.genesisHash === meta.pureCreatedAt ||
          (remoteProxyRelations[meta.pureCreatedAt]
            ? item.genesisHash === remoteProxyRelations[meta.pureCreatedAt]
            : false)
      );

      return supported;
    }

    return undefined;
  }, [meta.isPure, meta.pureCreatedAt, networks]);

  return useMemo(() => (supportedNetwork ? supportedNetwork : undefined), [supportedNetwork]);
}
