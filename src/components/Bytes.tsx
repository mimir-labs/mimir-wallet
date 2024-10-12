// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { u8aToU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import CopyButton from './CopyButton';

function Bytes({ value }: { value?: string | HexString }) {
  const size = useMemo(() => u8aToU8a(value || '0x').length, [value]);

  return (
    <span className='inline-flex gap-x-1'>
      {size} Bytes
      <CopyButton style={{ color: 'inherit', padding: 0 }} value={value} size='small' />
    </span>
  );
}

export default React.memo(Bytes);
