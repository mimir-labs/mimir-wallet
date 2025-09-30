// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent } from '../types.js';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type ToolUIPart, type UITools } from 'ai';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useAIContext } from '../store/aiContext.js';
import { functionCallManager } from '../store/functionCallManager.js';
import { Conversation, ConversationContent, ConversationScrollButton } from './conversation.js';
import { Loader } from './Loader.js';
import { Message, MessageContent } from './message.js';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from './prompt-input.js';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './reasoning.js';
import { Response } from './response.js';
import { Suggestion, Suggestions } from './suggestion.js';

interface Props {
  renderTool?: ({ tool }: { tool: ToolUIPart<UITools> }) => React.ReactNode;
  suggestions: Array<[string, string]>; // Array of [label, value] pairs - required
  onStatusChange?: (status: 'submitted' | 'streaming' | 'ready' | 'error') => void;
}

export interface SimpleChatRef {
  sendMessage: (message: string) => void;
}

const SimpleChat = forwardRef<SimpleChatRef, Props>(({ renderTool, suggestions, onStatusChange }, ref) => {
  const [input, setInput] = useState('');
  const conversationIdRef = useRef<string>();

  // Use provided suggestions directly
  const displaySuggestions = suggestions;

  const customTransport = new DefaultChatTransport({
    api: import.meta.env.VITE_AI_ENDPOINT || 'https://ai-assitant.mimir.global/',
    prepareSendMessagesRequest: (options) => ({
      body: {
        messages: options.messages,
        stateMessage: useAIContext.getState().getStateContext(),
        conversationId: conversationIdRef.current,
        userAddress: useAIContext.getState().getUserAddress()
      }
    }),
    fetch: async (input, init) => {
      const response = await fetch(input, init);

      const newConversationId = response.headers.get('x-conversation-id');

      if (newConversationId && newConversationId !== conversationIdRef.current) {
        conversationIdRef.current = newConversationId;
        console.log('Conversation ID updated:', newConversationId);
      }

      return response;
    }
  });

  const { messages, sendMessage, status, addToolResult, stop, regenerate } = useChat({
    transport: customTransport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      console.log('Tool call received:', toolCall);

      // Skip dynamic tool calls (server-side execution)
      if (toolCall.dynamic) {
        return;
      }

      // Create function call event
      const functionCallEvent: FunctionCallEvent = {
        id: toolCall.toolCallId,
        name: toolCall.toolName,
        arguments: toolCall.input || {},
        timestamp: new Date()
      };

      try {
        // Emit function call and wait for result
        const result = await functionCallManager.emitFunctionCall(functionCallEvent);

        // Add tool result back to chat
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: result.success ? JSON.stringify(result.result) : `Error: ${result.error}`
        });
      } catch (error) {
        console.error('Function call error:', error);
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  });

  // Expose sendMessage through ref
  useImperativeHandle(
    ref,
    () => ({
      sendMessage: (message: string) => {
        sendMessage({ text: message });
      }
    }),
    [sendMessage]
  );

  // Notify parent about status changes
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'error') {
      regenerate();
    } else if (status === 'streaming') {
      stop();
    } else if (status === 'ready') {
      if (input.trim()) {
        sendMessage({ text: input });
        setInput('');
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  return (
    <div className='flex h-full flex-col'>
      <Conversation className='h-full'>
        <ConversationContent>
          {messages.length === 0 ? (
            <Suggestions>
              {displaySuggestions.map(([label, value]) => (
                <Suggestion key={label} onClick={handleSuggestionClick} suggestion={value}>
                  {label}
                </Suggestion>
              ))}
            </Suggestions>
          ) : null}
          {messages.map((message) => (
            <div key={`${message.id}-message`}>
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <Response key={`${message.id}-${i}`}>{part.text}</Response>;
                      case 'reasoning':
                        return (
                          <Reasoning key={`${message.id}-${i}`} className='w-full' isStreaming={status === 'streaming'}>
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        if (part.type.startsWith('tool-')) {
                          return renderTool?.({ tool: part as ToolUIPart<UITools> });
                        }

                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            </div>
          ))}
          {status === 'submitted' && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className='relative mt-4'>
        <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
        <PromptInputSubmit
          className='absolute right-1 bottom-1'
          disabled={status === 'ready' && !input.trim()}
          status={status}
        />
      </PromptInput>
    </div>
  );
});

SimpleChat.displayName = 'SimpleChat';

export default SimpleChat;
