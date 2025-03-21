// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './style.css';

import moment from 'moment';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { initializeApi } from '@mimir-wallet/polkadot-core';
import { API_CLIENT_GATEWAY } from '@mimir-wallet/service';

import { initializeAccount } from './accounts/initialize';
import { initializeWallet } from './wallet/initialize';
import App from './App';
import { initGa } from './initGa';
import { initMimir } from './initMimir';
import { initializeSocket } from './socket';
import { upgradeAddresBook } from './upgrade';
import { initService, service } from './utils';

// Set default date-time format for the entire application
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

// Create React root container for application mounting
const root = createRoot(document.getElementById('root') as HTMLElement);

// Initialize core Mimir wallet configuration and get initial chain and address settings
// This sets up the basic configuration needed for the wallet to function
const { chain, address } = initMimir();

initService(API_CLIENT_GATEWAY, chain.serviceUrl);

// Upgrade address book data structure if needed (for backward compatibility)
// This ensures older versions of stored address data are compatible with current version
upgradeAddresBook();

// Initialize blockchain API connection with selected chain
// This establishes connection to the blockchain node and sets up API instance
initializeApi(chain, service);

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
root.render(<App />);

// Production-only features
if (import.meta.env.PROD) {
  // Register Service Worker for PWA functionality
  // This enables offline capabilities and app-like features
  registerSW();

  // Initialize Google Analytics tracking
  // This sets up usage tracking for production environment
  initGa();
}
