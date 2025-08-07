// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DelayType } from '../types';

import { useBlockInterval } from '@/hooks/useBlockInterval';
import { useMemo } from 'react';

import { estimateTimeFromBlocks } from '../utils';

interface Props {
  delayType: DelayType;
  isSelected: boolean;
  onSelect: (value: DelayType) => void;
  customBlocks?: string;
  onCustomBlockChange?: (value: string) => void;
}

function getLabel(delayType: DelayType) {
  let label: string;

  switch (delayType) {
    case 'hour':
      label = '1 Hour';
      break;
    case 'day':
      label = '1 Day';
      break;
    case 'week':
      label = '1 Week';
      break;
    case 'custom':
      label = 'Customize';
      break;
    default:
      label = 'Unknkow';
  }

  return label;
}

function EstimateCustom({ customBlocks }: { customBlocks: string }) {
  const blockInterval = useBlockInterval().toNumber();

  // Use utility function for time estimation
  return useMemo(() => {
    return estimateTimeFromBlocks(customBlocks, blockInterval);
  }, [customBlocks, blockInterval]);
}

function DelayItem({ isSelected, delayType, customBlocks = '', onCustomBlockChange, onSelect }: Props) {
  const handleClick = () => {
    onSelect(delayType);
  };

  const isCustomSelected = isSelected && delayType === 'custom';

  return (
    <div
      data-selected={isSelected}
      data-custom={isCustomSelected}
      className='bg-secondary text-secondary-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground flex h-[43px] w-[25%] cursor-pointer items-center justify-center gap-[5px] rounded-full px-2.5 text-sm transition-all data-[custom=true]:w-[50%] data-[custom=true]:flex-[0_0_auto] data-[custom=true]:shrink-0 data-[custom=true]:grow-0'
      onClick={handleClick}
    >
      {isCustomSelected ? (
        <>
          <input
            autoFocus
            type='number'
            min={0}
            value={customBlocks}
            onChange={onCustomBlockChange && ((e) => onCustomBlockChange(e.target.value))}
            className='text-foreground border-divider-300 bg-primary-foreground h-[27px] flex-shrink flex-grow rounded-full border-1 px-2.5 outline-none'
          />
          <span className='text-nowrap'>
            Blocks ( <EstimateCustom customBlocks={customBlocks} /> )
          </span>
        </>
      ) : (
        getLabel(delayType)
      )}
    </div>
  );
}

export default DelayItem;
