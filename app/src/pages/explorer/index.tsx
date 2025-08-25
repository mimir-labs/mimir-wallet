// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Batch from '@/apps/batch';
import MultiTransfer from '@/apps/multi-transfer';
import Transfer from '@/apps/transfer';
import { type CustomDappOption, dapps } from '@/config';
import { CUSTOM_APP_KEY } from '@/constants';
import { createElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { store } from '@mimir-wallet/service';

import AppFrame from './AppFrame';

function AppExplorer() {
  const { url } = useParams<'url'>();
  const [element, setElement] = useState<JSX.Element>();

  useEffect(() => {
    if (url) {
      const _url = decodeURIComponent(url);
      const customApps = Object.values((store.get(CUSTOM_APP_KEY) || {}) as Record<string | number, CustomDappOption>);

      if (_url.startsWith('mimir://app')) {
        const params = new URLSearchParams(new URL(_url).searchParams);

        const props: Record<string, unknown> = {};

        for (const [key, value] of params) {
          props[key] = value;
        }

        // Map URLs to components
        if (_url.startsWith('mimir://app/transfer')) {
          setElement(createElement(Transfer, props));
        } else if (_url.startsWith('mimir://app/batch')) {
          setElement(createElement(Batch, props));
        } else if (_url.startsWith('mimir://app/multi-transfer')) {
          setElement(createElement(MultiTransfer, props));
        }
      } else {
        const apps = [...dapps, ...customApps];

        const app = apps.find((item) => _url.startsWith(item.url));

        setElement(<AppFrame url={url} iconUrl={app?.icon} appName={app?.name} />);
      }
    }
  }, [url]);

  if (element) {
    return element;
  }

  return null;
}

export default AppExplorer;
