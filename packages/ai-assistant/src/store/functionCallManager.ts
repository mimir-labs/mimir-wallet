// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent, FunctionCallHandler, FunctionCallResult } from '../types.js';

import { EventEmitter } from 'eventemitter3';

// Internal types for the FunctionCallManager
interface PendingRequest {
  resolve: (result: FunctionCallResult) => void;
  reject: (error: Error) => void;
}

type FunctionCallManagerEvents = {
  functioncall: (event: FunctionCallEvent) => void;
  'functioncall:response': (response: FunctionCallResult) => void;
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
   * @returns Promise that resolves with the function call result
   */
  public emitFunctionCall(event: FunctionCallEvent): Promise<FunctionCallResult> {
    return new Promise<FunctionCallResult>((resolve, reject) => {
      // Store the promise resolvers
      this.pendingRequests.set(event.id, { resolve, reject });

      // Emit the function call event
      if (['createMultisig', 'createProxy', 'transferForm', 'batchTransferForm'].includes(event.name)) {
        setTimeout(() => {
          this.emit('functioncall', event);
        }, 1000);
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
   * Clean up all pending requests
   */
  public cleanup(): void {
    this.pendingRequests.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const functionCallManager = new FunctionCallManager();
