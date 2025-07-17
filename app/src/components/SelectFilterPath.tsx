// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath } from '@/hooks/types';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import { AnimatePresence } from 'framer-motion';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

import { Chip, FreeSoloPopover, Listbox, ListboxItem } from '@mimir-wallet/ui';

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
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);

  const handleSelect = (item: FilterPath) => {
    onChange(item);

    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const popoverContent = isOpen ? (
    <FreeSoloPopover
      isOpen
      disableDialogFocus
      onClose={handleClose}
      ref={popoverRef}
      triggerRef={wrapperRef}
      placement='bottom-start'
      style={{ width: wrapperRef.current?.clientWidth }}
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no addresses' className='text-foreground max-h-[250px] overflow-y-auto'>
        {filterPaths.map((item) => (
          <ListboxItem
            key={item.id}
            onPress={() => handleSelect(item)}
            className='text-foreground data-[hover=true]:text-foreground'
          >
            <FilterPathCell filterPath={item} />
          </ListboxItem>
        ))}
      </Listbox>
    </FreeSoloPopover>
  ) : null;

  return (
    <>
      <div className='w-full space-y-2 data-[disabled=true]:pointer-events-none'>
        {label && <div className='text-small font-bold'>{label}</div>}

        <div
          ref={wrapperRef}
          className='tap-highlight-transparent border-medium rounded-medium border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary relative inline-flex h-14 min-h-10 w-full cursor-pointer flex-col items-start justify-center gap-0 px-2 py-2 shadow-none transition-all !duration-150 data-[focus=true]:bg-transparent motion-reduce:transition-none'
          onClick={handleOpen}
        >
          <FilterPathCell filterPath={value} />
        </div>
      </div>

      <AnimatePresence>{popoverContent}</AnimatePresence>
    </>
  );
}

export default React.memo(SelectFilterPath);
