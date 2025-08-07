// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputProps } from './types';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { cn, Input as ShadcnInput } from '@mimir-wallet/ui';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      autoComplete,
      autoFocus,
      className = '',
      defaultValue,
      disabled,
      endAdornment,
      endButton,
      enterKeyHint,
      error,
      fullWidth = true,
      helper,
      label,
      onChange,
      placeholder,
      startAdornment,
      tabIndex,
      type,
      value,
      ...props
    },
    ref
  ) => {
    const startRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const [startWidth, setStartWidth] = useState(0);
    const [endWidth, setEndWidth] = useState(0);

    const _onChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange]
    );

    useEffect(() => {
      if (startRef.current && startAdornment) {
        const width = startRef.current.getBoundingClientRect().width;

        setStartWidth(width + 12); // Add 12px buffer
      } else {
        setStartWidth(0);
      }
    }, [startAdornment]);

    useEffect(() => {
      if (endRef.current && endAdornment) {
        const width = endRef.current.getBoundingClientRect().width;

        setEndWidth(width + 12); // Add 12px buffer
      } else {
        setEndWidth(0);
      }
    }, [endAdornment]);

    const errorClass = error ? 'border-danger focus-visible:border-danger' : '';

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full', className)}>
        {label && (
          <label className='mb-2 text-sm leading-none font-bold peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {label}
          </label>
        )}

        <div className='relative flex items-center'>
          {startAdornment && (
            <div ref={startRef} className='absolute left-3 z-10 flex items-center'>
              {startAdornment}
            </div>
          )}

          <ShadcnInput
            ref={ref}
            className={cn(errorClass)}
            style={{
              paddingLeft: startWidth > 0 ? `${startWidth}px` : undefined,
              paddingRight: endWidth > 0 ? `${endWidth}px` : undefined
            }}
            aria-invalid={!!error}
            value={value}
            defaultValue={defaultValue}
            tabIndex={tabIndex}
            autoComplete={autoComplete}
            enterKeyHint={enterKeyHint}
            placeholder={placeholder || ' '}
            type={type}
            autoFocus={autoFocus}
            disabled={disabled}
            onChange={_onChange}
            {...props}
          />

          {endAdornment && (
            <div ref={endRef} className='absolute right-3 z-10 flex items-center'>
              {endAdornment}
            </div>
          )}

          {endButton && <div className='ml-2'>{endButton}</div>}
        </div>

        {error && (
          <>
            <p className='text-danger mt-[5px] text-xs'>{error.message}</p>
          </>
        )}

        {helper && <p className='text-foreground/50 mt-[5px] text-xs'>{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
