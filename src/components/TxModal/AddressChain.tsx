// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { useAddressMeta } from '@mimir-wallet/hooks';
import { getAddressMeta, isLocalAccount } from '@mimir-wallet/utils';
import { Box, Divider, Stack } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import InputAddress from '../InputAddress';

function AddressChain({ accounts, filtered, index = 0, onChange }: { index?: number; accounts: [string, ...string[]]; onChange: (values: [string, ...string[]]) => void; filtered?: Filtered }) {
  const address = accounts[0];
  const { meta } = useAddressMeta(address);

  const _onChangeValue = useCallback(
    (selected: string) => {
      onChange([address, selected]);
    },
    [address, onChange]
  );

  const _onChangeChain = useCallback(
    (value: [string, ...string[]]) => {
      onChange([address, ...value]);
    },
    [address, onChange]
  );

  useEffect(() => {
    const address = accounts[0];
    const sender = accounts.at(1);

    if (!sender) {
      const finded = meta?.isMultisig ? (filtered ? Object.keys(filtered) : meta.who)?.filter((address) => isLocalAccount(address)) || [] : [];

      if (finded.length > 0) {
        const solo = finded.find((item) => !getAddressMeta(item).isMultisig);

        onChange([address, solo || finded[0]]);
      }
    }
  }, [accounts, filtered, meta, onChange]);

  if (meta?.isMultisig) {
    const sender = accounts.at(1) || '';

    let comp: React.ReactNode | null = null;

    if (sender && getAddressMeta(sender).isMultisig) {
      comp = <AddressChain accounts={accounts.slice(1) as [string, ...string[]]} filtered={filtered?.[sender]} index={index + 1} onChange={_onChangeChain} />;
    }

    return (
      <Stack spacing={1}>
        <Divider />
        <Box sx={{ paddingLeft: index * 1.5 }}>
          <InputAddress filtered={filtered ? Object.keys(filtered) : meta.who} isSign label={index === 0 ? 'Initiator' : undefined} onChange={_onChangeValue} value={sender} />
        </Box>
        {comp}
      </Stack>
    );
  }

  return null;
}

export default React.memo(AddressChain);
