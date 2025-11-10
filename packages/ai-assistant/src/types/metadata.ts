// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallHandler } from '../types.js';

/**
 * Route requirement for a handler
 */
export interface RouteRequirement {
  /** Required route path */
  path: string;

  /** Friendly display name for the route */
  displayName?: string;

  /** Whether to auto-navigate to this route when function is called */
  autoNavigate?: boolean;

  /** Custom navigation options */
  navigationOptions?: {
    params?: Record<string, string>;
    search?: Record<string, string>;
  };
}

/**
 * Metadata for a function call handler
 */
export interface HandlerMetadata {
  /** Unique identifier for this handler */
  handlerId: string;

  /** Function name this handler responds to */
  functionName: string;

  /** Route requirement (if any) */
  routeRequirement?: RouteRequirement;

  /** Handler priority (higher = executed first) */
  priority?: number;

  /** Custom metadata for extensions */
  customData?: Record<string, unknown>;
}

/**
 * Handler registration options
 */
export interface HandlerRegistrationOptions {
  /** Route requirement (if handler needs a specific route) */
  requiresRoute?: RouteRequirement | string;

  /** Handler priority */
  priority?: number;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Internal handler registration tracking
 */
export interface HandlerRegistration {
  handlerId: string;
  handler: FunctionCallHandler;
  channelName: string;
}
