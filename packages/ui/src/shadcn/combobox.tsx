// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils.js';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface ComboboxProps<T extends ComboboxOption = ComboboxOption> {
  /** Available options to select from */
  options: T[];
  /** Current selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Callback when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message to display when no options match the search */
  emptyMessage?: string;
  /** Allow users to input custom values not in the options list */
  allowCustomValue?: boolean;
  /** Validate custom value before allowing selection. Returns true if valid */
  validateCustomValue?: (value: string) => boolean;
  /** Custom filter function for options */
  filterOptions?: (options: T[], inputValue: string) => T[];
  /** Custom render function for options */
  renderOption?: (option: T, isSelected: boolean) => React.ReactNode;
  /** Custom render function for the selected value display */
  renderValue?: (value: string, option?: T) => React.ReactNode;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Additional class name for the trigger */
  className?: string;
  /** Additional class name for the popover content */
  contentClassName?: string;
}

// Dropdown arrow icon (same as Autocomplete)
const DropdownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M10.7998 13.9344C10.3998 14.4674 9.60022 14.4674 9.20021 13.9344L5.57194 9.10028C5.07718 8.44109 5.54751 7.5 6.37172 7.5L13.6283 7.5C14.4525 7.5 14.9228 8.44109 14.4281 9.10028L10.7998 13.9344Z"
      fill="currentColor"
    />
  </svg>
);

const defaultFilterOptions = <T extends ComboboxOption>(
  options: T[],
  inputValue: string,
): T[] => {
  if (!inputValue) return options;

  const lowerInput = inputValue.toLowerCase();

  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(lowerInput) ||
      option.value.toLowerCase().includes(lowerInput),
  );
};

export function Combobox<T extends ComboboxOption = ComboboxOption>({
  options,
  value,
  onValueChange,
  onOpenChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  allowCustomValue = false,
  validateCustomValue,
  filterOptions = defaultFilterOptions,
  renderOption,
  renderValue,
  disabled = false,
  className,
  contentClassName,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );
  const [inputValue, setInputValue] = React.useState('');

  // Find the selected option
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Filter options based on input
  const filteredOptions = React.useMemo(() => {
    return filterOptions(options, inputValue);
  }, [options, inputValue, filterOptions]);

  // Check if current input matches any option
  const hasExactMatch = React.useMemo(() => {
    if (!inputValue) return false;
    const lowerInput = inputValue.toLowerCase();

    return options.some(
      (option) =>
        option.value.toLowerCase() === lowerInput ||
        option.label.toLowerCase() === lowerInput,
    );
  }, [options, inputValue]);

  // Show custom value option when:
  // 1. allowCustomValue is true
  // 2. there's input value
  // 3. input doesn't exactly match any option
  // 4. no matching options found
  // 5. validation passes (if provided)
  const showCustomValueOption = React.useMemo(() => {
    if (
      !allowCustomValue ||
      !inputValue ||
      hasExactMatch ||
      filteredOptions.length > 0
    ) {
      return false;
    }

    if (validateCustomValue) {
      return validateCustomValue(inputValue) === true;
    }

    return true;
  }, [
    allowCustomValue,
    inputValue,
    hasExactMatch,
    filteredOptions.length,
    validateCustomValue,
  ]);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setOpen(false);
    setInputValue('');
  };

  const handleCustomValueSelect = () => {
    onValueChange?.(inputValue);
    setOpen(false);
    setInputValue('');
  };

  // Display value in trigger
  const displayValue = React.useMemo(() => {
    if (renderValue) {
      return renderValue(value || '', selectedOption);
    }

    if (value) {
      // If selected option exists, show its label, otherwise show the value itself
      return selectedOption?.label || value;
    }

    return null;
  }, [value, selectedOption, renderValue]);

  const defaultRenderOption = (option: T, isSelected: boolean) => (
    <>
      <CheckIcon
        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      {option.label}
    </>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative">
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              // Base styles matching Input component
              'border-input flex h-9 w-full min-w-0 touch-manipulation rounded-[10px] border bg-transparent px-3 py-1 pr-7 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
              // Focus and hover states matching Input
              'focus:border-primary hover:border-primary hover:bg-secondary',
              // Disabled state
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              // Layout for combobox trigger
              'items-center text-left truncate',
              // Placeholder color when no value
              !value && 'text-foreground/50',
              className,
            )}
          >
            {displayValue || placeholder}
          </button>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <DropdownIcon />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'border-divider w-(--radix-popover-trigger-width) border-1 p-[5px]',
          contentClassName,
        )}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="p-0">
              {/* Custom value option */}
              {showCustomValueOption && (
                <CommandItem
                  value={`__custom__${inputValue}`}
                  onSelect={handleCustomValueSelect}
                  className="data-[selected=true]:bg-secondary hover:bg-secondary cursor-pointer rounded-[5px]"
                >
                  <CheckIcon className="mr-2 h-4 w-4 opacity-0" />
                  <span className="text-muted-foreground">Use:</span>
                  <span className="ml-1 truncate font-medium">
                    {inputValue}
                  </span>
                </CommandItem>
              )}
              {/* Filtered options */}
              {filteredOptions.map((option) => {
                const isSelected = value === option.value;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      'data-[selected=true]:bg-secondary hover:bg-secondary cursor-pointer rounded-[5px]',
                      isSelected && 'bg-secondary',
                    )}
                  >
                    {renderOption
                      ? renderOption(option, isSelected)
                      : defaultRenderOption(option, isSelected)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
