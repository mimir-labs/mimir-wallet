// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallArgumentValue } from './types.js';

/**
 * Utility functions for safely converting FunctionCallArgumentValue to specific types
 */

/**
 * Safely convert FunctionCallArgumentValue or unknown to string
 */
export function toFunctionCallString(value: FunctionCallArgumentValue | unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
}

/**
 * Safely convert FunctionCallArgumentValue or unknown to number
 */
export function toFunctionCallNumber(value: FunctionCallArgumentValue | unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  const num = Number(value);

  return isNaN(num) ? undefined : num;
}

/**
 * Safely convert FunctionCallArgumentValue or unknown to boolean
 */
export function toFunctionCallBoolean(value: FunctionCallArgumentValue | unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return Boolean(value);
}

/**
 * Safely convert FunctionCallArgumentValue or unknown to string array
 */
export function toFunctionCallStringArray(value: FunctionCallArgumentValue | unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : String(item)));
  }

  return undefined;
}

/**
 * Type guard to check if FunctionCallArgumentValue is an array
 */
export function isFunctionCallArray(value: FunctionCallArgumentValue): value is FunctionCallArgumentValue[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if FunctionCallArgumentValue is an object
 */
export function isFunctionCallObject(
  value: FunctionCallArgumentValue
): value is { [key: string]: FunctionCallArgumentValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
