// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToolState } from '../hooks/chat.types.js';

import { useCallback, useImperativeHandle, useRef, useState } from 'react';

import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';

import { useChat } from '../hooks/useChat.js';
import { useFrontendAction } from '../hooks/useFrontendAction.js';
import { Conversation, ConversationContent, ScrollController } from './conversation.js';
import { Loader } from './Loader.js';
import { Message, MessageContent } from './message.js';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from './prompt-input.js';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './reasoning.js';
import { Response } from './response.js';
import { Suggestion, Suggestions } from './suggestion.js';
import { ToolHeader } from './tool.js';

/**
 * Tool data structure for custom rendering
 */
export interface ToolData {
  type: string;
  toolCallId: string;
  toolName: string;
  input: unknown;
  output?: unknown;
  state: ToolState;
}

interface Props {
  renderTool?: (params: { tool: ToolData }) => React.ReactNode;
  suggestions: Array<[string, string]>; // Array of [label, value] pairs - required
  onStatusChange?: (status: 'submitted' | 'streaming' | 'ready' | 'error') => void;
  ref?: React.Ref<SimpleChatRef>;
}

export interface SimpleChatRef {
  sendMessage: (message: string) => void;
  clearChat: () => void;
}

interface ConversationRef {
  scrollToBottom: () => void;
}

function SimpleChat({ renderTool, suggestions, onStatusChange, ref }: Props) {
  const [input, setInput] = useState('');
  const conversationRef = useRef<ConversationRef>(null);

  // Use the chat hook
  const {
    messages,
    status,
    lastFailedMessage,
    sendMessage: chatSendMessage,
    retry,
    stop,
    clearChat
  } = useChat({
    onStatusChange
  });

  // Use frontend action hook for retrying tool calls
  const { triggerFrontendAction } = useFrontendAction();

  // Wrapper for sendMessage that scrolls to bottom
  const sendMessage = useCallback(
    (message: string) => {
      chatSendMessage(message);
      // Scroll to bottom after sending message
      setTimeout(() => {
        conversationRef.current?.scrollToBottom();
      }, 100);
    },
    [chatSendMessage]
  );

  // Expose sendMessage and clearChat through ref
  useImperativeHandle(
    ref,
    () => ({
      sendMessage: sendMessage,
      clearChat: () => {
        clearChat();
        setInput('');
      }
    }),
    [sendMessage, clearChat]
  );

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'streaming') {
      // Stop streaming
      stop();
    } else if (status === 'ready' || status === 'error') {
      if (input.trim()) {
        sendMessage(input);
        setInput('');
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Handle tool retry
  const handleRetryTool = useCallback(
    (toolName: string, toolInput: unknown) => {
      triggerFrontendAction(toolName, toolInput);
    },
    [triggerFrontendAction]
  );

  return (
    <div className='flex h-full flex-col'>
      <Conversation className='h-full' ref={conversationRef}>
        <ConversationContent>
          <ScrollController />
          {messages.length === 0 ? (
            <Suggestions>
              {suggestions.map(([label, value]) => (
                <Suggestion key={label} onClick={handleSuggestionClick} suggestion={value}>
                  {label}
                </Suggestion>
              ))}
            </Suggestions>
          ) : null}
          {messages.map((message) => (
            <div key={message.id}>
              <Message from={message.role}>
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
                      case 'tool':
                        return (
                          <div key={`${message.id}-${i}`} className='space-y-2'>
                            {/* Tool status component - always displayed */}
                            <ToolHeader
                              type={`tool-call`}
                              state={part.state}
                              title={part.toolName}
                              onRetry={
                                part.toolName === 'navigate'
                                  ? () => handleRetryTool(part.toolName, part.input)
                                  : undefined
                              }
                            />

                            {/* Custom renderTool content - if provided */}
                            {renderTool &&
                              renderTool({
                                tool: {
                                  type: `tool-${part.toolName}`,
                                  toolCallId: `${message.id}-${i}`,
                                  toolName: part.toolName,
                                  input: part.input,
                                  output: part.output,
                                  state: part.state
                                }
                              })}
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            </div>
          ))}
          {status === 'submitted' && <Loader />}

          {/* Error retry prompt */}
          {status === 'error' && lastFailedMessage && (
            <Alert variant='destructive'>
              <AlertTitle>Meet some problems, please retry</AlertTitle>
              <Button
                size='sm'
                variant='ghost'
                onClick={retry}
                className='absolute top-0 right-2 bottom-0 m-auto mt-2 h-[20px]'
              >
                Retry
              </Button>
            </Alert>
          )}
        </ConversationContent>
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
}

SimpleChat.displayName = 'SimpleChat';

export default SimpleChat;
