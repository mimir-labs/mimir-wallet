// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconAnalytic from '@/assets/svg/icon-analytic.svg?react';
import IconAssets from '@/assets/svg/icon-assets.svg?react';
import IconDapp from '@/assets/svg/icon-dapp.svg?react';
import IconHome from '@/assets/svg/icon-home.svg?react';
import IconSetting from '@/assets/svg/icon-set.svg?react';
import IconTransaction from '@/assets/svg/icon-transaction.svg?react';
import { useMultiChainTransactionCounts } from '@/hooks/useTransactions';
import { Link } from '@tanstack/react-router';
import React, { memo, useMemo } from 'react';

import { Button } from '@mimir-wallet/ui';

interface NavLinkProps {
  to: string;
  Icon: React.ComponentType<any>;
  label: React.ReactNode;
  endContent?: React.ReactNode;
  onClick?: () => void;
  /**
   * Whether to use exact match for active state
   * @default false - uses fuzzy matching
   */
  exact?: boolean;
}

/**
 * Navigation Link Component with TanStack Router best practices
 *
 * Uses Link's activeProps and activeOptions for automatic active state detection
 * Button styling is applied through Link's activeProps/inactiveProps
 * Supports aria-current for accessibility
 */
function NavLink({ Icon, label, onClick, to, endContent, exact = false }: NavLinkProps) {
  return (
    <Button
      asChild
      fullWidth
      size='lg'
      radius='md'
      variant='light'
      className='text-foreground/50 aria-[current=page]:bg-secondary aria-[current=page]:text-primary hover:bg-secondary hover:text-primary h-[50px] items-center justify-start gap-x-2.5 px-[15px] py-[20px] text-base font-semibold'
    >
      <Link
        to={to}
        onClick={onClick}
        activeOptions={{
          exact,
          includeSearch: false
        }}
        activeProps={{
          'aria-current': 'page' as const
        }}
      >
        <Icon className='h-5 w-5' />
        {label}
        {endContent}
      </Link>
    </Button>
  );
}

/**
 * Main navigation menu component
 * Contains all primary navigation links
 */
function NavigationMenuComponent({ address }: { address?: string }) {
  const [transactionCounts] = useMultiChainTransactionCounts(address);

  const totalCounts = useMemo(
    () =>
      Object.values(transactionCounts || {}).reduce((acc, item) => {
        return acc + item.pending;
      }, 0),
    [transactionCounts]
  );

  return (
    <>
      <NavLink Icon={IconHome} label='Home' to='/' exact />
      <NavLink Icon={IconDapp} label='Apps' to='/dapp' />
      <NavLink Icon={IconAssets} label='Assets' to='/assets' />
      <NavLink
        Icon={IconTransaction}
        label='Transactions'
        endContent={
          totalCounts ? (
            <div className='text-danger-foreground bg-danger flex aspect-1/1 w-5 items-center justify-center rounded-full text-sm leading-[1] font-semibold'>
              {totalCounts}
            </div>
          ) : null
        }
        to='/transactions'
      />
      <NavLink Icon={IconAddressBook} label='Address Book' to='/address-book' />
      <NavLink Icon={IconAnalytic} label='Analytic' to='/analytic' />
      <NavLink Icon={IconSetting} label='Setting' to='/setting' />
    </>
  );
}

/**
 * Memoized NavigationMenu component
 * Only re-renders when transaction counts change
 */
export const NavigationMenu = memo(NavigationMenuComponent);
