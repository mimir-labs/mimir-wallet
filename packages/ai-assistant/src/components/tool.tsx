// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import type { ToolUIPart } from 'ai';
import type { ComponentProps, ReactNode } from 'react';

import { CheckCircleIcon, ChevronDownIcon, CircleIcon, WrenchIcon, XCircleIcon } from 'lucide-react';
import { isValidElement } from 'react';

import { cn, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@mimir-wallet/ui';

import { CodeBlock } from './code-block.js';

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible className={cn('not-prose border-divider-300 mb-4 w-full rounded-[10px] border', className)} {...props} />
);

export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart['type'];
  state: ToolUIPart['state'];
  className?: string;
};

const getStatusIndicator = (status: ToolUIPart['state']) => {
  const labels = {
    'input-streaming': 'Pending',
    'input-available': 'Running',
    'output-available': 'Completed',
    'output-error': 'Error'
  } as const;

  const iconColors = {
    'input-streaming': 'text-muted-foreground',
    'input-available': 'text-primary animate-pulse',
    'output-available': 'text-success',
    'output-error': 'text-danger'
  } as const;

  const icons = {
    'input-streaming': <CircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'input-available': <CircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'output-available': <CheckCircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'output-error': <XCircleIcon className={cn('size-[10px]', iconColors[status])} />
  } as const;

  return (
    <div className='flex items-center gap-[5px]'>
      {icons[status]}
      <span className='text-foreground text-sm'>{labels[status]}</span>
    </div>
  );
};

export const ToolHeader = ({ className, title, type, state, ...props }: ToolHeaderProps) => (
  <CollapsibleTrigger className={cn('flex w-full items-center justify-between gap-4 p-2', className)} {...props}>
    <div className='flex items-center gap-3'>
      <WrenchIcon className='text-foreground/50 size-4' />
      <span className='text-sm font-medium'>{title ?? type.split('-').slice(1).join('-')}</span>
      {getStatusIndicator(state)}
    </div>
    <ChevronDownIcon className='text-foreground/50 size-4 transition-transform group-data-[state=open]:rotate-180' />
  </CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in outline-none',
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<'div'> & {
  input: ToolUIPart['input'];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn('space-y-2 overflow-hidden p-2', className)} {...props}>
    <h4 className='text-foreground/50 text-xs font-medium tracking-wide uppercase'>Parameters</h4>
    <div className='bg-muted/50 rounded-[10px]'>
      <CodeBlock code={JSON.stringify(input, null, 2)} language='json' />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<'div'> & {
  output: ToolUIPart['output'];
  errorText: ToolUIPart['errorText'];
};

export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === 'object' && !isValidElement(output)) {
    Output = <CodeBlock code={JSON.stringify(output, null, 2)} language='json' />;
  } else if (typeof output === 'string') {
    Output = <CodeBlock code={output} language='json' />;
  }

  return (
    <div className={cn('space-y-2 p-2', className)} {...props}>
      <h4 className='text-foreground/50 text-xs font-medium tracking-wide uppercase'>
        {errorText ? 'Error' : 'Result'}
      </h4>
      <div
        className={cn(
          'overflow-x-auto rounded-[10px] text-xs [&_table]:w-full',
          errorText ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-foreground'
        )}
      >
        {errorText && <div>{errorText}</div>}
        {Output}
      </div>
    </div>
  );
};
