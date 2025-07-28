// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { POLKADOT_PROXY_TYPES_WIKI_URL } from '@/constants';
import { useProxyTypes } from '@/hooks/useProxyTypes';
import { memo } from 'react';

import { Link, Select, SelectItem } from '@mimir-wallet/ui';

import { proxyTypeDescriptions } from '../utils';

export interface ProxyPermissionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  description?: string;
}

/**
 * Unified proxy permission selector component
 * Used for both desktop and mobile versions
 */
function ProxyPermissionSelector({
  value,
  onChange,
  placeholder = 'Select permission level',
  isDisabled = false,
  variant = 'bordered',
  size = 'md',
  className = '',
  label,
  description
}: ProxyPermissionSelectorProps) {
  const proxyTypes = useProxyTypes();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className='text-foreground text-sm font-bold'>{label}</label>}

      {description && (
        <p className='text-foreground/50 text-tiny mb-2'>
          {description}{' '}
          <Link isExternal underline='hover' href={POLKADOT_PROXY_TYPES_WIKI_URL}>
            Permission level details
          </Link>
        </p>
      )}

      <Select
        placeholder={placeholder}
        variant={variant}
        size={size}
        selectionMode='single'
        selectedKeys={value ? [value] : []}
        isDisabled={isDisabled}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;

          if (selectedKey) {
            onChange(selectedKey);
          }
        }}
        renderValue={(items) => {
          return items.map((item) => {
            const proxyType = item.key?.toString();
            const description = proxyType ? proxyTypeDescriptions[proxyType] : '';

            return (
              <div key={item.key} className='flex items-center gap-[5px]'>
                <span className='text-foreground font-medium'>{proxyType}</span>
                {description && <span className='text-foreground/50 text-tiny'> - {description}</span>}
              </div>
            );
          });
        }}
      >
        {proxyTypes.map(({ text }) => {
          const description = proxyTypeDescriptions[text];

          return (
            <SelectItem key={text} textValue={text}>
              <div className='flex items-center gap-[5px]'>
                <span className='text-foreground font-medium'>{text}</span>
                {description && <span className='text-foreground/50 text-tiny'> - {description}</span>}
              </div>
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
}

export default memo(ProxyPermissionSelector);
