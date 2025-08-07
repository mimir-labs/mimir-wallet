// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { POLKADOT_PROXY_TYPES_WIKI_URL } from '@/constants';
import { useProxyTypes } from '@/hooks/useProxyTypes';
import { memo } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@mimir-wallet/ui';

import { proxyTypeDescriptions } from '../utils';

export interface ProxyPermissionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
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
  className = '',
  label,
  description
}: ProxyPermissionSelectorProps) {
  const proxyTypes = useProxyTypes();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className='text-foreground text-sm font-bold'>{label}</label>}

      {description && (
        <p className='text-foreground/50 mb-2 text-xs'>
          {description}{' '}
          <a className='hover:underline' href={POLKADOT_PROXY_TYPES_WIKI_URL} target='_blank' rel='noopener noreferrer'>
            Permission level details
          </a>
        </p>
      )}

      <Select value={value} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {proxyTypes.map(({ text }) => {
            const description = proxyTypeDescriptions[text];

            return (
              <SelectItem key={text} value={text}>
                <div className='flex items-center gap-[5px]'>
                  <span className='text-foreground font-medium'>{text}</span>
                  {description && <span className='text-foreground/50 text-xs'> - {description}</span>}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default memo(ProxyPermissionSelector);
