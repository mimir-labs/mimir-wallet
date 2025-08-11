// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath } from '@/hooks/types';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

import { Chip, Popover, PopoverContent, PopoverTrigger } from '@mimir-wallet/ui';

import AddressCell from './AddressCell';

interface Props {
  label?: React.ReactNode;
  filterPaths: FilterPath[];
  value: FilterPath;
  onChange: (value: FilterPath) => void;
}

function FilterPathCell({ filterPath }: { filterPath: FilterPath }) {
  return (
    <div className='flex w-full items-center justify-between gap-1'>
      <AddressCell className='flex-1' value={filterPath.address} withCopy showType addressCopyDisabled />
      {filterPath.type !== 'origin' && (
        <Chip
          color={
            filterPath.type === 'multisig'
              ? 'secondary'
              : filterPath.type === 'proxy'
                ? 'default'
                : filterPath.type === 'proposer'
                  ? 'default'
                  : 'primary'
          }
          size='sm'
          data-type={filterPath.type}
          className='data-[type=proposer]:bg-[#00A19C]/5 data-[type=proposer]:text-[#00A19C] data-[type=proxy]:bg-[#B700FF]/5 data-[type=proxy]:text-[#B700FF]'
        >
          {filterPath.type === 'multisig'
            ? 'AsMulti'
            : filterPath.type === 'proxy'
              ? 'Proxy'
              : filterPath.type === 'proposer'
                ? 'Proposer'
                : ''}
        </Chip>
      )}
      {filterPath.type === 'proxy' && (
        <Chip color='secondary' size='sm'>
          {
            <div className='flex items-center gap-1'>
              {!!filterPath.delay && <IconClock className='h-3 w-3' />}
              {filterPath.proxyType}
            </div>
          }
        </Chip>
      )}
    </div>
  );
}

function SelectFilterPath({ label, filterPaths, value, onChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);

  const handleSelect = (item: FilterPath) => {
    onChange(item);

    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  return (
    <div className='w-full space-y-2 data-[disabled=true]:pointer-events-none'>
      {label && <div className='text-sm font-bold'>{label}</div>}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className='tap-highlight-transparent border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative inline-flex h-14 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 rounded-[10px] border-1 px-2 py-2 shadow-none transition-all !duration-150 data-[focus=true]:bg-transparent motion-reduce:transition-none'
            onClick={handleOpen}
          >
            <FilterPathCell filterPath={value} />
          </div>
        </PopoverTrigger>
        <PopoverContent
          style={{ width: wrapperRef.current?.clientWidth }}
          className='border-divider-300 border-1 p-[5px]'
        >
          {filterPaths.length > 0 ? (
            <div className='text-foreground max-h-[250px] overflow-y-auto'>
              <ul className='flex list-none flex-col'>
                {filterPaths.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className='text-foreground transition-background hover:bg-secondary flex cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5'
                  >
                    <FilterPathCell filterPath={item} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className='text-foreground/50 text-center'>no addresses</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default React.memo(SelectFilterPath);
