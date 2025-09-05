// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent, FunctionCallHandler, FunctionCallResult } from '../types.js';

import { EventEmitter } from 'eventemitter3';

interface FunctionCallEvents {
  'function-call': (event: FunctionCallEvent, callback: (result: FunctionCallResult) => void) => void;
}

class FunctionCallManager extends EventEmitter<FunctionCallEvents> {
  private handlers: Map<string, FunctionCallHandler> = new Map();

  /**
   * Register a function call handler
   */
  register(name: string, handler: FunctionCallHandler): () => void {
    this.handlers.set(name, handler);

    // Return unregister function
    return () => {
      this.handlers.delete(name);
    };
  }

  /**
   * Unregister a function call handler
   */
  unregister(name: string): void {
    this.handlers.delete(name);
  }

  /**
   * Execute a function call
   */
  async execute(event: FunctionCallEvent): Promise<FunctionCallResult> {
    const handler = this.handlers.get(event.name);

    if (!handler) {
      return {
        id: event.id,
        success: false,
        error: `No handler registered for function: ${event.name}`
      };
    }

    try {
      const result = await handler(event);

      return result;
    } catch (error) {
      return {
        id: event.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Emit a function call event and wait for result
   */
  async emitFunctionCall(event: FunctionCallEvent): Promise<FunctionCallResult> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          id: event.id,
          success: false,
          error: 'Function call timeout after 30 seconds'
        });
      }, 30000);

      // First try registered handlers
      this.execute(event).then((result) => {
        clearTimeout(timeout);
        resolve(result);
      });

      // Also emit for external listeners
      this.emit('function-call', event, (result) => {
        clearTimeout(timeout);
        resolve(result);
      });
    });
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const functionCallManager = new FunctionCallManager();
