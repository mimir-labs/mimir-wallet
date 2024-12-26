// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressStore } from '@mimir-wallet/hooks/useAddressStore';

export async function initializeAccount(address?: string) {
  useAddressStore.setState({
    current: address
  });
}