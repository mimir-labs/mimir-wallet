// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChatResponseEvent } from '../chat-types.js';
import type { MessagePart } from './chat.types.js';

import { useCallback } from 'react';

/**
 * Hook for processing Server-Sent Events (SSE) from chat stream
 */
export function useSSEProcessor() {
  /**
   * Parse SSE event line into ChatResponseEvent
   */
  const parseSSEEvent = useCallback((line: string): ChatResponseEvent | null => {
    if (!line.startsWith('data: ')) return null;

    try {
      return JSON.parse(line.slice(6)) as ChatResponseEvent;
    } catch (err) {
      console.error('[useSSEProcessor] Failed to parse SSE event:', err);

      return null;
    }
  }, []);

  /**
   * Process text event - append incremental text content
   */
  const processTextEvent = useCallback((event: ChatResponseEvent, assistantParts: MessagePart[]): boolean => {
    if (event.type !== 'text') return false;

    const lastPart = assistantParts.find((item) => item.type === 'text');

    if (lastPart && lastPart.type === 'text') {
      // Append to existing text (incremental streaming)
      lastPart.text += event.content;
    } else {
      // Create new text part with initial content
      assistantParts.push({ type: 'text', text: event.content });
    }

    return true;
  }, []);

  /**
   * Process tool_start event - create new tool part
   */
  const processToolStartEvent = useCallback(
    (
      event: ChatResponseEvent,
      assistantParts: MessagePart[],
      toolCallsMap: Map<string, number>
    ): { processed: boolean; partIndex: number } => {
      if (event.type !== 'tool_start') return { processed: false, partIndex: -1 };

      // Create new tool part
      const toolPart: MessagePart = {
        type: 'tool',
        toolName: event.name,
        input: event.input,
        state: 'input-available'
      };

      // Add to parts array and track its index
      const partIndex = assistantParts.length;

      assistantParts.push(toolPart);
      toolCallsMap.set(event.id, partIndex);

      return { processed: true, partIndex };
    },
    []
  );

  /**
   * Process tool_end event - update tool part with output (immutable)
   */
  const processToolEndEvent = useCallback(
    (
      event: ChatResponseEvent,
      assistantParts: MessagePart[],
      toolCallsMap: Map<string, number>
    ): { processed: boolean; updated: boolean } => {
      if (event.type !== 'tool_end') return { processed: false, updated: false };

      // Find the corresponding tool part by ID
      const partIndex = toolCallsMap.get(event.id);

      // Validate tool state before updating
      if (partIndex === undefined) {
        console.error('[useSSEProcessor] Tool state corruption: tool_end without tool_start:', event.id);

        return { processed: true, updated: false };
      }

      if (partIndex >= assistantParts.length) {
        console.error('[useSSEProcessor] Tool state corruption: invalid part index:', partIndex);

        return { processed: true, updated: false };
      }

      if (assistantParts[partIndex]?.type !== 'tool') {
        console.error('[useSSEProcessor] Tool state corruption: type mismatch at index:', partIndex);

        return { processed: true, updated: false };
      }

      // Create new array with updated tool part (immutable update)
      const updatedParts = assistantParts.map((part, index) => {
        if (index === partIndex && part.type === 'tool') {
          return {
            ...part,
            output: event.output,
            state: 'output-available' as const
          };
        }

        return part;
      });

      // Replace assistantParts content with updated parts
      assistantParts.length = 0;
      assistantParts.push(...updatedParts);

      return { processed: true, updated: true };
    },
    []
  );

  /**
   * Process error event - create error message part
   */
  const processErrorEvent = useCallback((event: ChatResponseEvent, assistantParts: MessagePart[]): boolean => {
    if (event.type !== 'error') return false;

    // Format error message with details
    let errorText = event.message;

    if (event.errorType) {
      errorText = `[${event.errorType}] ${errorText}`;
    }

    if (event.details) {
      const detailsStr = JSON.stringify(event.details, null, 2);

      errorText += `\n\nDetails:\n${detailsStr}`;
    }

    // Add error as text part
    assistantParts.push({
      type: 'text',
      text: `❌ Error: ${errorText}`
    });

    return true;
  }, []);

  return {
    parseSSEEvent,
    processTextEvent,
    processToolStartEvent,
    processToolEndEvent,
    processErrorEvent
  };
}
