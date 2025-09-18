// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Cookie preference options available to users
 */
export type CookiePreference = 'all' | 'essentials';

/**
 * Cookie consent configuration interface
 */
export interface CookieConsentConfig {
  /**
   * Privacy policy URL for the "privacy" link
   */
  privacyPolicyUrl?: string;

  /**
   * Terms of service URL for the "terms" link
   */
  termsUrl?: string;

  /**
   * Custom privacy text (optional, uses default if not provided)
   */
  privacyText?: string;

  /**
   * Callback fired when user selects a preference
   */
  onPreferenceChange?: (preference: CookiePreference) => void;

  /**
   * Whether the banner should be initially visible
   * Defaults to true if no preference is stored
   */
  initialVisible?: boolean;
}

/**
 * Cookie consent state interface
 */
export interface CookieConsentState {
  preference: CookiePreference | null;
  isVisible: boolean;
  lastUpdated: number;
}
