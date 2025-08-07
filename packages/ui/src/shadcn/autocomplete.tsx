// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import * as React from 'react';

import { cn } from '../lib/utils.js';
import { Input } from './input.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';

export interface AutocompleteOption {
  value: string;
  label: string;
  [key: string]: any;
}

export interface AutocompleteProps {
  // Data
  options: AutocompleteOption[];
  getOptionLabel?: (option: AutocompleteOption) => string;
  getOptionValue?: (option: AutocompleteOption) => string;
  filterOptions?: (options: AutocompleteOption[], inputValue: string) => AutocompleteOption[];

  // Value control
  value?: string;
  onValueChange?: (value: string) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;

  // Behavior
  allowCustomValue?: boolean;
  onCustomValue?: (value: string) => void;

  // UI
  placeholder?: string;
  className?: string;
  disabled?: boolean;

  // Custom rendering
  renderOption?: (option: AutocompleteOption, isSelected: boolean) => React.ReactNode;
  emptyMessage?: string | React.ReactNode;
}

const defaultFilterOptions = (options: AutocompleteOption[], inputValue: string): AutocompleteOption[] => {
  if (!inputValue) return options;

  const lowerInput = inputValue.toLowerCase();

  return options.filter(
    (option) => option.label.toLowerCase().includes(lowerInput) || option.value.toLowerCase().includes(lowerInput)
  );
};

export function Autocomplete({
  options,
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.value,
  filterOptions = defaultFilterOptions,
  value,
  onValueChange,
  inputValue: controlledInputValue,
  onInputChange,
  allowCustomValue = false,
  onCustomValue,
  placeholder,
  className,
  disabled,
  renderOption,
  emptyMessage = 'No results found'
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [internalInputValue, setInternalInputValue] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Determine if component is controlled
  const isControlled = controlledInputValue !== undefined;
  const inputValue = isControlled ? controlledInputValue : internalInputValue;

  // Update input value when value changes
  React.useEffect(() => {
    if (value) {
      const selectedOption = options.find((opt) => getOptionValue(opt) === value);

      if (selectedOption) {
        const displayValue = getOptionValue(selectedOption); // Use value instead of label for display

        if (isControlled) {
          onInputChange?.(displayValue);
        } else {
          setInternalInputValue(displayValue);
        }
      }
    }
  }, [value, options, getOptionLabel, getOptionValue, isControlled, onInputChange]);

  const filteredOptions = React.useMemo(() => {
    return filterOptions(options, inputValue);
  }, [options, inputValue, filterOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (isControlled) {
      onInputChange?.(newValue);
    } else {
      setInternalInputValue(newValue);
    }

    setOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    const optionValue = getOptionValue(option);

    onValueChange?.(optionValue);

    if (isControlled) {
      onInputChange?.(optionValue); // Use value instead of label
    } else {
      setInternalInputValue(optionValue); // Use value instead of label
    }

    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (!open) {
        setOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleOptionSelect(filteredOptions[highlightedIndex]);
      } else if (allowCustomValue && inputValue) {
        onValueChange?.(inputValue);
        onCustomValue?.(inputValue);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputBlur = () => {
    // Allow custom value on blur if enabled
    if (allowCustomValue && inputValue) {
      const matchingOption = options.find(
        (opt) => getOptionLabel(opt) === inputValue || getOptionValue(opt) === inputValue
      );

      if (!matchingOption) {
        onValueChange?.(inputValue);
        onCustomValue?.(inputValue);
      }
    }
  };

  const defaultRenderOption = (option: AutocompleteOption, isSelected: boolean) => (
    <div
      className={cn(
        'relative flex cursor-pointer items-center rounded-[5px] px-2 py-1.5 text-sm outline-none select-none',
        'hover:bg-secondary focus:bg-secondary',
        isSelected && 'bg-secondary',
        highlightedIndex === filteredOptions.indexOf(option) && 'bg-secondary'
      )}
      onMouseEnter={() => setHighlightedIndex(filteredOptions.indexOf(option))}
    >
      {getOptionLabel(option)}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='relative'>
          <Input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('pr-5', className)}
          />
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1'>
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
              <path
                d='M10.7998 13.9344C10.3998 14.4674 9.60022 14.4674 9.20021 13.9344L5.57194 9.10028C5.07718 8.44109 5.54751 7.5 6.37172 7.5L13.6283 7.5C14.4525 7.5 14.9228 8.44109 14.4281 9.10028L10.7998 13.9344Z'
                fill='currentColor'
              />
            </svg>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='border-divider-300 w-[var(--radix-popover-trigger-width)] border-1 p-[5px]'
        align='start'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className='max-h-[300px] overflow-auto'>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={getOptionValue(option)}
                onClick={() => handleOptionSelect(option)}
                onMouseDown={(e) => e.preventDefault()}
                className='hover:bg-secondary cursor-pointer rounded-[5px] px-2 py-1.5'
              >
                {renderOption
                  ? renderOption(option, value === getOptionValue(option))
                  : defaultRenderOption(option, value === getOptionValue(option))}
              </div>
            ))
          ) : (
            <div className='text-muted-foreground px-2 py-6 text-center text-sm'>{emptyMessage}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
