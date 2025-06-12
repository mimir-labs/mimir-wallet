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
    <div className='w-full flex justify-between items-center gap-1'>
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
          className='data-[type=proxy]:bg-[#B700FF]/5 data-[type=proxy]:text-[#B700FF] data-[type=proposer]:bg-[#00A19C]/5 data-[type=proposer]:text-[#00A19C]'
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
              {!!filterPath.delay && <IconClock className='w-3 h-3' />}
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
      <Listbox color='secondary' emptyContent='no addresses' className='max-h-[250px] overflow-y-auto text-foreground'>
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
        {label && <div className='font-bold text-small'>{label}</div>}

        <div
          ref={wrapperRef}
          className='cursor-pointer relative w-full inline-flex tap-highlight-transparent px-2 border-medium min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-14 py-2 shadow-none border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent'
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
