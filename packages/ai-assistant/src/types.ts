// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type AiProvider = 'openai' | 'claude' | 'kimi';

export interface AiModel {
  id: string;
  name: string;
  provider: AiProvider;
  maxTokens: number;
  supportsFunctions?: boolean;
}

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  systemPrompt: string;
  streamResponse?: boolean;
  baseURL?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  config: AiConfig;
}

export interface StreamingResponse {
  content: string;
  done: boolean;
  error?: string;
}

export interface AiProviderConfig {
  baseURL: string;
  models: AiModel[];
  headers: Record<string, string>;
  supportedFeatures: {
    streaming: boolean;
    functions: boolean;
    vision: boolean;
  };
}

// Pre-defined AI models
export const AI_MODELS: Record<AiProvider, AiModel[]> = {
  openai: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      supportsFunctions: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      supportsFunctions: true
    }
  ],
  claude: [
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'claude',
      maxTokens: 200000
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'claude',
      maxTokens: 200000
    }
  ],
  kimi: [
    {
      id: 'moonshot-v1-8k',
      name: 'Kimi 8K',
      provider: 'kimi',
      maxTokens: 8192
    },
    {
      id: 'moonshot-v1-32k',
      name: 'Kimi 32K',
      provider: 'kimi',
      maxTokens: 32768
    },
    {
      id: 'moonshot-v1-128k',
      name: 'Kimi 128K',
      provider: 'kimi',
      maxTokens: 131072
    },
    {
      id: 'kimi-k2-instruct',
      name: 'Kimi K2 Instruct',
      provider: 'kimi',
      maxTokens: 32768
    }
  ]
};

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

export type FunctionCallHandler = (event: FunctionCallEvent) => Promise<FunctionCallResult>;

export interface FunctionCallRegistration {
  name: string;
  handler: FunctionCallHandler;
  description?: string;
}

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

export const PROVIDER_CONFIGS: Record<AiProvider, AiProviderConfig> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: AI_MODELS.openai,
    headers: {
      'Content-Type': 'application/json'
    },
    supportedFeatures: {
      streaming: true,
      functions: true,
      vision: false
    }
  },
  claude: {
    baseURL: 'https://api.anthropic.com/v1',
    models: AI_MODELS.claude,
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    supportedFeatures: {
      streaming: true,
      functions: false,
      vision: false
    }
  },
  kimi: {
    baseURL: 'https://api.moonshot.ai/v1',
    models: AI_MODELS.kimi,
    headers: {
      'Content-Type': 'application/json'
    },
    supportedFeatures: {
      streaming: true,
      functions: false,
      vision: false
    }
  }
};
