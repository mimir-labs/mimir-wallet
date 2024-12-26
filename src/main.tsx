// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { initializeAccount } from './accounts/initialize';
import { initializeWallet } from './wallet/initialize';
import { initializeApi } from './api';
import App from './App';
import { initGa } from './initGa';
import { initMimir } from './initMimir';
import Root from './Root';
import { initializeSocket } from './socket';
import { upgradeAddresBook } from './upgrade';

// Set default date-time format for the entire application
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

// Create React root container for application mounting
const root = createRoot(document.getElementById('root') as HTMLElement);

// Initialize core Mimir wallet configuration and get initial chain and address settings
// This sets up the basic configuration needed for the wallet to function
const { chain, address } = initMimir();

// Upgrade address book data structure if needed (for backward compatibility)
// This ensures older versions of stored address data are compatible with current version
upgradeAddresBook();

// Initialize blockchain API connection with selected chain
// This establishes connection to the blockchain node and sets up API instance
initializeApi(chain);

// Set up wallet connection and state management
// This initializes wallet providers (like Polkadot.js) and restores previous connections
initializeWallet();

// Initialize account management and synchronization
// This sets up account tracking, multisig handling, and proxy relationships
initializeAccount(address);

// Establish WebSocket connection for real-time updates
// This enables live updates for transactions, account changes, and other events
initializeSocket(chain);

// Render the main App component with initial configuration
root.render(
  <Root>
    <App />
  </Root>
);

// Production-only features
if (process.env.NODE_ENV === 'production') {
  // Register Service Worker for PWA functionality
  // This enables offline capabilities and app-like features
  registerSW();

  // Initialize Google Analytics tracking
  // This sets up usage tracking for production environment
  initGa();
}
