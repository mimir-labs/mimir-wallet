// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconNotification from '@/assets/svg/icon-notification.svg?react';
import { AddressRow } from '@/components';
import { type NotificationMessage, useNotifications } from '@/hooks/useNotifications';
import { formatAgo } from '@/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { getChainIcon } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Badge,
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip
} from '@mimir-wallet/ui';

// Function to get notification status color classes
function getNotificationStatusColor(status: NotificationMessage['status']) {
  // Using Tailwind color classes for better consistency
  if (status === 'pending') return 'bg-warning'; // Orange/Yellow for pending
  if (status === 'success') return 'bg-success'; // Green for success
  if (status === 'failed') return 'bg-danger'; // Red for failed

  return 'bg-warning'; // Default orange
}

// Function to get notification message based on notification type and status
function getNotificationMessage(notification: NotificationMessage): React.ReactNode {
  const txRef = `${notification.section}.${notification.method} #${notification.transactionId}`;

  const notificationType =
    notification.status === 'success' || notification.status === 'failed'
      ? 'transaction_executed'
      : notification.notificationType;

  // For transaction_executed, use status to determine the message
  if (notificationType === 'transaction_executed') {
    if (notification.status === 'success') {
      return `${txRef} has been executed successfully.`;
    } else if (notification.status === 'failed') {
      return `${txRef} execution failed.`;
    } else {
      return `${txRef} is being executed.`;
    }
  }

  // For other notification types
  switch (notificationType) {
    case 'transaction_created':
      return `${txRef} is waiting for your approval.`;

    case 'transaction_approved':
      return (
        <>
          {txRef} has been approved by{' '}
          <AddressRow
            className='inline-flex align-middle'
            value={notification.triggerAddress}
            withName
            withAddress={false}
            iconSize={14}
          />
          .
        </>
      );

    default:
      return `${txRef} status update.`;
  }
}

// Component for individual notification item with intersection observer
interface NotificationItemProps {
  notification: NotificationMessage;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ notification, isRead, onMarkAsRead }) => {
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the item is visible
    triggerOnce: false,
    delay: 3000 // Mark as read after 3 second in view
  });

  // Mark as read when the item comes into view
  useEffect(() => {
    if (inView && !isRead) {
      onMarkAsRead(notification.id);
    }
  }, [inView, isRead, notification.id, onMarkAsRead]);

  return (
    <div
      ref={ref}
      className={cn(
        'flex cursor-pointer gap-2.5 rounded-[10px] p-[10px] transition-all duration-200',
        'bg-primary/5 hover:bg-primary/15',
        isRead ? 'opacity-50' : ''
      )}
    >
      {/* Status Indicator - Blue for unread, original colors for read */}
      <div
        className={cn(
          'w-[5px] shrink-0 self-stretch rounded-[20px] transition-colors',
          getNotificationStatusColor(notification.status)
        )}
      />

      {/* Content */}
      <div className='flex flex-1 flex-col gap-2.5'>
        {/* Header */}
        <div className='flex items-center gap-[5px]'>
          <AddressRow className='flex-1' value={notification.address} withName withAddress={false} iconSize={20} />

          {/* Timestamp */}
          <span className='text-foreground/60 text-xs font-normal whitespace-nowrap'>
            {formatAgo(notification.updatedAt)} ago
          </span>

          {/* Status Icon */}
          <Avatar src={getChainIcon(notification.genesisHash)?.icon} style={{ width: 14, height: 14 }} />
        </div>

        {/* Message */}
        <div className={'text-foreground text-sm leading-normal font-normal'}>
          {getNotificationMessage(notification)}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

function NotificationButton() {
  const [isOpen, toggleOpen] = useToggle(false);
  const anchorEl = useRef<HTMLButtonElement>(null);

  const { notifications, isNotificationRead, markAsRead, markAllAsRead, getUnreadCount } = useNotifications();
  const [filter, setFilter] = useState<string>('all');

  const unreadCount = getUnreadCount();

  // Remove console.log for performance
  // console.log(unreadCount);

  // Memoize the mark as read callback
  const handleMarkAsRead = useCallback(
    (id: number) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    const notificationType =
      notification.status === 'success' || notification.status === 'failed'
        ? 'transaction_executed'
        : notification.notificationType;

    return notificationType === filter;
  });

  return (
    <>
      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div>
            <Tooltip content='Notification'>
              <Button
                isIconOnly
                ref={anchorEl}
                className='border-secondary bg-secondary relative h-[32px] w-[32px] sm:h-[42px] sm:w-[42px] sm:bg-transparent'
                color='primary'
                variant='ghost'
                radius='md'
                onClick={toggleOpen}
              >
                <IconNotification />
                <Badge
                  size='sm'
                  isOneChar
                  isInvisible={!unreadCount}
                  shape='circle'
                  color='danger'
                  classNames={{
                    base: 'flex-[0_0_auto]',
                    badge:
                      'w-1.5 h-1.5 min-w-1.5 min-h-1.5 border-0 translate-x-0.5 -translate-y-2 sm:translate-x-0.5 sm:-translate-y-2.5 pointer-events-none'
                  }}
                >
                  {' '}
                </Badge>
              </Button>
            </Tooltip>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'shadow-medium w-[360px] max-w-full rounded-[20px] p-4 px-2 sm:p-5 sm:px-3',
            'border-primary/5 border border-solid'
          )}
          sideOffset={8}
        >
          <div className='flex flex-col gap-2.5'>
            {/* Header Section */}
            <div className='flex items-center justify-between px-2'>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='All Transaction' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Transaction</SelectItem>
                  <SelectItem value='transaction_created'>Created</SelectItem>
                  <SelectItem value='transaction_approved'>Approved</SelectItem>
                  <SelectItem value='transaction_executed'>Executed</SelectItem>
                </SelectContent>
              </Select>

              {/* Mark All as Read Button */}
              {unreadCount > 0 && (
                <Button size='sm' variant='ghost' onClick={markAllAsRead} className='text-primary text-xs'>
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className='flex max-h-[400px] flex-col gap-2.5 overflow-y-auto px-2'>
              {filteredNotifications.length === 0 ? (
                <div className='text-foreground/60 py-8 text-center text-sm'>No notifications</div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isRead={isNotificationRead(notification.id)}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              )}
            </div>

            {/* Footer Link */}
            <div className='px-2 text-center'>
              <Link className='text-primary hover:underline' to=''>
                Don't want miss information? Try Email→
              </Link>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default React.memo(NotificationButton);
