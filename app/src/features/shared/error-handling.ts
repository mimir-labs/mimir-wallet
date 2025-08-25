// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Standardized error types for features
 */
export interface FeatureError {
  type: 'decode' | 'network' | 'validation' | 'api' | 'unknown';
  message: string;
  code?: string;
  details?: string;
  originalError?: Error;
}

/**
 * Error result type for decode operations
 */
export type DecodeResult<T> = [T | null, FeatureError | null];

/**
 * Creates a standardized feature error
 */
export function createFeatureError(
  type: FeatureError['type'],
  message: string,
  originalError?: Error,
  details?: string,
  code?: string
): FeatureError {
  return {
    type,
    message,
    code,
    details,
    originalError
  };
}

/**
 * Error handler for decode operations
 */
export function handleDecodeError(error: unknown, context: string = 'decode'): FeatureError {
  if (error instanceof Error) {
    return createFeatureError('decode', `Failed to ${context}: ${error.message}`, error, error.stack);
  }

  return createFeatureError('decode', `Failed to ${context}: Unknown error`, undefined, String(error));
}

/**
 * Error handler for network operations
 */
export function handleNetworkError(error: unknown, operation: string = 'network operation'): FeatureError {
  if (error instanceof Error) {
    return createFeatureError('network', `${operation} failed: ${error.message}`, error, error.stack);
  }

  return createFeatureError('network', `${operation} failed: Network error`, undefined, String(error));
}

/**
 * Error handler for validation operations
 */
export function handleValidationError(message: string, details?: string): FeatureError {
  return createFeatureError('validation', message, undefined, details);
}

/**
 * Formats error for user display
 */
export function formatErrorMessage(error: FeatureError): string {
  switch (error.type) {
    case 'decode':
      return `Data decoding error: ${error.message}`;
    case 'network':
      return `Network error: ${error.message}`;
    case 'validation':
      return `Validation error: ${error.message}`;
    case 'api':
      return `API error: ${error.message}`;
    default:
      return error.message;
  }
}

/**
 * Safe execution wrapper that returns DecodeResult
 */
export function safeExecute<T>(operation: () => T, context: string = 'operation'): DecodeResult<T> {
  try {
    const result = operation();

    return [result, null];
  } catch (error) {
    return [null, handleDecodeError(error, context)];
  }
}

/**
 * Async safe execution wrapper
 */
export async function safeExecuteAsync<T>(
  operation: () => Promise<T>,
  context: string = 'async operation'
): Promise<DecodeResult<T>> {
  try {
    const result = await operation();

    return [result, null];
  } catch (error) {
    return [null, handleDecodeError(error, context)];
  }
}
