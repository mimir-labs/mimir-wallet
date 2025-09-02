// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Valid routes in the application
 * Used for validating navigation requests from AI
 */
export const VALID_ROUTES = [
  '/',
  '/assets',
  '/transactions',
  '/address-book',
  '/dapp',
  '/analytic',
  '/account-setting',
  '/add-proxy',
  '/create-multisig',
  '/create-multisig-one',
  '/create-pure',
  '/welcome',
  '/setting',
  '/transfer'
] as const;

/**
 * Route patterns that accept dynamic parameters
 */
export const DYNAMIC_ROUTE_PATTERNS = [/^\/transactions\/[^/]+$/, /^\/explorer\/[^/]+$/] as const;

/**
 * Validates if a path is a valid route in the application
 * @param path - The path to validate
 * @returns true if the path is valid, false otherwise
 */
export function isValidRoute(path: string): boolean {
  // Check exact matches first
  if (VALID_ROUTES.includes(path as any)) {
    return true;
  }

  // Check dynamic route patterns
  return DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Sanitizes a path for safe navigation
 * @param path - The path to sanitize
 * @returns sanitized path or null if invalid
 */
export function sanitizePath(path: string): string | null {
  try {
    // Remove any dangerous characters
    const cleanPath = path.replace(/[<>"`]/g, '');

    // Ensure path starts with /
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    // Validate the path
    if (!isValidRoute(normalizedPath)) {
      return null;
    }

    return normalizedPath;
  } catch (error) {
    console.error('Error sanitizing path:', error);

    return null;
  }
}

/**
 * Maps common user intents to routes
 */
export const INTENT_TO_ROUTE_MAP: Record<string, string> = {
  // Multisig related
  'create-multisig': '/create-multisig',
  multisig: '/create-multisig',
  'multi-sig': '/create-multisig',
  'create-wallet': '/create-multisig',
  'new-wallet': '/create-multisig',

  // Asset related
  assets: '/assets',
  balance: '/assets',
  balances: '/assets',
  tokens: '/assets',

  // Transaction related
  transactions: '/transactions',
  history: '/transactions',
  tx: '/transactions',

  // Transfer related
  transfer: '/transfer',
  send: '/transfer',
  'send-tokens': '/transfer',

  // Address book
  'address-book': '/address-book',
  contacts: '/address-book',
  addresses: '/address-book',

  // DApp browser
  dapp: '/dapp',
  browser: '/dapp',
  apps: '/dapp',

  // Analytics
  analytics: '/analytic',
  analytic: '/analytic',
  stats: '/analytic',

  // Settings
  settings: '/setting',
  config: '/setting',
  preferences: '/setting',

  // Home/Dashboard
  home: '/',
  dashboard: '/',
  profile: '/'
};

/**
 * Resolves user intent to a valid route
 * @param intent - User's navigation intent
 * @returns resolved route path or null if not found
 */
export function resolveIntentToRoute(intent: string): string | null {
  const normalizedIntent = intent.toLowerCase().trim();

  return INTENT_TO_ROUTE_MAP[normalizedIntent] || null;
}
