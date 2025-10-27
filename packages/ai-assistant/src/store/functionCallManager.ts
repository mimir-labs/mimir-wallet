// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent, FunctionCallHandler, FunctionCallResult } from '../types.js';

import { EventEmitter } from 'eventemitter3';

// Internal types for the FunctionCallManager
interface PendingRequest {
  resolve: (result: FunctionCallResult) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  createdAt: number;
}

type FunctionCallManagerEvents = {
  functioncall: (event: FunctionCallEvent) => void;
  'functioncall:response': (response: FunctionCallResult) => void;
  'functioncall:pre-navigation': (event: FunctionCallEvent) => void;
};

/**
 * FunctionCallManager handles promise-based request-response pattern using EventEmitter
 * Supports emitting function call events and waiting for responses
 */
class FunctionCallManager extends EventEmitter<FunctionCallManagerEvents> {
  private readonly pendingRequests = new Map<string, PendingRequest>();

  constructor() {
    super();
    this.setupResponseListener();
  }

  /**
   * Setup internal response listener to handle function call responses
   */
  private setupResponseListener(): void {
    this.on('functioncall:response', (response: FunctionCallResult) => {
      const pending = this.pendingRequests.get(response.id);

      if (pending) {
        // Clear timeout before resolving/rejecting
        clearTimeout(pending.timeoutId);
        this.pendingRequests.delete(response.id);

        if (response.success) {
          pending.resolve(response);
        } else {
          pending.reject(new Error(response.error || 'Function call failed'));
        }
      }
    });
  }

  /**
   * Emit a function call event and return a Promise that resolves when response is received
   * @param event - The function call event to emit
   * @param options - Optional configuration
   * @param options.timeout - Timeout in milliseconds (default: 30000ms / 30 seconds)
   * @returns Promise that resolves with the function call result
   */
  public emitFunctionCall(event: FunctionCallEvent, options: { timeout?: number } = {}): Promise<FunctionCallResult> {
    const timeout = options.timeout ?? 30000; // Default 30 seconds

    return new Promise<FunctionCallResult>((resolve, reject) => {
      // Setup timeout to prevent memory leaks
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(event.id);
        reject(new Error(`Function call timeout after ${timeout}ms: ${event.name} (id: ${event.id})`));
      }, timeout);

      // Store the promise resolvers with timeout info
      this.pendingRequests.set(event.id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timeoutId,
        createdAt: Date.now()
      });

      // Emit pre-navigation event for route-dependent function calls
      // This allows route checking middleware to navigate before the actual function call
      const navigationFunctions = new Set(['createMultisig', 'createProxy', 'transferForm', 'batchTransferForm']);

      if (navigationFunctions.has(event.name)) {
        this.emit('functioncall:pre-navigation', event);

        // Delay the actual function call to allow navigation to complete
        const NAVIGATION_DELAY = 300; // ms

        setTimeout(() => {
          this.emit('functioncall', event);
        }, NAVIGATION_DELAY);
      } else {
        this.emit('functioncall', event);
      }
    });
  }

  /**
   * Respond to a function call with the result
   * This method should be called by external handlers to provide the response
   * @param result - The function call result
   */
  public respondToFunctionCall(result: FunctionCallResult): void {
    this.emit('functioncall:response', result);
  }

  /**
   * Register a function call handler
   * @param handler - The function call handler
   * @returns A function to remove the handler
   */
  public onFunctionCall(handler: FunctionCallHandler): () => void {
    this.on('functioncall', handler);

    // Return cleanup function
    return () => {
      this.off('functioncall', handler);
    };
  }

  /**
   * Register a pre-navigation handler for route-dependent function calls
   * This handler is called BEFORE the actual function call, allowing for route navigation
   * @param handler - The pre-navigation handler
   * @returns A function to remove the handler
   */
  public onPreNavigation(handler: FunctionCallHandler): () => void {
    this.on('functioncall:pre-navigation', handler);

    // Return cleanup function
    return () => {
      this.off('functioncall:pre-navigation', handler);
    };
  }

  /**
   * Clean up all pending requests
   */
  public cleanup(): void {
    // Clear all timeouts before cleaning up
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutId);
    }

    this.pendingRequests.clear();
    this.removeAllListeners();
  }

  /**
   * Get information about pending requests for debugging/monitoring
   * @returns Array of pending request information
   */
  public getPendingRequests(): Array<{ id: string; age: number; count: number }> {
    const now = Date.now();
    const pending = Array.from(this.pendingRequests.entries()).map(([id, request]) => ({
      id,
      age: now - request.createdAt,
      count: this.pendingRequests.size
    }));

    return pending;
  }
}

// Export singleton instance
export const functionCallManager = new FunctionCallManager();
