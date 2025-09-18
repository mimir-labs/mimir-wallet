// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UIMessage } from 'ai';
import type { ComponentProps, HTMLAttributes } from 'react';

import { Avatar, cn } from '@mimir-wallet/ui';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2 py-4',
      from === 'user' ? 'is-user [&>div]:max-w-[80%]' : 'is-assistant flex-row-reverse justify-end [&>div]:max-w-full',
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({ children, className, ...props }: MessageContentProps) => (
  <div
    className={cn(
      'text-foreground flex flex-col gap-2 overflow-hidden p-2.5 text-sm wrap-break-word',
      'group-[.is-user]:bg-secondary group-[.is-user]:rounded-[20px]',
      'group-[.is-assistant]:text-foreground group-[.is-assistant]:w-full group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0',
      'is-user:dark',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({ src, name, className, ...props }: MessageAvatarProps) => (
  <Avatar
    className={cn('ring-border size-8 ring-1', className)}
    {...props}
    src={src}
    fallback={<div>{name?.slice(0, 2) || 'ME'}</div>}
  ></Avatar>
);
