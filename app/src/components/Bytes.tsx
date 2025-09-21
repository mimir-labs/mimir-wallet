// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { hexToU8a } from '@polkadot/util';
import React, { useEffect, useState } from 'react';

import CopyButton from './CopyButton';

function Bytes({ value }: { value?: string | HexString }) {
  const [size, setSize] = useState(0);

  useEffect(() => {
    setSize(hexToU8a(value || '0x').length);
  }, [value]);

  return (
    <span className='inline-flex items-center gap-x-1'>
      {size} Bytes
      <CopyButton value={value} size='sm' className='opacity-50' />
    </span>
  );
}

export default React.memo(Bytes);
