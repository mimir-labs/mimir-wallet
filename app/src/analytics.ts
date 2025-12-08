// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Environment configuration
const isProduction = location.hostname === 'app.mimir.global';
const isDevelopment = location.hostname === 'dev.mimir.global';

// GA4 Configuration
const GA4_CONFIG = {
  production: 'G-8GQYDFDBZ6',
  development: 'G-4987GHNZMV',
};

// PostHog Configuration
const POSTHOG_CONFIG = {
  production: {
    apiKey: 'phc_1ljcIswDSHXxwIWbYzcTqgay5nJgmHg7QzbjBzF5M70',
    options: {
      api_host: 'https://us.posthog.com',
      defaults: '2025-05-24',
    } as const,
  },
};

// Analytics state - encapsulates libraries and their ready state
const analyticsState = {
  // Libraries (lazy loaded)
  posthog: null as typeof import('posthog-js').default | null,
  ga4: null as typeof import('react-ga4').default | null,

  // Ready flags - true when library is loaded AND initialized
  isPostHogReady: false,
  isGA4Ready: false,

  // Overall initialization state
  isInitialized: false,
  initPromise: null as Promise<void> | null,
  initResolve: null as (() => void) | null,
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
  MULTISIG_LOGIN_CTA = 'multisig_login_cta',
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
    wallet:
      | 'talisman'
      | 'SubWallet'
      | 'Nova'
      | 'PolkaGate'
      | 'Fearless'
      | 'Polkadot.js'
      | 'Plutonication'
      | string,
  ) => `ConnectWallet_${wallet}`,

  /**
   * Generate connected mode event name
   * @example dynamicEvents.connectedMode('omni') => 'Connected_mode_omni'
   */
  connectedMode: (mode: 'omni' | 'solo') => `Connected_mode_${mode}`,
};

// Wait for analytics to be initialized
async function waitForAnalytics(): Promise<typeof analyticsState> {
  if (analyticsState.isInitialized) return analyticsState;

  if (analyticsState.initPromise) {
    await analyticsState.initPromise;

    return analyticsState;
  }

  // Create a promise that will be resolved when analytics is initialized
  analyticsState.initPromise = new Promise((resolve) => {
    analyticsState.initResolve = resolve;
  });

  await analyticsState.initPromise;

  return analyticsState;
}

// Initialize all analytics (lazy loaded after page load)
export function initAnalytics() {
  // Delay analytics initialization to not block initial page load
  const doInit = async () => {
    try {
      // Load libraries
      const [posthogModule, reactGaModule] = await Promise.all([
        import('posthog-js'),
        import('react-ga4'),
      ]);

      analyticsState.posthog = posthogModule.default;
      analyticsState.ga4 = reactGaModule.default;

      // Initialize GA4
      const measurementId = isProduction
        ? GA4_CONFIG.production
        : isDevelopment
          ? GA4_CONFIG.development
          : null;

      if (measurementId && analyticsState.ga4) {
        analyticsState.ga4.initialize(measurementId);
        analyticsState.isGA4Ready = true;
        console.log('GA4 initialized with ID:', measurementId);
      }

      // Initialize PostHog
      const config = isProduction ? POSTHOG_CONFIG.production : null;

      if (config && analyticsState.posthog) {
        analyticsState.posthog.init(config.apiKey, config.options);
        analyticsState.isPostHogReady = true;
        console.log('PostHog initialized with key:', config.apiKey);
      }

      // Mark as initialized and resolve pending promise
      analyticsState.isInitialized = true;
      analyticsState.initResolve?.();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      // Still resolve to prevent hanging promises
      analyticsState.isInitialized = true;
      analyticsState.initResolve?.();
    }
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => doInit());
  } else {
    setTimeout(() => doInit(), 1000);
  }
}

