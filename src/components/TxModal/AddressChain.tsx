// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { useAddressMeta } from '@mimir-wallet/hooks';
import { getAddressMeta, isLocalAccount } from '@mimir-wallet/utils';
import { Box, Divider, Stack } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import InputAddress from '../InputAddress';

function AddressChain({
  accounts,
  address,
  filtered,
  index = 0,
  onChange
}: {
  index?: number;
  accounts: Record<string, string | undefined>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  address: string;
  filtered?: Filtered;
}) {
  const { meta } = useAddressMeta(address);

  const _onChange = useCallback(
    (selected: string) => {
      onChange((value) => ({
        ...value,
        [address]: selected
      }));
    },
    [address, onChange]
  );

  useEffect(() => {
    if (!accounts[address]) {
      const finded = meta?.isMultisig ? (filtered ? Object.keys(filtered) : meta.who)?.filter((address) => isLocalAccount(address)) || [] : [];

      if (finded.length > 0) {
        const solo = finded.find((item) => !getAddressMeta(item).isMultisig);

        onChange((value) => ({
          ...value,
          [address]: solo || finded[0]
        }));
      }
    }
  }, [accounts, address, filtered, meta, onChange]);

  if (meta?.isMultisig) {
    const value = accounts[address] || '';

    const isMultisigValue: boolean = !!value && !!getAddressMeta(value).isMultisig;

    return (
      <Stack spacing={1}>
        <Divider />
        <Box sx={{ paddingLeft: index * 1.5 }}>
          <InputAddress filtered={filtered ? Object.keys(filtered) : meta.who} isSign label={index === 0 ? 'Initiator' : undefined} onChange={_onChange} value={value} />
        </Box>
        {isMultisigValue && <AddressChain accounts={accounts} address={value} filtered={filtered?.[value]} index={index + 1} onChange={onChange} />}
      </Stack>
    );
  }

  return null;
}

export default React.memo(AddressChain);
