// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@xyflow/react/dist/style.css';
import './style.css';
import '@mimir-wallet/polkadot-core/augment';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import moment from 'moment';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import { ApiRoot, initializeApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { API_CLIENT_GATEWAY, initService } from '@mimir-wallet/service';

import { initializeAccount } from './accounts/initialize';
import { toastError, toastSuccess, toastWarn } from './components/utils';
import { initializeWallet } from './wallet/initialize';
import { initAnalytics } from './analytics';
import App from './App';
import { initMimir } from './initMimir';
import { upgradeAddresBook } from './upgrade';

// Set default date-time format for the entire application
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
);
// Create React root container for application mounting
const root = createRoot(document.getElementById('root') as HTMLElement);

const isOmni = useNetworks.getState().mode === 'omni';

// Initialize core Mimir wallet configuration and get initial chain and address settings
// This sets up the basic configuration needed for the wallet to function
const { chain, address } = initMimir(isOmni);

initService(API_CLIENT_GATEWAY);

// Upgrade address book data structure if needed (for backward compatibility)
// This ensures older versions of stored address data are compatible with current version
upgradeAddresBook();

// Initialize blockchain API connection
// This establishes connection to the blockchain node and sets up API instance
initializeApi(chain);

// Set up wallet connection and state management
// This initializes wallet providers (like Polkadot.js) and restores previous connections
initializeWallet();

// Initialize account management and synchronization
// This sets up account tracking, multisig handling, and proxy relationships
initializeAccount(chain, address);

// Render the main App component with initial configuration
root.render(
  <ApiRoot chain={chain}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApiRoot>
);

// Production-only features
if (import.meta.env.PROD) {
  // Register Service Worker for PWA functionality
  // This enables offline capabilities and app-like features
  registerSW();

  // Initialize analytics (GA4 and PostHog) using vanilla JavaScript
  initAnalytics();
}
