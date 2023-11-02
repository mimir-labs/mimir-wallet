// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useAccounts } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

import InputAddress from '../InputAddress';

function AddressChain({
  accounts,
  address,
  index = 0,
  onChange
}: {
  index?: number;
  accounts: Record<string, string | undefined>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  address: string;
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
    const finded = meta.isMultisig ? meta.who?.find((address) => isAccount(address)) : null;

    finded &&
      onChange((value) => ({
        ...value,
        [address]: finded
      }));
  }, [address, isAccount, meta, onChange]);

  if (meta.isMultisig) {
    const value = accounts[address] || '';

    const isMultisigValue: boolean = !!value && !!getAddressMeta(value).isMultisig;

    return (
      <>
        <Box sx={{ paddingLeft: index * 2 }}>
          <InputAddress filtered={meta.who} label={index === 0 ? 'Initiator' : undefined} onChange={_onChange} value={value} />
        </Box>
        {isMultisigValue && <AddressChain accounts={accounts} address={value} index={index + 1} onChange={onChange} />}
      </>
    );
  }

  return null;
}

export default React.memo(AddressChain);
