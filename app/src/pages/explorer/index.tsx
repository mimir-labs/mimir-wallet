// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
        const app = dapps.find((item) => _url.startsWith(item.url));
        const params = new URLSearchParams(new URL(_url).searchParams);

        const props: Record<string, unknown> = {};

        for (const [key, value] of params) {
          props[key] = value;
        }

        app?.Component?.().then((C) => {
          setElement(createElement(C, props));
        });
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
