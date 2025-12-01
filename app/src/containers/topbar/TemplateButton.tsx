// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Tooltip } from '@mimir-wallet/ui';
import React from 'react';

import { analyticsActions } from '@/analytics';
import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { useMimirLayout } from '@/hooks/useMimirLayout';

// Component styles
const BUTTON_STYLES = {
  base: 'border-secondary bg-secondary h-[32px] w-[32px] flex-[0_0_auto] sm:h-[42px] sm:w-[42px] sm:bg-transparent',
  icon: 'h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]'
} as const;

function TemplateButton() {
  const { rightSidebarOpen, rightSidebarState, openRightSidebar, closeRightSidebar, setRightSidebarTab } =
    useMimirLayout();
  const isOpen = rightSidebarOpen && rightSidebarState.tab === 'template';

  return (
    <Tooltip content='Template'>
      <Button
        isIconOnly
        className={BUTTON_STYLES.base}
        color='primary'
        variant='ghost'
        radius='md'
        onClick={() => {
          // Track template started when opening
          analyticsActions.templateStarted();

          if (isOpen) {
            closeRightSidebar();
          } else {
            setRightSidebarTab('template');
            openRightSidebar();
          }
        }}
      >
        <IconTemplate className={BUTTON_STYLES.icon} />
      </Button>
    </Tooltip>
  );
}

export default React.memo(TemplateButton);
