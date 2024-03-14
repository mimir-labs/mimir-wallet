// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { PushMessageData } from './types';

import { getServiceUrl } from '@mimir-wallet/utils/service';
import useSWR from 'swr';

import { useApi } from './useApi';

export function useMessages(addresses: HexString[]): PushMessageData[] {
  const { isApiReady } = useApi();

  const { data } = useSWR<PushMessageData[]>(isApiReady && addresses.length > 0 ? getServiceUrl(`messages?${addresses.map((address) => `addresses=${address}`).join('&')}`) : null);

  return data || [];
}
