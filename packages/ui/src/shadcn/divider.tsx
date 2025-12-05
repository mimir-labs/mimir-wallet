// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { cn } from '../lib/utils.js';

type DividerProps = React.ButtonHTMLAttributes<HTMLHRElement>;

function Divider({ className = '', ...props }: DividerProps) {
  return (
    <hr className={cn('h-divider bg-secondary w-full shrink-0 border-none [&+hr]:hidden', className)} {...props} />
  );
}

Divider.displayName = 'Divider';

export { Divider };
