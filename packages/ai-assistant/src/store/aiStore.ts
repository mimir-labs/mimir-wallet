// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AiConfig, AiProvider, ChatSession, Message } from '../types.js';

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

  // Chat sessions
  currentSessionId: string | null;
  sessions: ChatSession[];
  createSession: () => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;

  // Messages
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  clearSession: (sessionId: string) => void;

  // UI state
  isStreamingEnabled: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
  saveHistory: boolean;
  setSaveHistory: (save: boolean) => void;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set, get) => ({
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
        })),

      // Chat sessions
      currentSessionId: null,
      sessions: [],
      createSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        const newSession: ChatSession = {
          id: sessionId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          config: get().config
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId
        }));

        return sessionId;
      },
      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        })),
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

      // Messages
      addMessage: (sessionId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          createdAt: new Date()
        };

        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: new Date(),
                  title:
                    session.title === 'New Chat' && message.role === 'user'
                      ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                      : session.title
                }
              : session
          )
        }));

        return newMessage.id;
      },
      updateMessage: (sessionId, messageId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg: any) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
                  updatedAt: new Date()
                }
              : session
          )
        })),
      clearSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [],
                  updatedAt: new Date(),
                  title: 'New Chat'
                }
              : session
          )
        })),

      // UI state
      isStreamingEnabled: true,
      setStreamingEnabled: (enabled) => set({ isStreamingEnabled: enabled }),
      saveHistory: true,
      setSaveHistory: (save) => set({ saveHistory: save })
    }),
    {
      name: 'mimir-ai-assistant',
      partialize: (state) => ({
        config: state.config,
        sessions: state.saveHistory ? state.sessions : [],
        currentSessionId: state.saveHistory ? state.currentSessionId : null,
        isStreamingEnabled: state.isStreamingEnabled,
        saveHistory: state.saveHistory
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
