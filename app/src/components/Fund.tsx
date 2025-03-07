// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGroupAccounts } from '@/accounts/useGroupAccounts';
import { signAndSend } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useNativeBalances } from '@/hooks/useBalances';
import { useInputNumber } from '@/hooks/useInputNumber';
import { parseUnits } from '@/utils';
import { useAccountSource } from '@/wallet/useWallet';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import AddressCell from './AddressCell';
import Input from './Input';
import InputAddress from './InputAddress';

interface Props {
  open: boolean;
  defaultValue?: string | { toString: () => string };
  receipt?: string;
  onClose: () => void;
}

function Content({
  receipt,
  sending,
  setSending,
  setValue,
  value
}: {
  sending?: string;
  setSending: React.Dispatch<string>;
  value?: string;
  setValue: React.Dispatch<string>;
  receipt?: string;
}) {
  const [balances] = useNativeBalances(sending);
  const { injected } = useGroupAccounts();

  return (
    <DialogContent>
      <Stack spacing={2}>
        <InputAddress
          withBalance
          balance={balances?.transferrable}
          filtered={injected}
          isSign
          label='Sending From'
          onChange={setSending}
          value={sending}
        />
        <Stack spacing={1}>
          <p className='font-bold'>To</p>
          <Box bgcolor='secondary.main' borderRadius={1} padding={1}>
            <AddressCell shorten showType value={receipt} withCopy withAddressBook />
          </Box>
        </Stack>
        <Input label='Amount' onChange={setValue} value={value} />
      </Stack>
    </DialogContent>
  );
}

function Action({
  onClose,
  receipt,
  sending,
  value
}: {
  receipt?: string;
  value?: string;
  sending?: string;
  onClose: () => void;
}) {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const source = useAccountSource(sending);
  const handleClick = useCallback(() => {
    if (receipt && sending && value) {
      setLoading(true);

      if (source) {
        const events = signAndSend(
          api.tx.balances.transferKeepAlive(receipt, parseUnits(value, api.registry.chainDecimals[0])),
          sending,
          source
        );

        events.on('inblock', () => {
          setLoading(false);
          onClose();
        });
        events.on('error', () => {
          setLoading(false);
        });
      }
    }
  }, [source, api, onClose, receipt, sending, value]);

  return (
    <DialogActions>
      <Button fullWidth onClick={onClose} variant='outlined'>
        Cancel
      </Button>
      <LoadingButton loading={loading} disabled={!(receipt && sending && value)} fullWidth onClick={handleClick}>
        Submit
      </LoadingButton>
    </DialogActions>
  );
}

function Fund({ defaultValue, onClose, open, receipt }: Props) {
  const [sending, setSending] = useState<string>();
  const [[value], setValue] = useInputNumber(defaultValue?.toString() || '0', false, 0);

  return (
    <Dialog fullWidth onClose={onClose} open={open}>
      <DialogTitle>Fund</DialogTitle>
      <Content receipt={receipt} sending={sending} setSending={setSending} setValue={setValue} value={value} />
      <Action onClose={onClose} receipt={receipt} sending={sending} value={value} />
    </Dialog>
  );
}

export default React.memo(Fund);
