// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath } from '@/hooks/types';

import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@mimir-wallet/ui';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

import AddressCell from './AddressCell';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import { useElementWidth } from '@/hooks/useElementWidth';

interface Props {
  label?: React.ReactNode;
  filterPaths: FilterPath[];
  value: FilterPath;
  onChange: (value: FilterPath) => void;
}

function FilterPathCell({ filterPath }: { filterPath: FilterPath }) {
  return (
    <div className="flex w-full items-center justify-between gap-1">
      <AddressCell
        className="flex-1"
        value={filterPath.address}
        withCopy
        showType
        addressCopyDisabled
      />
      {filterPath.type !== 'origin' && (
        <Badge
          variant={
            filterPath.type === 'multisig'
              ? 'secondary'
              : filterPath.type === 'proxy'
                ? 'purple'
                : filterPath.type === 'proposer'
                  ? 'teal'
                  : 'default'
          }
        >
          {filterPath.type === 'multisig'
            ? 'AsMulti'
            : filterPath.type === 'proxy'
              ? 'Proxy'
              : filterPath.type === 'proposer'
                ? 'Proposer'
                : ''}
        </Badge>
      )}
      {filterPath.type === 'proxy' && (
        <Badge variant="secondary">
          <div className="flex items-center gap-1">
            {!!filterPath.delay && <IconClock className="h-3 w-3" />}
            {filterPath.proxyType}
          </div>
        </Badge>
      )}
    </div>
  );
}

function SelectFilterPath({ label, filterPaths, value, onChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(wrapperRef);
  const [isOpen, toggleOpen] = useToggle(false);

  const handleSelect = (item: FilterPath) => {
    onChange(item);

    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  return (
    <div className="w-full space-y-2 data-[disabled=true]:pointer-events-none">
      {label && <div className="text-sm font-bold">{label}</div>}

      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
          <div
            ref={wrapperRef}
            className="tap-highlight-transparent border-divider hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative inline-flex h-14 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 rounded-[10px] border-1 px-2 py-2 shadow-none transition-all !duration-150 data-[focus=true]:bg-transparent motion-reduce:transition-none"
            onClick={handleOpen}
          >
            <FilterPathCell filterPath={value} />
          </div>
        </PopoverTrigger>
        <PopoverContent
          style={{ width: popoverWidth }}
          className="border-divider border-1 p-[5px]"
        >
          {filterPaths.length > 0 ? (
            <div className="text-foreground max-h-[250px] overflow-y-auto">
              <ul className="flex list-none flex-col">
                {filterPaths.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="text-foreground transition-background hover:bg-secondary flex cursor-pointer items-center justify-between gap-2.5 rounded-[10px] px-2 py-1.5"
                  >
                    <FilterPathCell filterPath={item} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-foreground/50 text-center">no addresses</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default React.memo(SelectFilterPath);
