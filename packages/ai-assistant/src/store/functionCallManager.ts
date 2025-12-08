// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  FunctionCallEvent,
  FunctionCallHandler,
  HandlerRegistration,
  HandlerRegistrationOptions,
} from '../types.js';

import { EventEmitter } from 'eventemitter3';

import { getStaticRouteRequirement } from '../config/routeConfig.js';

import { handlerMetadataRegistry } from './handlerMetadataRegistry.js';

// ============================================================================
// Internal Types
// ============================================================================

interface PendingEventEntry {
  event: FunctionCallEvent;
  timestamp: number;
}

type ChannelName = string;

interface ChannelStats {
  channelName: string;
  handlerCount: number;
  pendingEventCount: number;
  oldestEventAge: number;
}

type FunctionCallManagerEvents = {
  functioncall: (event: FunctionCallEvent) => void;
  'functioncall:pre-navigation': (event: FunctionCallEvent) => void;
};

// ============================================================================
// Pure Event Bus - Metadata-Driven Architecture
// ============================================================================

/**
 * FunctionCallManager - Pure event bus with channel-based routing
 * Completely metadata-driven, no hardcoded function names or routes
 */
class FunctionCallManager extends EventEmitter<FunctionCallManagerEvents> {
  // Channel-based event queues (one queue per channel)
  private readonly channelQueues = new Map<ChannelName, PendingEventEntry[]>();

  // Track registered handlers per channel
  private readonly channelHandlers = new Map<
    ChannelName,
    Set<HandlerRegistration>
  >();

