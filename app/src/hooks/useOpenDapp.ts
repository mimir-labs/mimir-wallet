// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import { useMimirLayout } from './useMimirLayout';

export function useOpenDapp(dapp: DappOption) {
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { network } = useApi();
  const navigate = useNavigate();

  return useCallback(
    (path?: string) => {
      if (dapp.url === 'mimir://app/batch') {
        setRightSidebarTab('batch');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/template') {
        setRightSidebarTab('template');
        openRightSidebar();
      } else if (dapp.url === 'mimir://app/decoder') {
        setRightSidebarTab('decoder');
        openRightSidebar();
      } else {
        const _url = dapp.urlSearch?.(network) || new URL(dapp.url);

        if (path) {
          dapp.isSubPathHash ? (_url.hash = path) : (_url.pathname = path);
        }

        navigate(`/explorer/${encodeURIComponent(_url.toString())}`);
      }
    },
    [dapp, navigate, network, openRightSidebar, setRightSidebarTab]
  );
}
