// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import type { ComponentProps } from 'react';

import { Button } from '@mimir-wallet/ui';

export type SuggestionsProps = ComponentProps<'div'>;

export const Suggestions = ({ children, ...props }: SuggestionsProps) => (
  <div className='flex w-full flex-wrap gap-2.5' {...props}>
    <p>Hey there! i'm Mimo, What do you want today?</p>
    {children}
  </div>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  variant = 'solid',
  size = 'md',
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button onClick={handleClick} size={size} type='button' color='secondary' variant={variant} {...props}>
      {children || suggestion}
    </Button>
  );
};
