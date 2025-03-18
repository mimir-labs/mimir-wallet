// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressStore } from '@/hooks/useAddressStore';

import { encodeAddress } from '@mimir-wallet/polkadot-core';

export async function initializeAccount(address?: string) {
  useAddressStore.setState({
    current: address ? encodeAddress(address) : undefined
  });
}
