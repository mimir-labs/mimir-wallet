// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@mimir-wallet/ui';
import { CheckCircleIcon, CircleIcon, WrenchIcon, XCircleIcon } from 'lucide-react';
import React, { isValidElement } from 'react';

import { CodeBlock } from './code-block.js';

/**
 * Tool state types (matching backend protocol)
 */
export type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-streaming'
  | 'output-available'
  | 'output-error';

export type ToolProps = ComponentProps<'div'>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <div className={cn('not-prose border-divider mb-4 w-full rounded-[10px] border', className)} {...props} />
);

export type ToolHeaderProps = ComponentProps<'div'> & {
  title?: string;
  type: string;
  state: ToolState;
  onRetry?: () => void;
};

const getStatusIndicator = (status: ToolState) => {
  const labels: Record<ToolState, string> = {
    'input-streaming': 'Pending',
    'input-available': 'Running',
    'output-streaming': 'Processing',
    'output-available': 'Completed',
    'output-error': 'Error'
  };

  const iconColors: Record<ToolState, string> = {
    'input-streaming': 'text-muted-foreground',
    'input-available': 'text-primary animate-pulse',
    'output-streaming': 'text-primary animate-pulse',
    'output-available': 'text-success',
    'output-error': 'text-danger'
  };

  const icons: Record<ToolState, React.ReactElement> = {
    'input-streaming': <CircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'input-available': <CircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'output-streaming': <CircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'output-available': <CheckCircleIcon className={cn('size-[10px]', iconColors[status])} />,
    'output-error': <XCircleIcon className={cn('size-[10px]', iconColors[status])} />
  };

  return (
    <div className='flex items-center gap-[5px]'>
      {icons[status]}
      <span className='text-foreground text-sm'>{labels[status]}</span>
    </div>
  );
};

export const ToolHeader = ({ className, title, type, state, onRetry, ...divProps }: ToolHeaderProps) => {
  return (
    <div
      data-retry={!!onRetry}
      className={cn(
        'data-[retry=true]:hover:border-primary not-prose border-divider mb-4 flex w-full items-center justify-between gap-4 rounded-[10px] border p-2 data-[retry=true]:cursor-pointer',
        className
      )}
      onClick={onRetry}
      {...divProps}
    >
      <div className='flex items-center gap-3'>
        <WrenchIcon className='text-foreground/50 size-4' />
        <span
          data-retry={!!onRetry}
          className='text-sm font-medium data-[retry=true]:font-bold data-[retry=true]:underline'
        >
          {title ?? type.split('-').slice(1).join('-')}
        </span>
        {getStatusIndicator(state)}
      </div>
    </div>
  );
};

export type ToolContentProps = ComponentProps<'div'>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <div className={cn('text-popover-foreground outline-none', className)} {...props} />
);

export type ToolInputProps = ComponentProps<'div'> & {
  input: unknown;
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
  output?: unknown;
  errorText?: string;
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
