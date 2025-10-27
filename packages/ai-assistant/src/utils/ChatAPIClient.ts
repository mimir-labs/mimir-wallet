// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Chat API Client with retry logic and fallback endpoints
 *
 * Provides robust HTTP fetching with:
 * - Multiple endpoint failover
 * - Exponential backoff retry
 * - Request timeout handling
 * - AbortSignal support
 */

export interface ChatAPIClientConfig {
  /**
   * List of API endpoints to try in order
   */
  endpoints: string[];

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts per endpoint
   * @default 2
   */
  maxRetries?: number;
}

export class ChatAPIClient {
  private readonly endpoints: string[];
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: ChatAPIClientConfig) {
    this.endpoints = config.endpoints.filter(Boolean); // Remove empty strings
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 2;

    if (this.endpoints.length === 0) {
      throw new Error('ChatAPIClient: At least one endpoint must be provided');
    }
  }

  /**
   * Send POST request with retry logic
   *
   * @param body - Request body to send
   * @param signal - AbortSignal for cancellation
   * @returns Response object
   * @throws Error if all endpoints and retries fail
   */
  async post(body: unknown, signal: AbortSignal): Promise<Response> {
    let lastError: Error | null = null;

    // Try each endpoint with retry
    for (const endpoint of this.endpoints) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          // Create timeout controller
          const timeoutController = new AbortController();
          const timeoutId = setTimeout(() => timeoutController.abort(), this.timeout);

          // Combine timeout signal with user abort signal
          const combinedSignal = this.combineSignals([signal, timeoutController.signal]);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: combinedSignal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return response; // Success
          }

          // Log non-2xx responses
          console.warn(`[ChatAPIClient] Endpoint returned ${response.status}:`, endpoint);

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`Client error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          lastError = error as Error;

          // Don't retry if user aborted
          if (signal.aborted) {
            throw new Error('Request aborted by user');
          }

          // Don't retry on timeout for last attempt
          if ((error as Error).name === 'AbortError' && attempt === this.maxRetries) {
            console.error(`[ChatAPIClient] Request timeout after ${this.timeout}ms:`, endpoint);
            continue; // Try next endpoint
          }

          console.warn(`[ChatAPIClient] Attempt ${attempt + 1} failed:`, error);

          // Wait before retry (exponential backoff)
          if (attempt < this.maxRetries) {
            const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, ...

            await this.delay(delayMs);
          }
        }
      }
    }

    throw new Error(
      `All chat endpoints failed after ${this.maxRetries + 1} attempts each. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Combine multiple AbortSignals into one
   * If any signal aborts, the combined signal aborts
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    signals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    });

    return controller.signal;
  }

  /**
   * Delay for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration for debugging
   */
  getConfig() {
    return {
      endpoints: this.endpoints,
      timeout: this.timeout,
      maxRetries: this.maxRetries
    };
  }
}
