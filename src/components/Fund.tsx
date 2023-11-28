// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useCallback, useState } from 'react';

import { useApi, useCall, useGroupAccounts, useTxQueue } from '@mimirdev/hooks';

import AddressCell from './AddressCell';
import InputAddress from './InputAddress';
import InputNumber from './InputNumber';

interface Props {
  open: boolean;
  defaultValue?: string | BN;
  receipt?: string;
  onClose: () => void;
}

function Content({ receipt, sending, setSending, setValue, value }: { sending?: string; setSending: React.Dispatch<string>; value?: BN; setValue: React.Dispatch<BN>; receipt?: string }) {
  const { api } = useApi();
  const balances = useCall<DeriveBalancesAll>(api.derive.balances.all, [sending]);
  const { accounts, injected, testing } = useGroupAccounts();

  return (
    <DialogContent>
      <Stack spacing={2}>
        <InputAddress filtered={[...injected, ...testing, ...accounts]} isSign label='Sending From' onChange={setSending} value={sending} />
        <Stack spacing={1}>
          <Typography fontWeight={700}>To</Typography>
          <Box bgcolor='secondary.main' borderRadius={1} padding={1}>
            <AddressCell shorten={false} showType value={receipt} withCopy />
          </Box>
        </Stack>
        <InputNumber label='Amount' maxValue={balances?.freeBalance} onChange={setValue} value={value} withMax />
      </Stack>
    </DialogContent>
  );
}

function Action({ onClose, receipt, sending, value }: { receipt?: string; value?: BN; sending?: string; onClose: () => void }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const handleClick = useCallback(() => {
    if (receipt && sending && value) {
      addQueue({
        extrinsic: api.tx.balances.transferKeepAlive(receipt, value),
        accountId: sending
      });
    }
  }, [addQueue, api, receipt, sending, value]);

  return (
    <DialogActions>
      <Button disabled={!receipt || !sending || !value} fullWidth onClick={handleClick}>
        Submit
      </Button>
      <Button fullWidth onClick={onClose} variant='outlined'>
        Cancel
      </Button>
    </DialogActions>
  );
}

function Fund({ defaultValue, onClose, open, receipt }: Props) {
  const [sending, setSending] = useState<string>();
  const [value, setValue] = useState<BN>(new BN(defaultValue?.toString() || '0'));

  return (
    <Dialog fullWidth onClose={onClose} open={open}>
      <DialogTitle>Fund</DialogTitle>
      <Content receipt={receipt} sending={sending} setSending={setSending} setValue={setValue} value={value} />
      <Action onClose={onClose} receipt={receipt} sending={sending} value={value} />
    </Dialog>
  );
}

export default React.memo(Fund);
