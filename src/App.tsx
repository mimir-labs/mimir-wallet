// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from './config';

import { useRef } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageAccountSetting from './pages/account-setting';
import PageAddProxy from './pages/add-proxy';
import PageAddressBook from './pages/address-book';
import PageCreateMultisig from './pages/create-multisig';
import PageDapp from './pages/dapp';
import PageExplorer from './pages/explorer';
import PageProfile from './pages/profile';
import PageWelcome from './pages/profile/Welcome';
import PageTransactionDetails from './pages/transaction-details';
import PageTransactions from './pages/transactions';
import PageTransfer from './pages/transfer';
import { Providers } from './providers';

function App({ address, chain }: { address?: string; chain: Endpoint }) {
  const router = useRef(
    createBrowserRouter([
      {
        element: (
          <Providers address={address} chain={chain}>
            <Outlet />
          </Providers>
        ),
        children: [
          {
            element: <BaseContainer auth withSideBar withPadding />,
            children: [
              {
                index: true,
                element: <PageProfile />
              },
              {
                path: '/dapp',
                element: <PageDapp />
              },
              {
                path: '/transactions',
                element: <PageTransactions />
              },
              {
                path: '/transactions/:id',
                element: <PageTransactionDetails />
              },
              {
                path: '/address-book',
                element: <PageAddressBook />
              },
              {
                path: '/account-setting/:address',
                element: <PageAccountSetting />
              }
            ]
          },
          {
            element: <BaseContainer auth withSideBar={false} withPadding />,
            children: [
              {
                path: '/add-proxy',
                element: <PageAddProxy />
              }
            ]
          },
          {
            element: <BaseContainer auth={false} withSideBar={false} withPadding />,
            children: [
              {
                path: '/create-multisig',
                element: <PageCreateMultisig />
              },
              {
                path: '/create-multisig-one',
                element: <PageCreateMultisig threshold1 />
              },
              {
                path: '/create-pure',
                element: <PageAddProxy pure />
              }
            ]
          },
          {
            element: <BaseContainer auth withSideBar={false} withPadding={false} />,
            children: [
              {
                path: '/explorer/:url',
                element: <PageExplorer />
              }
            ]
          },
          {
            element: <BaseContainer auth={false} withSideBar withPadding />,
            children: [
              {
                path: '/welcome',
                element: <PageWelcome />
              }
            ]
          }
        ]
      },
      {
        path: '/transfer',
        element: <PageTransfer />
      },
      {
        path: '*',
        element: <Navigate replace to='/' />
      }
    ])
  );

  return <RouterProvider router={router.current} />;
}

export default App;
