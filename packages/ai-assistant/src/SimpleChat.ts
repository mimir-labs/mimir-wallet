// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Separate entry point for lazy loading SimpleChat
// This avoids loading the entire ai-assistant package when only SimpleChat is needed
export {
  default as SimpleChat,
  type SimpleChatRef,
  type ToolData,
} from './components/SimpleChat.js';
