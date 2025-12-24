// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountEnhancedAssetBalance } from '@mimir-wallet/polkadot-core';

import {
  Avatar,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  TooltipContent,
  TooltipTrigger,
  TooltipWrapper,
} from '@mimir-wallet/ui';
import React, { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import FormatBalance from './FormatBalance';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useChainBalances } from '@/hooks/useChainBalances';
import { useElementWidth } from '@/hooks/useElementWidth';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';

interface Props {
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  isIconOnly?: boolean;
  network: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  label?: string;
  identifier?: string;
  defaultIdentifier?: string;
  helper?: React.ReactNode;
  address?: string;
  onChange: (value: string) => void;
}

function InputToken({
  radius = 'md',
  isIconOnly = false,
  network,
  disabled,
  className,
  placeholder,
  wrapperClassName = '',
  label,
  helper,
  address,
  identifier,
  defaultIdentifier,
  onChange,
}: Props) {
  const [allBalances, isFetched, isFetching] = useChainBalances(
    network,
    address,
    { alwaysIncludeNative: true },
  );
  const [allAssets] = useChainXcmAsset(network);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(wrapperRef);
  const [isOpen, toggleOpen] = useToggle(false);

  // Controlled/uncontrolled pattern using derived state
  const isControlled = identifier !== undefined;
  const [internalValue, setInternalValue] = useState(defaultIdentifier || '');

  // Derive effective value: use identifier if controlled, internal state otherwise
  const value = isControlled ? identifier || '' : internalValue;

  // Unified setter that handles both modes
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange(newValue);
    },
    [isControlled, onChange],
  );

  const options = useMemo((): AccountEnhancedAssetBalance[] => {
    return allBalances || [];
  }, [allBalances]);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const token = useMemo(() => {
    return allAssets?.find((item) =>
      value === 'native' ? item.isNative : item.key === value,
    );
  }, [allAssets, value]);

  const element =
    !isFetched && isFetching ? (
      <div
        data-disabled={disabled}
        className="data-[disabled=true]:text-foreground/50 flex items-center gap-2.5"
      >
        <Spinner size="sm" />
        {isIconOnly ? null : (
          <p className="text-foreground/50">Fetching Assets...</p>
        )}
      </div>
    ) : token ? (
      <div
        data-disabled={disabled}
        className="data-[disabled=true]:text-foreground/50 flex items-center gap-2.5"
      >
        <Avatar
          alt={token.name}
          fallback={token.symbol.slice(0, 1)}
          src={token.logoUri}
          style={{ width: 20, height: 20 }}
        >
          {token.symbol}
        </Avatar>
        {isIconOnly ? null : <span>{token.symbol}</span>}
      </div>
    ) : (
      <span className="text-foreground/50">{placeholder}</span>
    );

  return (
    <div
      data-disabled={disabled}
      className={'input-token-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none'.concat(
        ` ${className || ''}`,
      )}
    >
      {label && <div className="text-sm font-bold">{label}</div>}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className={cn([
              'group border-divider hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative flex h-11 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 border px-2 py-2 shadow-none transition-all duration-150! data-[focus=true]:bg-transparent motion-reduce:transition-none',
              radius === 'full'
                ? 'rounded-full'
                : radius === 'lg'
                  ? 'rounded-[20px]'
                  : radius === 'md'
                    ? 'rounded-[10px]'
                    : radius === 'sm'
                      ? 'rounded-[5px]'
                      : 'rounded-none',
              wrapperClassName,
            ])}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
          >
            {element}

            <ArrowDown
              data-open={isOpen}
              className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer transition-transform duration-150 data-[open=true]:rotate-180"
              style={{ color: 'inherit' }}
              onClick={(e) => {
                e.stopPropagation();
                isOpen ? handleClose() : handleOpen();
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          style={{ width: popoverWidth, minWidth: 200 }}
          className="border-divider border p-[5px]"
        >
          {options.length > 0 ? (
            <div
              className={cn('text-foreground max-h-[250px] overflow-y-auto')}
            >
              <ul className={cn('flex list-none flex-col')}>
                {options.map((item) => {
                  const { logoUri, name, symbol, transferrable, decimals } =
                    item;
                  const identifier = item.isNative ? 'native' : item.key;

                  return (
                    <TooltipWrapper key={identifier}>
                      <TooltipTrigger asChild>
                        <li
                          onClick={() => {
                            handleClose();
                            handleValueChange(identifier);
                          }}
                          className={cn(
                            'text-foreground transition-background hover:bg-secondary flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5',
                          )}
                        >
                          <Avatar
                            alt={name}
                            className="shrink-0"
                            fallback={symbol.slice(0, 1)}
                            src={logoUri}
                            style={{ width: 20, height: 20 }}
                          >
                            {symbol}
                          </Avatar>
                          <span className="flex-1">{symbol}</span>
                          <div>
                            <FormatBalance
                              value={transferrable}
                              format={[decimals, symbol]}
                            />
                          </div>
                        </li>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="bg-background text-foreground"
                      >
                        {name}
                      </TooltipContent>
                    </TooltipWrapper>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="text-foreground/50 text-center">no tokens</div>
          )}
        </PopoverContent>
      </Popover>

      {helper && <div className="text-foreground/50 text-xs">{helper}</div>}
    </div>
  );
}

export default React.memo(InputToken);
