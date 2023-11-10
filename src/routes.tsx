// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createBrowserRouter, Navigate } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageWrapper from './containers/PageWrapper';
import SideBar from './containers/SideBar';
import PageAccountSetting from './pages/account-setting';
import PageAddressBook from './pages/address-book';
import PageCreateMultisig from './pages/create-multisig';
import PageDapp from './pages/dapp';
import PageProfile from './pages/profile';
import PageTransactions from './pages/transactions';
import PageTransfer from './pages/transfer';

export const routes = createBrowserRouter([
  {
    element: <BaseContainer />,
    children: [
      {
        element: <SideBar />,
        children: [
          {
            index: true,
            element: <PageProfile />
          },
          {
            path: 'dapp',
            element: <PageDapp />
          },
          {
            path: 'transactions',
            element: <PageTransactions />
          },
          {
            path: 'address-book',
            element: <PageAddressBook />
          },
          {
            path: 'account-setting/:address',
            element: <PageAccountSetting />
          }
        ]
      },
      {
        element: <PageWrapper />,
        children: [
          {
            path: 'create-multisig',
            element: <PageCreateMultisig />
          },
          {
            path: 'transfer',
            element: <PageTransfer />
          }
        ]
      }
    ]
  },
  { element: <Navigate replace to='/' />, path: '*' }
]);
