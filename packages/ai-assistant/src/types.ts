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
export interface FunctionCallEvent {
  id: string;
  name: string;
  arguments: Record<string, any>;
  timestamp: Date;
}

export interface FunctionCallResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

export type FunctionCallHandler = (event: FunctionCallEvent) => void;

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
