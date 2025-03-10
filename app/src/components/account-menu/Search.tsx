// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconSearch from '@/assets/svg/icon-search.svg?react';
import React from 'react';

import { Spinner } from '@mimir-wallet/ui';

import Input from '../Input';

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
      endAdornment={isSearching ? <Spinner size='sm' /> : <IconSearch className='text-divider-300' />}
      onChange={onChange}
      placeholder='Please input address'
      value={value}
    />
  );
}

export default React.memo(Search);
