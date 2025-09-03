// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import * as React from 'react';

import { cn } from '../lib/utils.js';
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from './drawer.js';

const SIDEBAR_WIDTH = '16rem';

function useIsMobile(mobileBreakpoint = 1024) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < mobileBreakpoint);

    return () => mql.removeEventListener('change', onChange);
  }, [mobileBreakpoint]);

  return !!isMobile;
}

function SidebarProvider({ className, style, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-wrapper'
      className={cn('group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full', className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

function ToggleSidebar({
  open,
  openSidebar,
  closeSidebar,
  side = 'left'
}: {
  open?: boolean;
  openSidebar?: () => void;
  closeSidebar?: () => void;
  side?: 'left' | 'right';
}) {
  const className =
    side === 'left'
      ? 'left-0 origin-center translate-x-0 data-[open=true]:translate-x-[var(--sidebar-width)]'
      : 'right-0 origin-center -translate-x-0 data-[open=true]:-translate-x-[var(--sidebar-width)]';

  return (
    <div
      data-open={open}
      className={cn(
        'hover:bg-primary/10 fixed top-[var(--header-height)] z-50 flex h-svh rotate-y-0 cursor-pointer items-center justify-center transition-all duration-200 ease-linear transform-3d data-[open=true]:rotate-y-180',
        className
      )}
      onClick={open ? closeSidebar : openSidebar}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='14'
        height='18'
        viewBox='0 0 14 18'
        fill='none'
        className={side === 'right' ? 'flex rotate-y-180' : ''}
      >
        <path
          d='M14 0H5C2.23858 0 0 2.23858 0 5V13C0 15.7614 2.23858 18 5 18H14V0Z'
          fill='#2700FF'
          className={open ? '' : 'origin-center rotate-y-180'}
        />
        <path
          opacity='0.9'
          d='M8 5L10.5225 8.2432C10.8034 8.60431 10.8034 9.10997 10.5225 9.47108L8 12.7143'
          stroke='white'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
        <path
          opacity='0.9'
          d='M4 5L6.52249 8.2432C6.80335 8.60431 6.80335 9.10997 6.52249 9.47108L4 12.7143'
          stroke='white'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
}

function Sidebar({
  side = 'left',
  className,
  children,
  open,
  onOpenChange,
  sideBarWidth = SIDEBAR_WIDTH,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
  sideBarWidth?: string;
}) {
  const state = open ? 'expanded' : 'collapsed';
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer direction={side} open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <div className='relative w-0'>
            <ToggleSidebar side={side} />
          </div>
        </DrawerTrigger>

        <DrawerContent
          style={
            {
              '--sidebar-width': sideBarWidth
            } as React.CSSProperties
          }
          className='w-[var(--sidebar-width)]'
        >
          <DrawerHeader className='hidden'>Menu</DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className='group peer text-sidebar-foreground relative hidden lg:block'
      data-state={state}
      data-collapsible={state === 'collapsed'}
      data-side={side}
      data-slot='sidebar'
      style={
        {
          '--sidebar-width': sideBarWidth
        } as React.CSSProperties
      }
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot='sidebar-gap'
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=true]:w-0',
          'group-data-[side=right]:rotate-180'
        )}
      />
      <ToggleSidebar
        side={side}
        open={open}
        openSidebar={() => onOpenChange?.(true)}
        closeSidebar={() => onOpenChange?.(false)}
      />

      <div
        data-slot='sidebar-container'
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear lg:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=true]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=true]:right-[calc(var(--sidebar-width)*-1)]',
          'border-sidebar-border group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className
        )}
        {...props}
      >
        <div data-sidebar='sidebar' data-slot='sidebar-inner' className='bg-sidebar flex h-full w-full flex-col'>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-header'
      data-sidebar='header'
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-footer'
      data-sidebar='footer'
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-content'
      data-sidebar='content'
      className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto', className)}
      {...props}
    />
  );
}

export { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider };
