// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { encodeAddress } from '@mimir-wallet/api';
import { useAddressStore } from '@mimir-wallet/hooks/useAddressStore';
import { useApi } from '@mimir-wallet/hooks/useApi';

export async function initializeAccount(address?: string) {
  const { chainSS58 } = useApi.getState();

  useAddressStore.setState({
    current: address ? encodeAddress(address, chainSS58) : undefined
  });
}
