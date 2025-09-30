// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Navigate } from '@/components';
import BaseContainer from '@/containers/BaseContainer';
import PageAddProxy from '@/pages/add-proxy';
import PageAddressBook from '@/pages/address-book';
import PageAnalytic from '@/pages/analytic';
import PageAssets from '@/pages/assets';
import PageCreateMultisig from '@/pages/create-multisig';
import PageDapp from '@/pages/dapp';
import PageExplorer from '@/pages/explorer';
import PageFund from '@/pages/fund';
import PageProfile from '@/pages/profile';
import PageWelcome from '@/pages/profile/Welcome';
import PageSetting from '@/pages/setting';
import PageTransactionDetails from '@/pages/transaction-details';
import PageTransactions from '@/pages/transactions';
import Root from '@/Root';
import { Outlet } from 'react-router-dom';

export const routes = [
  {
    element: (
      <Root>
        <Outlet />
      </Root>
    ),
    children: [
      {
        // Authenticated routes with sidebar and padding
        element: <BaseContainer auth withPadding />,
        children: [
          {
            index: true,
            element: <PageProfile />,
            description:
              'Multisig control center with account structure view, balance overview, transaction analytics, and quick actions for Polkadot ecosystem'
          },
          {
            path: '/dapp',
            element: <PageDapp />,
            description:
              'Integrated DApp hub with deep integrations (Subsquare, DOTConsole, Bifrost) for Polkadot ecosystem',
            search: {
              tab: 'Tab switch, available values: apps (view local apps), custom (custom apps)'
            }
          },
          {
            path: '/assets',
            element: <PageAssets />,
            description:
              'Cross-chain asset portfolio for DOT, parachain tokens, AssetHub assets with XCM transfer support and migration tracking'
          },
          {
            path: '/transactions',
            element: <PageTransactions />,
            description:
              'Multisig transaction queue with batch operations, simulation preview, and AssetHub migration status tracking',
            search: {
              status:
                'Transaction status, available values: pending (View pending transactions), history (Browse executed and cancelled transactions)'
            }
          },
          {
            path: '/transactions/:id',
            element: <PageTransactionDetails />,
            description:
              'Multisig transaction details with signature collection status, simulation results, and proposer information'
          },
          {
            path: '/address-book',
            element: <PageAddressBook />,
            description:
              'Address book for frequently used Polkadot addresses, multisig members, and proxy accounts with identity integration'
          },
          {
            path: '/analytic',
            element: <PageAnalytic />,
            description:
              'Multisig analytics dashboard showing common extrinsics, recipient patterns, transaction volume, and signer activity'
          },
          {
            path: '/fund',
            element: <PageFund />,
            description:
              'Fund pure or multisig accounts with guided transfer form, reusable via query params for AI prompts and shortcuts'
          },
          {
            path: '/account-setting',
            element: <PageSetting type='account' />,
            description:
              'Multisig account management for flexible member updates, threshold changes, proposer roles, and proxy configuration'
          },
          {
            path: '/extrinsic',
            element: <Navigate replace to={`/explorer/${encodeURIComponent('mimir://app/submit-calldata')}`} />,
            description:
              'Submit raw extrinsic calldata or recover transactions from other tools (PolkadotJS approveAsMulti)'
          }
        ]
      },
      {
        // Authenticated routes without sidebar
        element: <BaseContainer auth withPadding />,
        children: [
          {
            path: '/add-proxy',
            element: <PageAddProxy />,
            description:
              'Add proxy account for delegation with specific permissions (Any/NonTransfer/Staking/Governance/IdentityJudgement)'
          }
        ]
      },
      {
        // Public routes for account creation
        element: <BaseContainer auth={false} withPadding />,
        children: [
          {
            path: '/create-multisig',
            element: <PageCreateMultisig />,
            description:
              'Create static or flexible multisig account with customizable threshold and member management via proxy layer'
          },
          {
            path: '/create-pure',
            element: <PageAddProxy pure={true} />,
            description:
              'Create keyless pure proxy account for automation, validator setups, and enhanced security isolation'
          }
        ]
      },
      {
        // Explorer routes without padding
        element: <BaseContainer auth withPadding={false} />,
        children: [
          {
            path: '/explorer/:url',
            element: <PageExplorer />,
            description:
              'Sandboxed DApp container with Mimir SDK integration for in-wallet DApp execution and transaction signing'
          },
          {
            path: '/transfer',
            element: <Navigate replace to='/explorer/mimir%3A%2F%2Fapp%2Ftransfer' />
          },
          {
            path: '/multi-transfer',
            element: <Navigate replace to='/explorer/mimir%3A%2F%2Fapp%2Fmulti-transfer' />
          }
        ]
      },
      {
        // Welcome page for new users
        element: <BaseContainer auth={false} withPadding={false} hideSideBar hideTopBar />,
        children: [
          {
            path: '/welcome',
            element: <PageWelcome />,
            description:
              'Onboarding wizard introducing Mimir multisig features, account structure, and Polkadot ecosystem integration'
          }
        ]
      },
      {
        element: <BaseContainer auth={false} skipConnect withPadding />,
        children: [
          {
            path: '/setting',
            element: <PageSetting type='general' />,
            description:
              'Configure Mimir settings: network RPC endpoints, account visibility, Mimo AI assistant, email/push notifications',
            search: {
              tabs: 'Tab switch, available values: network (Configure RPC endpoints), account-display (Hide/unhide accounts for cleaner dashboard), notification (Email and explorer push notification opt-in)'
            }
          }
        ]
      },
      {
        // Redirect all unmatched routes to home
        path: '*',
        element: <Navigate replace to='/' />,
        description: 'Fallback route that redirects unmatched URLs to the home page'
      }
    ]
  }
];

// Type definition for routing context
interface RoutingContext {
  path: string;
  description: string;
  search: Record<string, string>;
}

// Recursive function to extract routing context from route configuration
export function extractRoutingContext(routeConfig: any[], parentPath = ''): RoutingContext[] {
  const result: RoutingContext[] = [];

  routeConfig.forEach((route) => {
    // Handle current route
    if ((route.path || route.index) && route.path !== '*') {
      // Determine the actual path
      let path: string;

      if (route.index) {
        path = parentPath || '/';
      } else {
        // Combine parent path with current route path
        const routePath = route.path || '';

        if (routePath.startsWith('/')) {
          // Absolute path
          path = routePath;
        } else {
          // Relative path
          path = (parentPath + '/' + routePath).replace(/\/+/g, '/');
        }
      }

      // Add route if it has a description
      if (route.description) {
        result.push({
          path: path,
          description: route.description,
          search: route.search || {}
        });
      }
    }

    // Recursively process children
    if (route.children && Array.isArray(route.children)) {
      // Determine the base path for children
      let childBasePath = parentPath;

      if (route.path && !route.path.startsWith('/')) {
        childBasePath = (parentPath + '/' + route.path).replace(/\/+/g, '/');
      } else if (route.path) {
        childBasePath = route.path;
      }

      result.push(...extractRoutingContext(route.children, childBasePath));
    }
  });

  return result;
}
