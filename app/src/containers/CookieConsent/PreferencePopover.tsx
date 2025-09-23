// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CookiePreference } from './types';

import IconCheck from '@/assets/svg/icon-success-fill.svg?react';
import React from 'react';

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@mimir-wallet/ui';

interface PreferencePopoverProps {
  /**
   * Currently selected preference
   */
  selectedPreference: CookiePreference | null;

  /**
   * Callback when preference is changed
   */
  onPreferenceChange: (preference: CookiePreference) => void;

  /**
   * Trigger element for the popover
   */
  children: React.ReactNode;

  /**
   * Whether the popover is open
   */
  open?: boolean;

  /**
   * Callback when popover open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

const PreferenceOption: React.FC<{
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, selected, disabled, onClick }) => {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-divider-300 flex w-full items-center justify-between gap-3 rounded-[10px] border px-[15px] py-[5px] text-left transition-colors',
        'hover:bg-secondary focus:bg-secondary focus:outline-none'
      )}
    >
      <span className={cn('text-[14px] text-nowrap', !disabled ? 'text-foreground' : 'text-foreground/50')}>
        {label}
      </span>

      <div className='flex-shrink-0'>
        {selected ? (
          <IconCheck className='text-success h-[20px] w-[20px]' />
        ) : (
          <div className='border-divider-300 mr-[2px] h-4 w-4 rounded-full border' />
        )}
      </div>
    </button>
  );
};

export const PreferencePopover: React.FC<PreferencePopoverProps> = ({
  selectedPreference,
  onPreferenceChange,
  children,
  open,
  onOpenChange
}) => {
  const effectivePreference: CookiePreference = selectedPreference ?? 'all';
  const [pendingPreference, setPendingPreference] = React.useState<CookiePreference>(effectivePreference);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setPendingPreference(effectivePreference);
  }, [open, effectivePreference]);

  const handlePreferenceSelect = (preference: CookiePreference) => {
    setPendingPreference(preference);
  };

  const handleApply = () => {
    if (pendingPreference) {
      onPreferenceChange(pendingPreference);
    }

    onOpenChange?.(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        className={cn('border-secondary rounded-[20px] border p-[10px]', 'shadow-medium w-[171px]')}
        align='end'
        sideOffset={8}
      >
        <div className='flex flex-col gap-[5px]'>
          <PreferenceOption
            label='All'
            selected={pendingPreference === 'all'}
            onClick={() => handlePreferenceSelect('all')}
          />

          <PreferenceOption
            label='Only Essentials'
            selected={pendingPreference === 'essentials'}
            onClick={() => handlePreferenceSelect('essentials')}
          />
          <Button color='primary' onClick={handleApply} variant='ghost' size='sm' fullWidth>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
