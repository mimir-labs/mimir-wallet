// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useState } from 'react';

/**
 * Template view states
 */
export type TemplateViewState = 'list' | 'add' | 'view';

/**
 * Template state configuration
 */
export interface TemplateStateConfig {
  network?: string;
  callData?: HexString;
  templateName?: string;
}

/**
 * Template state management hook
 * Separates routing logic from UI components for better maintainability
 */
export function useTemplateState(config: TemplateStateConfig) {
  const { callData: propCallData, templateName } = config;

  // View state management
  const [currentView, setCurrentView] = useState<TemplateViewState>(propCallData ? 'add' : 'list');

  // Form data management
  const [defaultCallData, setDefaultCallData] = useState<HexString | undefined>(propCallData);
  const [viewTemplate, setViewTemplate] = useState<HexString | undefined>(undefined);
  const [viewTemplateName, setViewTemplateName] = useState<string | undefined>(templateName);

  // State transition actions
  const actions = {
    /**
     * Navigate to add template view
     */
    showAdd: (callData?: HexString) => {
      if (callData) {
        setDefaultCallData(callData);
      }

      setCurrentView('add');
    },

    /**
     * Navigate to view template
     */
    showView: (name: string, callData: HexString) => {
      setViewTemplate(callData);
      setViewTemplateName(name);
      setCurrentView('view');
    },

    /**
     * Navigate back to list view
     */
    showList: () => {
      setCurrentView('list');
      // Reset form data
      setDefaultCallData(undefined);
      setViewTemplate(undefined);
      setViewTemplateName(undefined);
    },

    /**
     * Reset to initial state
     */
    reset: () => {
      setCurrentView('list');
      setDefaultCallData(propCallData);
      setViewTemplate(undefined);
      setViewTemplateName(templateName);
    }
  };

  return {
    // Current state
    currentView,
    defaultCallData,
    viewTemplate,
    viewTemplateName,

    // State transition actions
    actions,

    // Computed properties
    isAddView: currentView === 'add',
    isViewTemplate: currentView === 'view',
    isListView: currentView === 'list'
  };
}
