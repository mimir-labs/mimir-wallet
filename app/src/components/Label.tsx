// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip } from '@mimir-wallet/ui';
import React from 'react';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';

function Label({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) {
  if (!tooltip) {
    return children;
  }

  return (
    <span className="inline-flex items-center gap-[5px]">
      {children}
      <Tooltip classNames={{ content: 'max-w-[300px]' }} content={tooltip}>
        <IconQuestion className="text-primary" />
      </Tooltip>
    </span>
  );
}

export default Label;
