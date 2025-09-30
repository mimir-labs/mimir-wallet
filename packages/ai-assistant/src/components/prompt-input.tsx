// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import type { ChatStatus } from 'ai';
import type { ComponentProps, HTMLAttributes, KeyboardEventHandler } from 'react';

import { ArrowUp, Loader2Icon, XIcon } from 'lucide-react';
import { Children } from 'react';

import { Button, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@mimir-wallet/ui';

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      'bg-background border-divider-300 relative w-full overflow-hidden rounded-xl border shadow-sm',
      className
    )}
    {...props}
  />
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = 'What would you like to know?',
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;

      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        'relative w-full resize-none rounded-none border-none shadow-none ring-0 outline-none',
        'field-sizing-content bg-transparent dark:bg-transparent',
        'max-h-[6lh] !min-h-[2.5rem]',
        'p-3 pr-10',
        'focus-visible:ring-0',
        className
      )}
      name='message'
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({ className, ...props }: PromptInputToolbarProps) => (
  <div className={cn('flex items-center justify-between p-1', className)} {...props} />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({ className, ...props }: PromptInputToolsProps) => (
  <div className={cn('flex items-center gap-1', '[&_button:first-child]:rounded-bl-xl', className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({ variant = 'ghost', className, size, ...props }: PromptInputButtonProps) => {
  const newSize = (size ?? Children.count(props.children) > 1) ? 'default' : 'icon';

  return (
    <Button
      className={cn(
        'shrink-0 gap-1.5 rounded-lg',
        variant === 'ghost' && 'text-foreground/50',
        newSize === 'default' && 'px-3',
        className
      )}
      isIconOnly={newSize === 'icon'}
      type='button'
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  variant = 'solid',
  isIconOnly = true,
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <ArrowUp className='size-4' />;

  if (status === 'submitted') {
    Icon = <Loader2Icon className='size-4 animate-spin' />;
  } else if (status === 'streaming') {
    Icon = <div className='h-2.5 w-2.5 bg-[currentColor]' />;
  } else if (status === 'error') {
    Icon = <XIcon className='size-4' />;
  }

  return (
    <Button
      className={cn('gap-1.5', className)}
      isIconOnly={isIconOnly}
      type='submit'
      radius='full'
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => <Select {...props} />;

export type PromptInputModelSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export const PromptInputModelSelectTrigger = ({ className, ...props }: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      'text-muted-foreground border-none bg-transparent font-medium shadow-none transition-colors',
      'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
      className
    )}
    {...props}
  />
);

export type PromptInputModelSelectContentProps = ComponentProps<typeof SelectContent>;

export const PromptInputModelSelectContent = ({ className, ...props }: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({ className, ...props }: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<typeof SelectValue>;

export const PromptInputModelSelectValue = ({ className, ...props }: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);
