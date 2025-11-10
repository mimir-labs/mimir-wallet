// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type AiProvider = 'openai' | 'claude' | 'kimi';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  systemPrompt: string;
  streamResponse?: boolean;
  baseURL?: string;
}

// Function Call Types
/**
 * Recursive type for function call arguments supporting nested objects and arrays
 */
export type FunctionCallArgumentValue =
  | string
  | number
  | boolean
  | null
  | FunctionCallArgumentValue[]
  | { [key: string]: FunctionCallArgumentValue };

/**
 * Type guard to check if a value is a valid FunctionCallArgumentValue
 */
export function isFunctionCallArgumentValue(value: unknown): value is FunctionCallArgumentValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isFunctionCallArgumentValue(item));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every((val) => isFunctionCallArgumentValue(val));
  }

  return false;
}

/**
 * Safely convert unknown value to FunctionCallArgumentValue
 * Returns empty object if conversion fails
 */
export function toFunctionCallArguments(value: unknown): Record<string, FunctionCallArgumentValue> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const result: Record<string, FunctionCallArgumentValue> = {};

    for (const [key, val] of Object.entries(value)) {
      if (isFunctionCallArgumentValue(val)) {
        result[key] = val;
      } else {
        // Convert invalid values to string representation
        result[key] = String(val);
      }
    }

    return result;
  }

  return {};
}

export interface FunctionCallEvent {
  id: string;
  name: string;
  arguments: Record<string, FunctionCallArgumentValue>;
  timestamp: Date;
}

export interface FunctionCallResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

export type FunctionCallHandler = (event: FunctionCallEvent) => void;

// Export metadata types
export type {
  RouteRequirement,
  HandlerMetadata,
  HandlerRegistrationOptions,
  HandlerRegistration
} from './types/metadata.js';

// Default configurations
export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  topK: 40,
  baseURL: '',
  systemPrompt: ``
};
