// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs } from './types';

import { LoadingButton } from '@mui/lab';
import React from 'react';
import { useAsyncFn } from 'react-use';

import { isSuperset } from '@mimir-wallet/api';
import { toastWarn } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

function AddProxy({
  proxied,
  proxy,
  proxyArgs,
  reviewWindow,
  custom,
  proxyType,
  setProxyArgs
}: {
  proxied?: string;
  proxy?: string;
  proxyArgs: ProxyArgs[];
  reviewWindow: number;
  custom: string;
  proxyType: string;
  setProxyArgs: React.Dispatch<React.SetStateAction<ProxyArgs[]>>;
}) {
  const { api } = useApi();

  const [state, onAdd] = useAsyncFn(async () => {
    if (!proxy || !proxied) {
      return;
    }

    const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

    if (addressEq(proxied, proxy)) {
      toastWarn('Can not add self');

      return;
    }

    let exists = proxyArgs.find((item) => item.delegate === proxy && item.proxyType === proxyType);

    if (exists) {
      toastWarn('Already added');

      return;
    }

    exists = proxyArgs.find((item) => item.delegate === proxy && isSuperset(item.proxyType, proxyType));

    if (exists) {
      toastWarn('Already has higher permission proxy');

      return;
    }

    const result = await api.query.proxy.proxies(proxied);

    let onChainExists = result[0].find(
      (item) => item.delegate.toString() === proxy && item.proxyType.type === proxyType
    );

    if (onChainExists) {
      toastWarn('Already added');

      return;
    }

    onChainExists = result[0].find(
      (item) => item.delegate.toString() === proxy && isSuperset(item.proxyType.type, proxyType)
    );

    if (onChainExists) {
      toastWarn('Already has higher permission proxy');

      return;
    }

    setProxyArgs([...proxyArgs, { delegate: proxy, proxyType, delay }]);
  }, [api, custom, proxied, proxy, proxyArgs, proxyType, reviewWindow, setProxyArgs]);

  return (
    <LoadingButton disabled={!proxied || !proxy} fullWidth variant='outlined' onClick={onAdd} loading={state.loading}>
      Add
    </LoadingButton>
  );
}

export default React.memo(AddProxy);
