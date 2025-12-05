// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@mimir-wallet/ui';
import React from 'react';

import Input from '../Input';

import IconSearch from '@/assets/svg/icon-search.svg?react';

function Search({
  onChange,
  isSearching = true,
  value
}: {
  value: string;
  isSearching: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      fullWidth
      endAdornment={isSearching ? <Spinner size='sm' /> : <IconSearch className='text-divider' />}
      onChange={onChange}
      placeholder='Please input address'
      value={value}
    />
  );
}

export default React.memo(Search);
