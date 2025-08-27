// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import { useMimirLayout } from './useMimirLayout';

export function useOpenDapp({ url, urlSearch }: { url: string; urlSearch?: (network: string) => URL }) {
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();
  const { network } = useApi();
  const navigate = useNavigate();

  return useCallback(() => {
    if (url === 'mimir://app/batch') {
      setRightSidebarTab('batch');
      openRightSidebar();
    } else if (url === 'mimir://app/template') {
      setRightSidebarTab('template');
      openRightSidebar();
    } else if (url === 'mimir://app/decoder') {
      setRightSidebarTab('decoder');
      openRightSidebar();
    } else {
      const _url = urlSearch?.(network) || url;

      navigate(`/explorer/${encodeURIComponent(_url.toString())}`);
    }
  }, [navigate, network, openRightSidebar, setRightSidebarTab, url, urlSearch]);
}
