// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Tool UI state types representing different stages of tool execution
 */
export type ToolState =
  | 'input-streaming' // Tool input is being received
  | 'input-available' // Tool input is complete and available
  | 'output-streaming' // Tool output is being received
  | 'output-available' // Tool output is complete and available
  | 'output-error'; // Tool execution resulted in an error

/**
 * Message part types for rendering different content types
 */
export type MessagePart =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'reasoning';
      text: string;
    }
  | {
      type: 'tool';
      toolName: string;
      input: unknown;
      output?: unknown;
      error?: string;
      state: ToolState;
    };

/**
 * Display message structure containing role and content parts
 */
export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

/**
 * Chat status indicating current state of the chat
 */
export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

/**
 * Options for useChat hook
 */
export interface UseChatOptions {
  /**
   * Callback invoked when chat status changes
   */
  onStatusChange?: (status: ChatStatus) => void;
}

/**
 * Return value from useChat hook
 */
export interface UseChatReturn {
  /**
   * Current conversation ID for tracking multi-turn conversations
   */
  conversationId: string | null;

  /**
   * Array of messages for display in the UI
   */
  messages: DisplayMessage[];

  /**
   * Current chat status
   */
  status: ChatStatus;

  /**
   * Last failed message text for retry functionality
   */
  lastFailedMessage: string | null;

  /**
   * Send a message to the chat backend
   * @param text - The message text to send
   */
  sendMessage: (text: string) => Promise<void>;

  /**
   * Retry the last failed message
   */
  retry: () => Promise<void>;

  /**
   * Stop the current streaming response
   */
  stop: () => void;

  /**
   * Clear all chat history and reset conversation
   */
  clearChat: () => void;
}
