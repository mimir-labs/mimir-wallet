// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useRef } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageAddProxy from './pages/add-proxy';
import PageAddressBook from './pages/address-book';
import PageCreateMultisig from './pages/create-multisig';
import PageDapp from './pages/dapp';
import ErrorPage from './pages/error-page';
import PageExplorer from './pages/explorer';
import PageExtrinsic from './pages/extrinsic';
import PageProfile from './pages/profile';
import PageWelcome from './pages/profile/Welcome';
import PageSetting from './pages/setting';
import PageTransactionDetails from './pages/transaction-details';
import PageTransactions from './pages/transactions';
import PageTransfer from './pages/transfer';
import { ErrorBoundary } from './components';
import Root from './Root';

/**
 * Main Application Component
 *
 * This component serves as the root of the application's routing structure.
 * It defines all available routes and their corresponding components using React Router.
 * The routes are organized into different sections based on authentication requirements
 * and layout configurations (sidebar, padding).
 *
 * Route Categories:
 * - Authenticated routes with sidebar and padding (main app pages)
 * - Authenticated routes without sidebar (specific features)
 * - Public routes (account creation flows)
 * - Explorer routes (special layout)
 * - Welcome and standalone pages
 */
function App() {
  // Define application routing configuration using React Router
  const router = useRef(
    createBrowserRouter([
      {
        element: (
          <Root>
            <Outlet />
          </Root>
        ),
        errorElement: <ErrorPage />,
        children: [
          {
            // Authenticated routes with sidebar and padding
            element: <BaseContainer auth withSideBar withPadding />,
            errorElement: <ErrorPage />,
            children: [
              {
                index: true,
                element: <PageProfile />,
                errorElement: <ErrorPage />
              },
              {
                path: '/dapp',
                element: <PageDapp />,
                errorElement: <ErrorPage />
              },
              {
                path: '/transactions',
                element: <PageTransactions />,
                errorElement: <ErrorPage />
              },
              {
                path: '/transactions/:id',
                element: <PageTransactionDetails />,
                errorElement: <ErrorPage />
              },
              {
                path: '/address-book',
                element: <PageAddressBook />,
                errorElement: <ErrorPage />
              },
              {
                path: '/account-setting',
                element: <PageSetting type='account' />,
                errorElement: <ErrorPage />
              },
              {
                path: '/extrinsic',
                element: <PageExtrinsic />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            // Authenticated routes without sidebar
            element: <BaseContainer auth withSideBar={false} withPadding />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/add-proxy',
                element: <PageAddProxy />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            // Public routes for account creation
            element: <BaseContainer auth={false} withSideBar={false} withPadding />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/create-multisig',
                element: <PageCreateMultisig />,
                errorElement: <ErrorPage />
              },
              {
                path: '/create-multisig-one',
                element: <PageCreateMultisig />,
                errorElement: <ErrorPage />
              },
              {
                path: '/create-pure',
                element: <PageAddProxy pure />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            // Explorer routes without padding
            element: <BaseContainer auth withSideBar={false} withPadding={false} />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/explorer/:url',
                element: <PageExplorer />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            // Welcome page for new users
            element: <BaseContainer auth={false} withSideBar withPadding={false} hideSideBar hideTopBar />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/welcome',
                element: <PageWelcome />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            element: <BaseContainer auth={false} skipConnect withSideBar withPadding />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/setting',
                element: <PageSetting type='general' />,
                errorElement: <ErrorPage />
              }
            ]
          },
          {
            // Standalone transfer page
            path: '/transfer',
            element: <PageTransfer />,
            errorElement: <ErrorPage />
          },
          {
            // Redirect all unmatched routes to home
            path: '*',
            element: <Navigate replace to='/' />,
            errorElement: <ErrorPage />
          }
        ]
      }
    ])
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Router error caught by boundary:', error);
        console.error('Component stack:', errorInfo.componentStack);
      }}
    >
      <RouterProvider router={router.current} />
    </ErrorBoundary>
  );
}

export default App;
