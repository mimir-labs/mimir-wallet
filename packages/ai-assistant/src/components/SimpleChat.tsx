// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent } from '../types.js';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type ToolUIPart, type UITools } from 'ai';
import { useRef, useState } from 'react';

import { useAIContext } from '../store/aiContext.js';
import { useAiStore } from '../store/aiStore.js';
import { functionCallManager } from '../store/functionCallManager.js';
import { Conversation, ConversationContent, ConversationScrollButton } from './conversation.js';
import { Loader } from './Loader.js';
import { Message, MessageContent } from './message.js';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from './prompt-input.js';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './reasoning.js';
import { Response } from './response.js';
import { Suggestion, Suggestions } from './suggestion.js';

const models = [
  {
    name: 'Anthropic: Claude Sonnet 4',
    value: 'anthropic/claude-sonnet-4'
  },
  {
    name: 'OpenAI: GPT-5',
    value: 'openai/gpt-5'
  },
  {
    name: 'MoonshotAI: Kimi K2',
    value: 'moonshotai/kimi-k2'
  },
  {
    name: 'Google: Gemini 2.5 Pro',
    value: 'google/gemini-2.5-pro'
  }
];

interface Props {
  renderTool?: ({ tool }: { tool: ToolUIPart<UITools> }) => React.ReactNode;
}

const suggestions = [
  'How do I create a multisig wallet on Mimir?',
  'Can I send a transaction using a multisig account?',
  'What is multisig deposit?',
  'What’s the difference between static and flexible multisig?',
  'How can I use the Call Template to reuse transactions?',
  'How does the proposer role work in a multisig?',
  'Can I stake DOT using a multisig account?',
  'How do I vote on OpenGov with a proxy or multisig?',
  'How could i use multisig on HydraDX?'
];

function SimpleChat({ renderTool }: Props) {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const modelRef = useRef(model);

  modelRef.current = model;

  const { messages, sendMessage, status, addToolResult, stop } = useChat({
    transport: new DefaultChatTransport({
      api: import.meta.env.VITE_AI_ENDPOINT || 'https://ai-assitant.mimir.global/',
      prepareSendMessagesRequest: (options) => {
        return {
          body: {
            messages: options.messages,
            system: useAiStore.getState().config.systemPrompt || '',
            stateMessage: useAIContext.getState().getStateContext(),
            topK: useAiStore.getState().config.topK,
            topP: useAiStore.getState().config.topP,
            temperature: useAiStore.getState().config.temperature,
            model: modelRef.current
          }
        };
      }
    }),
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
          output: JSON.stringify({ error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` })
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'streaming') {
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
              {suggestions.map((suggestion) => (
                <Suggestion key={suggestion} onClick={handleSuggestionClick} suggestion={suggestion} />
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

      <PromptInput onSubmit={handleSubmit} className='mt-4'>
        <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputModelSelect
              onValueChange={(value) => {
                setModel(value);
              }}
              value={model}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((model) => (
                  <PromptInputModelSelectItem key={model.value} value={model.value}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export default SimpleChat;
