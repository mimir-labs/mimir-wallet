// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const LAYOUT = {
  /**
   * Header and topbar dimensions
   */
  TOPBAR_HEIGHT: 56,
  ALERT_HEIGHT: 38,

  /**
   * Sidebar dimensions
   */
  SIDEBAR: {
    /** Left sidebar width */
    LEFT_WIDTH: '220px',
    /** Right sidebar default width */
    RIGHT_DEFAULT_WIDTH: '360px',
    /** Right sidebar batch mode width */
    RIGHT_BATCH_WIDTH: '440px'
  },

  /**
   * Common component dimensions
   */
  COMPONENTS: {
    /** Standard button height for large buttons */
    BUTTON_HEIGHT_LG: 48,
    /** Standard modal padding */
    MODAL_PADDING: 16
  },

  /**
   * Responsive breakpoints (matching Tailwind CSS defaults)
   */
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },

  /**
   * Z-index layers for proper stacking
   */
  Z_INDEX: {
    MODAL: 1000,
    DROPDOWN: 100,
    SIDEBAR: 50,
    HEADER: 40
  }
} as const;

/**
 * CSS custom properties for use in dynamic styling
 */
export const CSS_VARS = {
  HEADER_HEIGHT: '--header-height',
  SIDEBAR_WIDTH: '--sidebar-width'
} as const;

/**
 * Helper functions for layout calculations
 */
export const layoutHelpers = {
  /**
   * Calculate total header height including alert
   */
  getTotalHeaderHeight: () => LAYOUT.TOPBAR_HEIGHT,

  /**
   * Get right sidebar width based on tab
   */
  getRightSidebarWidth: (tab?: 'batch' | 'template' | 'decoder' | 'ai-assistant') => {
    switch (tab) {
      case 'batch':
        return LAYOUT.SIDEBAR.RIGHT_BATCH_WIDTH;
      case 'ai-assistant':
        return '480px'; // Wider for AI chat interface
      default:
        return LAYOUT.SIDEBAR.RIGHT_DEFAULT_WIDTH;
    }
  },

  /**
   * Calculate viewport height minus header
   */
  getContentHeight: () => `calc(100dvh - ${layoutHelpers.getTotalHeaderHeight()}px)`
} as const;
