// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AiConfig, AiProvider } from '../types.js';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_AI_CONFIG } from '../types.js';

interface AiStore {
  // Configuration
  config: AiConfig;
  setConfig: (config: Partial<AiConfig>) => void;
  setProvider: (provider: AiProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set) => ({
      // Configuration
      config: DEFAULT_AI_CONFIG,
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig }
        })),
      setProvider: (provider) =>
        set((state) => ({
          config: { ...state.config, provider }
        })),
      setApiKey: (apiKey) =>
        set((state) => ({
          config: { ...state.config, apiKey }
        })),
      setModel: (model) =>
        set((state) => ({
          config: { ...state.config, model }
        }))
    }),
    {
      name: 'mimir-ai-assistant',
      partialize: (state) => ({
        config: state.config
      }),
      version: 1,
      // Add storage configuration for better error handling
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);

            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error reading from localStorage:', error);

            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        }
      }
    }
  )
);
