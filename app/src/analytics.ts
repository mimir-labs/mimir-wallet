// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { default as posthogLib } from 'posthog-js';
import ReactGA from 'react-ga4';

// Environment configuration
const isProduction = location.hostname === 'app.mimir.global';
const isDevelopment = location.hostname === 'dev.mimir.global';

// GA4 Configuration
const GA4_CONFIG = {
  production: 'G-8GQYDFDBZ6',
  development: 'G-4987GHNZMV'
};

// PostHog Configuration
const POSTHOG_CONFIG = {
  production: {
    apiKey: 'phc_1ljcIswDSHXxwIWbYzcTqgay5nJgmHg7QzbjBzF5M70',
    options: {
      api_host: 'https://us.posthog.com',
      defaults: '2025-05-24'
    } as const
  }
};

// State tracking
let isGA4Initialized = false;
let isPostHogInitialized = false;

// Format string for consistent event naming
const formatString = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9_]/g, '');
};

// Initialize GA4
function initGA4() {
  if (isGA4Initialized) return;

  try {
    const measurementId = isProduction ? GA4_CONFIG.production : isDevelopment ? GA4_CONFIG.development : null;

    if (measurementId) {
      ReactGA.initialize(measurementId);
      isGA4Initialized = true;
      console.log('GA4 initialized with ID:', measurementId);
    }
  } catch (error) {
    console.error('Failed to initialize GA4:', error);
  }
}

// Initialize PostHog
function initPostHog() {
  if (isPostHogInitialized) return;

  try {
    const config = isProduction ? POSTHOG_CONFIG.production : null;

    if (config) {
      posthogLib.init(config.apiKey, config.options);
      isPostHogInitialized = true;
      console.log('PostHog initialized with key:', config.apiKey);
    }
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
}

// Initialize all analytics
export function initAnalytics() {
  initGA4();
  initPostHog();
}

// Analytics action functions
export function gaAction(action: string, parameters?: Record<string, any>) {
  // GA4 Event
  if (isGA4Initialized) {
    try {
      ReactGA.event(action, parameters);
    } catch (error) {
      console.error('GA4 event failed:', error);
    }
  }

  // PostHog Event
  if (isPostHogInitialized) {
    try {
      posthogLib.capture(action, parameters);
    } catch (error) {
      console.error('PostHog event failed:', error);
    }
  }
}

// Specific analytics actions
export const analyticsActions = {
  // Switch between omni and solo mode
  omniSolochain(mode: string) {
    // GA4 Event
    if (isGA4Initialized) {
      try {
        ReactGA.event({
          category: 'TopBar',
          action: 'OmniSoloSwitch',
          label: `Switch to ${mode}`,
          transport: 'beacon'
        });
      } catch (error) {
        console.error('GA4 event failed:', error);
      }
    }

    // PostHog Event
    if (isPostHogInitialized) {
      try {
        posthogLib.capture('OmniSoloSwitch', {
          mode,
          previous_mode: mode === 'omni' ? 'solo' : 'omni',
          source: 'topbar'
        });
      } catch (error) {
        console.error('PostHog event failed:', error);
      }
    }
  },

  // Track connected wallets
  connectedWallet(wallets: string[]) {
    // GA4 Event
    if (isGA4Initialized) {
      try {
        ReactGA.event(
          'connect_wallet',
          wallets.reduce(
            (acc, wallet) => {
              acc[formatString(wallet)] = 'true';

              return acc;
            },
            {} as Record<string, 'true'>
          )
        );
      } catch (error) {
        console.error('GA4 event failed:', error);
      }
    }

    // PostHog Event
    if (isPostHogInitialized) {
      try {
        posthogLib.capture(
          'connect_wallet',
          wallets.reduce(
            (acc, wallet) => {
              acc[formatString(wallet)] = 'true';

              return acc;
            },
            {} as Record<string, 'true'>
          )
        );
      } catch (error) {
        console.error('PostHog event failed:', error);
      }
    }
  }
};