// Analytics action functions - waits for initialization
export async function gaAction(
  action: string,
  parameters?: Record<string, unknown>,
) {
  const state = await waitForAnalytics();

  // GA4 Event
  if (state.isGA4Ready && state.ga4) {
    try {
      state.ga4.event(action, parameters);
    } catch (error) {
      console.error('GA4 event failed:', error);
    }
  }

  // PostHog Event
  if (state.isPostHogReady && state.posthog) {
    try {
      state.posthog.capture(action, parameters);
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
  async omniSolochain(mode: string) {
    const state = await waitForAnalytics();

    // GA4 Event
    if (state.isGA4Ready && state.ga4) {
      try {
        state.ga4.event({
          category: 'TopBar',
          action: 'OmniSoloSwitch',
          label: `Switch to ${mode}`,
          transport: 'beacon',
        });
      } catch (error) {
        console.error('GA4 event failed:', error);
      }
    }

    // PostHog Event
    if (state.isPostHogReady && state.posthog) {
      try {
        state.posthog.capture('OmniSoloSwitch', {
          mode,
          previous_mode: mode === 'omni' ? 'solo' : 'omni',
          source: 'topbar',
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
  async connectedWallet(wallet: string) {
    const state = await waitForAnalytics();

    // GA4 Event
    if (state.isGA4Ready && state.ga4) {
      try {
        state.ga4.event('connect_wallet', {
          connect_wallet: wallet,
        });
      } catch (error) {
        console.error('GA4 event failed:', error);
      }
    }

    // PostHog Event
    if (state.isPostHogReady && state.posthog) {
      try {
        state.posthog.capture('connect_wallet', {
          wallet_type: wallet,
        });
      } catch (error) {
        console.error('PostHog event failed:', error);
      }
    }

    // Also track with dynamic event name for granular tracking
    await gaAction(dynamicEvents.connectWallet(wallet), {
      wallet_type: wallet,
    });
  },

  // ========== Transaction Events ==========

  /**
   * Track transactions view (pending or history)
   */
  async transactionsView(viewType: string) {
    await gaAction(AnalyticsEvent.TRANSACTIONS_VIEW, { view_type: viewType });
  },

  /**
   * Track transaction result (success or failure)
   */
  async transactionResult(success: boolean, errorMessage?: string) {
    await gaAction(AnalyticsEvent.TRANSACTION_SUBMITTED, {
      transaction_success: success,
      transaction_failed: !success,
      ...(errorMessage && { error_message: errorMessage }),
    });
  },

  // ========== Apps View ==========

  /**
   * Track apps view
   */
  async appsView(viewType: string) {
    await gaAction(AnalyticsEvent.APPS_VIEW, { view_type: viewType });
  },

  // ========== Batch Operations ==========

  /**
   * Track batch operation started
   */
  async batchStarted(count: number) {
    await gaAction(AnalyticsEvent.BATCH_STARTED, { batch_count: count });
  },

  /**
   * Track batch interaction
   */
  async batchInteracted() {
    await gaAction(AnalyticsEvent.BATCH_STARTED, { batch_interacted: true });
  },

  /**
   * Track batch operation success
   */
  async batchSuccess(count: number) {
    await gaAction(AnalyticsEvent.BATCH_STARTED, {
      batch_success: true,
      batch_count: count,
    });
  },

  // ========== Template Operations ==========

  /**
   * Track template operation started
   */
  async templateStarted() {
    await gaAction(AnalyticsEvent.TEMPLATE_STARTED, {});
  },

  /**
   * Track template interaction
   */
  async templateInteracted() {
    await gaAction(AnalyticsEvent.TEMPLATE_STARTED, {
      template_interacted: true,
    });
  },

  /**
   * Track template operation success
   */
  async templateSuccess() {
    await gaAction(AnalyticsEvent.TEMPLATE_STARTED, { template_success: true });
  },

  // ========== WalletConnect ==========

  /**
   * Track WalletConnect session start
   */
  async walletConnectStart() {
    await gaAction(AnalyticsEvent.WALLET_CONNECT_START, {});
  },

  /**
   * Track WalletConnect pairing key entered
   */
  async walletConnectPairingKey() {
    await gaAction(AnalyticsEvent.WALLET_CONNECT_START, {
      pairing_key_entered: true,
    });
  },

  /**
   * Track WalletConnect connection success
   */
  async walletConnectSuccess() {
    await gaAction(AnalyticsEvent.WALLET_CONNECT_START, {
      wallet_connect_success: true,
    });
  },

  // ========== Network & Mode ==========

  /**
   * Track connected mode (omni or solo)
   */
  async connectedMode(mode: 'omni' | 'solo') {
    await gaAction(dynamicEvents.connectedMode(mode), { mode });
  },

  // ========== Multisig ==========

  /**
   * Track multisig login CTA
   */
  async multisigLoginCta() {
    await gaAction(AnalyticsEvent.MULTISIG_LOGIN_CTA, {
      connect_to_dapp: true,
    });
  },

  // ========== Onboarding Events ==========

  /**
   * Track onboarding features close
   */
  async onboardingFeaturesClose() {
    await gaAction(AnalyticsEvent.ONBOARDING_FEATURES_CLOSE, {});
  },

  /**
   * Track specific onboarding feature interaction
   */
  async onboardingFeature(feature: string) {
    await gaAction(dynamicEvents.onboardingFeature(feature), { feature });
  },

  /**
   * Track onboarding connect wallet step
   */
  async onboardingConnectWallet() {
    await gaAction(AnalyticsEvent.ONBOARDING_CONNECT_WALLET, {});
  },

  /**
   * Track onboarding example account click
   */
  async onboardingClickExample() {
    await gaAction(AnalyticsEvent.ONBOARDING_CLICK_EXAMPLE, {});
  },

  /**
   * Track onboarding extension account connected
   */
  async onboardingConnectedExtension() {
    await gaAction(AnalyticsEvent.ONBOARDING_CONNECTED_EXTENSION, {});
  },
};
