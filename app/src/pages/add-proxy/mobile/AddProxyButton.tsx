// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs } from '../types';

import { toastWarn } from '@/components/utils';
import React from 'react';
import { useAsyncFn } from 'react-use';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

function AddProxyButton({
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
    if (!(proxy && proxied)) {
      return;
    }

    const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

    if (addressEq(proxied, proxy)) {
      toastWarn('Can not add self');

      return;
    }

    const exists = proxyArgs.find((item) => item.delegate === proxy && item.proxyType === proxyType);

    if (exists) {
      toastWarn('Already added');

      return;
    }

    const result = await api.query.proxy.proxies(proxied);

    const onChainExists = result[0].find(
      (item) => item.delegate.toString() === proxy && item.proxyType.type === proxyType
    );

    if (onChainExists) {
      toastWarn('Already added');

      return;
    }

    setProxyArgs([...proxyArgs, { delegate: proxy, proxyType, delay }]);
  }, [api, custom, proxied, proxy, proxyArgs, proxyType, reviewWindow, setProxyArgs]);

  return (
    <Button isDisabled={!(proxied && proxy)} fullWidth variant='ghost' onPress={onAdd} isLoading={state.loading}>
      Add
    </Button>
  );
}

export default React.memo(AddProxyButton);
