// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createBrowserRouter, Navigate } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageWrapper from './containers/PageWrapper';
import SideBar from './containers/SideBar';
import PageAccountSetting from './pages/account-setting';
import PageCreateMultisig from './pages/create-multisig';
import PageProfile from './pages/profile';

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
            element: <>dapp</>
          },
          {
            path: 'transactions',
            element: <>transactions</>
          },
          {
            path: 'address-book',
            element: <>address book</>
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
            path: 'transfer/:sender?',
            element: <>transfer</>
          }
        ]
      }
    ]
  },
  { element: <Navigate replace to='/' />, path: '*' }
]);
