// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent } from '../types.js';

import { useCallback } from 'react';

import { functionCallManager } from '../store/functionCallManager.js';
import { toFunctionCallArguments } from '../types.js';

/**
 * Hook for triggering frontend UI operations (navigation, modals, etc.)
 * Note: Backend handles business logic, frontend handles UI interactions
 */
export function useFrontendAction() {
  /**
   * Trigger frontend UI operation
   * @param toolName - Name of the tool/action
   * @param toolInput - Tool input parameters
   */
  const triggerFrontendAction = useCallback(
    (toolName: string, toolInput: unknown) => {
      // Create function call event for frontend listeners
      const functionCallEvent: FunctionCallEvent = {
        id: `${toolName}-${Date.now()}`,
        name: toolName,
        arguments: toFunctionCallArguments(toolInput),
        timestamp: new Date(),
      };

      // Emit to frontend listeners (navigation, modals, etc.)
      // This is fire-and-forget event emission
      functionCallManager.emitFunctionCall(functionCallEvent);
    },
    [],
  );

  return { triggerFrontendAction };
}
