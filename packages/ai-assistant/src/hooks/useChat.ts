// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChatRequest, FrontendState } from '../chat-types.js';
import type {
  ChatStatus,
  DisplayMessage,
  MessagePart,
  UseChatOptions,
  UseChatReturn,
} from './chat.types.js';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CONVERSATION_ID_HEADER } from '../chat-types.js';
import { useAIContext } from '../store/aiContext.js';
import { ChatAPIClient } from '../utils/ChatAPIClient.js';

import { useFrontendAction } from './useFrontendAction.js';
import { useSSEProcessor } from './useSSEProcessor.js';

/**
 * Custom hook for managing chat functionality with AI assistant
 *
 * Features:
 * - Send messages and receive streaming responses
 * - Handle tool execution and display
 * - Automatic retry on failure with fallback endpoints
 * - Error recovery with partial message preservation
 * - Conversation state management
 *
 * @param options - Configuration options for the chat hook
 * @returns Chat state and control functions
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { onStatusChange } = options;

  // ===== State Management =====
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // ===== API Client Setup =====
  const chatAPI = useMemo(() => {
    const primaryEndpoint =
      import.meta.env.VITE_AI_ENDPOINT || 'https://ai-assistant.mimir.global/';

    return new ChatAPIClient({
      endpoints: [primaryEndpoint].filter(Boolean),
      timeout: 30000, // 30 seconds
      maxRetries: 2, // 2 retries per endpoint
    });
  }, []);

  // ===== Extracted Hooks =====
  const {
    parseSSEEvent,
    processTextEvent,
    processToolStartEvent,
    processToolEndEvent,
    processErrorEvent,
  } = useSSEProcessor();
  const { triggerFrontendAction } = useFrontendAction();

  // ===== Helper Functions =====

  /**
   * Update chat status and notify parent component
   */
  const updateStatus = useCallback(
    (newStatus: ChatStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  /**
   * Get current frontend state for context
   */
  const getFrontendState = useCallback((): FrontendState => {
    const aiContext = useAIContext.getState();

    return {
      currentPage: aiContext.state?.currentPath || window.location.pathname,
      currentAccount: aiContext.state?.currentAccount?.address,
      ss58Format: aiContext.state?.chainSS58,
      networks: aiContext.supportedNetworks || [],
      addressBook: aiContext.addresses || [],
    };
  }, []);

  /**
   * Update message display with current assistant parts
   */
  const updateMessageDisplay = useCallback(
    (assistantMessageId: string, assistantParts: MessagePart[]) => {
      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) => m.id === assistantMessageId,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];

          updated[existingIndex] = {
            id: assistantMessageId,
            role: 'assistant',
            parts: [...assistantParts],
          };

          return updated;
        }

        return [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            parts: [...assistantParts],
          },
        ];
      });
    },
    [],
  );

  /**
   * Process SSE stream and update UI
   */
  const processSSEStream = useCallback(
    async (
      reader: ReadableStreamDefaultReader<Uint8Array>,
      assistantMessageId: string,
      userMessage: string,
    ) => {
      const decoder = new TextDecoder();
      let buffer = '';
      const assistantParts: MessagePart[] = [];
      const toolCallsMap = new Map<string, number>();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode chunk and process complete lines
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            // Process each line with error boundary
            try {
              const event = parseSSEEvent(line);

              if (!event) {
                continue;
              }

              switch (event.type) {
                case 'text': {
                  processTextEvent(event, assistantParts);
                  updateMessageDisplay(assistantMessageId, assistantParts);
                  break;
                }

                case 'tool_start': {
                  const { processed } = processToolStartEvent(
                    event,
                    assistantParts,
                    toolCallsMap,
                  );

                  if (processed) {
                    updateMessageDisplay(assistantMessageId, assistantParts);
                    triggerFrontendAction(event.name, event.input);
                  }

                  break;
                }

                case 'tool_end': {
                  const { updated } = processToolEndEvent(
                    event,
                    assistantParts,
                    toolCallsMap,
                  );

                  if (updated) {
                    updateMessageDisplay(assistantMessageId, assistantParts);
                  }

                  break;
                }

                case 'done':
                  updateStatus('ready');
                  break;

                case 'error': {
                  // Process error event and add to assistant message
                  const processed = processErrorEvent(event, assistantParts);

                  if (processed) {
                    updateMessageDisplay(assistantMessageId, assistantParts);
                  }

                  // Set status to error and save failed message so user can retry
                  updateStatus('error');
                  setLastFailedMessage(userMessage);

                  console.error('[useChat] Error event:', event);

                  // Don't throw - we've already displayed the error to the user
                  // Just return early to stop processing
                  return;
                }
              }
            } catch (lineError) {
              console.error('[useChat] Failed to process SSE line:', lineError);
              // Continue processing remaining lines
            }
          }
        }
      } catch (streamError) {
        console.error('[useChat] Stream processing error:', streamError);

        // Preserve partial assistant message if any content was received
        if (assistantParts.length > 0) {
          updateMessageDisplay(assistantMessageId, assistantParts);
        }

        throw streamError;
      }
    },
    [
      parseSSEEvent,
      processTextEvent,
      processToolStartEvent,
      processToolEndEvent,
      processErrorEvent,
      triggerFrontendAction,
      updateMessageDisplay,
      updateStatus,
    ],
  );

  // ===== Public API Functions =====

  /**
   * Send a message to the chat backend
   */
  const sendMessage = useCallback(
    async (text: string, isRetry = false) => {
      if (!text.trim() || status === 'streaming' || status === 'submitted') {
        return;
      }

      // Cleanup previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Add user message (skip on retry)
      if (!isRetry) {
        const userMessageId = `user-${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            role: 'user',
            parts: [{ type: 'text', text }],
          },
        ]);
      }

      updateStatus('submitted');

      try {
        // Prepare and send request
        const state = getFrontendState();
        const requestBody: ChatRequest = {
          message: text,
          state,
          conversationId,
          userAddress: useAIContext.getState().getUserAddress(),
        };

        const response = await chatAPI.post(
          requestBody,
          abortControllerRef.current.signal,
        );

        // Update conversation ID
        const newConversationId = response.headers.get(CONVERSATION_ID_HEADER);

        if (newConversationId && newConversationId !== conversationId) {
          setConversationId(newConversationId);
        }

        updateStatus('streaming');

        // Process streaming response
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const assistantMessageId = `assistant-${Date.now()}`;

        await processSSEStream(reader, assistantMessageId, text);
      } catch (error) {
        const err = error as Error;

        // Handle abort
        if (err.name === 'AbortError') {
          updateStatus('ready');

          return;
        }

        // Handle error
        console.error('[useChat] Error:', err);
        updateStatus('error');
        setLastFailedMessage(text);

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: `Sorry, an error occurred: ${err.message}`,
              },
            ],
          },
        ]);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      chatAPI,
      status,
      conversationId,
      updateStatus,
      getFrontendState,
      processSSEStream,
    ],
  );

  /**
   * Retry the last failed message
   */
  const retry = useCallback(async () => {
    if (!lastFailedMessage) {
      console.warn('[useChat] No failed message to retry');

      return;
    }

    setLastFailedMessage(null);

    // Remove assistant messages after the failed user message
    setMessages((prev) => {
      let lastUserMessageIndex = -1;

      for (let i = prev.length - 1; i >= 0; i--) {
        const firstPart = prev[i].parts[0];

        if (
          prev[i].role === 'user' &&
          firstPart?.type === 'text' &&
          firstPart.text === lastFailedMessage
        ) {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex >= 0) {
        return prev.slice(0, lastUserMessageIndex + 1);
      }

      // Fallback: remove error message
      const lastMessage = prev[prev.length - 1];

      if (
        lastMessage &&
        lastMessage.role === 'assistant' &&
        lastMessage.id.startsWith('error-')
      ) {
        return prev.slice(0, -1);
      }

      return prev;
    });

    await sendMessage(lastFailedMessage, true);
  }, [lastFailedMessage, sendMessage]);

  /**
   * Stop the current streaming response
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear all chat history and reset conversation
   */
  const clearChat = useCallback(() => {
    // Prevent clearing during active chat session
    if (status === 'submitted' || status === 'streaming') {
      console.warn(
        '[useChat] Cannot clear chat while message is being processed',
      );

      return;
    }

    // Abort current request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset all state
    setConversationId(null);
    setMessages([]);
    setLastFailedMessage(null);
    updateStatus('ready');
  }, [status, updateStatus]);

  // ===== Lifecycle =====

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ===== Return Public API =====

  return {
    conversationId,
    messages,
    status,
    lastFailedMessage,
    sendMessage,
    retry,
    stop,
    clearChat,
  };
}
