// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { dapps } from '@mimir-wallet/config';
import { isSameOrigin } from '@mimir-wallet/utils';

const PREFIX = 'Mimir|Your Ultimate Web3 Multisig Wallet';

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = PREFIX;

    if (pathname.startsWith('/dapp')) {
      title += ' - Dapp';
    } else if (pathname.startsWith('/transactions')) {
      title += ' - Transactions';
    } else if (pathname.startsWith('/address-book')) {
      title += ' - Address Book';
    } else if (pathname.startsWith('/account-setting')) {
      title += ' - Account Setting';
    } else if (pathname.startsWith('/add-proxy')) {
      title += ' - Add Proxy';
    } else if (pathname.startsWith('/create-multisig')) {
      title += ' - Create Multisig';
    } else if (pathname.startsWith('/create-multisig-one')) {
      title += ' - Create Multisig Threshold 1';
    } else if (pathname.startsWith('/create-pure')) {
      title += ' - Create Pure';
    } else if (pathname.startsWith('/explorer')) {
      const appUrl = pathname.split('/')[2];

      const dapp = dapps.find((item) => item.url.startsWith('https://') && isSameOrigin(item.url, appUrl));

      if (dapp) {
        title += ` - ${dapp.name}`;
      } else {
        title += ` - Explorer(${appUrl})`;
      }
    } else if (pathname.startsWith('/welcome')) {
      title += ' - Welcome';
    }

    document.title = title;
  }, [pathname]);
}