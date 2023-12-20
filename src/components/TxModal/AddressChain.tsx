// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { useAccounts } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

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
  const { isAccount } = useAccounts();

  const meta = useMemo(() => getAddressMeta(address), [address]);

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
    const finded = meta.isMultisig ? (filtered ? Object.keys(filtered) : meta.who)?.filter((address) => isAccount(address)) || [] : [];

    if (finded.length > 0) {
      const solo = finded.find((item) => !getAddressMeta(item).isMultisig);

      onChange((value) => ({
        ...value,
        [address]: solo || finded[0]
      }));
    }
  }, [address, filtered, isAccount, meta, onChange]);

  if (meta.isMultisig) {
    const value = accounts[address] || '';

    const isMultisigValue: boolean = !!value && !!getAddressMeta(value).isMultisig;

    return (
      <>
        <Box sx={{ paddingLeft: index * 2 }}>
          <InputAddress filtered={filtered ? Object.keys(filtered) : meta.who} isSign label={index === 0 ? 'Initiator' : undefined} onChange={_onChange} value={value} />
        </Box>
        {isMultisigValue && <AddressChain accounts={accounts} address={value} filtered={filtered?.[value]} index={index + 1} onChange={onChange} />}
      </>
    );
  }

  return null;
}

export default React.memo(AddressChain);
