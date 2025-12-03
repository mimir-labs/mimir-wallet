// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { encodeAddress, type Endpoint } from '@mimir-wallet/polkadot-core';

import { useAddressStore } from '@/hooks/useAddressStore';

export async function initializeAccount(chain: Endpoint, address?: string) {
  useAddressStore.setState({
    current: address ? encodeAddress(address, chain.ss58Format) : undefined
  });
}
