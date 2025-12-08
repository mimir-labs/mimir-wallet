// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * TypeScript Type Definitions for Mimir AI Assistant Chat Integration
 * Adapted from ai-docs/frontend-types.ts for the new backend architecture
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Main request body for chat API
 */
export interface ChatRequest {
  /**
   * Latest user message (string only)
   * Backend manages conversation history, so only send the new message
   */
  message: string;

  /**
   * Current frontend application state
   * This helps AI understand the context of user's request
   */
  state: FrontendState;

  /**
   * Optional conversation ID for continuing existing conversation
   * If not provided, a new conversation will be created
   * Save the ID from response header 'x-conversation-id' for subsequent requests
   */
  conversationId?: string | null;

  /**
   * Optional user wallet address
   * Used for logging and analytics
   */
  userAddress?: string;

  /**
   * Optional additional metadata
   * Can be used for custom tracking or analytics
   */
  metadata?: Record<string, unknown>;
}

/**
 * Frontend application state structure
 */
export interface FrontendState {
  currentPage: string;
  currentAccount?: string; // Account address, will be fetched from API
  ss58Format?: number;
  networks: NetworkInfo[];
  addressBook: Contact[];
}

/**
 * Blockchain network information
 */
export interface NetworkInfo {
  /** Network identifier, e.g., "polkadot", "kusama" */
  key: string;

  /** Display name, e.g., "Polkadot", "Kusama" */
  name: string;

  /** Whether this is a relay chain */
  isRelayChain: boolean;

  /** Network genesis hash */
  genesisHash: string;

  /** SS58 address format number */
  ss58Format: number;

  /** Parachain ID (if applicable) */
  paraId?: number;

  /** Whether this is a testnet */
  isTestnet: boolean;

  /** Whether this network is enabled by user */
  isEnabled: boolean;
}

/**
 * Address book contact
 */
export interface Contact {
  /** Contact display name */
  name: string;

  /** Contact address */
  address: string;

  /** Whether this contact has permissions (e.g., multisig member) */
  hasPermission: boolean;

  /** Whether this is a multisig account */
  isMultisig: boolean;

  /** Whether this is a pure proxy */
  isPure: boolean;

  /** Associated network (if specific to one network) */
  network?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Server-Sent Event (SSE) response types
 */
export type ChatResponseEvent =
  | TextResponseEvent
  | ToolStartEvent
  | ToolEndEvent
  | ChatErrorEvent
  | DoneEvent;

/**
 * Text response from AI
 */
export interface TextResponseEvent {
  type: 'text';
  /** AI's text response */
  content: string;
}

/**
 * Tool start event - AI starts calling a tool
 */
export interface ToolStartEvent {
  type: 'tool_start';
  /** Unique tool call ID */
  id: string;
  /** Name of the tool being called */
  name: string;
  /** Input parameters for the tool */
  input: unknown;
}

/**
 * Tool end event - Tool execution completed
 */
export interface ToolEndEvent {
  type: 'tool_end';
  /** Same ID as tool_start */
  id: string;
  /** Name of the tool */
  name: string;
  /** Tool execution output */
  output: unknown;
}

/**
 * Error event (renamed to avoid conflict with DOM ErrorEvent)
 */
export interface ChatErrorEvent {
  type: 'error';
  /** Error message */
  message: string;
  /** Error type/category (e.g., "tool_validation_error", "network_error") */
  errorType?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Completion event - streaming finished
 */
export interface DoneEvent {
  type: 'done';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Chat message for display (frontend only)
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * Constants
 */
export const CONVERSATION_ID_HEADER = 'x-conversation-id';
