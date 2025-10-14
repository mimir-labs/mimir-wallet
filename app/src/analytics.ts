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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatString = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9_]/g, '');
};

// ============================================
// Event Types and Constants
// ============================================

/**
 * Analytics event names enum
 * All event names should be added here for type safety
 */
export enum AnalyticsEvent {
  // Onboarding Events
  ONBOARDING_FEATURES = 'onboarding_features',
  ONBOARDING_FEATURES_CLOSE = 'onboarding_features_close',
  ONBOARDING_CONNECT_WALLET = 'Onboarding_Connect_Wallet',
  ONBOARDING_CLICK_EXAMPLE = 'Onboarding_Click_Example',
  ONBOARDING_CONNECTED_EXTENSION = 'onboarding_connected_extension_account',

  // Network & Mode
  CONNECT_NETWORK = 'ConnectNetwork',
  CONNECTED_MODE = 'Connected_mode',

  // Transactions
  TRANSACTION_SUBMITTED = 'transaction_submitted',
  TRANSACTIONS_VIEW = 'transactions_view',

  // Apps
  APPS_VIEW = 'apps_view',

  // WalletConnect
  WALLET_CONNECT_START = 'wallet_connect_start',

  // Batch
  BATCH_STARTED = 'batch_started',

  // Template
  TEMPLATE_STARTED = 'template_started',

  // Multisig
  MULTISIG_LOGIN_CTA = 'multisig_login_cta'
}

/**
 * Dynamic event generators for parameterized event names
 */
export const dynamicEvents = {
  /**
   * Generate onboarding feature event name
   * @example dynamicEvents.onboardingFeature('remoteproxy') => 'Onboarding_Features_remoteproxy'
   */
  onboardingFeature: (feature: string) => `Onboarding_Features_${feature}`,

  /**
   * Generate connect wallet event name
   * @example dynamicEvents.connectWallet('talisman') => 'ConnectWallet_talisman'
   */
  connectWallet: (
    wallet: 'talisman' | 'SubWallet' | 'Nova' | 'PolkaGate' | 'Fearless' | 'Polkadot.js' | 'Plutonication' | string
  ) => `ConnectWallet_${wallet}`,

  /**
   * Generate connected mode event name
   * @example dynamicEvents.connectedMode('omni') => 'Connected_mode_omni'
   */
  connectedMode: (mode: 'omni' | 'solo') => `Connected_mode_${mode}`
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

// ============================================
// Analytics Actions
// ============================================

/**
 * Specific analytics actions
 * All tracking methods should be added here
 */
export const analyticsActions = {
  // ========== Legacy Methods (Keep for compatibility) ==========

  /**
   * Switch between omni and solo mode
   * @deprecated Use connectedMode instead
   */
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

  /**
   * Track connected wallets
   * Use this for initial wallet connection
   */
  connectedWallet(wallet: string) {
    // GA4 Event
    if (isGA4Initialized) {
      try {
        ReactGA.event('connect_wallet', {
          connect_wallet: wallet
        });
      } catch (error) {
        console.error('GA4 event failed:', error);
      }
    }

    // PostHog Event
    if (isPostHogInitialized) {
      try {
        posthogLib.capture('connect_wallet', {
          wallet_type: wallet
        });
      } catch (error) {
        console.error('PostHog event failed:', error);
      }
    }

    // Also track with dynamic event name for granular tracking
    gaAction(dynamicEvents.connectWallet(wallet), {
      wallet_type: wallet
    });
  },

  // ========== Transaction Events ==========

  /**
   * Track transactions view (pending or history)
   * @param viewType - Type of transaction view
   */
  transactionsView(viewType: string) {
    gaAction(AnalyticsEvent.TRANSACTIONS_VIEW, { view_type: viewType });
  },

  /**
   * Track transaction result (success or failure)
   * @param success - Whether transaction was successful
   * @param errorMessage - Error message if failed
   */
  transactionResult(success: boolean, errorMessage?: string) {
    gaAction(AnalyticsEvent.TRANSACTION_SUBMITTED, {
      transaction_success: success,
      transaction_failed: !success,
      ...(errorMessage && { error_message: errorMessage })
    });
  },

  // ========== Apps View ==========

  /**
   * Track apps view
   * @param viewType - Type of app being viewed
   */
  appsView(viewType: string) {
    gaAction(AnalyticsEvent.APPS_VIEW, { view_type: viewType });
  },

  // ========== Batch Operations ==========

  /**
   * Track batch operation started
   * @param count - Number of transactions in batch
   */
  batchStarted(count: number) {
    gaAction(AnalyticsEvent.BATCH_STARTED, { batch_count: count });
  },

  /**
   * Track batch interaction
   */
  batchInteracted() {
    gaAction(AnalyticsEvent.BATCH_STARTED, { batch_interacted: true });
  },

  /**
   * Track batch operation success
   * @param count - Number of transactions successfully batched
   */
  batchSuccess(count: number) {
    gaAction(AnalyticsEvent.BATCH_STARTED, { batch_success: true, batch_count: count });
  },

  // ========== Template Operations ==========

  /**
   * Track template operation started
   */
  templateStarted() {
    gaAction(AnalyticsEvent.TEMPLATE_STARTED, {});
  },

  /**
   * Track template interaction
   */
  templateInteracted() {
    gaAction(AnalyticsEvent.TEMPLATE_STARTED, { template_interacted: true });
  },

  /**
   * Track template operation success
   */
  templateSuccess() {
    gaAction(AnalyticsEvent.TEMPLATE_STARTED, { template_success: true });
  },

  // ========== WalletConnect ==========

  /**
   * Track WalletConnect session start
   */
  walletConnectStart() {
    gaAction(AnalyticsEvent.WALLET_CONNECT_START, {});
  },

  /**
   * Track WalletConnect pairing key entered
   */
  walletConnectPairingKey() {
    gaAction(AnalyticsEvent.WALLET_CONNECT_START, { pairing_key_entered: true });
  },

  /**
   * Track WalletConnect connection success
   */
  walletConnectSuccess() {
    gaAction(AnalyticsEvent.WALLET_CONNECT_START, { wallet_connect_success: true });
  },

  // ========== Network & Mode ==========

  /**
   * Track connected mode (omni or solo)
   * @param mode - Network mode
   */
  connectedMode(mode: 'omni' | 'solo') {
    gaAction(dynamicEvents.connectedMode(mode), { mode });
  },

  // ========== Multisig ==========

  /**
   * Track multisig login CTA
   */
  multisigLoginCta() {
    gaAction(AnalyticsEvent.MULTISIG_LOGIN_CTA, { connect_to_dapp: true });
  },

  // ========== Onboarding Events ==========
  /**
   * Track onboarding features close
   */
  onboardingFeaturesClose() {
    gaAction(AnalyticsEvent.ONBOARDING_FEATURES_CLOSE, {});
  },

  /**
   * Track specific onboarding feature interaction
   * @param feature - Feature identifier
   */
  onboardingFeature(feature: string) {
    gaAction(dynamicEvents.onboardingFeature(feature), { feature });
  },

  /**
   * Track onboarding connect wallet step
   */
  onboardingConnectWallet() {
    gaAction(AnalyticsEvent.ONBOARDING_CONNECT_WALLET, {});
  },

  /**
   * Track onboarding example account click
   */
  onboardingClickExample() {
    gaAction(AnalyticsEvent.ONBOARDING_CLICK_EXAMPLE, {});
  },

  /**
   * Track onboarding extension account connected
   */
  onboardingConnectedExtension() {
    gaAction(AnalyticsEvent.ONBOARDING_CONNECTED_EXTENSION, {});
  }
};
