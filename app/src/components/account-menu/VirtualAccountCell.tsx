// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useInView } from 'react-intersection-observer';

import AccountCell from './AccountCell';

interface VirtualAccountCellProps {
  value: string;
  onClose?: () => void;
  onSelect?: (address: string) => void;
  selected?: boolean;
  watchlist?: boolean;
  withAdd?: boolean;
}

function VirtualAccountCell({
  value,
  onClose,
  onSelect,
  selected,
  watchlist = false,
  withAdd = false
}: VirtualAccountCellProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '50px 0px' // Pre-load items 50px before they enter viewport
  });

  return (
    <div ref={ref} className='w-full'>
      {inView ? (
        <AccountCell
          value={value}
          onClose={onClose}
          onSelect={onSelect}
          selected={selected}
          watchlist={watchlist}
          withAdd={withAdd}
        />
      ) : (
        <div className='rounded-medium bg-secondary h-[50px] w-full animate-pulse' />
      )}
    </div>
  );
}

export default React.memo(VirtualAccountCell);
