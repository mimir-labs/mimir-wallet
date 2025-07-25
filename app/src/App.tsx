// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet, useRoutes } from 'react-router-dom';

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
import { Navigate } from './components';
import Root from './Root';

const routes = [
  {
    element: (
      <Root>
        <Outlet />
      </Root>
    ),
    children: [
      {
        // Authenticated routes with sidebar and padding
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
            path: '/account-setting',
            element: <PageSetting type='account' />
          },
          {
            path: '/extrinsic',
            element: <PageExtrinsic />
          }
        ]
      },
      {
        // Authenticated routes without sidebar
        element: <BaseContainer auth withSideBar={false} withPadding />,

        children: [
          {
            path: '/add-proxy',
            element: <PageAddProxy />
          }
        ]
      },
      {
        // Public routes for account creation
        element: <BaseContainer auth={false} withSideBar={false} withPadding />,

        children: [
          {
            path: '/create-multisig',
            element: <PageCreateMultisig />
          },
          {
            path: '/create-multisig-one',
            element: <PageCreateMultisig />
          },
          {
            path: '/create-pure',
            element: <PageAddProxy pure={true} />
          }
        ]
      },
      {
        // Explorer routes without padding
        element: <BaseContainer auth withSideBar={false} withPadding={false} />,
        children: [
          {
            path: '/explorer/:url',
            element: <PageExplorer />
          }
        ]
      },
      {
        // Welcome page for new users
        element: <BaseContainer auth={false} withSideBar withPadding={false} hideSideBar hideTopBar />,

        children: [
          {
            path: '/welcome',
            element: <PageWelcome />
          }
        ]
      },
      {
        element: <BaseContainer auth={false} skipConnect withSideBar withPadding />,
        children: [
          {
            path: '/setting',
            element: <PageSetting type='general' />
          }
        ]
      },
      {
        // Standalone transfer page
        path: '/transfer',
        element: <PageTransfer />
      },
      {
        // Redirect all unmatched routes to home
        path: '*',
        element: <Navigate replace to='/' />
      }
    ]
  }
];

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
  const element = useRoutes(routes);

  return <ErrorPage>{element}</ErrorPage>;
}

export default App;
