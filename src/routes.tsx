// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageWrapper, { PageWrapperMain } from './containers/PageWrapper';
import PageAccountSetting from './pages/account-setting';
import PageAddressBook from './pages/address-book';
import PageCreateMultisig from './pages/create-multisig';
import PageDapp from './pages/dapp';
import PageExplorer from './pages/explorer';
import PageProfile from './pages/profile';
import PageTransactions from './pages/transactions';
import PageTransfer from './pages/transfer';

export const routes = createBrowserRouter([
  {
    element: <BaseContainer fixedSidebar />,
    children: [
      {
        element: <PageWrapperMain />,
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
            path: 'account-setting/:address?',
            element: <PageAccountSetting />
          }
        ]
      }
    ]
  },
  {
    element: <BaseContainer fixedSidebar={false} />,
    children: [
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
      },
      {
        element: (
          <Box sx={{ height: '100vh', paddingTop: '56px' }}>
            <Outlet />
          </Box>
        ),
        path: 'explorer',
        children: [
          {
            path: ':url',
            element: <PageExplorer />
          }
        ]
      }
    ]
  },
  { element: <Navigate replace to='/' />, path: '*' }
]);
