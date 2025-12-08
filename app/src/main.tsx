// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './style.css';
import '@mimir-wallet/polkadot-core/augment';

import { getNetworkMode, NetworkProvider } from '@mimir-wallet/polkadot-core';
import {
  API_CLIENT_GATEWAY,
  initService,
  QueryProvider,
} from '@mimir-wallet/service';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { initAnalytics } from './analytics';
import { initFavoriteDapps, initMimir } from './initMimir';
import { router } from './router';
import { upgradeAddresBook } from './upgrade';
import { initializeWallet } from './wallet/initialize';

// Create React root container for application mounting
const root = createRoot(document.getElementById('root') as HTMLElement);

const isOmni = getNetworkMode() === 'omni';

// Initialize core Mimir wallet configuration and get initial chain settings
// This sets up the basic configuration needed for the wallet to function
// Address is now managed via URL search params (retainSearchParams in router)
const { chain } = initMimir(isOmni);

initFavoriteDapps();

initService(API_CLIENT_GATEWAY);

// Upgrade address book data structure if needed (for backward compatibility)
// This ensures older versions of stored address data are compatible with current version
upgradeAddresBook();

// Set up wallet connection and state management
// This initializes wallet providers (like Polkadot.js) and restores previous connections
initializeWallet();

// Render the main App component with initial configuration
// StrictMode is enabled in development to help identify potential problems
const app = (
  <StrictMode>
    <NetworkProvider network={chain.key}>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </NetworkProvider>
  </StrictMode>
);

root.render(import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app);

// Production-only features
if (import.meta.env.PROD) {
  // Register Service Worker for PWA functionality
  // This enables offline capabilities and app-like features
  registerSW();

  // Initialize analytics (GA4 and PostHog) using vanilla JavaScript
  initAnalytics();
}