  private readonly EVENT_EXPIRATION_MS = 5000; // 5 seconds
  private readonly MAX_PENDING_EVENTS_PER_CHANNEL = 10;
  private expirationCleanupInterval?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.startExpirationCleanup();
  }

  // ============================================================================
  // Public API - Metadata-Driven Registration
  // ============================================================================

  /**
   * Register a handler with optional metadata
   *
   * @example
   * // Simple registration (no route requirement)
   * functionCallManager.registerHandler('navigate', handler);
   *
   * @example
   * // With route requirement (shorthand)
   * functionCallManager.registerHandler('createMultisig', handler, {
   *   requiresRoute: '/create-multisig'
   * });
   *
   * @example
   * // With full route configuration
   * functionCallManager.registerHandler('transferForm', handler, {
   *   requiresRoute: {
   *     path: '/explorer/mimir%3A%2F%2Fapp%2Ftransfer',
   *     displayName: 'Transfer',
   *     autoNavigate: true
   *   },
   *   priority: 10
   * });
   */
  public registerHandler(
    channelName: ChannelName,
    handler: FunctionCallHandler,
    options?: HandlerRegistrationOptions,
  ): () => void {
    // Generate unique handler ID
    const handlerId = `${channelName}_${Date.now()}_${Math.random()}`;

    // Create handler registration
    const registration: HandlerRegistration = {
      handlerId,
      handler,
      channelName,
    };

    // Register in channel handlers
    let handlers = this.channelHandlers.get(channelName);

    if (!handlers) {
      handlers = new Set();
      this.channelHandlers.set(channelName, handlers);
    }

    handlers.add(registration);

    // Register metadata if provided
    if (options) {
      const routeRequirement = this.normalizeRouteRequirement(
        options.requiresRoute,
      );

      handlerMetadataRegistry.register({
        handlerId,
        functionName: channelName,
        routeRequirement,
        priority: options.priority,
        customData: options.metadata,
      });
    }

    // Replay pending events for THIS channel only
    this.replayChannelEvents(channelName, handler);

    // Listen to generic 'functioncall' event and route to this channel
    const wrappedHandler = (event: FunctionCallEvent) => {
      if (this.shouldRouteToChannel(event, channelName)) {
        handler(event);
      }
    };

    this.on('functioncall', wrappedHandler);

    // Return cleanup function
    return () => {
      handlers?.delete(registration);

      if (handlers?.size === 0) {
        this.channelHandlers.delete(channelName);
      }

      handlerMetadataRegistry.unregister(handlerId);
      this.off('functioncall', wrappedHandler);
    };
  }

  // ============================================================================
  // Public API - Event Emission (Simplified)
  // ============================================================================

  /**
   * Emit a function call event (simplified, no Promise)
   * Delegates route checking to middleware layer via metadata registry
   */
  public emitFunctionCall(event: FunctionCallEvent): void {
    // Check if route requirement exists: prioritize static config, fallback to metadata registry
    const staticRoute = getStaticRouteRequirement(event.name);
    const metadataRoute = handlerMetadataRegistry.requiresRoute(event.name);
    const requiresRoute = staticRoute !== undefined || metadataRoute;

    if (requiresRoute) {
      // Emit pre-navigation event for middleware to handle
      // Middleware will call emitAfterNavigation() when ready
      this.emit('functioncall:pre-navigation', event);
    } else {
      // Direct emission for non-route-dependent calls
      this.emitOrQueueFunctionCall(event);
    }
  }

  /**
   * Emit event after navigation completes
   * Called by NavigationMiddleware after route navigation
   */
  public emitAfterNavigation(event: FunctionCallEvent): void {
    this.emitOrQueueFunctionCall(event);
  }

  /**
   * Register a pre-navigation handler for route-dependent function calls
   */
  public onPreNavigation(handler: FunctionCallHandler): () => void {
    this.on('functioncall:pre-navigation', handler);

    return () => {
      this.off('functioncall:pre-navigation', handler);
    };
  }

  // ============================================================================
  // Private Helpers - Channel Routing
  // ============================================================================

  /**
   * Determine if an event should be routed to a specific channel
   */
  private shouldRouteToChannel(
    event: FunctionCallEvent,
    channelName: ChannelName,
  ): boolean {
    // Wildcard channel receives all events
    if (channelName === '*') {
      return true;
    }

    // Check if event's function name matches the channel
    return event.name === channelName;
  }

  /**
   * Queue event for a specific channel
   */
  private queueEventForChannel(
    channelName: ChannelName,
    event: FunctionCallEvent,
  ): void {
    let queue = this.channelQueues.get(channelName);

    if (!queue) {
      queue = [];
      this.channelQueues.set(channelName, queue);
    }

    queue.push({
      event,
      timestamp: Date.now(),
    });

    // Enforce max limit to prevent memory leaks
    if (queue.length > this.MAX_PENDING_EVENTS_PER_CHANNEL) {
      queue.shift();
    }

    console.log(
      `[FunctionCallManager] Queued event for channel '${channelName}': ${event.name} (id: ${event.id})`,
    );
  }

  /**
   * Replay all pending events for a specific channel to a handler
   */
  private replayChannelEvents(
    channelName: ChannelName,
    handler: FunctionCallHandler,
  ): void {
    const queue = this.channelQueues.get(channelName);

    if (!queue || queue.length === 0) {
      return;
    }

    console.log(
      `[FunctionCallManager] Replaying ${queue.length} events for channel '${channelName}'`,
    );

    // Replay events
    for (const entry of queue) {
      try {
        handler(entry.event);
      } catch (error) {
        console.error(
          `[FunctionCallManager] Error replaying event for channel '${channelName}':`,
          error,
        );
      }
    }

    // Clear the queue after successful replay
    this.channelQueues.delete(channelName);
  }

  /**
   * Check if a channel has registered handlers
   */
  private hasHandlersForChannel(channelName: ChannelName): boolean {
    const handlers = this.channelHandlers.get(channelName);

    return handlers !== undefined && handlers.size > 0;
  }

  /**
   * Emit or queue function call based on channel readiness
   */
  private emitOrQueueFunctionCall(event: FunctionCallEvent): void {
    const targetChannel = event.name; // Direct mapping: function name = channel name

    // Check if handlers exist (for both route-dependent and non-route-dependent)
    const hasChannelHandlers = this.hasHandlersForChannel(targetChannel);
    const hasWildcardHandlers = this.hasHandlersForChannel('*');

    if (hasChannelHandlers || hasWildcardHandlers) {
      // Handlers exist: emit directly
      this.emit('functioncall', event);
    } else {
      // No handlers: queue for later replay
      this.queueEventForChannel(targetChannel, event);
    }
  }

  /**
   * Normalize route requirement input
   */
  private normalizeRouteRequirement(input?: any): any {
    if (!input) return undefined;

    if (typeof input === 'string') {
      return {
        path: input,
        autoNavigate: true,
      };
    }

    return {
      ...input,
      autoNavigate: input.autoNavigate ?? true,
    };
  }

  // ============================================================================
  // Internal Maintenance
  // ============================================================================

  /**
   * Start periodic cleanup of expired pending events
   */
  private startExpirationCleanup(): void {
    this.expirationCleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [channelName, queue] of this.channelQueues.entries()) {
        const validEntries = queue.filter(
          (entry) => now - entry.timestamp < this.EVENT_EXPIRATION_MS,
        );

        if (validEntries.length === 0) {
          this.channelQueues.delete(channelName);
        } else if (validEntries.length < queue.length) {
          this.channelQueues.set(channelName, validEntries);
        }
      }
    }, 2000);
  }

  // ============================================================================
  // Monitoring and Debugging
  // ============================================================================

  /**
   * Get statistics for all channels
   */
  public getChannelStats(): ChannelStats[] {
    const now = Date.now();
    const stats: ChannelStats[] = [];

    // Get all unique channels
    const allChannels = new Set([
      ...this.channelQueues.keys(),
      ...this.channelHandlers.keys(),
    ]);

    for (const channelName of allChannels) {
      const handlers = this.channelHandlers.get(channelName);
      const queue = this.channelQueues.get(channelName);

      const oldestEvent = queue && queue.length > 0 ? queue[0] : null;

      stats.push({
        channelName,
        handlerCount: handlers?.size || 0,
        pendingEventCount: queue?.length || 0,
        oldestEventAge: oldestEvent ? now - oldestEvent.timestamp : 0,
      });
    }

    return stats;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clean up all pending events and intervals
   */
  public cleanup(): void {
    this.channelQueues.clear();
    this.channelHandlers.clear();

    // Clear expiration cleanup interval
    if (this.expirationCleanupInterval) {
      clearInterval(this.expirationCleanupInterval);
      this.expirationCleanupInterval = undefined;
    }

    this.removeAllListeners();
  }
}

// Export singleton instance
export const functionCallManager = new FunctionCallManager();
