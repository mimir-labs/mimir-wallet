// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

import { cn } from '@mimir-wallet/ui';

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown className={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)} {...props} />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = 'Response';
