// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { PushMessageData } from './types';

import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState } from 'react';

import { LAST_READ_MESSAGE_KEY } from '@mimir-wallet/constants';
import { SocketCtx } from '@mimir-wallet/socket';
import { store } from '@mimir-wallet/utils';
import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { useApi } from './useApi';

export function useMessages(addresses: HexString[]): [messages: PushMessageData[], isRead: boolean, read: () => void] {
  const { isApiReady } = useApi();
  const { subscribe } = useContext(SocketCtx);
  const { data } = useQuery<PushMessageData[]>({
    refetchInterval: false,
    queryHash: serviceUrl(`messages?${addresses.map((address) => `addresses=${address}`).join('&')}`),
    queryKey: [
      isApiReady && addresses.length > 0
        ? serviceUrl(`messages?${addresses.map((address) => `addresses=${address}`).join('&')}`)
        : null
    ]
  });
  const [pushed, setPushed] = useState<PushMessageData[]>([]);
  const [readId, setReadId] = useState<number | undefined | null>(store.get(LAST_READ_MESSAGE_KEY) as number);

  useEffect(() => {
    const unsubs: (() => any)[] = [];

    addresses.forEach((address) => {
      const listener = (data: PushMessageData) => {
        setPushed((values) => [...values, data]);
      };

      unsubs.push(subscribe(`messages:${address}`, listener));
    });

    return () => unsubs.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.join(''), subscribe]);

  useEffect(() => {
    store.set(LAST_READ_MESSAGE_KEY, readId);
  }, [readId]);

  return useMemo(() => {
    // Remove duplicates
    const map = new Map<string, PushMessageData>();

    for (const item of pushed.concat(data || [])) {
      map.set(JSON.stringify(item.raw), item);
    }

    const list = Array.from(map.values()).sort((l, r) => r.id - l.id);

    return [list, list[0] ? list[0].id === readId : true, () => list[0] && setReadId(list[0].id)];
  }, [data, pushed, readId]);
}
